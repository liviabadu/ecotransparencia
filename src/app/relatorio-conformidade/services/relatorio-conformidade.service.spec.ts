import { TestBed } from '@angular/core/testing';
import { Entity } from '../../models/entity.model';
import { RelatorioConformidadeService } from './relatorio-conformidade.service';

describe('RelatorioConformidadeService', () => {
  let service: RelatorioConformidadeService;
  const geradoEm = new Date('2026-06-04T16:32:00');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelatorioConformidadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('formata documento (CNPJ) e identifica empresa (Critério 4)', () => {
    const entity: Entity = {
      id: '1',
      name: 'Empresa Teste Ltda',
      document: '11222333000181',
      documentType: 'cnpj',
      sectorLabel: 'Indústria',
      score: 42,
      riskLevel: 'Médio',
      occurrences: [],
    };
    const r = service.consolidar(entity, geradoEm);
    expect(r.empresa.nome).toBe('Empresa Teste Ltda');
    expect(r.empresa.documento).toBe('11.222.333/0001-81');
    expect(r.geradoEm).toContain('04/06/2026');
  });

  it('marca semRegistros quando não há ocorrências (Critério 7)', () => {
    const entity: Entity = {
      id: '2',
      name: 'Empresa Limpa S.A.',
      document: '11222333000181',
      documentType: 'cnpj',
      occurrences: [],
    };
    const r = service.consolidar(entity, geradoEm);
    expect(r.semRegistros).toBe(true);
    expect(r.totalOcorrencias).toBe(0);
    expect(r.blocos.length).toBe(0);
  });

  it('lista SEMPRE as 4 bases pesquisadas, mesmo as sem ocorrência', () => {
    const entity: Entity = {
      id: '2b',
      name: 'Empresa Limpa S.A.',
      document: '11222333000181',
      documentType: 'cnpj',
      occurrences: [],
    };
    const r = service.consolidar(entity, geradoEm);
    expect(r.basesConsultadas.map((b) => b.fonte)).toEqual([
      'IBAMA',
      'ICMBio',
      'MTE',
      'Portal da Transparência',
    ]);
    expect(r.basesConsultadas.every((b) => b.semOcorrencias && b.totalOcorrencias === 0)).toBe(true);
  });

  it('reflete o total por base em basesConsultadas', () => {
    const entity: Entity = {
      id: '2c',
      name: 'Empresa Com Trabalho Escravo',
      document: '11222333000181',
      documentType: 'cnpj',
      occurrences: [],
      trabalhoEscravo: [{ anoAcaoFiscal: 2022, uf: 'PA', empregador: 'X' }],
    };
    const r = service.consolidar(entity, geradoEm);
    const mte = r.basesConsultadas.find((b) => b.fonte === 'MTE');
    const ibama = r.basesConsultadas.find((b) => b.fonte === 'IBAMA');
    expect(mte?.totalOcorrencias).toBe(1);
    expect(mte?.semOcorrencias).toBe(false);
    expect(ibama?.semOcorrencias).toBe(true);
    expect(r.basesConsultadas.length).toBe(4);
  });

  it('consolida ocorrências das fontes oficiais e agrupa por fonte (Critérios 3 e 5)', () => {
    const entity: Entity = {
      id: '3',
      name: 'Empresa Mista Ltda',
      document: '99888777000166',
      documentType: 'cnpj',
      occurrences: [],
      ocorrencias: {
        embargos: [],
        autosInfracao: [
          {
            id: 'a1',
            source: 'IBAMA',
            numeroAuto: 'AI-123',
            descricao: 'Desmatamento ilegal',
            valorMulta: 50000,
            status: 'Ativo',
            data: '2024-03-20',
          },
        ],
      },
      trabalhoEscravo: [
        {
          anoAcaoFiscal: 2022,
          uf: 'PA',
          empregador: 'Empresa Mista Ltda',
          trabalhadoresEnvolvidos: 12,
        },
      ],
      sancoesAdmPublica: [
        { cadastro: 'CEIS', categoriaSancao: 'Inidoneidade', orgaoSancionador: 'CGU' },
      ],
    };

    const r = service.consolidar(entity, geradoEm);
    expect(r.semRegistros).toBe(false);
    expect(r.totalOcorrencias).toBe(3);

    const fontes = r.blocos.map((b) => b.fonte);
    expect(fontes).toContain('IBAMA');
    expect(fontes).toContain('MTE');
    expect(fontes).toContain('Portal da Transparência');

    const mte = r.blocos.find((b) => b.fonte === 'MTE');
    expect(mte?.ocorrencias[0].tipo).toBe('Trabalho análogo à escravidão');

    const ibama = r.blocos.find((b) => b.fonte === 'IBAMA');
    expect(ibama?.ocorrencias[0].valor).toContain('50.000');
  });

  it('roteia occurrences genéricas para a fonte certa por categoria', () => {
    const entity: Entity = {
      id: '4',
      name: 'Empresa Verde',
      document: '11222333000181',
      documentType: 'cnpj',
      occurrences: [
        {
          id: 'occ-1',
          source: 'IBAMA',
          category: 'Ambiental IBAMA',
          description: 'Advertência',
          status: 'Baixado',
          date: new Date('2023-06-15'),
        },
      ],
    };
    const r = service.consolidar(entity, geradoEm);
    expect(r.blocos.length).toBe(1);
    expect(r.blocos[0].fonte).toBe('IBAMA');
    expect(r.blocos[0].ocorrencias[0].data).toBe('15/06/2023');
  });
});
