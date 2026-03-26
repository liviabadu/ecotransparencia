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
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  @HostListener('document:keydown', ['$event'])
  onEscapeLeavePage(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (isFocusInTextEntryField()) return;
    this.router.navigate(['/']);
    event.preventDefault();
  }

  email = signal('');
  password = signal('');
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage.set(null);
    this.isLoading.set(true);

    try {
      await this.authService.login(this.email(), this.password());
      this.router.navigate(['/']);
    } catch (error: any) {
      this.errorMessage.set(this.getErrorMessage(error.code));
    } finally {
      this.isLoading.set(false);
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
