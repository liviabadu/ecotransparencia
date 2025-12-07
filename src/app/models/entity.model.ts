/**
 * Types and interfaces for the EcoTransparência scoring system
 * Based on HU001 requirements
 */

export type RiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export type OccurrenceCategory =
  | 'Ambiental IBAMA'
  | 'Ambiental ICMBio'
  | 'Trabalhista'
  | 'Administrativo';

export type OccurrenceStatus = 'Ativo' | 'Baixado';

export interface Occurrence {
  id: string;
  date: Date;
  description: string;
  status: OccurrenceStatus;
  source: string;
  sourceUrl: string;
  category: OccurrenceCategory;
}

export interface CategorySummary {
  category: OccurrenceCategory;
  count: number;
  occurrences: Occurrence[];
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
}

export interface SearchResult {
  found: boolean;
  entity?: Entity;
  scoreResult?: ScoreResult;
}
