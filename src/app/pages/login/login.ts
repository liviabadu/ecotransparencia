import { Component, HostListener, inject, signal } from '@angular/core';
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
  private authService = inject(AuthService);
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
      await this.authService.loginWithGoogle();
      await this.router.navigate(['/']);
    } catch (error: unknown) {
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
      await this.authService.login(this.email(), this.password());
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
        return 'Permita pop-ups para este site e tente de novo.';
      case 'auth/account-exists-with-different-credential':
        return 'Já existe uma conta com este e-mail usando outro método de login.';
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
}
