import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Metodologia } from './pages/metodologia/metodologia';
import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'metodologia', component: Metodologia },
  { path: 'login', component: Login },
  { path: 'admin', component: Admin, canActivate: [authGuard] },
];
