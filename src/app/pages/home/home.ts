import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Search } from '../../components/search/search';
import { CounterDirective } from '../../directives/counter.directive';
import { HomeScrollStory } from './home-scroll-story';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Search, RouterLink, CounterDirective],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  isHelpMenuOpen = signal(false);

  /** Host dos efeitos até o fim da página — ver home-scroll-story.ts */
  @ViewChild('storyHost', { read: ElementRef }) private storyHost?: ElementRef<HTMLElement>;

  private readonly zone = inject(NgZone);
  private scrollStory?: HomeScrollStory;

  /** Rodapé com href="#" (placeholders): evita saltar ao topo e “piscar” a viewport */
  preventFooterPlaceholder(event: Event): void {
    event.preventDefault();
  }

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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  ngAfterViewInit(): void {
    const el = this.storyHost?.nativeElement;
    if (!el || typeof window === 'undefined') return;
    this.scrollStory = new HomeScrollStory(el, this.zone);
    this.scrollStory.init();
  }

  ngOnDestroy(): void {
    this.scrollStory?.destroy();
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
