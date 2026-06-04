import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HomeDashboard } from './home-dashboard/home-dashboard.component';
import { HomePublic } from './home-public/home-public.component';

function scrollDocumentToTop(): void {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * Raiz da rota `/`: alterna entre landing (visitante) e dashboard (autenticado).
 * Conteúdo público em {@link HomePublic}; painel em {@link HomeDashboard}.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomePublic, HomeDashboard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly auth = inject(AuthService);

  constructor() {
    let wasAuthenticated = this.auth.isAuthenticated();
    effect(() => {
      const authed = this.auth.isAuthenticated();
      if (wasAuthenticated && !authed) {
        queueMicrotask(() => scrollDocumentToTop());
      }
      wasAuthenticated = authed;
    });
  }
}
