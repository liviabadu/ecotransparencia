import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Search } from '../../../components/search/search';
import { AuthService } from '../../../services/auth.service';
import { LogoutDialogService } from '../../../services/logout-dialog.service';
import { SettingsOpenerService } from '../../../services/settings-opener.service';

export type DashRiskLevel = 'low' | 'medium' | 'high';

export interface DashFavoriteRow {
  name: string;
  score: number;
  risk: DashRiskLevel;
}

/**
 * Painel pós-login: busca, atalhos e áreas reservadas a histórico/favoritos/insights.
 * Dados de listas são placeholders até existir backend ou persistência local.
 */
@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [RouterLink, Search],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.css',
})
export class HomeDashboard {
  readonly auth = inject(AuthService);
  private readonly settingsOpener = inject(SettingsOpenerService);
  private readonly logoutDialog = inject(LogoutDialogService);

  @ViewChild('userMenuRoot', { read: ElementRef }) private userMenuRoot?: ElementRef<HTMLElement>;

  /** Menu do avatar (Perfil / Configurações / Sair) */
  protected readonly userMenuOpen = signal(false);

  /** Listas vazias por padrão — substituir por serviço quando houver API */
  protected readonly recentCompanies = signal<string[]>([]);
  protected readonly favoriteIds = signal<string[]>([]);
  protected readonly historyLines = signal<string[]>([]);
  protected readonly alertLines = signal<string[]>([]);
  protected readonly favoriteRows = signal<DashFavoriteRow[]>([]);

  protected readonly highRiskPreview = signal<string[]>([]);
  protected readonly criticalSectors = signal<string[]>([]);

  readonly dashSearchPlaceholder = 'Digite o nome ou CNPJ da empresa';

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen.update((o) => !o);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  openSettings(): void {
    this.closeUserMenu();
    this.settingsOpener.requestOpen();
  }

  onProfileClick(event: Event): void {
    event.preventDefault();
    this.closeUserMenu();
    /* Rota /perfil quando existir */
  }

  requestLogout(): void {
    this.closeUserMenu();
    this.logoutDialog.request();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  @HostListener('document:keydown', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.logoutDialog.open()) {
      this.logoutDialog.dismiss();
      event.preventDefault();
      return;
    }
    if (!this.userMenuOpen()) return;
    this.closeUserMenu();
    event.preventDefault();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent): void {
    if (!this.userMenuOpen()) return;
    const root = this.userMenuRoot?.nativeElement;
    const t = ev.target;
    if (root && t instanceof Node && root.contains(t)) return;
    this.userMenuOpen.set(false);
  }
}
