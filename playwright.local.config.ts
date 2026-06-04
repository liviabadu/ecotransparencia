import { defineConfig, devices } from '@playwright/test';

/**
 * Config OPCIONAL para rodar os e2e localmente em modo headless (CI/sandbox),
 * sem slowMo e contra um servidor local.
 *
 * Uso:
 *   E2E_BASE_URL=http://localhost:4200 npx playwright test -c playwright.local.config.ts
 *
 * A config padrão (playwright.config.ts) permanece headed e apontando para o
 * site publicado, como exigido para acompanhamento visual.
 */
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  /* Artefatos fora da árvore do projeto (evita problemas de permissão em
     filesystems montados/CI; sobrescreva com PW_OUTPUT_DIR se quiser). */
  outputDir: process.env.PW_OUTPUT_DIR || '/tmp/pw-results',
  use: {
    baseURL: BASE_URL,
    headless: true,
    viewport: { width: 1366, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        // Necessário em containers/CI sem sandbox de kernel disponível.
        launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage'] },
      },
    },
  ],
});
