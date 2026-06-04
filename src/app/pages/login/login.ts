import { Component, HostListener, inject, isDevMode, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isFocusInTextEntryField } from '../../utils/form-focus.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['../auth/auth-modal.shared.css', './login.css'],
})
export class Login {
  /** Público para o template: rodapé “Cadastrar-se” só quando não há sessão (pré-login). */
  protected readonly auth = inject(AuthService);
  private router = inject(Router);

  @HostListener('document:keydown', ['$event'])
  onEscapeLeavePage(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (isFocusInTextEntryField()) return;
    this.goHome();
    event.preventDefault();
  }

  email = signal('');
  password = signal('');
  /** Desmarcado por padrão: sessão só no browser até fechar (browserSessionPersistence). */
  rememberMe = signal(false);
  errorMessage = signal<string | null>(null);
  infoMessage = signal<string | null>(null);
  isLoading = signal(false);

  /** Fecha a tela e vai ao início sem empilhar histórico (resposta imediata ao X / Esc) */
  goHome(): void {
    void this.router.navigateByUrl('/', { replaceUrl: true });
  }

  /** Clique no fundo ao redor do cartão (como o modal de configurações) */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.goHome();
    }
  }

  onPhone(): void {
    this.errorMessage.set(null);
    this.infoMessage.set('Login com telefone estará disponível em breve.');
  }

  async onGoogle(): Promise<void> {
    this.errorMessage.set(null);
    this.infoMessage.set(null);
    this.isLoading.set(true);
    try {
      const viaPopup = await this.auth.loginWithGoogle(this.rememberMe());
      if (viaPopup) {
        await this.router.navigate(['/']);
      }
      /* Redirect: o APP_INITIALIZER trata o regresso com getRedirectResult */
    } catch (error: unknown) {
      if (isDevMode()) {
        console.warn('[Auth] Google sign-in:', error);
      }
      this.errorMessage.set(this.mapGoogleError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage.set(null);
    this.infoMessage.set(null);
    this.isLoading.set(true);

    try {
      await this.auth.login(this.email(), this.password(), this.rememberMe());
      await this.router.navigate(['/']);
    } catch (error: unknown) {
      this.errorMessage.set(this.getErrorMessage(this.codeOf(error)));
    } finally {
      this.isLoading.set(false);
    }
  }

  private codeOf(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
      return String((error as { code: string }).code);
    }
    return '';
  }

  private mapGoogleError(error: unknown): string {
    const code = this.codeOf(error);
    switch (code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Login cancelado.';
      case 'auth/popup-blocked':
        return 'Permita redirecionamento ou desative bloqueadores para o domínio do Google.';
      case 'auth/account-exists-with-different-credential':
        return 'Já existe uma conta com este e-mail usando outro método de login.';
      case 'auth/unauthorized-domain':
        return 'Este endereço (domínio) não está autorizado no Firebase. Em Authentication → Settings → Authorized domains, inclua o host que usa no browser (ex.: 127.0.0.1 se não for localhost).';
      case 'auth/operation-not-allowed':
        return 'O provedor Google não está ativado. No Firebase Console → Authentication → Sign-in method, ative Google.';
      case 'auth/web-storage-unsupported':
        return 'O navegador bloqueou armazenamento (cookies/armazenamento local). Saia do modo privado ou relaxe as restrições do site.';
      default:
        return 'Não foi possível entrar com o Google. Tente novamente.';
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/user-disabled':
        return 'Usuário desabilitado.';
      case 'auth/user-not-found':
        return 'Usuário não encontrado.';
      case 'auth/wrong-password':
        return 'Senha incorreta.';
      case 'auth/invalid-credential':
        return 'Credenciais inválidas. Verifique e-mail e senha.';
      case 'auth/web-storage-unsupported':
        return 'O navegador bloqueou armazenamento. Saia do modo privado ou permita cookies/armazenamento para este site.';
      default:
        return 'Erro ao fazer login. Tente novamente.';
    }
  }

  onEmailChange(value: string): void {
    this.email.set(value);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  onRememberMeChange(checked: boolean): void {
    this.rememberMe.set(checked);
  }
}
