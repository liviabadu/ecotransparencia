import { test, expect } from '@playwright/test';

/**
 * Cenário: usuário pesquisa um CNPJ VÁLIDO e sem problemas ASG
 * (ex.: 00.000.000/0001-91) e, após clicar em Pesquisar, deve ver a
 * mensagem "Nenhum registro encontrado para a entidade pesquisada".
 *
 * O backend de produção (Cloud Run / V2) responde `{ found: false }`
 * (sem bloqueio por situação cadastral). O front renderiza o card
 * `.search-state-card--no-records` (search.html), guardado por
 * `noResultsFound() && !isLoading()`. Por isso o teste roda contra o
 * site publicado (baseURL em playwright.config.ts).
 */

const CNPJ_DIGITS = '00000000000191';

test('pesquisar CNPJ válido sem registros 00.000.000/0001-91 exibe "Nenhum registro encontrado"', async ({
  page,
}) => {
  await page.goto('/');

  const form = page.locator('form.search-form').first();
  const input = form.locator('input.search-input');
  await expect(input).toBeVisible();

  // Usuário DIGITA o CNPJ (máscara aplicada a cada tecla)
  await input.click();
  await input.pressSequentially(CNPJ_DIGITS, { delay: 80 });
  await expect(input).toHaveValue('00.000.000/0001-91');

  // Clica em "Pesquisar"
  await form.getByRole('button', { name: 'Pesquisar' }).click();

  // Card "sem registros" aparece com a mensagem esperada
  const card = page.locator('.search-state-card--no-records');
  await expect(card).toBeVisible({ timeout: 20_000 });
  await expect(card).toContainText('Nenhum registro encontrado para a entidade pesquisada');

  // Não deve existir relatório de score nem card de CNPJ inativo
  await expect(page.locator('article[aria-labelledby="cnpj-score-heading"]')).toHaveCount(0);
  await expect(page.locator('.situacao-cadastral-card')).toHaveCount(0);
});
