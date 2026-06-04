import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/* Evita o browser “lembrar” o scroll ao dar F5 na mesma URL (SPA). O router trata o posicionamento. */
if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
