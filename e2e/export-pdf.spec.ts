import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';

/**
 * Cenário (regressão do bug reportado): usuário pesquisa o CNPJ válido
 * 32.102.290/0001-70 (MATA FRIA INDÚSTRIA E COMÉRCIO LTDA), o relatório de
 * conformidade socioambiental aparece e, ao clicar em "Exportar PDF", o
 * download do arquivo deve acontecer SEM erro.
 *
 * Contexto do bug: o CSS do relatório usava color-mix(), que o navegador
 * computa como color(srgb …) — formato que o html2canvas (gerador do PDF no
 * cliente) não sabe parsear. A exportação falhava para qualquer CNPJ e o card
 * de erro ".relatorio-erro" era exibido. Este teste garante que a exportação
 * volte a quebrar de forma visível caso alguém reintroduza cores não
 * suportadas (color-mix/oklch/color()) no componente do relatório.
 *
 * Roda contra o site publicado (baseURL em playwright.config.ts), como os
 * demais specs. A geração rasteriza o documento inteiro (html2canvas + jsPDF),
 * por isso o timeout do download é generoso.
 */

/**
 * CNPJ do cenário (o mesmo do bug reportado). Pode ser sobrescrito com
 * E2E_CNPJ para rodar contra o mock local (ex.: E2E_CNPJ=22333444000181
 * E2E_BASE_URL=http://localhost:4200 npm run e2e -- export-pdf).
 */
const CNPJ_DIGITS = process.env.E2E_CNPJ ?? '32102290000170';
const CNPJ_MASCARADO = CNPJ_DIGITS.replace(
  /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
  '$1.$2.$3/$4-$5',
);

test(`exportar PDF do relatório do CNPJ ${CNPJ_MASCARADO} baixa o arquivo sem erro`, async ({
  page,
}) => {
  await page.goto('/');

  // Campo de busca dentro do formulário de pesquisa
  const form = page.locator('form.search-form').first();
  const input = form.locator('input.search-input');
  await expect(input).toBeVisible();

  // Usuário DIGITA o CNPJ (a máscara de CNPJ é aplicada a cada tecla)
  await input.click();
  await input.pressSequentially(CNPJ_DIGITS, { delay: 80 });
  await expect(input).toHaveValue(CNPJ_MASCARADO);

  // Clica em "Pesquisar"
  await form.getByRole('button', { name: 'Pesquisar' }).click();

  // O relatório de conformidade (com os botões de exportação) aparece ao
  // final do resultado da busca
  const relatorio = page.locator('app-relatorio-conformidade');
  await expect(relatorio).toBeVisible({ timeout: 20_000 });

  const documento = relatorio.locator('.relatorio-doc');
  await expect(documento).toBeVisible();

  const exportarBtn = relatorio.getByRole('button', { name: 'Exportar relatório em PDF' });
  await expect(exportarBtn).toBeEnabled();

  // Clica em "Exportar PDF" e espera o download (a rasterização de um
  // relatório longo pode levar vários segundos)
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60_000 }),
    exportarBtn.click(),
  ]);

  // Nome do arquivo: relatorio-conformidade-<cnpj>-<aaaa-mm-dd>.pdf
  expect(download.suggestedFilename()).toMatch(
    new RegExp(`^relatorio-conformidade-${CNPJ_DIGITS}-\\d{4}-\\d{2}-\\d{2}\\.pdf$`),
  );

  // O arquivo baixado é um PDF de verdade (magic bytes %PDF) e não está vazio
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const header = fs.readFileSync(filePath as string).subarray(0, 5).toString('latin1');
  expect(header).toBe('%PDF-');
  expect(fs.statSync(filePath as string).size).toBeGreaterThan(10_000);

  // Nenhum card de erro de exportação deve ter aparecido
  await expect(relatorio.locator('.relatorio-erro')).toHaveCount(0);

  // O botão volta ao estado normal (sai de "Gerando PDF…")
  await expect(exportarBtn).toHaveText(/Exportar PDF/, { timeout: 10_000 });
});
