import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type AppThemeMode = 'dark';

const STORAGE_KEY = 'ecotransparencia-appearance';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  /** Tema fixo da aplicação: escuro. */
  readonly mode = signal<AppThemeMode>('dark');

  constructor() {
    this.applyToDom();

    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, 'dark');
      } catch {
        /* modo privado / indisponível */
      }
      this.applyToDom();
    });
  }

  setMode(next: AppThemeMode): void {
    this.mode.set(next);
  }

  private applyToDom(): void {
    const html = this.document.documentElement;
    html.setAttribute('data-app-theme', 'dark');
    html.style.setProperty('color-scheme', 'dark');
  }
}
