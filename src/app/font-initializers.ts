import { APP_INITIALIZER } from '@angular/core';

/**
 * Espera as faces usadas no primeiro paint (hero + header) antes do bootstrap.
 * Sem isso, o primeiro frame já pinta com fallback e depois troca — “cresce / trava / volta”.
 * Timeout máximo evita tela branca eterna se a rede falhar.
 */
/** Teto se as fontes não carregarem; não bloquear o bootstrap além do necessário no reload */
const FONT_WAIT_MS = 480;

const CRITICAL_FONT_SPECS = [
  '400 16px "Inter Variable"',
  '500 16px "Inter Variable"',
  '600 14px "Inter Variable"',
  '600 16px "Inter Variable"',
  '700 16px "Inter Variable"',
  '800 16px "Inter Variable"',
  '700 56px "Space Grotesk Variable"',
  '700 40px "Space Grotesk Variable"',
  '700 28px "Space Grotesk Variable"',
  '700 18px "Space Grotesk Variable"',
] as const;

export function criticalFontsReadyFactory(): () => Promise<void> {
  return () => {
    if (typeof document === 'undefined') {
      return Promise.resolve();
    }

    const root = document.documentElement;
    if (!document.fonts?.load) {
      root.classList.add('app-fonts-ready');
      return Promise.resolve();
    }

    const loads = CRITICAL_FONT_SPECS.map((spec) => document.fonts.load(spec));

    return Promise.race([
      Promise.all(loads).then(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, FONT_WAIT_MS)),
    ])
      .catch(() => undefined)
      .then(() => {
        root.classList.add('app-fonts-ready');
      });
  };
}

export function provideCriticalFontsReady() {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: criticalFontsReadyFactory,
  };
}
