import { Directive, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';

/** ease-out cúbico (animação fluida) */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Contador estilo odômetro. Atributo `counter` + `class="counter"`.
 * IntersectionObserver + requestAnimationFrame na animação dos dígitos.
 * Ao sair da viewport: animação cancela e faixas voltam a zero; ao entrar de novo, conta de novo.
 */
@Directive({
  selector: '[counter]',
  standalone: true,
})
export class CounterDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);

  private rafId = 0;
  private playTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  private readonly columns: { strip: HTMLElement; target: number }[] = [];
  private digitPx = 0;
  private durationMs = 2000;
  private delayMs = 0;
  private wasIntersecting = false;
  private observeTarget: Element | null = null;

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    const pattern = el.dataset['pattern'];
    const targetStr = el.dataset['target'];
    const suffix = el.dataset['suffix'] ?? '';

    el.textContent = '';
    el.classList.add('counter--odometer');

    if (pattern) {
      this.buildPattern(el, pattern);
    } else if (targetStr != null) {
      const n = Number.parseInt(targetStr, 10);
      if (!Number.isFinite(n) || n < 0) return;
      this.buildNumber(el, n, suffix);
    } else {
      return;
    }

    if (typeof window === 'undefined') return;

    this.durationMs = Number.parseInt(el.dataset['duration'] ?? '2000', 10) || 2000;
    this.delayMs = Number.parseInt(el.dataset['delay'] ?? '0', 10) || 0;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      requestAnimationFrame(() => {
        this.cacheDigitPx();
        this.applyFinalState();
      });
      return;
    }

    this.observeTarget = el.closest('.stat-item') ?? el.closest('.about-stats') ?? el;

    requestAnimationFrame(() => {
      this.cacheDigitPx();
      this.resetStripsToZero();
      this.attachIntersectionObserver();
    });
  }

  ngOnDestroy(): void {
    this.teardownObserver();
    this.abortPlay();
  }

  private attachIntersectionObserver(): void {
    const observeTarget = this.observeTarget;
    if (!observeTarget) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== observeTarget) continue;

          if (entry.isIntersecting) {
            if (!this.wasIntersecting) {
              this.wasIntersecting = true;
              this.schedulePlay();
            }
          } else if (this.wasIntersecting) {
            this.wasIntersecting = false;
            this.abortPlay();
            this.resetStripsToZero();
          }
        }
      },
      { root: null, threshold: 0, rootMargin: '0px 0px 15% 0px' },
    );

    this.intersectionObserver.observe(observeTarget);
  }

  private teardownObserver(): void {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
  }

  private schedulePlay(): void {
    this.abortPlay();
    this.resetStripsToZero();
    this.cacheDigitPx();

    this.playTimeoutId = window.setTimeout(() => {
      this.playTimeoutId = null;
      this.runAnimation(this.durationMs);
    }, this.delayMs);
  }

  private abortPlay(): void {
    if (this.playTimeoutId != null) {
      clearTimeout(this.playTimeoutId);
      this.playTimeoutId = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private resetStripsToZero(): void {
    for (const { strip } of this.columns) {
      strip.style.transform = 'translateY(0)';
    }
  }

  private buildNumber(host: HTMLElement, value: number, suffix: string): void {
    const s = String(Math.floor(value));
    for (const ch of s) {
      const d = Number.parseInt(ch, 10);
      if (Number.isFinite(d)) this.appendDigitColumn(host, d);
    }
    this.appendSuffix(host, suffix);
  }

  private buildPattern(host: HTMLElement, pattern: string): void {
    for (const ch of pattern) {
      if (ch >= '0' && ch <= '9') {
        this.appendDigitColumn(host, Number.parseInt(ch, 10));
      } else {
        const span = document.createElement('span');
        span.className = 'counter-static';
        span.textContent = ch;
        host.appendChild(span);
      }
    }
  }

  private appendSuffix(host: HTMLElement, text: string): void {
    if (!text) return;
    const span = document.createElement('span');
    span.className = 'counter-suffix';
    span.textContent = text;
    host.appendChild(span);
  }

  private appendDigitColumn(host: HTMLElement, targetDigit: number): void {
    const wrap = document.createElement('span');
    wrap.className = 'odometer-digit';
    const strip = document.createElement('span');
    strip.className = 'odometer-digit__strip';
    for (let i = 0; i <= 9; i++) {
      const cell = document.createElement('span');
      cell.className = 'odometer-cell';
      cell.textContent = String(i);
      strip.appendChild(cell);
    }
    wrap.appendChild(strip);
    host.appendChild(wrap);
    this.columns.push({ strip, target: targetDigit });
  }

  private cacheDigitPx(): void {
    const first = this.columns[0]?.strip.querySelector('.odometer-cell') as HTMLElement | null;
    this.digitPx = first?.getBoundingClientRect().height ?? 16;
  }

  private applyFinalState(): void {
    const h = this.digitPx || 16;
    for (const { strip, target } of this.columns) {
      strip.style.transform = `translateY(-${Math.round(target * h)}px)`;
    }
  }

  private runAnimation(durationMs: number): void {
    if (!this.columns.length) return;

    const h = this.digitPx || 16;
    const cols = this.columns;
    const stagger = Math.min(160, Math.max(60, Math.floor(durationMs * 0.035)));
    const start = performance.now();

    const tick = (now: number) => {
      let allComplete = true;

      for (let i = 0; i < cols.length; i++) {
        const { strip, target } = cols[i];
        const delay = (cols.length - 1 - i) * stagger;
        let localT = (now - start - delay) / durationMs;
        if (localT < 0) {
          localT = 0;
          allComplete = false;
        } else if (localT > 1) {
          localT = 1;
        } else {
          allComplete = false;
        }

        const e = easeOutCubic(localT);
        const v = target * e;
        strip.style.transform = `translateY(-${v * h}px)`;
      }

      if (!allComplete) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = 0;
        this.applyFinalState();
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }
}
