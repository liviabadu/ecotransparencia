import { NgZone } from '@angular/core';

/**
 * Storytelling na home (só até o fim da primeira leitura da página):
 *
 * - Enquanto o usuário desce: fade-in / reveal-scale (IntersectionObserver,
 *   só adiciona .is-inview, não remove).
 * - Ao chegar ao final (sentinel visível): “encerra” — tudo estático, observers desligados.
 *
 * Sem listener de scroll: o fim da página é detectado por IO no .home-story-end-sentinel
 * (o parallax em JS foi removido — getBoundingClientRect a cada frame deixava o scroll pesado).
 * prefers-reduced-motion: estados finais imediatos, sem observers.
 */

const IO_FADE_MARGIN = '0px 0px -10% 0px';
const IO_FADE_THRESHOLD = 0.06;
const IO_SCALE_THRESHOLD = 0.12;
/** Mesma folga que antes (checkReachedBottom): considerar “chegou ao fim” um pouco antes */
const BOTTOM_SLACK_PX = 56;
/** Página que quase não rola: encerra efeitos de uma vez */
const SHORT_PAGE_EXTRA_PX = 64;

export class HomeScrollStory {
  private ioFade: IntersectionObserver | null = null;
  private ioScale: IntersectionObserver | null = null;
  private ioBottom: IntersectionObserver | null = null;

  private settled = false;

  private readonly reduced: boolean;

  constructor(
    private readonly root: HTMLElement,
    private readonly zone: NgZone,
  ) {
    this.reduced =
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init(): void {
    if (this.reduced) {
      this.zone.runOutsideAngular(() => {
        this.applyReducedMotionDefaults();
        this.root.classList.add('home-story--settled');
      });
      return;
    }

    /**
     * Fontes críticas já foram aguardadas no APP_INITIALIZER (font-initializers.ts)
     * antes do bootstrap — o primeiro paint do Angular usa Inter/Space Grotesk estáveis.
     */
    this.zone.runOutsideAngular(() => {
      this.markVisibleIfAlreadyInViewport();

      this.setupFadeInObserver();
      this.setupRevealScaleObserver();
      this.setupBottomSentinelObserver();

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
    this.ioFade?.disconnect();
    this.ioFade = null;
    this.ioScale?.disconnect();
    this.ioScale = null;
    this.ioBottom?.disconnect();
    this.ioBottom = null;
  }

  /** Página menor que a viewport: não há “descida”; aplica estado final. */
  private maybeSettleShortPage(): void {
    if (this.settled || typeof window === 'undefined') return;
    const doc = document.documentElement;
    if (doc.scrollHeight <= window.innerHeight + SHORT_PAGE_EXTRA_PX) {
      this.settle();
    }
  }

  /**
   * Estado “normal”: tudo visível, sem observers.
   */
  private settle(): void {
    if (this.settled) return;
    this.settled = true;

    this.ioFade?.disconnect();
    this.ioFade = null;
    this.ioScale?.disconnect();
    this.ioScale = null;
    this.ioBottom?.disconnect();
    this.ioBottom = null;

    for (const el of this.root.querySelectorAll('.fade-in')) {
      el.classList.add('is-inview');
    }
    for (const el of this.root.querySelectorAll('.reveal-scale')) {
      el.classList.add('is-inview');
    }

    this.root.classList.add('home-story--settled');
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
   * Fim da home: rootMargin inferior amplia a zona — equivalente ao “slack” do scroll antigo.
   */
  private setupBottomSentinelObserver(): void {
    const sentinel = this.root.querySelector('.home-story-end-sentinel');
    if (!sentinel) return;

    const margin = `0px 0px ${BOTTOM_SLACK_PX}px 0px`;
    this.ioBottom = new IntersectionObserver(
      (entries) => {
        if (this.settled) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.settle();
            return;
          }
        }
      },
      { root: null, rootMargin: margin, threshold: 0 },
    );
    this.ioBottom.observe(sentinel);
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
}
