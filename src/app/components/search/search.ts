import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentValidationService } from '../../services/document-validation.service';
import { ApiService } from '../../services/api.service';
import { ScoreService } from '../../services/score.service';
import { SearchResult } from '../../models/entity.model';
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

  // Signals for reactive state
  searchTerm = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  searchResult = signal<SearchResult | null>(null);
  noResultsFound = signal(false);
  hasSearched = signal(false);

  /**
   * Main search handler
   * Validates input, detects document type, and performs search
   */
  async onSearch(): Promise<void> {
    const term = this.searchTerm();

    // Reset state
    this.errorMessage.set(null);
    this.searchResult.set(null);
    this.noResultsFound.set(false);

    // Validate input
    const validation = this.documentValidationService.validate(term);

    if (!validation.isValid) {
      this.errorMessage.set(validation.errorMessage || 'Erro de validação');
      return;
    }

    // Start loading
    this.isLoading.set(true);
    this.hasSearched.set(true);

    try {
      let result: SearchResult;

      if (validation.type === 'cpf') {
        result = await firstValueFrom(this.apiService.searchByDocument(term, 'cpf'));
      } else if (validation.type === 'cnpj') {
        result = await firstValueFrom(this.apiService.searchByDocument(term, 'cnpj'));
      } else {
        result = await firstValueFrom(this.apiService.searchByName(term));
      }

      this.searchResult.set(result);
      this.noResultsFound.set(!result.found);
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
  }

  /**
   * Handles input changes and applies CPF/CNPJ mask if applicable
   */
  onInputChange(value: string): void {
    // Check if input looks like a document (numeric)
    if (this.documentValidationService.isNumericInput(value)) {
      // Apply mask for CPF/CNPJ
      const masked = this.documentValidationService.applyMask(value);
      this.searchTerm.set(masked);
    } else {
      // For names, just set the value as-is
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
