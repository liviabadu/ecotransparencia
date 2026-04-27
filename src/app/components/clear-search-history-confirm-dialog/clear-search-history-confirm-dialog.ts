import { Component, output } from '@angular/core';

@Component({
  selector: 'app-clear-search-history-confirm-dialog',
  standalone: true,
  templateUrl: './clear-search-history-confirm-dialog.html',
  styleUrl: './clear-search-history-confirm-dialog.css',
})
export class ClearSearchHistoryConfirmDialog {
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
