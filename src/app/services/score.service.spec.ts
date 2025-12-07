import { TestBed } from '@angular/core/testing';
import { ScoreService } from './score.service';
import { Occurrence, RiskLevel } from '../models/entity.model';

describe('ScoreService', () => {
  let service: ScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRiskLevel', () => {
    // CA07 - Risk level ranges: Baixo: 0-25, Médio: 26-50, Alto: 51-75, Crítico: 76-100

    it('should return "Baixo" for score 0', () => {
      expect(service.getRiskLevel(0)).toBe('Baixo');
    });

    it('should return "Baixo" for score 15', () => {
      expect(service.getRiskLevel(15)).toBe('Baixo');
    });

    it('should return "Baixo" for score 25', () => {
      expect(service.getRiskLevel(25)).toBe('Baixo');
    });

    it('should return "Médio" for score 26', () => {
      expect(service.getRiskLevel(26)).toBe('Médio');
    });

    it('should return "Médio" for score 40', () => {
      expect(service.getRiskLevel(40)).toBe('Médio');
    });

    it('should return "Médio" for score 50', () => {
      expect(service.getRiskLevel(50)).toBe('Médio');
    });

    it('should return "Alto" for score 51', () => {
      expect(service.getRiskLevel(51)).toBe('Alto');
    });

    it('should return "Alto" for score 65', () => {
      expect(service.getRiskLevel(65)).toBe('Alto');
    });

    it('should return "Alto" for score 75', () => {
      expect(service.getRiskLevel(75)).toBe('Alto');
    });

    it('should return "Crítico" for score 76', () => {
      expect(service.getRiskLevel(76)).toBe('Crítico');
    });

    it('should return "Crítico" for score 85', () => {
      expect(service.getRiskLevel(85)).toBe('Crítico');
    });

    it('should return "Crítico" for score 100', () => {
      expect(service.getRiskLevel(100)).toBe('Crítico');
    });
  });

  describe('getRiskColor', () => {
    // CT09-CT12 - Visual indicators with colors

    it('should return green for Baixo risk level', () => {
      expect(service.getRiskColor('Baixo')).toBe('green');
    });

    it('should return yellow for Médio risk level', () => {
      expect(service.getRiskColor('Médio')).toBe('yellow');
    });

    it('should return orange for Alto risk level', () => {
      expect(service.getRiskColor('Alto')).toBe('orange');
    });

    it('should return red for Crítico risk level', () => {
      expect(service.getRiskColor('Crítico')).toBe('red');
    });
  });

  describe('calculateScoreResult', () => {
    it('should calculate score result with empty occurrences', () => {
      const result = service.calculateScoreResult(0, []);
      expect(result.score).toBe(0);
      expect(result.riskLevel).toBe('Baixo');
      expect(result.totalOccurrences).toBe(0);
      expect(result.categorySummaries).toHaveLength(0);
    });

    it('should group occurrences by category', () => {
      const occurrences: Occurrence[] = [
        {
          id: '1',
          date: new Date('2024-01-15'),
          description: 'Environmental violation',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/1',
          category: 'Ambiental IBAMA',
        },
        {
          id: '2',
          date: new Date('2024-02-20'),
          description: 'Another violation',
          status: 'Baixado',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/2',
          category: 'Ambiental IBAMA',
        },
        {
          id: '3',
          date: new Date('2024-03-10'),
          description: 'Labor issue',
          status: 'Ativo',
          source: 'MTE',
          sourceUrl: 'https://mte.gov.br/1',
          category: 'Trabalhista',
        },
      ];

      const result = service.calculateScoreResult(50, occurrences);

      expect(result.score).toBe(50);
      expect(result.riskLevel).toBe('Médio');
      expect(result.totalOccurrences).toBe(3);
      expect(result.categorySummaries).toHaveLength(2);

      const ibamaCategory = result.categorySummaries.find(
        (c) => c.category === 'Ambiental IBAMA'
      );
      expect(ibamaCategory).toBeDefined();
      expect(ibamaCategory!.count).toBe(2);

      const trabalhistaCategory = result.categorySummaries.find(
        (c) => c.category === 'Trabalhista'
      );
      expect(trabalhistaCategory).toBeDefined();
      expect(trabalhistaCategory!.count).toBe(1);
    });

    it('should sort occurrences chronologically within categories (newest first)', () => {
      const occurrences: Occurrence[] = [
        {
          id: '1',
          date: new Date('2024-01-15'),
          description: 'Old violation',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/1',
          category: 'Ambiental IBAMA',
        },
        {
          id: '2',
          date: new Date('2024-03-20'),
          description: 'New violation',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/2',
          category: 'Ambiental IBAMA',
        },
        {
          id: '3',
          date: new Date('2024-02-10'),
          description: 'Middle violation',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/3',
          category: 'Ambiental IBAMA',
        },
      ];

      const result = service.calculateScoreResult(30, occurrences);
      const ibamaCategory = result.categorySummaries.find(
        (c) => c.category === 'Ambiental IBAMA'
      );

      expect(ibamaCategory).toBeDefined();
      expect(ibamaCategory!.occurrences[0].id).toBe('2'); // Newest
      expect(ibamaCategory!.occurrences[1].id).toBe('3'); // Middle
      expect(ibamaCategory!.occurrences[2].id).toBe('1'); // Oldest
    });
  });

  describe('getCategoryOrder', () => {
    it('should return categories in correct order', () => {
      const order = service.getCategoryOrder();
      expect(order).toEqual([
        'Ambiental IBAMA',
        'Ambiental ICMBio',
        'Trabalhista',
        'Administrativo',
      ]);
    });
  });
});
