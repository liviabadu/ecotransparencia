import { NgClass } from '@angular/common';
import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Occurrence, SearchResult, SituacaoCadastral } from '../../models/entity.model';
import { ApiService } from '../../services/api.service';
import { DocumentValidationService } from '../../services/document-validation.service';

type RiskBandKey = 'baixo' | 'medio' | 'alto' | 'critico';

@Component({
  selector: 'app-score-colors-test',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './score-colors-test.component.html',
  styleUrls: ['./score-colors-test.component.css', '../../components/search/search.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ScoreColorsTest {
  private readonly documentValidation = inject(DocumentValidationService);
  private readonly apiService = inject(ApiService);

  /** Mesma escala que o cartão de score na busca e a metodologia (0–100). */
  readonly bands: { key: RiskBandKey; score: number; label: string; range: string }[] = [
    { key: 'baixo', score: 12, label: 'Baixo', range: '0–25' },
    { key: 'medio', score: 38, label: 'Médio', range: '26–50' },
    { key: 'alto', score: 62, label: 'Alto', range: '51–75' },
    { key: 'critico', score: 91, label: 'Crítico', range: '76–100' },
  ];

  /**
   * CNPJs válidos alinhados a `server/mock-data.js` e ao motor `applyScoringToEntity`.
   * O último só simula pendência cadastral (não está na lista de entidades mock).
   */
  readonly demoCnpjFixtures: { cnpjMasked: string; faixa: string; pendencias: string }[] = [
    { cnpjMasked: '60.746.977/0001-84', faixa: 'Baixo (0)', pendencias: 'Sem ocorrências nas bases' },
    { cnpjMasked: '11.222.333/0001-81', faixa: 'Baixo (~14)', pendencias: 'Com ocorrências (1)' },
    { cnpjMasked: '22.333.444/0001-81', faixa: 'Médio (~47)', pendencias: 'Com ocorrências (2)' },
    { cnpjMasked: '33.444.555/0001-81', faixa: 'Alto (~70)', pendencias: 'Com ocorrências (4)' },
    { cnpjMasked: '44.555.666/0001-81', faixa: 'Crítico (~88)', pendencias: 'Com ocorrências (8)' },
    { cnpjMasked: '18.236.120/0001-58', faixa: '—', pendencias: 'Pendência cadastral (demo)' },
  ];

  readonly cnpjTerm = signal('');
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly searchResult = signal<SearchResult | null>(null);
  readonly noResultsFound = signal(false);
  readonly hasSearched = signal(false);
  readonly bloqueadoPorSituacaoCadastral = signal(false);
  readonly situacaoCadastral = signal<SituacaoCadastral | null>(null);

  private searchRequestSeq = 0;

  clampScorePercent(score: number | undefined): number {
    if (score == null || Number.isNaN(Number(score))) return 0;
    return Math.min(100, Math.max(0, Number(score)));
  }

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

  onCnpjInput(value: string): void {
    if (this.documentValidation.isNumericInput(value)) {
      this.cnpjTerm.set(this.documentValidation.applyCNPJMask(value));
    } else {
      this.cnpjTerm.set(value);
    }
  }

  /** Preenche o campo com um CNPJ de demonstração (máscara completa). */
  fillDemoCnpj(masked: string): void {
    this.cnpjTerm.set(masked);
  }

  onCnpjSubmit(event: Event): void {
    event.preventDefault();
    void this.runCnpjSearch();
  }

  clearCnpjSearch(): void {
    this.cnpjTerm.set('');
    this.searchResult.set(null);
    this.errorMessage.set(null);
    this.noResultsFound.set(false);
    this.hasSearched.set(false);
    this.bloqueadoPorSituacaoCadastral.set(false);
    this.situacaoCadastral.set(null);
  }

  private async runCnpjSearch(): Promise<void> {
    const term = this.cnpjTerm();
    this.errorMessage.set(null);
    this.noResultsFound.set(false);
    this.bloqueadoPorSituacaoCadastral.set(false);
    this.situacaoCadastral.set(null);
    this.searchResult.set(null);

    const validation = this.documentValidation.validateCnpjOnly(term);
    if (!validation.isValid) {
      this.errorMessage.set(validation.errorMessage || 'CNPJ inválido');
      return;
    }

    const seq = ++this.searchRequestSeq;
    this.isLoading.set(true);
    this.hasSearched.set(true);

    try {
      const result = await firstValueFrom(this.apiService.searchByDocument(term, 'cnpj'));
      if (seq !== this.searchRequestSeq) return;

      this.searchResult.set(result);

      if (result.bloqueadoPorSituacaoCadastral) {
        this.bloqueadoPorSituacaoCadastral.set(true);
        this.situacaoCadastral.set(result.situacaoCadastral ?? null);
        this.noResultsFound.set(false);
      } else {
        this.noResultsFound.set(!result.found);
      }
    } catch {
      if (seq !== this.searchRequestSeq) return;
      this.errorMessage.set('Erro ao realizar a busca. Tente novamente.');
    } finally {
      if (seq === this.searchRequestSeq) {
        this.isLoading.set(false);
      }
    }
  }

  /** Total de ocorrências usado para “pendências” nas bases (igual ao resumo da busca). */
  occurrenceCount(): number {
    const r = this.searchResult();
    if (!r?.found || !r.entity) return 0;
    const n = r.scoreResult?.totalOccurrences;
    if (n != null) return n;
    return r.entity.occurrences?.length ?? r.entity.asgScore?.totalOcorrencias ?? 0;
  }

  /** Há ocorrências socioambientais/administrativas registradas. */
  hasOccurrencePendency(): boolean {
    const r = this.searchResult();
    if (!r?.found) return false;
    return this.occurrenceCount() > 0;
  }

  riskBandKeyLive(): RiskBandKey {
    const s = this.searchResult()?.scoreResult?.score;
    if (s == null || Number.isNaN(Number(s))) return 'medio';
    const n = Number(s);
    if (n <= 25) return 'baixo';
    if (n <= 50) return 'medio';
    if (n <= 75) return 'alto';
    return 'critico';
  }

  riskBandLabelLive(): string {
    switch (this.riskBandKeyLive()) {
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

  /** Faixa numérica exibida junto ao nível (alinhado à metodologia 0–100). */
  riskBandRangeLive(): string {
    switch (this.riskBandKeyLive()) {
      case 'baixo':
        return '0–25';
      case 'medio':
        return '26–50';
      case 'alto':
        return '51–75';
      default:
        return '76–100';
    }
  }

  liveScoreDisplay(): string {
    const s = this.searchResult()?.scoreResult?.score;
    if (s == null || Number.isNaN(Number(s))) return '—';
    return String(s);
  }

  hasCategoryPendencyList(): boolean {
    return (this.searchResult()?.scoreResult?.categorySummaries?.length ?? 0) > 0;
  }

  /**
   * Ocorrências sem agrupamento por categoria (ex.: API sem `category` preenchido).
   */
  flatOccurrencesForPendencyList(): Occurrence[] {
    const r = this.searchResult();
    if (!r?.found || !r.entity?.occurrences?.length) return [];
    if (this.hasCategoryPendencyList()) return [];
    return r.entity.occurrences;
  }
}
