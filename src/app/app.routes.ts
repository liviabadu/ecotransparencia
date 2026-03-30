import { Routes } from '@angular/router';
import { authBehindLeaveGuard } from './guards/auth-behind-leave.guard';
import { AuthBehindHome } from './pages/auth-behind-home/auth-behind-home';
import { Assinaturas } from './pages/assinaturas/assinaturas';
import { EmptyRoute } from './pages/empty-route/empty-route.component';
import { MainShell } from './pages/main-shell/main-shell.component';
import { Metodologia } from './pages/metodologia/metodologia';

/**
 * Rotas síncronas no bundle principal: no F5 o Router ativa a página de imediato,
 * sem “buraco” no outlet à espera de chunk lazy (evita piscar).
 *
 * `/`, `/login` e `/cadastro` usam {@link MainShell}: a mesma instância de {@link Home}
 * permanece montada ao abrir/fechar auth (menos “pulo” visual na tipografia).
 */
export const routes: Routes = [
  { path: 'metodologia', component: Metodologia },
  { path: 'assinaturas', component: Assinaturas },
  {
    path: '',
    component: MainShell,
    children: [
      { path: '', pathMatch: 'full', component: EmptyRoute },
      {
        path: 'login',
        component: AuthBehindHome,
        canDeactivate: [authBehindLeaveGuard],
        data: { authMode: 'login' as const },
      },
      {
        path: 'cadastro',
        component: AuthBehindHome,
        canDeactivate: [authBehindLeaveGuard],
        data: { authMode: 'cadastro' as const },
      },
    ],
  },
];
