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
  loading: string;
  loggedInLead: string;
  guestLead: string;
  signIn: string;
  signUp: string;
}

const MODAL_COPY: Record<ModalLocale, SettingsModalCopy> = {
  'pt-BR': {
    closeAria: 'Fechar configurações',
    navAria: 'Seções',
    navGeral: 'Geral',
    navData: 'Controlar dados',
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
    dataTitle: 'Controlar dados',
    dataSubtitle: 'Conta, segurança e privacidade neste dispositivo',
    loading: 'Carregando…',
    loggedInLead:
      'Sua sessão está ativa com segurança. Recursos extras e gestão de dados ficam disponíveis quando você usa a conta conectada.',
    guestLead:
      'Faça login para aproveitar melhores experiências no site, com proteção dos seus dados e privacidade reforçada.',
    signIn: 'Entrar',
    signUp: 'Criar conta',
  },
  en: {
    closeAria: 'Close settings',
    navAria: 'Sections',
    navGeral: 'General',
    navData: 'Data controls',
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
    dataTitle: 'Data controls',
    dataSubtitle: 'Account, security, and privacy on this device',
    loading: 'Loading…',
    loggedInLead:
      'Your session is active and secure. Extra features and data management are available when you use your connected account.',
    guestLead:
      'Sign in to get a better experience, stronger protection for your data, and improved privacy.',
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
