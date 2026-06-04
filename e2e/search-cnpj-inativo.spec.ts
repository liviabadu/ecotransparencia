import { test, expect } from '@playwright/test';

/**
 * Cenário: usuário pesquisa um CNPJ INAPTO na Receita Federal
 * (ex.: 02.698.412/0001-72) e, após clicar em Pesquisar, deve ver a
 * mensagem de "CNPJ inativo" — sem relatório de análise ASG.
 *
 * O backend de produção (Cloud Run / V2) responde com
 * `bloqueadoPorSituacaoCadastral: true` e `situacaoCadastral.situacao = "Inapta"`.
 * O front renderiza o card `.situacao-cadastral-card` com o título "CNPJ inativo"
 * (search.html). Por isso o teste roda contra o site publicado (baseURL em
 * playwright.config.ts) — o mock local não reproduz esse estado.
 */

const CNPJ_DIGITS = '02698412000172';

test('pesquisar CNPJ inapto 02.698.412/0001-72 exibe mensagem de CNPJ inativo', async ({
  page,
}) => {
  await page.goto('/');

  const form = page.locator('form.search-form').first();
  const input = form.locator('input.search-input');
  await expect(input).toBeVisible();

  // Usuário DIGITA o CNPJ (máscara aplicada a cada tecla)
  await input.click();
  await input.pressSequentially(CNPJ_DIGITS, { delay: 80 });
  await expect(input).toHaveValue('02.698.412/0001-72');

  // Clica em "Pesquisar"
  await form.getByRole('button', { name: 'Pesquisar' }).click();

  // Card de situação cadastral aparece com o título "CNPJ inativo"
  const card = page.locator('.situacao-cadastral-card');
  await expect(card).toBeVisible({ timeout: 20_000 });
  await expect(card.locator('.situacao-cadastral-card__title')).toHaveText('CNPJ inativo');

  // A situação informada pela Receita é "Inapta"
  await expect(card).toContainText('Inapta');

  // Não deve existir relatório de score para um CNPJ inativo
  await expect(page.locator('article[aria-labelledby="cnpj-score-heading"]')).toHaveCount(0);
});
