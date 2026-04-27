import { Injectable } from '@angular/core';
import { Entity, Occurrence, SearchResult } from '../models/entity.model';
import { ScoreService } from './score.service';

/** Linha do widget “Setores mais críticos” no painel (derivada da amostra mock). */
export interface DashboardCriticalSectorRow {
  sectorKey: string;
  line: string;
}

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  private entities: Entity[] = [];

  constructor(private scoreService: ScoreService) {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Test data from HU001 - Dados de Teste (Mock)

    // Entidade com Score Baixo - Empresa Verde Sustentável
    this.entities.push({
      id: '1',
      name: 'Empresa Verde Sustentável Ltda',
      document: '11222333000181',
      documentType: 'cnpj',
      sectorLabel: 'Fabricação leve',
      score: 15,
      riskLevel: 'Baixo',
      occurrences: [
        {
          id: 'occ-1',
          date: new Date('2023-06-15'),
          description: 'Advertência por descarte irregular de resíduos - situação regularizada',
          status: 'Baixado',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/123456',
          category: 'Ambiental IBAMA',
        },
      ],
    });

    // Entidade com Score Médio - Indústria Amarela
    this.entities.push({
      id: '2',
      name: 'Indústria Amarela S.A.',
      document: '22333444000181',
      documentType: 'cnpj',
      sectorLabel: 'Indústria transformadora',
      score: 42,
      riskLevel: 'Médio',
      occurrences: [
        {
          id: 'occ-2',
          date: new Date('2024-03-20'),
          description: 'Auto de infração por emissão de poluentes acima do permitido',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/234567',
          category: 'Ambiental IBAMA',
        },
        {
          id: 'occ-3',
          date: new Date('2024-01-10'),
          description: 'Multa por operação sem licença ambiental válida',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/234568',
          category: 'Ambiental IBAMA',
        },
      ],
    });

    // Entidade com Score Alto - Construtora Laranja
    this.entities.push({
      id: '3',
      name: 'Construtora Laranja Ltda',
      document: '33444555000181',
      documentType: 'cnpj',
      sectorLabel: 'Construção civil',
      score: 68,
      riskLevel: 'Alto',
      occurrences: [
        {
          id: 'occ-4',
          date: new Date('2024-05-12'),
          description: 'Embargo de obra por desmatamento ilegal em área de preservação',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/345678',
          category: 'Ambiental IBAMA',
        },
        {
          id: 'occ-5',
          date: new Date('2024-04-08'),
          description: 'Auto de infração por degradação de área de APP',
          status: 'Ativo',
          source: 'ICMBio',
          sourceUrl: 'https://icmbio.gov.br/consulta/456789',
          category: 'Ambiental ICMBio',
        },
        {
          id: 'occ-6',
          date: new Date('2024-02-28'),
          description: 'Multa por poluição de curso d\'água',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/345679',
          category: 'Ambiental IBAMA',
        },
        {
          id: 'occ-7',
          date: new Date('2023-11-15'),
          description: 'Autuação por descumprimento de normas de segurança do trabalho',
          status: 'Ativo',
          source: 'MTE',
          sourceUrl: 'https://mte.gov.br/consulta/567890',
          category: 'Trabalhista',
        },
      ],
    });

    // Entidade com Score Crítico - Mineradora Vermelha
    this.entities.push({
      id: '4',
      name: 'Mineradora Vermelha S.A.',
      document: '44555666000181',
      documentType: 'cnpj',
      sectorLabel: 'Extração mineral',
      score: 89,
      riskLevel: 'Crítico',
      occurrences: [
        {
          id: 'occ-8',
          date: new Date('2024-06-01'),
          description: 'Embargo total de atividades por contaminação de lençol freático',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/456780',
          category: 'Ambiental IBAMA',
        },
        {
          id: 'occ-9',
          date: new Date('2024-05-20'),
          description: 'Auto de infração por mineração em área de unidade de conservação',
          status: 'Ativo',
          source: 'ICMBio',
          sourceUrl: 'https://icmbio.gov.br/consulta/567891',
          category: 'Ambiental ICMBio',
        },
        {
          id: 'occ-10',
          date: new Date('2024-04-15'),
          description: 'Multa por destruição de habitat de espécie ameaçada',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/456781',
          category: 'Ambiental IBAMA',
        },
        {
          id: 'occ-11',
          date: new Date('2024-03-10'),
          description: 'Auto de infração por operação sem licença',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/456782',
          category: 'Ambiental IBAMA',
        },
        {
          id: 'occ-12',
          date: new Date('2024-02-05'),
          description: 'Multa por emissão de poluentes atmosféricos',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/456783',
          category: 'Ambiental IBAMA',
        },
        {
          id: 'occ-13',
          date: new Date('2024-01-20'),
          description: 'Autuação por trabalho em condições degradantes',
          status: 'Ativo',
          source: 'MTE',
          sourceUrl: 'https://mte.gov.br/consulta/678901',
          category: 'Trabalhista',
        },
        {
          id: 'occ-14',
          date: new Date('2023-12-10'),
          description: 'Multa por descumprimento de normas de segurança',
          status: 'Ativo',
          source: 'MTE',
          sourceUrl: 'https://mte.gov.br/consulta/678902',
          category: 'Trabalhista',
        },
        {
          id: 'occ-15',
          date: new Date('2023-10-05'),
          description: 'Sanção administrativa por irregularidades em documentação',
          status: 'Ativo',
          source: 'ANM',
          sourceUrl: 'https://anm.gov.br/consulta/789012',
          category: 'Administrativo',
        },
      ],
    });

    // CNPJ sem ocorrências — score 0, faixa Baixo, sem pendências nas bases
    this.entities.push({
      id: '6',
      name: 'Eco Limpo Comércio Ltda',
      document: '60746977000184',
      documentType: 'cnpj',
      sectorLabel: 'Comércio',
      score: 0,
      riskLevel: 'Baixo',
      occurrences: [],
    });

    // Pessoa Física para Teste - João da Silva
    this.entities.push({
      id: '5',
      name: 'João da Silva Teste',
      document: '12345678909',
      documentType: 'cpf',
      score: 35,
      riskLevel: 'Médio',
      occurrences: [
        {
          id: 'occ-16',
          date: new Date('2024-02-15'),
          description: 'Auto de infração por pesca ilegal em área protegida',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/890123',
          category: 'Ambiental IBAMA',
        },
      ],
    });
  }

  /**
   * Strips mask from document for comparison
   */
  private stripMask(document: string): string {
    return document.replace(/[.\-/]/g, '');
  }

  /**
   * Simulates network delay for realistic async behavior
   * CA13 - Feedback visual durante processamento
   */
  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 200));
  }

  /**
   * Search by document (CPF or CNPJ)
   * CA03, CA04 - Search by CPF/CNPJ
   */
  async searchByDocument(
    document: string,
    type: 'cpf' | 'cnpj'
  ): Promise<SearchResult> {
    await this.simulateDelay();

    const strippedDocument = this.stripMask(document);

    if (type === 'cnpj' && strippedDocument === '18236120000158') {
      return {
        found: false,
        bloqueadoPorSituacaoCadastral: true,
        situacaoCadastral: {
          dataConsulta: new Date().toISOString(),
          mensagem:
            'CNPJ de demonstração: situação cadastral irregular na Receita Federal. A análise ASG não está disponível para empresas inativas. Em produção, o texto viria da consulta oficial.',
          situacao: 'Baixada',
          valido: false,
        },
      };
    }

    const entity = this.entities.find(
      (e) => e.documentType === type && this.stripMask(e.document) === strippedDocument
    );

    if (entity) {
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

    return { found: false };
  }

  /**
   * Search by name (partial, case-insensitive)
   * CA01 - Search by name
   */
  async searchByName(name: string): Promise<SearchResult> {
    await this.simulateDelay();

    const searchTerm = name.toLowerCase();
    const entity = this.entities.find((e) =>
      e.name.toLowerCase().includes(searchTerm)
    );

    if (entity) {
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

    return { found: false };
  }

  /**
   * Setores ordenados por score médio (maior primeiro), usando CNPJs da amostra com `sectorLabel`.
   * Alinha-se à escala 0–100 do produto para o rótulo de risco.
   */
  getCriticalSectorsDashboardLines(maxRows = 5): DashboardCriticalSectorRow[] {
    const cnpjs = this.entities.filter(
      (e): e is Entity & { sectorLabel: string } =>
        e.documentType === 'cnpj' && typeof e.sectorLabel === 'string' && e.sectorLabel.trim() !== ''
    );
    const bySector = new Map<string, number[]>();
    for (const e of cnpjs) {
      const key = e.sectorLabel.trim();
      const list = bySector.get(key) ?? [];
      list.push(e.score);
      bySector.set(key, list);
    }
    const aggregated = [...bySector.entries()].map(([sectorKey, scores]) => {
      const sum = scores.reduce((a, b) => a + b, 0);
      const avg = Math.round(sum / scores.length);
      return { sectorKey, avg, count: scores.length, risk: this.riskLabelFromScore(avg) };
    });
    aggregated.sort((a, b) => b.avg - a.avg);
    return aggregated.slice(0, maxRows).map(({ sectorKey, avg, count, risk }) => ({
      sectorKey,
      line: `${sectorKey} — score médio ${avg} (${risk}), ${count} ${count === 1 ? 'empresa' : 'empresas'} na amostra`,
    }));
  }

  private riskLabelFromScore(score: number): string {
    if (score <= 25) return 'Baixo';
    if (score <= 50) return 'Médio';
    if (score <= 75) return 'Alto';
    return 'Crítico';
  }
}
