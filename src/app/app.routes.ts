import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Metodologia } from './pages/metodologia/metodologia';
import { AuthBehindHome } from './pages/auth-behind-home/auth-behind-home';
import { Assinaturas } from './pages/assinaturas/assinaturas';

/**
 * Rotas síncronas no bundle principal: no F5 o Router ativa a página de imediato,
 * sem “buraco” no outlet à espera de chunk lazy (evita piscar).
 */
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'metodologia', component: Metodologia },
  { path: 'assinaturas', component: Assinaturas },
  {
    path: 'login',
    component: AuthBehindHome,
    data: { authMode: 'login' as const },
  },
  {
    path: 'cadastro',
    component: AuthBehindHome,
    data: { authMode: 'cadastro' as const },
  },
];
