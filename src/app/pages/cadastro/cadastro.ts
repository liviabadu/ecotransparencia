import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isFocusInTextEntryField } from '../../utils/form-focus.util';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrls: ['../auth/auth-modal.shared.css', './cadastro.css'],
})
export class Cadastro {
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
  passwordConfirm = signal('');
  errorMessage = signal<string | null>(null);
  infoMessage = signal<string | null>(null);
  isLoading = signal(false);

  goHome(): void {
    void this.router.navigateByUrl('/', { replaceUrl: true });
  }

  onPhone(): void {
    this.errorMessage.set(null);
    this.infoMessage.set('Cadastro com telefone estará disponível em breve.');
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

    if (this.password() !== this.passwordConfirm()) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.register(this.email(), this.password());
      await this.router.navigate(['/']);
    } catch (error: unknown) {
      this.errorMessage.set(this.getRegisterError(this.codeOf(error)));
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
        return 'Cadastro cancelado.';
      case 'auth/popup-blocked':
        return 'Permita pop-ups para este site e tente de novo.';
      case 'auth/account-exists-with-different-credential':
        return 'Já existe uma conta com este e-mail. Entre com e-mail e senha ou outro provedor.';
      default:
        return 'Não foi possível continuar com o Google. Tente novamente.';
    }
  }

  private getRegisterError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado.';
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/weak-password':
        return 'Senha fraca. Use pelo menos 6 caracteres.';
      case 'auth/operation-not-allowed':
        return 'Cadastro por e-mail não está habilitado no momento.';
      default:
        return 'Não foi possível criar a conta. Tente novamente.';
    }
  }

  onEmailChange(value: string): void {
    this.email.set(value);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  onPasswordConfirmChange(value: string): void {
    this.passwordConfirm.set(value);
  }
}
