import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';

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
    provideAuth(() => getAuth()), // Adicione outros serviços aqui (Firestore, etc.)
  ]
};
