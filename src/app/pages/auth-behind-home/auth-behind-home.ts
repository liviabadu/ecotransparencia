import { afterNextRender, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, of, timer } from 'rxjs';
import { Login } from '../login/login';
import { Cadastro } from '../cadastro/cadastro';

type AuthMode = 'login' | 'cadastro';

function modeFromData(d: Data): AuthMode {
  const m = d['authMode'];
  return m === 'cadastro' ? 'cadastro' : 'login';
}

/**
 * Camada de auth sobre a {@link Home} já montada no {@link MainShell} (véu + formulário).
 */
@Component({
  selector: 'app-auth-behind-home',
  standalone: true,
  imports: [Login, Cadastro],
  templateUrl: './auth-behind-home.html',
  styleUrl: './auth-behind-home.css',
})
export class AuthBehindHome {
  private readonly route = inject(ActivatedRoute);

  /** Mesma entrada em fade do modal de configurações (.app-modal-scrim.is-mounted) */
  protected readonly dimMounted = signal(false);

  /** Painel do formulário: fade + leve deslocamento após o véu */
  protected readonly panelMounted = signal(false);

  /** Saída animada antes do Router destruir a rota */
  protected readonly leaving = signal(false);

  protected readonly authMode = toSignal(
    this.route.data.pipe(map(modeFromData)),
    { initialValue: modeFromData(this.route.snapshot.data) },
  );

  constructor() {
    afterNextRender(() => {
      this.dimMounted.set(true);
      const reduce =
        typeof globalThis.matchMedia === 'function' &&
        globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        this.panelMounted.set(true);
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => this.panelMounted.set(true));
        });
      }
    });
  }

  scheduleLeaveAnimation(): Observable<boolean> {
    if (this.leaving()) {
      return of(true);
    }
    this.leaving.set(true);
    const reduce =
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ms = reduce ? 0 : 300;
    return timer(ms).pipe(map(() => true));
  }
}
