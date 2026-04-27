import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeScrollStory } from '../home/home-scroll-story';

@Component({
  selector: 'app-metodologia',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './metodologia.html',
  styleUrls: ['./metodologia.css', '../home/home-scroll-story.css'],
})
export class Metodologia implements AfterViewInit, OnDestroy {
  readonly footerContactEmail = 'contato@ecotransparencia.org';
  readonly footerMailto = 'mailto:contato@ecotransparencia.org';
  readonly footerSocial = {
    linkedin: 'https://www.linkedin.com/',
    instagram: 'https://www.instagram.com/',
    github: 'https://github.com/',
  } as const;

  private readonly zone = inject(NgZone);
  private scrollStory?: HomeScrollStory;

  @ViewChild('storyHost', { read: ElementRef }) private storyHost?: ElementRef<HTMLElement>;

  /** Rodapé com href="#" (placeholders): evita saltar ao topo */
  preventFooterPlaceholder(event: Event): void {
    event.preventDefault();
  }

  scrollToTop(): void {
    if (typeof window === 'undefined') return;
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
}
