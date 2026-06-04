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

export type CadastroSancao = 'CEIS' | 'CNEP';

export interface SancaoAdmPublica {
  cadastro: CadastroSancao;
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

export interface ImpedimentoCepim {
  cnpjEntidade?: string;
  nomeEntidade?: string;
  numeroConvenio?: string;
  orgaoConcedente?: string;
  motivoImpedimento?: string;
}

export interface TrabalhoEscravo {
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

export interface IcmbioAuto {
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

export interface IcmbioEmbargo {
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
  /** Ausente quando o back retornou ocorrências apenas via listas raiz V2 (sem IBAMA). */
  score?: number;
  /** Ausente quando o back retornou ocorrências apenas via listas raiz V2 (sem IBAMA). */
  riskLevel?: RiskLevel;
  occurrences: Occurrence[];
  asgScore?: AsgScore;
  ocorrencias?: Ocorrencias;
  sancoesAdmPublica?: SancaoAdmPublica[];
  impedimentosCepim?: ImpedimentoCepim[];
  trabalhoEscravo?: TrabalhoEscravo[];
  icmbioAutos?: IcmbioAuto[];
  icmbioEmbargos?: IcmbioEmbargo[];
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
