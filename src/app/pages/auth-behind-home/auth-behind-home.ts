import { Component, inject } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Home } from '../home/home';
import { Login } from '../login/login';
import { Cadastro } from '../cadastro/cadastro';

type AuthMode = 'login' | 'cadastro';

function modeFromData(d: Data): AuthMode {
  const m = d['authMode'];
  return m === 'cadastro' ? 'cadastro' : 'login';
}

/**
 * Mantém a home montada atrás + véu escuro sem blur (estilo ChatGPT).
 * Login e cadastro ficam só na camada da frente — o resto do UI não muda.
 */
@Component({
  selector: 'app-auth-behind-home',
  standalone: true,
  imports: [Home, Login, Cadastro],
  templateUrl: './auth-behind-home.html',
  styleUrl: './auth-behind-home.css',
})
export class AuthBehindHome {
  private readonly route = inject(ActivatedRoute);

  protected readonly authMode = toSignal(
    this.route.data.pipe(map(modeFromData)),
    { initialValue: modeFromData(this.route.snapshot.data) },
  );
}
