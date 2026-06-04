import { defineConfig, devices } from '@playwright/test';

/**
 * Testes end-to-end (Playwright) — rodam contra o site publicado por padrão.
 * Modo HEADED (navegador visível) por exigência: queremos VER o site sendo navegado.
 *
 * Sobrescreva a URL com a variável de ambiente E2E_BASE_URL se quiser testar
 * outro ambiente (ex.: E2E_BASE_URL=http://localhost:4200 npm run e2e).
 */
const BASE_URL = process.env.E2E_BASE_URL || 'https://ecotransparencia-d786e.web.app';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    headless: false, // navegador visível
    viewport: { width: 1366, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        launchOptions: {
          slowMo: 400, // desacelera as ações para acompanhar visualmente
        },
      },
    },
  ],
});
