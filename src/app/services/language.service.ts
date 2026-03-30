import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type AppLanguage = 'pt-BR' | 'en' | 'auto';

const STORAGE_KEY = 'ecotransparencia-language';

type ModalLocale = 'pt-BR' | 'en';

/** Textos do modal de configurações (resto do site permanece no idioma original até haver i18n global). */
export interface SettingsModalCopy {
  closeAria: string;
  navAria: string;
  navGeral: string;
  navData: string;
  geralTitle: string;
  geralSubtitle: string;
  appearance: string;
  appearanceHint: string;
  themeSystem: string;
  themeSystemDesc: string;
  themeLight: string;
  themeLightDesc: string;
  themeDark: string;
  themeDarkDesc: string;
  language: string;
  languageHint: string;
  langAuto: string;
  langPt: string;
  langPtDesc: string;
  langEn: string;
  langEnDesc: string;
  dataTitle: string;
  dataSubtitle: string;
  loggedInLead: string;
  advancedGuestTagline: string;
  signIn: string;
  signUp: string;
}

const MODAL_COPY: Record<ModalLocale, SettingsModalCopy> = {
  'pt-BR': {
    closeAria: 'Fechar configurações',
    navAria: 'Seções',
    navGeral: 'Geral',
    navData: 'Configurações avançadas',
    geralTitle: 'Geral',
    geralSubtitle: 'Preferências gerais do site neste dispositivo',
    appearance: 'Aparência',
    appearanceHint: 'Tema claro, escuro ou o mesmo do sistema',
    themeSystem: 'Sistema',
    themeSystemDesc: 'Segue claro ou escuro do dispositivo',
    themeLight: 'Claro',
    themeLightDesc: 'Fundo claro em todo o site',
    themeDark: 'Escuro',
    themeDarkDesc: 'Tema escuro fixo',
    language: 'Idioma',
    languageHint: 'Idioma da interface neste painel e atributo de idioma da página',
    langAuto: 'Autodetectar',
    langPt: 'Português',
    langPtDesc: 'Português (Brasil)',
    langEn: 'English',
    langEnDesc: 'English (US)',
    dataTitle: 'Configurações avançadas',
    dataSubtitle: 'Conta e sessão neste dispositivo',
    loggedInLead: 'Você está conectado. Sua sessão está ativa neste dispositivo.',
    advancedGuestTagline: 'Entre com sua conta para salvar consultas e usar recursos extras.',
    signIn: 'Entrar',
    signUp: 'Criar conta',
  },
  en: {
    closeAria: 'Close settings',
    navAria: 'Sections',
    navGeral: 'General',
    navData: 'Advanced settings',
    geralTitle: 'General',
    geralSubtitle: 'Site preferences on this device',
    appearance: 'Appearance',
    appearanceHint: 'Light, dark, or match your system',
    themeSystem: 'System',
    themeSystemDesc: 'Follows your device light or dark mode',
    themeLight: 'Light',
    themeLightDesc: 'Light background across the site',
    themeDark: 'Dark',
    themeDarkDesc: 'Dark theme always',
    language: 'Language',
    languageHint: 'Language for this panel and the page lang attribute',
    langAuto: 'Auto-detect',
    langPt: 'Português',
    langPtDesc: 'Portuguese (Brazil)',
    langEn: 'English',
    langEnDesc: 'English (US)',
    dataTitle: 'Advanced settings',
    dataSubtitle: 'Account and session on this device',
    loggedInLead: 'You’re signed in. Your session is active on this device.',
    advancedGuestTagline: 'Sign in to save searches and use extra features with your account.',
    signIn: 'Sign in',
    signUp: 'Create account',
  },
};

function browserLocale(): ModalLocale {
  if (typeof navigator === 'undefined') return 'pt-BR';
  const n = (navigator.language || 'pt-BR').toLowerCase();
  return n.startsWith('en') ? 'en' : 'pt-BR';
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly document = inject(DOCUMENT);

  readonly lang = signal<AppLanguage>(this.readStored());

  readonly effectiveLocale = computed((): ModalLocale => {
    const l = this.lang();
    if (l === 'auto') return browserLocale();
    return l === 'en' ? 'en' : 'pt-BR';
  });

  readonly modalCopy = computed(() => MODAL_COPY[this.effectiveLocale()]);

  constructor() {
    this.applyLangAttribute();

    effect(() => {
      this.lang();
      try {
        localStorage.setItem(STORAGE_KEY, this.lang());
      } catch {
        /* ignore */
      }
      this.applyLangAttribute();
    });
  }

  setLang(next: AppLanguage): void {
    this.lang.set(next);
  }

  private readStored(): AppLanguage {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'en' || v === 'pt-BR' || v === 'auto') return v;
    } catch {
      /* ignore */
    }
    return 'auto';
  }

  private applyLangAttribute(): void {
    const eff = this.effectiveLocale();
    this.document.documentElement.lang = eff === 'en' ? 'en' : 'pt-BR';
  }
}
