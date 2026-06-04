/**
 * View-model do Relatório de Conformidade Socioambiental (HU – Exportação de Relatório).
 *
 * Não duplica o domínio: deriva de {@link Entity} (models/entity.model.ts). O serviço
 * {@link RelatorioConformidadeService} consolida as ocorrências das fontes oficiais
 * (ICMBio, MTE, IBAMA, Portal da Transparência) neste formato achatado e pronto para
 * renderização/impressão/exportação em PDF.
 */

/** Fontes oficiais consolidadas no relatório. */
export type FonteOficial = 'ICMBio' | 'MTE' | 'IBAMA' | 'Portal da Transparência';

/** Rótulo legível e descrição da fonte para o cabeçalho de cada bloco. */
export const FONTE_DESCRICAO: Record<FonteOficial, string> = {
  ICMBio: 'Instituto Chico Mendes de Conservação da Biodiversidade',
  MTE: 'Ministério do Trabalho e Emprego',
  IBAMA: 'Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis',
  'Portal da Transparência': 'Controladoria-Geral da União — Portal da Transparência',
};

/** Identificação da empresa consultada, exibida no topo do documento. */
export interface RelatorioEmpresa {
  nome: string;
  documento: string; // CNPJ formatado
  documentType: 'cpf' | 'cnpj';
  setor?: string;
  /** Risco/score quando disponível (não é requisito da HU, mas agrega contexto). */
  score?: number;
  riskLabel?: string;
}

/** Par rótulo/valor para detalhes adicionais de uma ocorrência. */
export interface CampoDetalhe {
  rotulo: string;
  valor: string;
}

/** Severidade visual da ocorrência (codifica cor do cartão no relatório). */
export type SeveridadeOcorrencia = 'alta' | 'media' | 'baixa';

/** Uma ocorrência já normalizada para o relatório, independente da fonte de origem. */
export interface RelatorioOcorrencia {
  /** Tipo legível: "Autuação ambiental", "Embargo", "Trabalho análogo à escravidão"… */
  tipo: string;
  /** Severidade para destaque visual (borda/realce do cartão). */
  severidade: SeveridadeOcorrencia;
  /** Título curto (nº do auto/processo ou resumo). */
  titulo: string;
  descricao?: string;
  /** Data formatada (pt-BR) já pronta para exibição, ou null se não informada. */
  data?: string | null;
  local?: string;
  valor?: string;
  situacao?: string;
  detalhes?: CampoDetalhe[];
}

/** Bloco de ocorrências agrupadas por fonte oficial. */
export interface RelatorioBlocoFonte {
  fonte: FonteOficial;
  descricaoFonte: string;
  ocorrencias: RelatorioOcorrencia[];
}

/**
 * Status de uma base oficial efetivamente consultada — listada SEMPRE no relatório,
 * mesmo quando não retornou ocorrências (rastreabilidade da pesquisa).
 */
export interface BaseConsultada {
  fonte: FonteOficial;
  descricaoFonte: string;
  /** Quantidade de ocorrências encontradas nesta base. */
  totalOcorrencias: number;
  /** true quando a base foi consultada e não retornou ocorrências. */
  semOcorrencias: boolean;
}

/** Relatório consolidado pronto para renderização/exportação. */
export interface RelatorioConformidade {
  empresa: RelatorioEmpresa;
  /** Data/hora de geração já formatada em pt-BR (ex.: "04/06/2026, 16:32"). */
  geradoEm: string;
  /** Lista das fontes oficiais consolidadas, na ordem de exibição. */
  fontes: FonteOficial[];
  /** Todas as bases consultadas, com o resultado de cada uma (sempre as 4). */
  basesConsultadas: BaseConsultada[];
  /** Blocos com ocorrências (somente fontes que retornaram algo). */
  blocos: RelatorioBlocoFonte[];
  /** Total de ocorrências somando todas as fontes. */
  totalOcorrencias: number;
  /** true quando nenhuma ocorrência foi encontrada em nenhuma base. */
  semRegistros: boolean;
}
