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
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
