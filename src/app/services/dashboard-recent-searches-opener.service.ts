import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

function normalizePath(url: string): string {
  const p = url.split('?')[0].split('#')[0].trim();
  const withSlash = p.startsWith('/') ? p : `/${p}`;
  const trimmed = withSlash.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/**
 * Abre o modal de histórico de pesquisas no {@link HomeDashboard} a partir da rail (ou após navegar para /).
 */
@Injectable({ providedIn: 'root' })
export class DashboardRecentSearchesOpenerService {
  private readonly router = inject(Router);

  /** Incrementado quando o utilizador já está em `/` — o dashboard reage num `effect`. */
  readonly openNonce = signal(0);

  private openOnNextDashboardMount = false;

  requestOpenRecentHistory(): void {
    const path = normalizePath(this.router.url);
    if (path === '/') {
      this.openNonce.update((n) => n + 1);
    } else {
      this.openOnNextDashboardMount = true;
      void this.router.navigateByUrl('/');
    }
  }

  /** Chamado pelo dashboard ao montar (ex.: vindo de outra rota com pedido pendente). */
  consumeOpenOnDashboardMount(): boolean {
    if (!this.openOnNextDashboardMount) return false;
    this.openOnNextDashboardMount = false;
    return true;
  }
}
