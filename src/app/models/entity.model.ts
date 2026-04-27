/**
 * Types and interfaces for the EcoTransparência scoring system
 * Based on HU001 requirements and V2 API contract
 */

export type RiskLevel = 'Baixo' | 'Medio' | 'Médio' | 'Alto' | 'Critico' | 'Crítico';

export type OccurrenceCategory =
  | 'Ambiental IBAMA'
  | 'Ambiental ICMBio'
  | 'Trabalhista'
  | 'Administrativo';

export type OccurrenceStatus = 'Ativo' | 'Baixado' | 'Lavrado';

export interface Location {
  imovel?: string;
  municipio: string;
  uf: string;
}

export interface Occurrence {
  id: string;
  date?: Date;
  description?: string;
  status?: OccurrenceStatus;
  source: string;
  sourceUrl?: string;
  category?: OccurrenceCategory;
  // Geographic and environmental fields
  location?: Location;
  biome?: string;
  areaEmbargada?: number;
  desmatamento?: boolean;
  autoInfracao?: string;
}

export interface CategorySummary {
  category: OccurrenceCategory;
  count: number;
  occurrences: Occurrence[];
}

export interface AsgScoreBreakdown {
  fonte: string;
  peso: number;
  quantidadeOcorrencias: number;
  score: number;
  scorePonderado?: number;
}

export interface AsgScore {
  score: number;
  riskLevel: RiskLevel;
  totalOcorrencias: number;
  breakdown: AsgScoreBreakdown[];
}

export interface Embargo {
  id: string;
  source: string;
  category?: string;
  date?: string;
  description?: string;
  status?: string;
  sourceUrl?: string;
  // Geographic and environmental fields
  location?: Location;
  biome?: string;
  areaEmbargada?: number;
  desmatamento?: boolean;
  autoInfracao?: string;
}

export interface AutoInfracao {
  id: string;
  source: string;
  data?: string;
  descricao?: string;
  numeroAuto?: string;
  tipoInfracao?: string;
  valorMulta?: number;
  status?: string;
  // Legal and severity fields
  location?: Location;
  biomasAtingidos?: string;
  efeitoMeioAmbiente?: string;
  enquadramentoLegal?: string;
  gravidade?: string;
  motivacaoConduta?: string;
}

export interface Ocorrencias {
  embargos: Embargo[];
  autosInfracao: AutoInfracao[];
}

export interface ScoreResult {
  score: number;
  riskLevel: RiskLevel;
  totalOccurrences: number;
  categorySummaries: CategorySummary[];
}

export interface Entity {
  id: string;
  name: string;
  document: string;
  documentType: 'cpf' | 'cnpj';
  score: number;
  riskLevel: RiskLevel;
  occurrences: Occurrence[];
  asgScore?: AsgScore;
  ocorrencias?: Ocorrencias;
  /** Setor econômico resumido (ex.: CNAE agregado) — opcional; mock / API. */
  sectorLabel?: string;
}

export interface SituacaoCadastral {
  dataConsulta: string;
  mensagem: string;
  situacao: string;
  valido: boolean;
  codigoErro?: number;
  erroConsulta?: boolean;
}

export interface SearchResult {
  found: boolean;
  entity?: Entity;
  scoreResult?: ScoreResult;
  bloqueadoPorSituacaoCadastral?: boolean;
  situacaoCadastral?: SituacaoCadastral;
}
