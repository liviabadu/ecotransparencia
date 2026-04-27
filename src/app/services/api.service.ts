import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, from, map, throwError } from 'rxjs';
import {
  Entity,
  SearchResult,
  Occurrence,
  RiskLevel,
  SituacaoCadastral,
  SancaoAdmPublica,
  ImpedimentoCepim,
  TrabalhoEscravo,
  IcmbioAuto,
  IcmbioEmbargo,
} from '../models/entity.model';
import { ScoreService } from './score.service';
import { MockDataService } from './mock-data.service';
import { environment } from '../../environments/environment';

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
  /** Setor agregado para insights (opcional). */
  sectorLabel?: string;
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

export interface ApiSituacaoCadastral {
  dataConsulta: string;
  mensagem: string;
  situacao: string;
  valido: boolean;
  codigoErro?: number;
  erroConsulta?: boolean;
}

export interface ApiSancaoAdmPublica {
  cadastro: 'CEIS' | 'CNEP';
  codigoSancao?: string;
  nomeSancionado?: string;
  categoriaSancao?: string;
  valorMulta?: number;
  dataInicioSancao?: string;
  dataFimSancao?: string;
  orgaoSancionador?: string;
  ufOrgao?: string;
  esferaOrgao?: string;
  fundamentacaoLegal?: string;
}

export interface ApiImpedimentoCepim {
  cnpjEntidade?: string;
  nomeEntidade?: string;
  numeroConvenio?: string;
  orgaoConcedente?: string;
  motivoImpedimento?: string;
}

export interface ApiTrabalhoEscravo {
  anoAcaoFiscal?: number;
  uf?: string;
  empregador?: string;
  cpfCnpjFormatado?: string;
  estabelecimento?: string;
  trabalhadoresEnvolvidos?: number;
  cnae?: string;
  decisaoAdmProcedencia?: string;
  inclusaoCadastroEmpregadores?: string;
}

export interface ApiIcmbioAuto {
  numeroAi?: string;
  tipo?: string;
  valorMulta?: number;
  autuado?: string;
  descAi?: string;
  data?: string;
  ano?: number;
  tipoInfra?: string;
  nomeUc?: string;
  municipio?: string;
  uf?: string;
  processo?: string;
  julgamento?: string;
}

export interface ApiIcmbioEmbargo {
  numeroEmb?: string;
  numeroAi?: string;
  autuado?: string;
  descInfra?: string;
  descSanc?: string;
  tipoInfra?: string;
  nomeUc?: string;
  municipio?: string;
  uf?: string;
  data?: string;
  ano?: number;
  area?: number;
  processo?: string;
  julgamento?: string;
}

export interface ApiSearchResponse {
  found: boolean;
  entity?: ApiEntityResponse;
  bloqueadoPorSituacaoCadastral?: boolean;
  situacaoCadastral?: ApiSituacaoCadastral;
  sancoesAdmPublica?: ApiSancaoAdmPublica[];
  impedimentosCepim?: ApiImpedimentoCepim[];
  trabalhoEscravo?: ApiTrabalhoEscravo[];
  icmbioAutos?: ApiIcmbioAuto[];
  icmbioEmbargos?: ApiIcmbioEmbargo[];
}

function hasV2RootListMatch(response: ApiSearchResponse): boolean {
  return !!(
    response.sancoesAdmPublica?.length ||
    response.impedimentosCepim?.length ||
    response.trabalhoEscravo?.length ||
    response.icmbioAutos?.length ||
    response.icmbioEmbargos?.length
  );
}

function inferNameFromV2Lists(response: ApiSearchResponse): string {
  return (
    response.sancoesAdmPublica?.[0]?.nomeSancionado ||
    response.trabalhoEscravo?.[0]?.empregador ||
    response.impedimentosCepim?.[0]?.nomeEntidade ||
    response.icmbioAutos?.[0]?.autuado ||
    response.icmbioEmbargos?.[0]?.autuado ||
    'Entidade não identificada'
  );
}

function synthesizeEntityFromV2Lists(
  response: ApiSearchResponse,
  document: string,
  documentType: 'cpf' | 'cnpj'
): Entity {
  return {
    id: document,
    name: inferNameFromV2Lists(response),
    document,
    documentType,
    occurrences: [],
    sancoesAdmPublica: response.sancoesAdmPublica as SancaoAdmPublica[] | undefined,
    impedimentosCepim: response.impedimentosCepim as ImpedimentoCepim[] | undefined,
    trabalhoEscravo: response.trabalhoEscravo as TrabalhoEscravo[] | undefined,
    icmbioAutos: response.icmbioAutos as IcmbioAuto[] | undefined,
    icmbioEmbargos: response.icmbioEmbargos as IcmbioEmbargo[] | undefined,
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private scoreService = inject(ScoreService);
  private mockData = inject(MockDataService);

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
      .pipe(
        map((response) => this.mapApiResponseToSearchResult(response, cleanDocument, type)),
        catchError((err) => this.fallbackDocumentSearchFromMockIfDev(document, type, err))
      );
  }

  /**
   * Search by name
   */
  searchByName(name: string): Observable<SearchResult> {
    return this.http
      .get<ApiSearchResponse>(`${this.baseUrl}/search/name`, {
        params: { name },
      })
      .pipe(
        map((response) => this.mapApiResponseToSearchResult(response)),
        catchError((err) => {
          if (environment.production) {
            return throwError(() => err);
          }
          return from(this.mockData.searchByName(name));
        })
      );
  }

  /**
   * Em desenvolvimento, se a API em 127.0.0.1:3333 não estiver no ar (`npm start` sem `npm run api`),
   * usa o mock em memória para os CNPJs de demonstração continuarem a funcionar.
   */
  private fallbackDocumentSearchFromMockIfDev(
    document: string,
    type: 'cpf' | 'cnpj',
    err: unknown
  ): Observable<SearchResult> {
    if (environment.production) {
      return throwError(() => err);
    }
    return from(this.mockData.searchByDocument(document, type));
  }

  /**
   * Maps API response to frontend SearchResult model.
   * `requestDocument` / `requestType` permitem sintetizar entity quando o back
   * marca `found: true` mas só popula listas raiz V2 (CEIS/CNEP, CEPIM, MTE, ICMBio).
   */
  private mapApiResponseToSearchResult(
    response: ApiSearchResponse,
    requestDocument?: string,
    requestType?: 'cpf' | 'cnpj'
  ): SearchResult {
    // Handle blocked by situacao cadastral case
    if (response.bloqueadoPorSituacaoCadastral) {
      return {
        found: false,
        bloqueadoPorSituacaoCadastral: true,
        situacaoCadastral: response.situacaoCadastral,
      };
    }

    if (response.found && !response.entity && hasV2RootListMatch(response) && requestDocument) {
      const entity = synthesizeEntityFromV2Lists(response, requestDocument, requestType ?? 'cnpj');
      return { found: true, entity };
    }

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
      sancoesAdmPublica: response.sancoesAdmPublica as SancaoAdmPublica[] | undefined,
      impedimentosCepim: response.impedimentosCepim as ImpedimentoCepim[] | undefined,
      trabalhoEscravo: response.trabalhoEscravo as TrabalhoEscravo[] | undefined,
      icmbioAutos: response.icmbioAutos as IcmbioAuto[] | undefined,
      icmbioEmbargos: response.icmbioEmbargos as IcmbioEmbargo[] | undefined,
    };

    const scoreResult = this.scoreService.calculateScoreResult(
      entity.score ?? 0,
      entity.occurrences
    );

    return {
      found: true,
      entity,
      scoreResult,
    };
  }
}
