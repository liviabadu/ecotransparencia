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
import { Search } from '../../../components/search/search';
import { CounterDirective } from '../../../directives/counter.directive';
import { HomeScrollStory } from '../home-scroll-story';

/**
 * Landing pública (pré-login): marketing, hero, como funciona, sobre e rodapé.
 * Efeitos de scroll até o fim da página — ver {@link HomeScrollStory}.
 */
@Component({
  selector: 'app-home-public',
  standalone: true,
  imports: [Search, RouterLink, CounterDirective],
  templateUrl: './home-public.component.html',
  styleUrls: ['./home-public.component.css', '../home-scroll-story.css'],
})
export class HomePublic implements AfterViewInit, OnDestroy {
  readonly footerContactEmail = 'contato@ecotransparencia.org';
  readonly footerMailto = 'mailto:contato@ecotransparencia.org';
  readonly footerSocial = {
    linkedin: 'https://www.linkedin.com/',
    instagram: 'https://www.instagram.com/',
    github: 'https://github.com/',
  } as const;

  isHelpMenuOpen = signal(false);

  @ViewChild('storyHost', { read: ElementRef }) private storyHost?: ElementRef<HTMLElement>;

  private readonly zone = inject(NgZone);
  private scrollStory?: HomeScrollStory;

  preventFooterPlaceholder(event: Event): void {
    event.preventDefault();
  }

  onFooterInPageLink(event: Event, sectionId: string): void {
    event.preventDefault();
    this.scrollToSection(sectionId);
  }

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
