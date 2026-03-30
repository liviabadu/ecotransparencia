import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentValidationService } from '../../services/document-validation.service';
import { ApiService } from '../../services/api.service';
import { ScoreService } from '../../services/score.service';
import { SearchResult, SituacaoCadastral } from '../../models/entity.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  private documentValidationService = inject(DocumentValidationService);
  private apiService = inject(ApiService);
  protected scoreService = inject(ScoreService);

  /** Placeholder do input (landing vs dashboard podem diferir). */
  readonly searchPlaceholder = input('Digite o CNPJ da empresa');
  /** Estilo de painel autenticado (largura total, tipografia). */
  readonly dashboardLayout = input(false);

  // Signals for reactive state
  searchTerm = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  searchResult = signal<SearchResult | null>(null);
  noResultsFound = signal(false);
  hasSearched = signal(false);
  bloqueadoPorSituacaoCadastral = signal(false);
  situacaoCadastral = signal<SituacaoCadastral | null>(null);

  /**
   * Main search handler
   * Validates input and performs CNPJ search
   */
  async onSearch(): Promise<void> {
    const term = this.searchTerm();

    // Reset state
    this.errorMessage.set(null);
    this.searchResult.set(null);
    this.noResultsFound.set(false);
    this.bloqueadoPorSituacaoCadastral.set(false);
    this.situacaoCadastral.set(null);

    // Validate input - CNPJ only
    const validation = this.documentValidationService.validateCnpjOnly(term);

    if (!validation.isValid) {
      this.errorMessage.set(validation.errorMessage || 'Erro de validação');
      return;
    }

    // Start loading
    this.isLoading.set(true);
    this.hasSearched.set(true);

    try {
      const result = await firstValueFrom(this.apiService.searchByDocument(term, 'cnpj'));

      this.searchResult.set(result);

      // Handle bloqueado por situação cadastral
      if (result.bloqueadoPorSituacaoCadastral) {
        this.bloqueadoPorSituacaoCadastral.set(true);
        this.situacaoCadastral.set(result.situacaoCadastral || null);
        this.noResultsFound.set(false);
      } else {
        this.noResultsFound.set(!result.found);
      }
    } catch (error) {
      this.errorMessage.set('Erro ao realizar a busca. Tente novamente.');
    } finally {
      this.isLoading.set(false);
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

  /**
   * Format date for display
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Data não informada';
    return new Date(date).toLocaleDateString('pt-BR');
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
}
