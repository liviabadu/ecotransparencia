import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Entity, SearchResult, Occurrence, RiskLevel } from '../models/entity.model';
import { ScoreService } from './score.service';

/**
 * Interface representing the API response for entity search
 * This defines the contract between frontend and backend (V2)
 */
export interface ApiEntityResponse {
  id: string;
  name: string;
  document: string;
  documentType: 'cpf' | 'cnpj';
  score: number;
  riskLevel: 'Baixo' | 'Medio' | 'Médio' | 'Alto' | 'Critico' | 'Crítico';
  occurrences: ApiOccurrenceResponse[];
  asgScore?: ApiAsgScore;
  ocorrencias?: ApiOcorrencias;
}

export interface ApiOccurrenceResponse {
  id: string;
  date?: string;
  description?: string;
  status?: 'Ativo' | 'Baixado' | 'Lavrado';
  source: string;
  sourceUrl?: string;
  category?: 'Ambiental IBAMA' | 'Ambiental ICMBio' | 'Trabalhista' | 'Administrativo';
  // Geographic and environmental fields
  location?: {
    imovel?: string;
    municipio: string;
    uf: string;
  };
  biome?: string;
  areaEmbargada?: number;
  desmatamento?: boolean;
  autoInfracao?: string;
}

export interface ApiAsgScoreBreakdown {
  fonte: string;
  peso: number;
  quantidadeOcorrencias: number;
  score: number;
  scorePonderado?: number;
}

export interface ApiAsgScore {
  score: number;
  riskLevel: string;
  totalOcorrencias: number;
  breakdown: ApiAsgScoreBreakdown[];
}

export interface ApiEmbargo {
  id: string;
  source: string;
  category?: string;
  date?: string;
  description?: string;
  status?: string;
  sourceUrl?: string;
  // Geographic and environmental fields
  location?: {
    imovel?: string;
    municipio: string;
    uf: string;
  };
  biome?: string;
  areaEmbargada?: number;
  desmatamento?: boolean;
  autoInfracao?: string;
}

export interface ApiAutoInfracao {
  id: string;
  source: string;
  data?: string;
  descricao?: string;
  numeroAuto?: string;
  tipoInfracao?: string;
  valorMulta?: number;
  status?: string;
  // Legal and severity fields
  location?: {
    municipio: string;
    uf: string;
  };
  biomasAtingidos?: string;
  efeitoMeioAmbiente?: string;
  enquadramentoLegal?: string;
  gravidade?: string;
  motivacaoConduta?: string;
}

export interface ApiOcorrencias {
  embargos: ApiEmbargo[];
  autosInfracao: ApiAutoInfracao[];
}

export interface ApiSearchResponse {
  found: boolean;
  entity?: ApiEntityResponse;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private scoreService = inject(ScoreService);

  private baseUrl = '/api';

  /**
   * Search by document (CPF or CNPJ)
   */
  searchByDocument(document: string, type: 'cpf' | 'cnpj'): Observable<SearchResult> {
    // Remove mask characters, send only digits
    const cleanDocument = document.replace(/[.\-/]/g, '');
    return this.http
      .get<ApiSearchResponse>(`${this.baseUrl}/search/document`, {
        params: { document: cleanDocument, type },
      })
      .pipe(map((response) => this.mapApiResponseToSearchResult(response)));
  }

  /**
   * Search by name
   */
  searchByName(name: string): Observable<SearchResult> {
    return this.http
      .get<ApiSearchResponse>(`${this.baseUrl}/search/name`, {
        params: { name },
      })
      .pipe(map((response) => this.mapApiResponseToSearchResult(response)));
  }

  /**
   * Maps API response to frontend SearchResult model
   */
  private mapApiResponseToSearchResult(response: ApiSearchResponse): SearchResult {
    if (!response.found || !response.entity) {
      return { found: false };
    }

    const entity: Entity = {
      ...response.entity,
      occurrences: response.entity.occurrences.map((occ) => ({
        ...occ,
        date: occ.date ? new Date(occ.date) : undefined,
      })),
      asgScore: response.entity.asgScore ? {
        ...response.entity.asgScore,
        riskLevel: response.entity.asgScore.riskLevel as RiskLevel,
      } : undefined,
      ocorrencias: response.entity.ocorrencias,
    };

    const scoreResult = this.scoreService.calculateScoreResult(
      entity.score,
      entity.occurrences
    );

    return {
      found: true,
      entity,
      scoreResult,
    };
  }
}
