import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'ecotrans.sidebar.expanded';

/**
 * Pré-login: painel deslizante (`open`).
 * Pós-login: rail ChatGPT (`expanded`, persistido em localStorage).
 */
@Injectable({ providedIn: 'root' })
export class SidebarService {
  /** Pré-login: gaveta com painel ao lado da rail */
  readonly open = signal(false);

  /** Pós-login: coluna única expandida (largura + rótulos) */
  readonly expanded = signal(false);

  constructor() {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'true') this.expanded.set(true);
    if (raw === 'false') this.expanded.set(false);
  }

  toggleGuestPanel(): void {
    this.open.update((v) => !v);
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
    this.persistExpanded();
  }

  close(): void {
    this.open.set(false);
    this.expanded.set(false);
    this.persistExpanded();
  }

  private persistExpanded(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, String(this.expanded()));
  }
}
