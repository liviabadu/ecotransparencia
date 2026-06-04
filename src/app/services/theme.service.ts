import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

/** Aparência selecionável: claro, escuro ou seguindo o sistema operacional. */
export type AppThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ecotransparencia-appearance';

/** Tema padrão da aplicação: claro. */
const DEFAULT_MODE: AppThemeMode = 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  /** Aparência atual (claro por padrão; persiste a escolha do usuário). */
  readonly mode = signal<AppThemeMode>(this.readStoredMode());

  constructor() {
    this.applyToDom();

    // Reage à troca de tema do SO quando o modo é "system".
    const mq = this.systemPrefersDark();
    mq?.addEventListener?.('change', () => {
      if (this.mode() === 'system') this.applyToDom();
    });

    effect(() => {
      // Lê o signal para reaplicar quando muda.
      this.mode();
      try {
        localStorage.setItem(STORAGE_KEY, this.mode());
      } catch {
        /* modo privado / indisponível */
      }
      this.applyToDom();
    });
  }

  setMode(next: AppThemeMode): void {
    this.mode.set(next);
  }

  /** Tema efetivo aplicado ao DOM (resolve "system" para claro/escuro). */
  effectiveTheme(): 'light' | 'dark' {
    const mode = this.mode();
    if (mode === 'system') {
      return this.systemPrefersDark()?.matches ? 'dark' : 'light';
    }
    return mode;
  }

  private readStoredMode(): AppThemeMode {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
    } catch {
      /* indisponível */
    }
    return DEFAULT_MODE;
  }

  private systemPrefersDark(): MediaQueryList | null {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return null;
    }
  }

  private applyToDom(): void {
    const html = this.document.documentElement;
    const mode = this.mode();
    const effective = this.effectiveTheme();
    // Mantém o modo escolhido no atributo (CSS usa "light"/"dark"/"system").
    html.setAttribute('data-app-theme', mode);
    html.style.setProperty('color-scheme', effective);
  }
}
