import { Injectable, OnDestroy } from '@angular/core';

/**
 * Parallax com mouse: elementos com classe `.parallax` recebem translate suave.
 * Opcional: `data-parallax="12"` — intensidade em px (padrão 10).
 * Opcional: classe `parallax-invert` — move no sentido oposto (fundo).
 */
@Injectable({ providedIn: 'root' })
export class MouseParallaxService implements OnDestroy {
  private targetX = 0;
  private targetY = 0;
  private smoothX = 0;
  private smoothY = 0;
  private rafId = 0;
  private active = false;

  private readonly onMove = (e: MouseEvent): void => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    this.targetX = (e.clientX / w - 0.5) * 2;
    this.targetY = (e.clientY / h - 0.5) * 2;
  };

  start(): void {
    if (this.active || typeof document === 'undefined') return;
    this.active = true;
    document.addEventListener('mousemove', this.onMove, { passive: true });
    const loop = (): void => {
      this.rafId = requestAnimationFrame(loop);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const nodes = document.querySelectorAll<HTMLElement>('.parallax');
      if (reduce) {
        nodes.forEach((el) => {
          el.style.transform = '';
        });
        return;
      }
      const ease = 0.085;
      this.smoothX += (this.targetX - this.smoothX) * ease;
      this.smoothY += (this.targetY - this.smoothY) * ease;
      nodes.forEach((el) => {
        const raw = el.getAttribute('data-parallax');
        const strength = raw !== null && raw !== '' ? parseFloat(raw) : 10;
        const s = Number.isFinite(strength) ? strength : 10;
        const inv = el.classList.contains('parallax-invert') ? -1 : 1;
        const dx = this.smoothX * s * inv;
        const dy = this.smoothY * s * inv;
        el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      });
    };
    this.rafId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    this.stop();
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    document.removeEventListener('mousemove', this.onMove);
    cancelAnimationFrame(this.rafId);
    document.querySelectorAll<HTMLElement>('.parallax').forEach((el) => {
      el.style.transform = '';
    });
  }
}
