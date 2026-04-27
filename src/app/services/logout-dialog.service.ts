import { Injectable, signal } from '@angular/core';

export interface LogoutDialogOptions {
  afterLogout?: () => void | Promise<void>;
  onError?: () => void;
}

/**
 * Diálogo de confirmação de saída hospedado em {@link App} (fora de .app-main com isolation)
 * para o scrim ficar acima da rail.
 */
@Injectable({ providedIn: 'root' })
export class LogoutDialogService {
  readonly open = signal(false);
  private pending: LogoutDialogOptions | null = null;

  request(options?: LogoutDialogOptions): void {
    this.pending = options ?? null;
    this.open.set(true);
  }

  dismiss(): void {
    this.open.set(false);
    this.pending = null;
  }

  /** Lê e limpa opções ao confirmar (antes de signOut). */
  consumePending(): LogoutDialogOptions {
    const p = this.pending ?? {};
    this.pending = null;
    return p;
  }
}
