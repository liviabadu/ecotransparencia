import { Component, computed, inject, input, OnDestroy, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentValidationService } from '../../services/document-validation.service';
import { ApiService } from '../../services/api.service';
import { SearchResult, SituacaoCadastral } from '../../models/entity.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnDestroy {
  private documentValidationService = inject(DocumentValidationService);
  private apiService = inject(ApiService);

  /** Placeholder do input (landing vs dashboard podem diferir). */
  readonly searchPlaceholder = input('Digite o CNPJ da empresa');
  /** Estilo de painel autenticado (largura total, tipografia). */
  readonly dashboardLayout = input(false);

  /** Emite após resposta da API no dashboard (para “Últimas pesquisas”, etc.). */
  readonly dashboardSearchSettled = output<{ term: string; result: SearchResult }>();

  /** CNPJs (14 dígitos) já guardados como favoritos no painel — vindo do `HomeDashboard`. */
  readonly favoriteCnpjKeys = input<string[]>([]);

  /** Alternar favorito no resultado atual (painel trata persistência). */
  readonly dashboardFavoriteToggled = output<{ cnpj: string; label: string; add: boolean }>();

  // Signals for reactive state
  searchTerm = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  searchResult = signal<SearchResult | null>(null);
  noResultsFound = signal(false);
  hasSearched = signal(false);
  bloqueadoPorSituacaoCadastral = signal(false);
  situacaoCadastral = signal<SituacaoCadastral | null>(null);

  /** Evita aplicar resposta antiga se o utilizador disparar várias buscas seguidas. */
  private searchRequestSeq = 0;

  /** Confirmação após favoritar ou remover (painel pós-login). */
  readonly favoriteToastMessage = signal<string | null>(null);
  /** Tom visual do aviso: adicionada (verde) vs removida (vermelho). */
  protected readonly favoriteToastKind = signal<'added' | 'removed'>('added');
  /** Incrementado a cada novo toast para repetir a animação de entrada. */
  protected readonly favoriteToastRenderKey = signal(0);
  /** Dispara animação de saída e recolhe o slot (layout acompanha o sumiço). */
  protected readonly favoriteToastLeaving = signal(false);
  private favoriteToastClearTimer: ReturnType<typeof setTimeout> | null = null;
  private favoriteToastDismissFallback: ReturnType<typeof setTimeout> | null = null;

  /** Resultado CNPJ atual está nos favoritos do painel. */
  readonly isCurrentEntityFavorite = computed(() => {
    const keys = this.favoriteCnpjKeys();
    const e = this.searchResult()?.entity;
    if (!e || e.documentType !== 'cnpj') return false;
    const cnpj = e.document.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    return keys.includes(cnpj);
  });

  /**
   * Main search handler
   * Validates input and performs CNPJ search
   */
  async onSearch(): Promise<void> {
    await this.executeCnpjSearch();
  }

  private async executeCnpjSearch(): Promise<void> {
    const term = this.searchTerm();
    this.errorMessage.set(null);
    this.noResultsFound.set(false);
    this.bloqueadoPorSituacaoCadastral.set(false);
    this.situacaoCadastral.set(null);
    this.searchResult.set(null);
    this.clearFavoriteToast();

    const validation = this.documentValidationService.validateCnpjOnly(term);
    if (!validation.isValid) {
      this.errorMessage.set(validation.errorMessage || 'Erro de validação');
      return;
    }

    const seq = ++this.searchRequestSeq;
    this.isLoading.set(true);
    this.hasSearched.set(true);

    try {
      const result = await firstValueFrom(this.apiService.searchByDocument(term, 'cnpj'));
      if (seq !== this.searchRequestSeq) {
        return;
      }

      this.searchResult.set(result);

      if (result.bloqueadoPorSituacaoCadastral) {
        this.bloqueadoPorSituacaoCadastral.set(true);
        this.situacaoCadastral.set(result.situacaoCadastral || null);
        this.noResultsFound.set(false);
      } else {
        this.noResultsFound.set(!result.found);
      }

      if (this.dashboardLayout()) {
        this.dashboardSearchSettled.emit({ term: term.trim(), result });
      }
    } catch {
      if (seq !== this.searchRequestSeq) {
        return;
      }
      this.errorMessage.set('Erro ao realizar a busca. Tente novamente.');
    } finally {
      if (seq === this.searchRequestSeq) {
        this.isLoading.set(false);
      }
    }
  }

  /**
   * Clears search state
   */

  clearSearch(): void {
    this.searchTerm.set('');
    this.searchResult.set(null);
    this.errorMessage.set(null);
    this.noResultsFound.set(false);
    this.hasSearched.set(false);
    this.bloqueadoPorSituacaoCadastral.set(false);
    this.situacaoCadastral.set(null);
  }

  /**
   * Handles input changes and applies CNPJ mask if applicable
   */
  onInputChange(value: string): void {
    // Check if input looks like a document (numeric)
    if (this.documentValidationService.isNumericInput(value)) {
      // Apply mask for CNPJ only
      const masked = this.documentValidationService.applyCNPJMask(value);
      this.searchTerm.set(masked);
    } else {
      // Set the value as-is
      this.searchTerm.set(value);
    }
  }

  /**
   * Handle form submit
   */
  onSubmit(event: Event): void {
    event.preventDefault();
    this.onSearch();
  }

  toggleEntityFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const e = this.searchResult()?.entity;
    if (!e || e.documentType !== 'cnpj') return;
    const cnpj = e.document.replace(/\D/g, '');
    if (cnpj.length !== 14) return;
    const masked = this.documentValidationService.applyCNPJMask(cnpj);
    const label = `${e.name} — ${masked}`;
    const add = !this.isCurrentEntityFavorite();
    this.dashboardFavoriteToggled.emit({
      cnpj,
      label,
      add,
    });
    if (add) {
      this.showFavoriteStatusToast(e.name, 'added');
    } else {
      this.showFavoriteStatusToast(e.name, 'removed');
    }
  }

  private showFavoriteStatusToast(companyName: string, kind: 'added' | 'removed'): void {
    if (this.favoriteToastClearTimer) {
      clearTimeout(this.favoriteToastClearTimer);
      this.favoriteToastClearTimer = null;
    }
    this.clearFavoriteToastDismissFallback();
    this.favoriteToastLeaving.set(false);
    this.favoriteToastRenderKey.update((k) => k + 1);
    this.favoriteToastKind.set(kind);
    const text =
      kind === 'added'
        ? `“${companyName}” foi adicionada aos favoritos.`
        : `“${companyName}” foi removida dos favoritos.`;
    this.favoriteToastMessage.set(text);
    this.favoriteToastClearTimer = setTimeout(() => {
      this.favoriteToastClearTimer = null;
      this.favoriteToastLeaving.set(true);
      this.scheduleFavoriteToastDismissFallback();
    }, 3000);
  }

  private clearFavoriteToast(): void {
    if (this.favoriteToastClearTimer) {
      clearTimeout(this.favoriteToastClearTimer);
      this.favoriteToastClearTimer = null;
    }
    this.clearFavoriteToastDismissFallback();
    this.favoriteToastLeaving.set(false);
    this.favoriteToastMessage.set(null);
  }

  /**
   * Recolhe o slot (grid) em paralelo ao toast; limpa estado ao fim da transição.
   */
  protected onFavoriteToastSlotTransitionEnd(event: TransitionEvent): void {
    if (event.target !== event.currentTarget) return;
    if (!event.propertyName.includes('grid-template')) return;
    this.finalizeFavoriteToastDismiss();
  }

  private scheduleFavoriteToastDismissFallback(): void {
    this.clearFavoriteToastDismissFallback();
    this.favoriteToastDismissFallback = setTimeout(() => {
      this.favoriteToastDismissFallback = null;
      this.finalizeFavoriteToastDismiss();
    }, 520);
  }

  private clearFavoriteToastDismissFallback(): void {
    if (this.favoriteToastDismissFallback) {
      clearTimeout(this.favoriteToastDismissFallback);
      this.favoriteToastDismissFallback = null;
    }
  }

  private finalizeFavoriteToastDismiss(): void {
    this.clearFavoriteToastDismissFallback();
    if (!this.favoriteToastLeaving()) return;
    this.favoriteToastMessage.set(null);
    this.favoriteToastLeaving.set(false);
  }

  ngOnDestroy(): void {
    if (this.favoriteToastClearTimer) clearTimeout(this.favoriteToastClearTimer);
    this.clearFavoriteToastDismissFallback();
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string | undefined): string {
    if (date === undefined || date === null) return 'Data não informada';
    if (typeof date === 'string' && date.trim() === '') return 'Data não informada';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return 'Data não informada';
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Data da consulta cadastral: só devolve texto quando a data é válida (evita "Invalid Date").
   */
  formatDataConsultaCadastral(raw: string | undefined | null): string | null {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s) return null;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
    const br = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
    if (br) {
      const d2 = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
      if (!Number.isNaN(d2.getTime())) {
        return d2.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
    }
    return null;
  }

  /**
   * Format currency for display
   */
  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Format area in hectares
   */
  formatArea(area: number | undefined): string {
    if (area === undefined || area === null) return '';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(area) + ' ha';
  }

  /**
   * Format location
   */
  formatLocation(location: { imovel?: string; municipio: string; uf: string } | undefined): string {
    if (!location) return '';
    if (location.imovel) {
      return `${location.imovel} - ${location.municipio}/${location.uf}`;
    }
    return `${location.municipio}/${location.uf}`;
  }

  /**
   * Get color for biome badge
   */
  getBiomeColor(biome: string | undefined): string {
    if (!biome) return '#6b7280';
    const normalized = biome.toLowerCase();
    if (normalized.includes('amazo')) return '#10b981';
    if (normalized.includes('mata')) return '#059669';
    if (normalized.includes('cerrado')) return '#eab308';
    if (normalized.includes('caatinga')) return '#f59e0b';
    if (normalized.includes('pampa')) return '#84cc16';
    if (normalized.includes('pantanal')) return '#06b6d4';
    return '#6b7280';
  }

  /**
   * Get color for gravity/severity
   */
  getGravityColor(gravity: string | undefined): string {
    if (!gravity) return '#6b7280';
    const normalized = gravity.toLowerCase();
    if (normalized.includes('grave') || normalized.includes('gravissim')) return '#dc2626';
    if (normalized.includes('medio') || normalized.includes('médio')) return '#f59e0b';
    if (normalized.includes('leve') || normalized.includes('baixo')) return '#eab308';
    return '#6b7280';
  }

  /**
   * Get percentage from breakdown item
   */
  getBreakdownPercentage(scorePonderado: number | undefined, totalScore: number): number {
    if (!scorePonderado || !totalScore) return 0;
    return Math.round((scorePonderado / totalScore) * 100);
  }

  /** Largura da barra de risco 0–100 (apresentação). */
  clampScorePercent(score: number | undefined): number {
    if (score == null || Number.isNaN(Number(score))) return 0;
    return Math.min(100, Math.max(0, Number(score)));
  }

  /**
   * Faixa visual pelo score numérico (0–100): cores e pill alinhados à escala,
   * independentemente do texto vindo da API.
   * 0–25 Baixo, 26–50 Médio, 51–75 Alto, 76–100 Crítico.
   */
  riskBandKey(): 'baixo' | 'medio' | 'alto' | 'critico' {
    const s = this.searchResult()?.scoreResult?.score;
    if (s == null || Number.isNaN(Number(s))) return 'medio';
    const n = Number(s);
    if (n <= 25) return 'baixo';
    if (n <= 50) return 'medio';
    if (n <= 75) return 'alto';
    return 'critico';
  }

  riskBandLabel(): string {
    switch (this.riskBandKey()) {
      case 'baixo':
        return 'Baixo';
      case 'medio':
        return 'Médio';
      case 'alto':
        return 'Alto';
      default:
        return 'Crítico';
    }
  }

  /** Texto curto do resumo de ocorrências (singular / plural). */
  occurrencesSummaryLabel(total: number | undefined): string {
    const n = total ?? 0;
    return n === 1 ? '1 ocorrência encontrada' : `${n} ocorrências encontradas`;
  }
}
