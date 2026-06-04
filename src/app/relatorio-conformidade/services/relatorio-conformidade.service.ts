import { Injectable } from '@angular/core';
import {
  AutoInfracao,
  Embargo,
  Entity,
  IcmbioAuto,
  IcmbioEmbargo,
  ImpedimentoCepim,
  Occurrence,
  SancaoAdmPublica,
  TrabalhoEscravo,
} from '../../models/entity.model';
import {
  BaseConsultada,
  CampoDetalhe,
  FONTE_DESCRICAO,
  FonteOficial,
  RelatorioBlocoFonte,
  RelatorioConformidade,
  RelatorioOcorrencia,
  SeveridadeOcorrencia,
} from '../models/relatorio.model';

/** Ordem fixa de exibição das fontes no documento. */
const ORDEM_FONTES: FonteOficial[] = ['IBAMA', 'ICMBio', 'MTE', 'Portal da Transparência'];

/**
 * Consolida os dados de uma {@link Entity} (resposta da API/V2) no view-model
 * {@link RelatorioConformidade}, agrupando as ocorrências pelas fontes oficiais.
 *
 * É puro/sem estado: recebe a entidade já obtida pela busca e devolve a estrutura
 * pronta para o componente renderizar, imprimir e exportar em PDF.
 */
@Injectable({ providedIn: 'root' })
export class RelatorioConformidadeService {
  /**
   * Monta o relatório consolidado. `geradoEm` pode ser injetado em testes; por padrão
   * usa o instante atual.
   */
  consolidar(entity: Entity, geradoEm: Date = new Date()): RelatorioConformidade {
    // Monta um bloco por fonte (mesmo vazio) para registrar quais bases foram consultadas.
    const todosBlocos = ORDEM_FONTES.map((fonte) => this.montarBloco(fonte, entity));

    // Lista de bases consultadas — SEMPRE as 4, com o resultado de cada uma.
    const basesConsultadas: BaseConsultada[] = todosBlocos.map((b) => ({
      fonte: b.fonte,
      descricaoFonte: b.descricaoFonte,
      totalOcorrencias: b.ocorrencias.length,
      semOcorrencias: b.ocorrencias.length === 0,
    }));

    // Blocos detalhados: apenas as fontes que retornaram ocorrências.
    const blocos = todosBlocos.filter((b) => b.ocorrencias.length > 0);

    const totalOcorrencias = blocos.reduce((soma, b) => soma + b.ocorrencias.length, 0);

    return {
      empresa: {
        nome: entity.name,
        documento: this.formatDocumento(entity.document, entity.documentType),
        documentType: entity.documentType,
        setor: entity.sectorLabel,
        score: entity.score,
        riskLabel: entity.riskLevel,
      },
      geradoEm: this.formatDataHora(geradoEm),
      fontes: ORDEM_FONTES,
      basesConsultadas,
      blocos,
      totalOcorrencias,
      semRegistros: totalOcorrencias === 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Montagem por fonte
  // ---------------------------------------------------------------------------

  private montarBloco(fonte: FonteOficial, e: Entity): RelatorioBlocoFonte {
    let ocorrencias: RelatorioOcorrencia[] = [];

    switch (fonte) {
      case 'IBAMA':
        ocorrencias = [
          ...(e.ocorrencias?.autosInfracao ?? []).map((a) => this.mapAutoInfracao(a)),
          ...(e.ocorrencias?.embargos ?? []).map((emb) => this.mapEmbargo(emb)),
          ...this.mapOccurrencesGenericas(e.occurrences, 'IBAMA'),
        ];
        break;
      case 'ICMBio':
        ocorrencias = [
          ...(e.icmbioAutos ?? []).map((a) => this.mapIcmbioAuto(a)),
          ...(e.icmbioEmbargos ?? []).map((emb) => this.mapIcmbioEmbargo(emb)),
          ...this.mapOccurrencesGenericas(e.occurrences, 'ICMBio'),
        ];
        break;
      case 'MTE':
        ocorrencias = [
          ...(e.trabalhoEscravo ?? []).map((t) => this.mapTrabalhoEscravo(t)),
          ...this.mapOccurrencesGenericas(e.occurrences, 'MTE'),
        ];
        break;
      case 'Portal da Transparência':
        ocorrencias = [
          ...(e.sancoesAdmPublica ?? []).map((s) => this.mapSancao(s)),
          ...(e.impedimentosCepim ?? []).map((i) => this.mapCepim(i)),
          ...this.mapOccurrencesGenericas(e.occurrences, 'Portal da Transparência'),
        ];
        break;
    }

    return { fonte, descricaoFonte: FONTE_DESCRICAO[fonte], ocorrencias };
  }

  // ---------------------------------------------------------------------------
  // Mapeadores por tipo de registro
  // ---------------------------------------------------------------------------

  private mapAutoInfracao(a: AutoInfracao): RelatorioOcorrencia {
    return {
      tipo: 'Autuação ambiental',
      severidade: this.severidadePorGravidade(a.gravidade, 'media'),
      titulo: a.numeroAuto ? `Auto de infração nº ${a.numeroAuto}` : 'Auto de infração',
      descricao: a.descricao,
      data: this.formatData(a.data),
      local: this.formatLocation(a.location),
      valor: this.formatCurrency(a.valorMulta),
      situacao: a.status,
      detalhes: this.compactar([
        ['Tipo de infração', a.tipoInfracao],
        ['Gravidade', a.gravidade],
        ['Enquadramento legal', a.enquadramentoLegal],
        ['Biomas atingidos', a.biomasAtingidos],
        ['Efeito ao meio ambiente', a.efeitoMeioAmbiente],
      ]),
    };
  }

  private mapEmbargo(emb: Embargo): RelatorioOcorrencia {
    return {
      tipo: 'Embargo',
      severidade: 'alta',
      titulo: emb.autoInfracao ? `Embargo — auto nº ${emb.autoInfracao}` : 'Área embargada',
      descricao: emb.description,
      data: this.formatData(emb.date),
      local: this.formatLocation(emb.location),
      situacao: emb.status,
      detalhes: this.compactar([
        ['Bioma', emb.biome],
        ['Área embargada', this.formatArea(emb.areaEmbargada)],
        ['Desmatamento', emb.desmatamento == null ? undefined : emb.desmatamento ? 'Sim' : 'Não'],
      ]),
    };
  }

  private mapIcmbioAuto(a: IcmbioAuto): RelatorioOcorrencia {
    return {
      tipo: 'Autuação ambiental (Unidade de Conservação)',
      severidade: 'media',
      titulo: a.numeroAi ? `Auto de infração nº ${a.numeroAi}` : 'Auto de infração',
      descricao: a.descAi,
      data: this.formatData(a.data) ?? (a.ano ? String(a.ano) : null),
      local: this.formatMunicipioUf(a.municipio, a.uf),
      valor: this.formatCurrency(a.valorMulta),
      situacao: a.julgamento,
      detalhes: this.compactar([
        ['Unidade de conservação', a.nomeUc],
        ['Tipo de infração', a.tipoInfra],
        ['Processo', a.processo],
      ]),
    };
  }

  private mapIcmbioEmbargo(emb: IcmbioEmbargo): RelatorioOcorrencia {
    return {
      tipo: 'Embargo (Unidade de Conservação)',
      severidade: 'alta',
      titulo: emb.numeroEmb ? `Embargo nº ${emb.numeroEmb}` : 'Área embargada',
      descricao: emb.descInfra || emb.descSanc,
      data: this.formatData(emb.data) ?? (emb.ano ? String(emb.ano) : null),
      local: this.formatMunicipioUf(emb.municipio, emb.uf),
      situacao: emb.julgamento,
      detalhes: this.compactar([
        ['Unidade de conservação', emb.nomeUc],
        ['Tipo de infração', emb.tipoInfra],
        ['Área', this.formatArea(emb.area)],
        ['Processo', emb.processo],
      ]),
    };
  }

  private mapTrabalhoEscravo(t: TrabalhoEscravo): RelatorioOcorrencia {
    return {
      tipo: 'Trabalho análogo à escravidão',
      severidade: 'alta',
      titulo: t.empregador
        ? `Cadastro de Empregadores — ${t.empregador}`
        : 'Inclusão no Cadastro de Empregadores (Lista Suja)',
      descricao: t.estabelecimento
        ? `Estabelecimento autuado: ${t.estabelecimento}.`
        : undefined,
      data: t.anoAcaoFiscal ? String(t.anoAcaoFiscal) : null,
      local: t.uf ? t.uf : undefined,
      situacao: t.decisaoAdmProcedencia,
      detalhes: this.compactar([
        ['Trabalhadores envolvidos', this.formatNumero(t.trabalhadoresEnvolvidos)],
        ['CNAE', t.cnae],
        ['Inclusão no cadastro', t.inclusaoCadastroEmpregadores],
      ]),
    };
  }

  private mapSancao(s: SancaoAdmPublica): RelatorioOcorrencia {
    return {
      tipo: `Sanção administrativa (${s.cadastro})`,
      severidade: 'media',
      titulo: s.categoriaSancao
        ? `${s.cadastro} — ${s.categoriaSancao}`
        : `Registro no cadastro ${s.cadastro}`,
      descricao: s.nomeSancionado ? `Sancionado: ${s.nomeSancionado}.` : undefined,
      data: this.formatData(s.dataInicioSancao),
      local: this.formatMunicipioUf(undefined, s.ufOrgao),
      valor: this.formatCurrency(s.valorMulta),
      detalhes: this.compactar([
        ['Órgão sancionador', s.orgaoSancionador],
        ['Esfera', s.esferaOrgao],
        ['Vigência', this.formatPeriodo(s.dataInicioSancao, s.dataFimSancao)],
        ['Fundamentação legal', s.fundamentacaoLegal],
      ]),
    };
  }

  private mapCepim(i: ImpedimentoCepim): RelatorioOcorrencia {
    return {
      tipo: 'Impedimento (CEPIM)',
      severidade: 'baixa',
      titulo: i.nomeEntidade
        ? `Entidade impedida — ${i.nomeEntidade}`
        : 'Impedimento de recebimento de recursos',
      descricao: i.motivoImpedimento,
      detalhes: this.compactar([
        ['Convênio', i.numeroConvenio],
        ['Órgão concedente', i.orgaoConcedente],
        ['CNPJ da entidade', i.cnpjEntidade],
      ]),
    };
  }

  /**
   * Ocorrências genéricas (`Entity.occurrences`) — usadas pelos mocks básicos e por
   * respostas legadas. Roteadas para a fonte do bloco conforme `category`/`source`.
   */
  private mapOccurrencesGenericas(
    occurrences: Occurrence[] | undefined,
    fonte: FonteOficial,
  ): RelatorioOcorrencia[] {
    if (!occurrences?.length) return [];
    return occurrences
      .filter((o) => this.classificarFonte(o) === fonte)
      .map((o) => ({
        tipo: o.category ?? 'Ocorrência',
        severidade: this.severidadePorCategoria(o.category),
        titulo: o.autoInfracao ? `Auto nº ${o.autoInfracao}` : o.source || 'Registro',
        descricao: o.description,
        data: this.formatData(o.date),
        local: this.formatLocation(o.location),
        situacao: o.status,
        detalhes: this.compactar([
          ['Bioma', o.biome],
          ['Área embargada', this.formatArea(o.areaEmbargada)],
        ]),
      }));
  }

  /** Decide em qual das 4 fontes uma ocorrência genérica deve aparecer. */
  private classificarFonte(o: Occurrence): FonteOficial {
    const cat = (o.category ?? '').toLowerCase();
    const src = (o.source ?? '').toLowerCase();
    if (cat.includes('icmbio') || src.includes('icmbio')) return 'ICMBio';
    if (cat.includes('trabalh') || src.includes('mte') || src.includes('trabalho')) return 'MTE';
    if (cat.includes('administrativ') || src.includes('transpar') || src.includes('ceis') || src.includes('cnep')) {
      return 'Portal da Transparência';
    }
    // Padrão: ambiental federal.
    return 'IBAMA';
  }

  // ---------------------------------------------------------------------------
  // Formatadores (pt-BR)
  // ---------------------------------------------------------------------------

  /** Severidade a partir do texto de gravidade da autuação (fallback configurável). */
  private severidadePorGravidade(
    gravidade: string | undefined,
    fallback: SeveridadeOcorrencia,
  ): SeveridadeOcorrencia {
    const g = (gravidade ?? '').toLowerCase();
    if (g.includes('gravissim') || g.includes('gravíssim') || g.includes('grave')) return 'alta';
    if (g.includes('medi') || g.includes('médi')) return 'media';
    if (g.includes('leve') || g.includes('baix')) return 'baixa';
    return fallback;
  }

  /** Severidade a partir da categoria de uma ocorrência genérica. */
  private severidadePorCategoria(categoria: string | undefined): SeveridadeOcorrencia {
    const c = (categoria ?? '').toLowerCase();
    if (c.includes('trabalh')) return 'alta';
    if (c.includes('administrativ')) return 'baixa';
    return 'media';
  }

  /** Remove pares com valor vazio e devolve undefined se nada sobrar. */
  private compactar(pares: Array<[string, string | undefined | null]>): CampoDetalhe[] | undefined {
    const detalhes = pares
      .filter(([, v]) => v != null && String(v).trim() !== '')
      .map(([rotulo, valor]) => ({ rotulo, valor: String(valor) }));
    return detalhes.length ? detalhes : undefined;
  }

  private formatDocumento(doc: string, type: 'cpf' | 'cnpj'): string {
    const digits = (doc ?? '').replace(/\D/g, '');
    if (type === 'cnpj' && digits.length === 14) {
      return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    if (type === 'cpf' && digits.length === 11) {
      return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    return doc;
  }

  private formatDataHora(d: Date): string {
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatData(date: Date | string | undefined | null): string | null {
    if (date == null || (typeof date === 'string' && date.trim() === '')) return null;
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) {
      // Aceita "dd/mm/aaaa" já formatado vindo da API.
      return typeof date === 'string' ? date : null;
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private formatPeriodo(inicio?: string, fim?: string): string | undefined {
    const i = this.formatData(inicio);
    const f = this.formatData(fim);
    if (i && f) return `${i} a ${f}`;
    if (i) return `a partir de ${i}`;
    if (f) return `até ${f}`;
    return undefined;
  }

  private formatCurrency(value: number | undefined): string | undefined {
    if (value == null) return undefined;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private formatArea(area: number | undefined): string | undefined {
    if (area == null) return undefined;
    return (
      new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(
        area,
      ) + ' ha'
    );
  }

  private formatNumero(n: number | undefined): string | undefined {
    if (n == null) return undefined;
    return new Intl.NumberFormat('pt-BR').format(n);
  }

  private formatLocation(
    location: { imovel?: string; municipio: string; uf: string } | undefined,
  ): string | undefined {
    if (!location) return undefined;
    if (location.imovel) return `${location.imovel} — ${location.municipio}/${location.uf}`;
    return `${location.municipio}/${location.uf}`;
  }

  private formatMunicipioUf(municipio?: string, uf?: string): string | undefined {
    if (municipio && uf) return `${municipio}/${uf}`;
    return municipio || uf || undefined;
  }
}
