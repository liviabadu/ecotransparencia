import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppSettingsModal } from './components/app-settings-modal/app-settings-modal';
import { LogoutConfirmDialog } from './components/logout-confirm-dialog/logout-confirm-dialog';
import { AuthService } from './services/auth.service';
import { DashboardRecentSearchesOpenerService } from './services/dashboard-recent-searches-opener.service';
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

/** Duração do keyframe de saída do popover da rail + margem para `animationend` / fallback. */
const RAIL_ACCOUNT_OVERLAY_EXIT_FALLBACK_MS = 320;

/** Flyout Ajuda: saída (fade + deslize) + margem para `animationend` / fallback. */
const RAIL_ACCOUNT_HELP_FLYOUT_EXIT_FALLBACK_MS = 300;

/** Upload de foto (Storage + Auth): evita UI presa se a rede não responder. */
const PROFILE_PHOTO_UPLOAD_TIMEOUT_MS = 120_000;

const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(Object.assign(new Error('Tempo esgotado ao guardar.'), { code: 'deadline-exceeded' }));
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (err) => {
        clearTimeout(id);
        reject(err);
      },
    );
  });
}

function formatProfileSaveError(e: unknown): string {
  const code =
    e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
  if (code.includes('deadline-exceeded')) {
    return 'A operação demorou demais (rede ou firewall). Tente outra rede ou desative VPN.';
  }
  if (code.includes('unavailable') || code.includes('deadline') || code.includes('network')) {
    return 'Serviço temporariamente indisponível. Tente novamente.';
  }
  if (code.includes('permission-denied') || code.includes('storage/unauthorized')) {
    return 'Sem permissão para enviar a imagem. Verifique as regras do Storage no Firebase.';
  }
  if (code.includes('storage/quota-exceeded')) {
    return 'Espaço de armazenamento esgotado no projeto.';
  }
  if (code.startsWith('storage/')) {
    return 'Não foi possível enviar a imagem. Tente outro ficheiro ou verifique a rede.';
  }
  if (e instanceof Error) {
    if (e.message === 'Sem utilizador autenticado') {
      return 'Sessão expirada. Entre de novo.';
    }
    if (
      e.message === 'Escolha um ficheiro de imagem.' ||
      e.message.startsWith('Imagem demasiado grande')
    ) {
      return e.message;
    }
  }
  return 'Não foi possível guardar. Tente novamente.';
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
  private readonly dashboardRecentSearchesOpener = inject(DashboardRecentSearchesOpenerService);
  /** Público: sidebar usa `auth.isAuthenticated()` e dados do utilizador. */
  readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Scrim da rail em /login e /cadastro: mesmo ritmo do véu {@link AuthBehindHome}
   * (fade-in com 2× rAF; fade-out no NavigationStart ao sair; remove o nó após a transição).
   */
  readonly authRailScrimShow = signal(false);
  readonly authRailScrimMounted = signal(false);
  private railDomHideTimer: ReturnType<typeof setTimeout> | null = null;
  private editProfileSuccessCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private railAccountMenuExitFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private railAccountHelpExitFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private railEditProfileExitFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  /** Após fechar o menu com animação, abrir o modal de perfil (clique em “Perfil”). */
  private readonly openEditProfileAfterAccountMenuClose = signal(false);

  /** Instancia cedo para aplicar tema e idioma salvos */
  private readonly _theme = inject(ThemeService);
  private readonly _language = inject(LanguageService);
  private readonly settingsOpener = inject(SettingsOpenerService);

  readonly settingsOpen = signal(false);

  /** Menu estilo conta (só rail recolhida pós-login); itens sem ação por agora. */
  readonly railAccountMenuOpen = signal(false);
  /** True durante a animação de saída do menu da conta (véu + popover). */
  readonly railAccountMenuExiting = signal(false);
  /** Subpainel “Ajuda” à direita do menu da conta (itens ainda sem rota). */
  readonly railAccountHelpPanelOpen = signal(false);
  /** True durante a animação de fecho do flyout Ajuda. */
  readonly railAccountHelpFlyoutExiting = signal(false);

  /** Modal “Editar perfil” (abre a partir da linha Perfil do menu da conta). */
  readonly railEditProfileOpen = signal(false);
  /** True durante a animação de saída do modal editar perfil. */
  readonly railEditProfileExiting = signal(false);
  readonly editProfileDisplayName = signal('');
  readonly editProfileSaving = signal(false);
  readonly editProfileSaveError = signal<string | null>(null);
  readonly editProfileSuccessMessage = signal<string | null>(null);
  readonly editProfilePhotoUploading = signal(false);
  /** Pré-visualização local (blob) logo após escolher ficheiro; revogada ao concluir ou fechar. */
  readonly editProfilePhotoPreviewUrl = signal<string | null>(null);

  private readonly profilePhotoFileInput = viewChild<ElementRef<HTMLInputElement>>('profilePhotoFileInput');

  constructor() {
    effect(() => {
      if (this.sidebar.expanded()) {
        this.clearRailAccountMenuExitFallbackTimer();
        this.openEditProfileAfterAccountMenuClose.set(false);
        this.railAccountMenuExiting.set(false);
        this.railAccountMenuOpen.set(false);
        this.clearRailAccountHelpExitFallbackTimer();
        this.railAccountHelpFlyoutExiting.set(false);
        this.railAccountHelpPanelOpen.set(false);
        this.closeRailEditProfileImmediate();
      }
    });

    this.settingsOpener.settingsOpenRequested.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.onSettingsClick();
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
    if (this.railEditProfileOpen()) {
      this.startRailEditProfileClose();
      event.preventDefault();
      return;
    }
    if (this.railAccountMenuOpen()) {
      if (this.railAccountHelpFlyoutExiting()) {
        event.preventDefault();
        return;
      }
      if (this.railAccountHelpPanelOpen()) {
        this.startRailAccountHelpClose();
        event.preventDefault();
        return;
      }
      this.startRailAccountMenuClose();
      event.preventDefault();
      return;
    }
    if (!this.sidebar.expanded() && !this.sidebar.open()) return;
    this.sidebar.close();
    event.preventDefault();
  }

  toggleSidebar(): void {
    if (this.auth.isAuthenticated()) {
      this.sidebar.toggleExpanded();
    } else {
      this.sidebar.toggleGuestPanel();
    }
  }

  /**
   * Rail unificada pós-login: recolhida → qualquer clique abre; expandida → só o ícone do painel fecha.
   */
  onUnifiedRailToggleClick(event: MouseEvent): void {
    if (!this.auth.isAuthenticated()) {
      this.toggleSidebar();
      return;
    }
    if (!this.sidebar.expanded()) {
      this.toggleSidebar();
      return;
    }
    const t = event.target;
    if (t instanceof Element && t.closest('.app-rail-toggle-chevron')) {
      this.toggleSidebar();
    }
  }

  onUltimasPesquisasRailClick(): void {
    this.dashboardRecentSearchesOpener.requestOpenRecentHistory();
  }

  onRailUserCardClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.railAccountMenuOpen()) {
      this.startRailAccountMenuClose();
    } else {
      this.clearRailAccountHelpExitFallbackTimer();
      this.railAccountHelpFlyoutExiting.set(false);
      this.railAccountHelpPanelOpen.set(false);
      this.railAccountMenuExiting.set(false);
      this.railAccountMenuOpen.set(true);
    }
  }

  /** Fecha o menu da conta com animação (véu, atalho do cartão, Escape). */
  closeRailAccountMenu(): void {
    this.startRailAccountMenuClose();
  }

  private clearRailAccountMenuExitFallbackTimer(): void {
    if (this.railAccountMenuExitFallbackTimer !== null) {
      clearTimeout(this.railAccountMenuExitFallbackTimer);
      this.railAccountMenuExitFallbackTimer = null;
    }
  }

  private clearRailEditProfileExitFallbackTimer(): void {
    if (this.railEditProfileExitFallbackTimer !== null) {
      clearTimeout(this.railEditProfileExitFallbackTimer);
      this.railEditProfileExitFallbackTimer = null;
    }
  }

  startRailAccountMenuClose(): void {
    if (!this.railAccountMenuOpen()) {
      return;
    }
    if (this.railAccountMenuExiting()) {
      return;
    }
    if (prefersReducedMotion()) {
      this.finishRailAccountMenuClose();
      return;
    }
    /* Fecho imediato do Ajuda ao fechar o menu inteiro (anima só o popover principal). */
    this.clearRailAccountHelpExitFallbackTimer();
    this.railAccountHelpFlyoutExiting.set(false);
    this.railAccountHelpPanelOpen.set(false);
    this.railAccountMenuExiting.set(true);
    this.clearRailAccountMenuExitFallbackTimer();
    this.railAccountMenuExitFallbackTimer = globalThis.setTimeout(() => {
      this.railAccountMenuExitFallbackTimer = null;
      if (this.railAccountMenuOpen() && this.railAccountMenuExiting()) {
        this.finishRailAccountMenuClose();
      }
    }, RAIL_ACCOUNT_OVERLAY_EXIT_FALLBACK_MS);
  }

  private finishRailAccountMenuClose(): void {
    this.clearRailAccountMenuExitFallbackTimer();
    if (!this.railAccountMenuOpen()) {
      return;
    }
    const openEdit = this.openEditProfileAfterAccountMenuClose();
    this.openEditProfileAfterAccountMenuClose.set(false);
    this.clearRailAccountHelpExitFallbackTimer();
    this.railAccountHelpFlyoutExiting.set(false);
    this.railAccountHelpPanelOpen.set(false);
    this.railAccountMenuExiting.set(false);
    this.railAccountMenuOpen.set(false);
    if (openEdit) {
      this.clearEditProfileSuccessTimer();
      this.revokeEditProfilePhotoPreview();
      this.editProfileSaveError.set(null);
      this.editProfileSuccessMessage.set(null);
      this.editProfileDisplayName.set(this.auth.getDisplayName());
      this.editProfilePhotoUploading.set(false);
      this.railEditProfileExiting.set(false);
      this.railEditProfileOpen.set(true);
    }
  }

  onRailAccountMenuPopoverAnimEnd(event: AnimationEvent): void {
    if (!this.railAccountMenuExiting()) {
      return;
    }
    if (event.target !== event.currentTarget) {
      return;
    }
    if (!event.animationName.includes('appRailAccountPopoverOut')) {
      return;
    }
    this.finishRailAccountMenuClose();
  }

  openRailEditProfile(): void {
    if (!this.railAccountMenuOpen()) {
      return;
    }
    this.openEditProfileAfterAccountMenuClose.set(true);
    this.startRailAccountMenuClose();
  }

  /** Abre o Ajuda ou inicia o fecho com animação (segundo clique na linha “Ajuda”). */
  toggleRailAccountHelp(): void {
    if (this.railAccountHelpFlyoutExiting()) {
      return;
    }
    if (this.railAccountHelpPanelOpen()) {
      this.startRailAccountHelpClose();
    } else {
      this.railAccountHelpPanelOpen.set(true);
    }
  }

  closeRailAccountHelp(): void {
    this.startRailAccountHelpClose();
  }

  private clearRailAccountHelpExitFallbackTimer(): void {
    if (this.railAccountHelpExitFallbackTimer !== null) {
      clearTimeout(this.railAccountHelpExitFallbackTimer);
      this.railAccountHelpExitFallbackTimer = null;
    }
  }

  startRailAccountHelpClose(): void {
    if (!this.railAccountHelpPanelOpen() || this.railAccountHelpFlyoutExiting()) {
      return;
    }
    if (prefersReducedMotion()) {
      this.finishRailAccountHelpClose();
      return;
    }
    this.railAccountHelpFlyoutExiting.set(true);
    this.clearRailAccountHelpExitFallbackTimer();
    this.railAccountHelpExitFallbackTimer = globalThis.setTimeout(() => {
      this.railAccountHelpExitFallbackTimer = null;
      if (this.railAccountHelpFlyoutExiting()) {
        this.finishRailAccountHelpClose();
      }
    }, RAIL_ACCOUNT_HELP_FLYOUT_EXIT_FALLBACK_MS);
  }

  private finishRailAccountHelpClose(): void {
    this.clearRailAccountHelpExitFallbackTimer();
    this.railAccountHelpFlyoutExiting.set(false);
    this.railAccountHelpPanelOpen.set(false);
  }

  onRailAccountHelpFlyoutAnimEnd(event: AnimationEvent): void {
    if (!this.railAccountHelpFlyoutExiting()) {
      return;
    }
    if (event.target !== event.currentTarget) {
      return;
    }
    if (!event.animationName.includes('appRailAccountHelpFlyoutOut')) {
      return;
    }
    this.finishRailAccountHelpClose();
  }

  private clearEditProfileSuccessTimer(): void {
    if (this.editProfileSuccessCloseTimer !== null) {
      clearTimeout(this.editProfileSuccessCloseTimer);
      this.editProfileSuccessCloseTimer = null;
    }
  }

  /** Fecha o modal com animação (Cancelar, véu, Escape, após “Salvar”). */
  closeRailEditProfile(): void {
    this.startRailEditProfileClose();
  }

  /**
   * Garante que o popover da conta não fique pendente ao sair do editor de perfil
   * (Cancelar / véu / Esc / Fechar após salvar).
   */
  private dismissRailAccountMenuChromeForEditProfileClose(): void {
    this.openEditProfileAfterAccountMenuClose.set(false);
    this.clearRailAccountMenuExitFallbackTimer();
    this.clearRailAccountHelpExitFallbackTimer();
    this.railAccountHelpFlyoutExiting.set(false);
    this.railAccountHelpPanelOpen.set(false);
    this.railAccountMenuExiting.set(false);
    this.railAccountMenuOpen.set(false);
  }

  /** Fecho imediato (ex.: sidebar expandida) — sem animação. */
  closeRailEditProfileImmediate(): void {
    this.clearRailEditProfileExitFallbackTimer();
    this.clearEditProfileSuccessTimer();
    this.dismissRailAccountMenuChromeForEditProfileClose();
    this.revokeEditProfilePhotoPreview();
    this.editProfileSaveError.set(null);
    this.editProfileSuccessMessage.set(null);
    this.editProfileSaving.set(false);
    this.editProfilePhotoUploading.set(false);
    this.railEditProfileExiting.set(false);
    this.railEditProfileOpen.set(false);
  }

  private revokeEditProfilePhotoPreview(): void {
    const url = this.editProfilePhotoPreviewUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.editProfilePhotoPreviewUrl.set(null);
    }
  }

  pickProfilePhoto(ev: Event): void {
    ev.stopPropagation();
    if (
      this.editProfileSaving() ||
      this.editProfilePhotoUploading() ||
      !!this.editProfileSuccessMessage()
    ) {
      return;
    }
    this.profilePhotoFileInput()?.nativeElement.click();
  }

  async onProfilePhotoFileChange(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.editProfileSaveError.set('Escolha um ficheiro de imagem.');
      return;
    }
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      this.editProfileSaveError.set('Imagem demasiado grande (máximo 5 MB).');
      return;
    }

    this.editProfileSaveError.set(null);
    this.revokeEditProfilePhotoPreview();
    this.editProfilePhotoPreviewUrl.set(URL.createObjectURL(file));

    this.editProfilePhotoUploading.set(true);
    try {
      await withTimeout(this.auth.uploadProfilePhoto(file), PROFILE_PHOTO_UPLOAD_TIMEOUT_MS);
      this.revokeEditProfilePhotoPreview();
    } catch (e) {
      this.editProfileSaveError.set(formatProfileSaveError(e));
      this.revokeEditProfilePhotoPreview();
    } finally {
      this.editProfilePhotoUploading.set(false);
    }
  }

  startRailEditProfileClose(): void {
    if (!this.railEditProfileOpen()) {
      return;
    }
    if (this.railEditProfileExiting()) {
      return;
    }
    if (prefersReducedMotion()) {
      this.closeRailEditProfileImmediate();
      return;
    }
    this.railEditProfileExiting.set(true);
    this.clearRailEditProfileExitFallbackTimer();
    this.railEditProfileExitFallbackTimer = globalThis.setTimeout(() => {
      this.railEditProfileExitFallbackTimer = null;
      if (this.railEditProfileOpen() && this.railEditProfileExiting()) {
        this.closeRailEditProfileImmediate();
      }
    }, RAIL_ACCOUNT_OVERLAY_EXIT_FALLBACK_MS);
  }

  onRailEditProfileAnimEnd(event: AnimationEvent): void {
    if (!this.railEditProfileExiting()) {
      return;
    }
    if (event.target !== event.currentTarget) {
      return;
    }
    if (!event.animationName.includes('appRailEditProfileOut')) {
      return;
    }
    this.closeRailEditProfileImmediate();
  }

  async onRailEditProfileSave(): Promise<void> {
    const name = this.editProfileDisplayName().trim();
    if (!name || this.editProfileSaving() || this.editProfilePhotoUploading()) return;
    this.editProfileSaveError.set(null);
    this.editProfileSaving.set(true);
    try {
      const displayUnchanged = this.auth.getDisplayName().trim() === name;
      if (displayUnchanged) {
        if (!this.railEditProfileOpen()) {
          this.editProfileSaving.set(false);
          return;
        }
        this.editProfileSaving.set(false);
        this.editProfileSuccessMessage.set('Perfil atualizado com sucesso.');
        const delayMs = 2000;
        this.editProfileSuccessCloseTimer = globalThis.setTimeout(() => {
          this.editProfileSuccessCloseTimer = null;
          this.closeRailEditProfile();
        }, delayMs);
        return;
      }

      await withTimeout(this.auth.updateDisplayName(name), 35_000);
      if (!this.railEditProfileOpen()) {
        return;
      }
      this.editProfileSaving.set(false);
      this.editProfileSuccessMessage.set('Perfil atualizado com sucesso.');
      const delayMs = 2000;
      this.editProfileSuccessCloseTimer = globalThis.setTimeout(() => {
        this.editProfileSuccessCloseTimer = null;
        this.closeRailEditProfile();
      }, delayMs);
    } catch (e) {
      if (!this.railEditProfileOpen()) {
        return;
      }
      this.editProfileSaving.set(false);
      this.editProfileSaveError.set(formatProfileSaveError(e));
    }
  }

  /** Mesmo fluxo do “Sair” do menu do avatar no dashboard: confirmação + signOut. */
  requestLogoutFromRailAccountMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.startRailAccountMenuClose();
    this.logoutDialog.request();
  }

  onSettingsClick(): void {
    if (this.railAccountMenuOpen()) {
      this.clearRailAccountMenuExitFallbackTimer();
      this.clearRailAccountHelpExitFallbackTimer();
      this.railAccountMenuExiting.set(false);
      this.railAccountHelpFlyoutExiting.set(false);
      this.railAccountHelpPanelOpen.set(false);
      this.railAccountMenuOpen.set(false);
    }
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
