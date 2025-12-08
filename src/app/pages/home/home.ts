import { Component } from '@angular/core';
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
  /**
   * Scroll suave para seção
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
