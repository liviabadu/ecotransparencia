import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppSettingsModal } from './components/app-settings-modal/app-settings-modal';
import { LanguageService } from './services/language.service';
import { SidebarService } from './services/sidebar.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AppSettingsModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly sidebar = inject(SidebarService);
  /** Instancia cedo para aplicar tema e idioma salvos */
  private readonly _theme = inject(ThemeService);
  private readonly _language = inject(LanguageService);

  readonly settingsOpen = signal(false);

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
}
