import { test, expect } from '@playwright/test';

/**
 * Cenário: usuário clica em "Entrar", informa e-mail e senha de uma conta
 * existente com credenciais corretas e, ao enviar, o portal navega para a
 * área logada (dashboard).
 *
 * Usa Firebase Authentication REAL contra o site publicado (baseURL em
 * playwright.config.ts). A conta precisa existir no Firebase Auth do projeto.
 *
 * ⚠️ Credenciais: por padrão usa os valores informados, mas podem ser
 * sobrescritas por variáveis de ambiente — prefira uma conta de TESTE dedicada:
 *   E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... npm run e2e
 */

const EMAIL = process.env.E2E_LOGIN_EMAIL || 'liviabadu@gmail.com';
const PASSWORD = process.env.E2E_LOGIN_PASSWORD || 'Liviabadu04@';

test('login com credenciais válidas navega para a área logada', async ({ page }) => {
  await page.goto('/');

  // Usuário clica em "Entrar" no topo da home pública
  await page.getByRole('link', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/login$/);

  // Preenche e-mail e senha
  await page.locator('#login-email').fill(EMAIL);
  await page.locator('#login-password').fill(PASSWORD);

  // Envia o formulário ("Continuar" — botão primário de submit)
  await page.locator('button[type="submit"].auth-pill-btn--primary').click();

  // Navega para a área logada (raiz com layout de dashboard)
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });

  // Elemento que só aparece quando autenticado: saudação do dashboard
  const greeting = page.locator('.home-dash-greeting');
  await expect(greeting).toBeVisible({ timeout: 20_000 });
  await expect(greeting).toContainText('Olá');

  // E o botão "Entrar" da home pública não deve mais existir
  await expect(page.getByRole('link', { name: 'Entrar' })).toHaveCount(0);
});
