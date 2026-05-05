import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Router, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { provideCriticalFontsReady } from './font-initializers';
import { routes } from './app.routes';

/** Caminho atual no browser (respeita o que o utilizador recarregou). */
function currentDocumentPath(): string {
  if (typeof document === 'undefined') return '/';
  const p = document.location.pathname.trim();
  const withSlash = p.startsWith('/') ? p : `/${p}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

/**
 * F5 em telas “sobrepostas” (login, cadastro, assinaturas) → home limpa, em vez de manter o overlay.
 * Não corre em navegação normal (ex.: voltar do Google OAuth), só em `type === 'reload'`.
 */
export function reloadCloseAuthScreensFactory(router: Router) {
  return () => {
    if (typeof performance === 'undefined') return Promise.resolve();
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (entry?.type !== 'reload') return Promise.resolve();

    const path = currentDocumentPath();
    if (path === '/login' || path === '/cadastro' || path === '/assinaturas') {
      return router.navigateByUrl('/', { replaceUrl: true });
    }
    return Promise.resolve();
  };
}
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { Auth, getAuth, getRedirectResult, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';

/**
 * Restaura sessão, conclui login Google por redirect e envia para a home se o retorno foi em /login ou /cadastro.
 */
export function firebaseAuthStateReadyFactory(auth: Auth, router: Router) {
  return async () => {
    await auth.authStateReady();
    try {
      const cred = await getRedirectResult(auth);
      if (cred?.user) {
        const path =
          (typeof document !== 'undefined' ? document.location.pathname : router.url.split('?')[0])
            .replace(/\/+$/, '') || '/';
        if (path === '/login' || path === '/cadastro') {
          await router.navigateByUrl('/', { replaceUrl: true });
        }
      }
    } catch {
      /* Sem redirect pendente ou URL inválida — ignorar */
    }
  };
}

const firebaseConfig = {
  apiKey: "AIzaSyAqhgimtb9EAWDFGwLqS2_pgfkze8dbtFA",
  authDomain: "ecotransparencia-d786e.firebaseapp.com",
  projectId: "ecotransparencia-d786e",
  storageBucket: "ecotransparencia-d786e.firebasestorage.app",
  messagingSenderId: "860516408210",
  appId: "1:860516408210:web:deffede2d139ecd9433f4b",
  measurementId: "G-9D6GWNFJF0"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideCriticalFontsReady(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      /* Sem withViewTransitions: snapshot de página inteira deixava navegação lenta na home longa */
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: reloadCloseAuthScreensFactory,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: firebaseAuthStateReadyFactory,
      deps: [Auth, Router],
    },
  ]
};
