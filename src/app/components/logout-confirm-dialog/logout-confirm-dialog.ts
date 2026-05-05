import { Component, inject, output } from '@angular/core';
import { APP_ENTITY_DISPLAY_NAME } from '../../config/app-entity';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout-confirm-dialog',
  standalone: true,
  templateUrl: './logout-confirm-dialog.html',
  styleUrl: './logout-confirm-dialog.css',
})
export class LogoutConfirmDialog {
  protected readonly auth = inject(AuthService);
  /** Nome da entidade do projeto (texto da confirmação). */
  readonly entityName = APP_ENTITY_DISPLAY_NAME;

  readonly dismissed = output<void>();
  readonly confirmed = output<void>();

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dismissed.emit();
    }
  }

  protected onCancel(): void {
    this.dismissed.emit();
  }

  protected onConfirm(): void {
    this.confirmed.emit();
  }
}
