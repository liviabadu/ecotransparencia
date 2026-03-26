import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Search } from '../../components/search/search';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Search, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  isHelpMenuOpen = signal(false);

  /**
   * Scroll suave para seção
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleHelpMenu(): void {
    this.isHelpMenuOpen.update((value) => !value);
  }

  @HostListener('document:keydown', ['$event'])
  onEscapeCloseHelp(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.isHelpMenuOpen()) return;
    this.isHelpMenuOpen.set(false);
    event.preventDefault();
  }

  @HostListener('document:click')
  closeHelpMenu(): void {
    this.isHelpMenuOpen.set(false);
  }
}
