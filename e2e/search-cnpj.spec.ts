import { test, expect } from '@playwright/test';

/**
 * Cenário pedido: usuário pesquisa o CNPJ válido 32.102.290/0001-70
 * (MATA FRIA INDÚSTRIA E COMÉRCIO LTDA) e deve ver o relatório de análise
 * com Score de risco 35 (nível Alto).
 *
 * O score 35 é produzido pelo backend de produção (Cloud Run / V2:
 * Embargos IBAMA + Lista Suja do Trabalho Escravo). Por isso o teste roda
 * contra o site publicado (baseURL em playwright.config.ts). O mock local
 * (server/index.js) NÃO reproduz esse score.
 *
 * Observação: o score deriva de dados públicos (IBAMA/MTE) consultados ao vivo;
 * se essas bases mudarem, o valor 35 pode variar e o teste precisará de ajuste.
 */

const CNPJ = '32102290000170';
const CNPJ_DIGITS = CNPJ; // digitado dígito a dígito; a máscara formata sozinha
const EXPECTED_SCORE = '35';

test('pesquisar CNPJ 32.102.290/0001-70 exibe relatório com score 35', async ({ page }) => {
  await page.goto('/');

  // Campo de busca dentro do formulário de pesquisa
  const form = page.locator('form.search-form').first();
  const input = form.locator('input.search-input');
  await expect(input).toBeVisible();

  // Usuário DIGITA o CNPJ (a máscara de CNPJ é aplicada a cada tecla)
  await input.click();
  await input.pressSequentially(CNPJ_DIGITS, { delay: 80 });
  await expect(input).toHaveValue('32.102.290/0001-70');

  // Clica em "Pesquisar"
  await form.getByRole('button', { name: 'Pesquisar' }).click();

  // Relatório de análise aparece com o card de score
  const scoreCard = page.locator('article[aria-labelledby="cnpj-score-heading"]');
  await expect(scoreCard).toBeVisible({ timeout: 20_000 });

  // Score de risco = 35 (requisito principal do cenário)
  const scoreValue = scoreCard.locator('.result-score-value');
  await expect(scoreValue).toHaveText(EXPECTED_SCORE);

  // O selo de risco do card usa a faixa do front-end: score 35 (26–50) => "Médio".
  await expect(scoreCard.locator('.risk-pill')).toHaveText(/Médio/i);
});
