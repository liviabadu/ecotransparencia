import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type AppThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'ecotransparencia-appearance';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  /** Preferência salva: Sistema segue o SO, Claro/Escuro forçam. */
  readonly mode = signal<AppThemeMode>(this.readStored());

  private mql?: MediaQueryList;
  private readonly onSchemeChange = (): void => {
    if (this.mode() === 'system') {
      this.applyToDom();
    }
  };

  constructor() {
    if (typeof globalThis.matchMedia === 'function') {
      this.mql = globalThis.matchMedia('(prefers-color-scheme: dark)');
      this.mql.addEventListener('change', this.onSchemeChange);
    }

    this.applyToDom();

    effect(() => {
      const m = this.mode();
      try {
        localStorage.setItem(STORAGE_KEY, m);
      } catch {
        /* modo privado / indisponível */
      }
      this.applyToDom();
    });
  }

  setMode(next: AppThemeMode): void {
    this.mode.set(next);
  }

  private readStored(): AppThemeMode {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark' || v === 'system') return v;
    } catch {
      /* ignore */
    }
    return 'system';
  }

  private applyToDom(): void {
    const html = this.document.documentElement;
    const m = this.mode();
    html.setAttribute('data-app-theme', m);

    const resolvedDark =
      m === 'system'
        ? !!globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
        : m === 'dark';

    html.style.setProperty('color-scheme', resolvedDark ? 'dark' : 'light');
  }
}
