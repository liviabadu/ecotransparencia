import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SidebarService } from './services/sidebar.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly sidebar = inject(SidebarService);

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (!this.sidebar.open()) return;
    this.sidebar.close();
    event.preventDefault();
  }

  toggleSidebar(): void {
    this.sidebar.toggle();
  }

  /** Painel de configurações será ligado depois */
  onSettingsClick(): void {
    // reservado
  }
}
