import { CanDeactivateFn } from '@angular/router';
import { of } from 'rxjs';
import { AuthBehindHome } from '../pages/auth-behind-home/auth-behind-home';

/** Aguarda a animação de saída de Entrar / Cadastrar-se antes de trocar de rota. */
export const authBehindLeaveGuard: CanDeactivateFn<AuthBehindHome> = (component) =>
  component?.scheduleLeaveAnimation() ?? of(true);
