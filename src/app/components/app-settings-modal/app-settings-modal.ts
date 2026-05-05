import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { AppLanguage, LanguageService } from '../../services/language.service';
import { AppThemeMode, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './app-settings-modal.html',
  styleUrl: './app-settings-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSettingsModal {
  readonly closed = output<void>();
  readonly theme = inject(ThemeService);
  readonly language = inject(LanguageService);
  readonly auth = inject(AuthService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly activePane = signal<'geral' | 'advanced'>('geral');
  protected readonly appearanceOpen = signal(false);
  protected readonly languageOpen = signal(false);
  /** Entrada: transição de abertura */
  protected readonly mounted = signal(false);
  /** Saída: após animação emite `closed` */
  protected readonly leaving = signal(false);

  private readonly reduceMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    afterNextRender(() => {
      if (this.reduceMotion) {
        this.mounted.set(true);
        return;
      }
      requestAnimationFrame(() =>
        requestAnimationFrame(() => this.mounted.set(true)),
      );
    });
  }

  requestClose(): void {
    if (this.leaving()) return;
    if (this.reduceMotion) {
      this.closed.emit();
      return;
    }
    this.leaving.set(true);
    this.closeDropdowns();
  }

  onOverlayTransitionEnd(event: TransitionEvent): void {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== 'opacity') return;
    if (!this.leaving()) return;
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.appearanceOpen() || this.languageOpen()) {
      this.closeDropdowns();
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.requestClose();
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.appearanceOpen() && !this.languageOpen()) {
      return;
    }

    const t = event.target as Node;
    const el = this.host.nativeElement;

    if (this.appearanceOpen()) {
      const r = el.querySelector('.app-settings-dropdown--appearance');
      if (!r?.contains(t)) this.appearanceOpen.set(false);
    }
    if (this.languageOpen()) {
      const r = el.querySelector('.app-settings-dropdown--language');
      if (!r?.contains(t)) this.languageOpen.set(false);
    }
  }

  toggleAppearanceMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.languageOpen.set(false);
    this.appearanceOpen.update((o) => !o);
  }

  toggleLanguageMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.appearanceOpen.set(false);
    this.languageOpen.update((o) => !o);
  }

  pickAppearance(mode: AppThemeMode, event: MouseEvent): void {
    event.stopPropagation();
    this.theme.setMode(mode);
    this.appearanceOpen.set(false);
  }

  pickLanguage(code: AppLanguage, event: MouseEvent): void {
    event.stopPropagation();
    this.language.setLang(code);
    this.languageOpen.set(false);
  }

  protected appearanceLabel(): string {
    return this.language.modalCopy().themeDark;
  }

  protected languageLabel(): string {
    const c = this.language.modalCopy();
    const pref = this.language.lang();
    if (pref === 'auto') return c.langAuto;
    if (pref === 'en') return c.langEn;
    return c.langPt;
  }

  selectGeral(): void {
    this.activePane.set('geral');
    this.closeDropdowns();
  }

  selectAdvanced(): void {
    this.activePane.set('advanced');
    this.closeDropdowns();
  }

  private closeDropdowns(): void {
    this.appearanceOpen.set(false);
    this.languageOpen.set(false);
  }
}
