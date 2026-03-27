import { NgZone } from '@angular/core';

/**
 * Storytelling na home (só até o fim da primeira leitura da página):
 *
 * - Enquanto o usuário desce a home: fade-in / reveal-scale (IntersectionObserver,
 *   só adiciona .is-inview, não remove) + parallax no scroll (rAF).
 * - Ao chegar ao final da página (ou página curta que não rola): “encerra” — tudo fica
 *   estático, observers e parallax desligados; voltar ao hero fica normal, sem efeito extra.
 *
 * Sem interação com o mouse (tilt removido).
 * prefers-reduced-motion: estados finais imediatos, sem listeners.
 *
 * Por que o texto “some” ao salvar/recarregar no dev:
 * .fade-in começa em opacity:0 até receber .is-inview. O IO dispara após o layout;
 * por isso markVisibleIfAlreadyInViewport() (e rAF duplo) corre logo após montar os observers.
 */

const IO_FADE_MARGIN = '0px 0px -10% 0px';
const IO_FADE_THRESHOLD = 0.06;
const IO_SCALE_THRESHOLD = 0.12;
/** Pixels do fim do documento para considerar “desceu a home inteira” */
const BOTTOM_SLACK_PX = 56;
/** Página que quase não rola: encerra efeitos de uma vez */
const SHORT_PAGE_EXTRA_PX = 64;

export class HomeScrollStory {
  private readonly parallaxEls: HTMLElement[] = [];

  private ioFade: IntersectionObserver | null = null;
  private ioScale: IntersectionObserver | null = null;

  private rafScroll = 0;
  private settled = false;

  private readonly reduced: boolean;

  private readonly onScrollOrResize = (): void => {
    if (this.settled) return;
    this.checkReachedBottom();
    this.scheduleParallax();
  };

  constructor(
    private readonly root: HTMLElement,
    private readonly zone: NgZone,
  ) {
    this.reduced =
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init(): void {
    this.zone.runOutsideAngular(() => {
      if (this.reduced) {
        this.applyReducedMotionDefaults();
        this.root.classList.add('home-story--settled');
        return;
      }

      /* Antes dos observers: marcar viewport (reduz 1 frame com hero invisível no F5) */
      this.markVisibleIfAlreadyInViewport();

      this.setupFadeInObserver();
      this.setupRevealScaleObserver();
      this.setupParallaxScroll();

      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', this.onScrollOrResize, { passive: true });
        window.addEventListener('resize', this.onScrollOrResize, { passive: true });
      }

      this.scheduleParallax();
      this.checkReachedBottom();
      this.maybeSettleShortPage();

      this.markVisibleIfAlreadyInViewport();
      requestAnimationFrame(() => {
        this.markVisibleIfAlreadyInViewport();
        requestAnimationFrame(() => this.markVisibleIfAlreadyInViewport());
      });
    });
  }

  /**
   * Replica de forma aproximada a visibilidade do IO, sem esperar o callback assíncrono.
   * Evita hero (e qualquer bloco já na tela) ficar com opacity:0 após reload/HMR.
   */
  private markVisibleIfAlreadyInViewport(): void {
    if (this.settled || typeof window === 'undefined') return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const fadeEffectiveBottom = vh * 0.9;

    for (const el of this.root.querySelectorAll('.fade-in')) {
      const r = (el as Element).getBoundingClientRect();
      if (r.width <= 0 && r.height <= 0) continue;
      const top = Math.max(r.top, 0);
      const bottom = Math.min(r.bottom, fadeEffectiveBottom);
      const visibleH = bottom - top;
      const ratio = r.height > 0 ? visibleH / r.height : visibleH > 0 ? 1 : 0;
      if (visibleH > 0 && r.left < vw && r.right > 0 && ratio >= IO_FADE_THRESHOLD * 0.45) {
        el.classList.add('is-inview');
      }
    }

    for (const el of this.root.querySelectorAll('.reveal-scale')) {
      const r = (el as Element).getBoundingClientRect();
      if (r.width <= 0 && r.height <= 0) continue;
      const top = Math.max(r.top, 0);
      const bottom = Math.min(r.bottom, vh);
      const visibleH = bottom - top;
      const ratio = r.height > 0 ? visibleH / r.height : visibleH > 0 ? 1 : 0;
      if (visibleH > 0 && r.left < vw && r.right > 0 && ratio >= IO_SCALE_THRESHOLD * 0.45) {
        el.classList.add('is-inview');
      }
    }
  }

