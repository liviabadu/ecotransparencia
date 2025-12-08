import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Metodologia } from './pages/metodologia/metodologia';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'metodologia', component: Metodologia },
];
