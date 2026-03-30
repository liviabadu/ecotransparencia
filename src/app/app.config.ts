import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { provideCriticalFontsReady } from './font-initializers';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { Auth, getAuth, provideAuth } from '@angular/fire/auth';

/** Primeira pintura só depois da sessão Firebase estar restaurada (evita flash na home). */
export function firebaseAuthStateReadyFactory(auth: Auth) {
  return () => auth.authStateReady();
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
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: firebaseAuthStateReadyFactory,
      deps: [Auth],
    },
  ]
};
