import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HomeDashboard } from './home-dashboard/home-dashboard.component';
import { HomePublic } from './home-public/home-public.component';

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
}
