import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Metodologia } from './pages/metodologia/metodologia';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { Assinaturas } from './pages/assinaturas/assinaturas';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'metodologia', component: Metodologia },
  { path: 'assinaturas', component: Assinaturas },
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
];
