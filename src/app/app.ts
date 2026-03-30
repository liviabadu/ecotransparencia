import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppSettingsModal } from './components/app-settings-modal/app-settings-modal';
import { LogoutConfirmDialog } from './components/logout-confirm-dialog/logout-confirm-dialog';
import { AuthService } from './services/auth.service';
import { LanguageService } from './services/language.service';
import { LogoutDialogService } from './services/logout-dialog.service';
import { SettingsOpenerService } from './services/settings-opener.service';
import { SidebarService } from './services/sidebar.service';
import { ThemeService } from './services/theme.service';

function normalizePath(url: string): string {
  if (!url) return '/';
  const p = url.split('?')[0].split('#')[0].trim();
  if (!p) return '/';
  const withSlash = p.startsWith('/') ? p : `/${p}`;
  const trimmed = withSlash.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function isAuthLoginOrCadastroRoute(url: string): boolean {
  const path = normalizePath(url);
  return path === '/login' || path === '/cadastro';
}

function prefersReducedMotion(): boolean {
  return (
    typeof globalThis.matchMedia === 'function' &&
    globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AppSettingsModal, LogoutConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly sidebar = inject(SidebarService);
  readonly logoutDialog = inject(LogoutDialogService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Scrim da rail em /login e /cadastro: mesmo ritmo do véu {@link AuthBehindHome}
   * (fade-in com 2× rAF; fade-out no NavigationStart ao sair; remove o nó após a transição).
   */
  readonly authRailScrimShow = signal(false);
  readonly authRailScrimMounted = signal(false);
  private railDomHideTimer: ReturnType<typeof setTimeout> | null = null;

  /** Instancia cedo para aplicar tema e idioma salvos */
  private readonly _theme = inject(ThemeService);
  private readonly _language = inject(LanguageService);
  private readonly settingsOpener = inject(SettingsOpenerService);

  readonly settingsOpen = signal(false);

  constructor() {
    this.settingsOpener.settingsOpenRequested.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.sidebar.close();
      this.settingsOpen.set(true);
    });

    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => {
      if (e instanceof NavigationStart) {
        const from = normalizePath(this.router.url);
        const to = normalizePath(e.url);
        if (isAuthLoginOrCadastroRoute(from) && !isAuthLoginOrCadastroRoute(to)) {
          this.clearRailDomHideTimer();
          this.authRailScrimMounted.set(false);
        }
        if (!isAuthLoginOrCadastroRoute(from) && isAuthLoginOrCadastroRoute(to)) {
          this.clearRailDomHideTimer();
          this.authRailScrimShow.set(true);
          this.authRailScrimMounted.set(false);
        }
      }
      if (e instanceof NavigationEnd) {
        const path = normalizePath(this.router.url);
        if (isAuthLoginOrCadastroRoute(path)) {
          this.clearRailDomHideTimer();
          this.authRailScrimShow.set(true);
          if (!this.authRailScrimMounted()) {
            if (prefersReducedMotion()) {
              this.authRailScrimMounted.set(true);
            } else {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => this.authRailScrimMounted.set(true));
              });
            }
          }
        } else if (this.authRailScrimShow()) {
          this.scheduleRailDomHideAfterTransition();
        }
      }
    });

    queueMicrotask(() => {
      if (!isAuthLoginOrCadastroRoute(this.router.url)) return;
      this.authRailScrimShow.set(true);
      this.authRailScrimMounted.set(false);
      if (prefersReducedMotion()) {
        this.authRailScrimMounted.set(true);
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => this.authRailScrimMounted.set(true));
        });
      }
    });
  }

  private clearRailDomHideTimer(): void {
    if (this.railDomHideTimer !== null) {
      clearTimeout(this.railDomHideTimer);
      this.railDomHideTimer = null;
    }
  }

  /** Alinhado ao timer do {@link AuthBehindHome}.scheduleLeaveAnimation (300ms) e ao fade do véu. */
  private scheduleRailDomHideAfterTransition(): void {
    this.clearRailDomHideTimer();
    const ms = prefersReducedMotion() ? 0 : 300;
    this.railDomHideTimer = setTimeout(() => {
      this.authRailScrimShow.set(false);
      this.authRailScrimMounted.set(false);
      this.railDomHideTimer = null;
    }, ms);
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    /* Modal de configurações trata Escape internamente (com animação de saída) */
    if (this.settingsOpen()) return;
    if (!this.sidebar.open()) return;
    this.sidebar.close();
    event.preventDefault();
  }

  toggleSidebar(): void {
    this.sidebar.toggle();
  }

  onSettingsClick(): void {
    this.sidebar.close();
    this.settingsOpen.set(true);
  }

  closeSettings(): void {
    this.settingsOpen.set(false);
  }

  onLogoutDismiss(): void {
    this.logoutDialog.dismiss();
  }

  async onLogoutConfirm(): Promise<void> {
    const opts = this.logoutDialog.consumePending();
    this.logoutDialog.open.set(false);
    try {
      await this.auth.logout();
      await opts.afterLogout?.();
    } catch {
      opts.onError?.();
    }
  }
}