  destroy(): void {
    this.teardownScrollListeners();

    if (this.rafScroll) {
      cancelAnimationFrame(this.rafScroll);
      this.rafScroll = 0;
    }

    this.ioFade?.disconnect();
    this.ioFade = null;
    this.ioScale?.disconnect();
    this.ioScale = null;

    for (const el of this.parallaxEls) {
      el.style.transform = '';
    }
  }

  /** Página menor que a viewport: não há “descida”; aplica estado final. */
  private maybeSettleShortPage(): void {
    if (this.settled || typeof window === 'undefined') return;
    const doc = document.documentElement;
    if (doc.scrollHeight <= window.innerHeight + SHORT_PAGE_EXTRA_PX) {
      this.settle();
    }
  }

  /** Doc quase no fim → encerra jornada de efeitos. */
  private checkReachedBottom(): void {
    if (this.settled || typeof window === 'undefined') return;
    const doc = document.documentElement;
    const y = window.scrollY || doc.scrollTop;
    const remaining = doc.scrollHeight - y - window.innerHeight;
    if (remaining <= BOTTOM_SLACK_PX) {
      this.settle();
    }
  }

  /**
   * Estado “normal”: tudo visível, parallax zerado, sem observers nem scroll handler.
   */
  private settle(): void {
    if (this.settled) return;
    this.settled = true;

    this.ioFade?.disconnect();
    this.ioFade = null;
    this.ioScale?.disconnect();
    this.ioScale = null;

    this.teardownScrollListeners();

    if (this.rafScroll) {
      cancelAnimationFrame(this.rafScroll);
      this.rafScroll = 0;
    }

    for (const el of this.root.querySelectorAll('.fade-in')) {
      el.classList.add('is-inview');
    }
    for (const el of this.root.querySelectorAll('.reveal-scale')) {
      el.classList.add('is-inview');
    }
    for (const el of this.parallaxEls) {
      el.style.transform = '';
    }

    this.root.classList.add('home-story--settled');
  }

  private teardownScrollListeners(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScrollOrResize);
      window.removeEventListener('resize', this.onScrollOrResize);
    }
  }

  private applyReducedMotionDefaults(): void {
    for (const el of this.root.querySelectorAll('.fade-in')) {
      el.classList.add('is-inview');
    }
    for (const el of this.root.querySelectorAll('.reveal-scale')) {
      el.classList.add('is-inview');
    }
  }

  /**
   * Só adiciona .is-inview ao entrar — não remove ao sair, até settle()
   * (evita piscar ao subir/descer no meio da “primeira viagem”).
   */
  private setupFadeInObserver(): void {
    this.ioFade = new IntersectionObserver(
      (entries) => {
        if (this.settled) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
          }
        }
      },
      { root: null, rootMargin: IO_FADE_MARGIN, threshold: IO_FADE_THRESHOLD },
    );

    for (const el of this.root.querySelectorAll('.fade-in')) {
      this.ioFade.observe(el);
    }
  }

  private setupRevealScaleObserver(): void {
    this.ioScale = new IntersectionObserver(
      (entries) => {
        if (this.settled) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
          }
        }
      },
      { root: null, rootMargin: '0px', threshold: IO_SCALE_THRESHOLD },
    );

    for (const el of this.root.querySelectorAll('.reveal-scale')) {
      this.ioScale.observe(el);
    }
  }

  private setupParallaxScroll(): void {
    this.parallaxEls.length = 0;
    for (const el of this.root.querySelectorAll('.parallax-scroll')) {
      this.parallaxEls.push(el as HTMLElement);
    }
  }

  private scheduleParallax(): void {
    if (this.settled || !this.parallaxEls.length || this.rafScroll) return;
    this.rafScroll = requestAnimationFrame(() => {
      this.rafScroll = 0;
      if (this.settled) return;

      const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
      const mid = vh * 0.5;

      for (const el of this.parallaxEls) {
        const speed = Number.parseFloat(el.dataset['parallaxSpeed'] ?? '0.15');
        const s = Number.isFinite(speed) ? speed : 0.15;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height * 0.5;
        const offset = centerY - mid;
        const ty = -offset * s * 0.08;
        el.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
      }
    });
  }
}
