import { TestBed } from '@angular/core/testing';
import { MockDataService } from './mock-data.service';
import { Entity } from '../models/entity.model';

describe('MockDataService', () => {
  let service: MockDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchByDocument', () => {
    // CT03 - Search by valid CPF with mask
    it('should find entity by CPF with mask', async () => {
      const result = await service.searchByDocument('123.456.789-09', 'cpf');
      expect(result.found).toBe(true);
      expect(result.entity).toBeDefined();
      expect(result.entity!.name).toBe('João da Silva Teste');
    });

    // CT04 - Search by valid CPF without mask
    it('should find entity by CPF without mask', async () => {
      const result = await service.searchByDocument('12345678909', 'cpf');
      expect(result.found).toBe(true);
      expect(result.entity).toBeDefined();
    });

    // CT06 - Search by valid CNPJ with mask
    it('should find entity by CNPJ with mask (Empresa Verde)', async () => {
      const result = await service.searchByDocument('11.222.333/0001-81', 'cnpj');
      expect(result.found).toBe(true);
      expect(result.entity).toBeDefined();
      expect(result.entity!.name).toBe('Empresa Verde Sustentável Ltda');
      expect(result.entity!.score).toBe(15);
    });

    // CT07 - Search by valid CNPJ without mask
    it('should find entity by CNPJ without mask', async () => {
      const result = await service.searchByDocument('11222333000181', 'cnpj');
      expect(result.found).toBe(true);
      expect(result.entity).toBeDefined();
    });

    it('should find Indústria Amarela by CNPJ', async () => {
      const result = await service.searchByDocument('22.333.444/0001-81', 'cnpj');
      expect(result.found).toBe(true);
      expect(result.entity!.name).toBe('Indústria Amarela S.A.');
      expect(result.entity!.score).toBe(42);
    });

    it('should find Construtora Laranja by CNPJ', async () => {
      const result = await service.searchByDocument('33.444.555/0001-81', 'cnpj');
      expect(result.found).toBe(true);
      expect(result.entity!.name).toBe('Construtora Laranja Ltda');
      expect(result.entity!.score).toBe(68);
    });

    it('should find Mineradora Vermelha by CNPJ', async () => {
      const result = await service.searchByDocument('44.555.666/0001-81', 'cnpj');
      expect(result.found).toBe(true);
      expect(result.entity!.name).toBe('Mineradora Vermelha S.A.');
      expect(result.entity!.score).toBe(89);
    });

    // CT14 - No results found
    it('should return not found for unknown document', async () => {
      const result = await service.searchByDocument('00.000.000/0001-00', 'cnpj');
      expect(result.found).toBe(false);
      expect(result.entity).toBeUndefined();
    });
  });

  describe('searchByName', () => {
    // CT01 - Search by valid name with results
    it('should find entity by name (partial match)', async () => {
      const result = await service.searchByName('Empresa Verde');
      expect(result.found).toBe(true);
      expect(result.entity).toBeDefined();
      expect(result.entity!.name).toContain('Verde');
    });

    it('should find entity by name case insensitive', async () => {
      const result = await service.searchByName('empresa verde');
      expect(result.found).toBe(true);
      expect(result.entity).toBeDefined();
    });

    it('should find João da Silva by name', async () => {
      const result = await service.searchByName('João da Silva');
      expect(result.found).toBe(true);
      expect(result.entity!.documentType).toBe('cpf');
    });

    // CT14 - No results found for name
    it('should return not found for unknown name', async () => {
      const result = await service.searchByName('Entidade Inexistente XYZ');
      expect(result.found).toBe(false);
      expect(result.entity).toBeUndefined();
    });
  });

  describe('entity data validation', () => {
    it('should have occurrences for entities with score > 0', async () => {
      const result = await service.searchByDocument('44.555.666/0001-81', 'cnpj');
      expect(result.found).toBe(true);
      expect(result.entity!.occurrences.length).toBeGreaterThan(0);
    });

    // CA10 - Each occurrence should have required fields
    it('should have complete occurrence data', async () => {
      const result = await service.searchByDocument('44.555.666/0001-81', 'cnpj');
      const occurrence = result.entity!.occurrences[0];

      expect(occurrence.id).toBeDefined();
      expect(occurrence.date).toBeInstanceOf(Date);
      expect(occurrence.description).toBeDefined();
      expect(occurrence.status).toMatch(/^(Ativo|Baixado)$/);
      expect(occurrence.source).toBeDefined();
      expect(occurrence.sourceUrl).toBeDefined();
      expect(occurrence.category).toBeDefined();
    });

    // CA11 - Links should be valid URLs
    it('should have valid source URLs', async () => {
      const result = await service.searchByDocument('44.555.666/0001-81', 'cnpj');
      const occurrence = result.entity!.occurrences[0];

      expect(occurrence.sourceUrl).toMatch(/^https?:\/\//);
    });
  });

  describe('score result calculation', () => {
    it('should include scoreResult in search result', async () => {
      const result = await service.searchByDocument('11.222.333/0001-81', 'cnpj');
      expect(result.scoreResult).toBeDefined();
      expect(result.scoreResult!.score).toBe(15);
      expect(result.scoreResult!.riskLevel).toBe('Baixo');
    });

    it('should group occurrences by category in scoreResult', async () => {
      const result = await service.searchByDocument('44.555.666/0001-81', 'cnpj');
      expect(result.scoreResult).toBeDefined();
      expect(result.scoreResult!.categorySummaries.length).toBeGreaterThan(0);
    });
  });

  describe('simulated delay', () => {
    // CA13 - Simulates async behavior for loading indicator testing
    it('should simulate async behavior', async () => {
      const startTime = Date.now();
      await service.searchByName('Empresa Verde');
      const endTime = Date.now();

      // Should have some simulated delay (at least 100ms)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });
});
