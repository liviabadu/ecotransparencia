import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Entity, SearchResult, Occurrence } from '../models/entity.model';
import { ScoreService } from './score.service';

/**
 * Interface representing the API response for entity search
 * This defines the contract between frontend and backend
 */
export interface ApiEntityResponse {
  id: string;
  name: string;
  document: string;
  documentType: 'cpf' | 'cnpj';
  score: number;
  riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  occurrences: ApiOccurrenceResponse[];
}

export interface ApiOccurrenceResponse {
  id: string;
  date: string; // ISO date string from API
  description: string;
  status: 'Ativo' | 'Baixado';
  source: string;
  sourceUrl: string;
  category: 'Ambiental IBAMA' | 'Ambiental ICMBio' | 'Trabalhista' | 'Administrativo';
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
        date: new Date(occ.date),
      })),
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
