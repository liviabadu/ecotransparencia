import { Injectable, signal } from '@angular/core';

/** Estado da gaveta lateral (aberta ao clicar no ícone; usado no shell `App`). Fecha também com Esc. */
@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly open = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }
}
