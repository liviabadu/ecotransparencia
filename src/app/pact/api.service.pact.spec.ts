import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import * as path from 'path';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

const { like, eachLike, integer } = MatchersV3;

describe('ApiService Pact Tests', () => {
  let apiService: ApiService;

  // Create a new Pact instance for each test file
  const provider = new PactV4({
    consumer: 'EcoTransparenciaFrontend',
    provider: 'EcoTransparenciaBackend',
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [ApiService],
    });
  });

  describe('searchByDocument', () => {
    it('should return entity when searching by valid CNPJ', async () => {
      await provider
        .addInteraction()
        .given('an entity with CNPJ 11222333000181 exists')
        .uponReceiving('a request to search by CNPJ')
        .withRequest('GET', '/api/search/document', (builder) => {
          builder.query({ document: '11222333000181', type: 'cnpj' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: true,
            entity: {
              id: like('1'),
              name: like('Empresa Verde Sustentável Ltda'),
              document: like('11222333000181'),
              documentType: like('cnpj'),
              score: integer(15),
              riskLevel: like('Baixo'),
              occurrences: eachLike({
                id: like('occ-1'),
                date: like('2023-06-15T00:00:00.000Z'),
                description: like('Advertência por descarte irregular de resíduos'),
                status: like('Baixado'),
                source: like('IBAMA'),
                sourceUrl: like('https://ibama.gov.br/consulta/123456'),
                category: like('Ambiental IBAMA'),
              }),
            },
          });
        })
        .executeTest(async (mockServer) => {
          // Configure the API service to use the mock server
          apiService = TestBed.inject(ApiService);
          (apiService as any).baseUrl = mockServer.url + '/api';

          const result = await firstValueFrom(
            apiService.searchByDocument('11222333000181', 'cnpj')
          );

          expect(result.found).toBe(true);
          expect(result.entity).toBeDefined();
          expect(result.entity!.name).toBe('Empresa Verde Sustentável Ltda');
          expect(result.entity!.documentType).toBe('cnpj');
          expect(result.scoreResult).toBeDefined();
        });
    });

    it('should return entity when searching by valid CPF', async () => {
      await provider
        .addInteraction()
        .given('a person with CPF 12345678909 exists')
        .uponReceiving('a request to search by CPF')
        .withRequest('GET', '/api/search/document', (builder) => {
          builder.query({ document: '12345678909', type: 'cpf' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: true,
            entity: {
              id: like('5'),
              name: like('João da Silva Teste'),
              document: like('12345678909'),
              documentType: like('cpf'),
              score: integer(35),
              riskLevel: like('Médio'),
              occurrences: eachLike({
                id: like('occ-16'),
                date: like('2024-02-15T00:00:00.000Z'),
                description: like('Auto de infração por pesca ilegal em área protegida'),
                status: like('Ativo'),
                source: like('IBAMA'),
                sourceUrl: like('https://ibama.gov.br/consulta/890123'),
                category: like('Ambiental IBAMA'),
              }),
            },
          });
        })
        .executeTest(async (mockServer) => {
          apiService = TestBed.inject(ApiService);
          (apiService as any).baseUrl = mockServer.url + '/api';

          const result = await firstValueFrom(
            apiService.searchByDocument('12345678909', 'cpf')
          );

          expect(result.found).toBe(true);
          expect(result.entity).toBeDefined();
          expect(result.entity!.name).toBe('João da Silva Teste');
          expect(result.entity!.documentType).toBe('cpf');
        });
    });

    it('should return not found for non-existent document', async () => {
      await provider
        .addInteraction()
        .given('no entity with CNPJ 00000000000000 exists')
        .uponReceiving('a request to search by non-existent CNPJ')
        .withRequest('GET', '/api/search/document', (builder) => {
          builder.query({ document: '00000000000000', type: 'cnpj' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: false,
          });
        })
        .executeTest(async (mockServer) => {
          apiService = TestBed.inject(ApiService);
          (apiService as any).baseUrl = mockServer.url + '/api';

          const result = await firstValueFrom(
            apiService.searchByDocument('00000000000000', 'cnpj')
          );

          expect(result.found).toBe(false);
          expect(result.entity).toBeUndefined();
        });
    });
  });

  describe('searchByName', () => {
    it('should return entity when searching by name', async () => {
      await provider
        .addInteraction()
        .given('an entity with name containing "Empresa Verde" exists')
        .uponReceiving('a request to search by name')
        .withRequest('GET', '/api/search/name', (builder) => {
          builder.query({ name: 'Empresa Verde' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: true,
            entity: {
              id: like('1'),
              name: like('Empresa Verde Sustentável Ltda'),
              document: like('11222333000181'),
              documentType: like('cnpj'),
              score: integer(15),
              riskLevel: like('Baixo'),
              occurrences: eachLike({
                id: like('occ-1'),
                date: like('2023-06-15T00:00:00.000Z'),
                description: like('Advertência por descarte irregular de resíduos'),
                status: like('Baixado'),
                source: like('IBAMA'),
                sourceUrl: like('https://ibama.gov.br/consulta/123456'),
                category: like('Ambiental IBAMA'),
              }),
            },
          });
        })
        .executeTest(async (mockServer) => {
          apiService = TestBed.inject(ApiService);
          (apiService as any).baseUrl = mockServer.url + '/api';

          const result = await firstValueFrom(
            apiService.searchByName('Empresa Verde')
          );

          expect(result.found).toBe(true);
          expect(result.entity).toBeDefined();
          expect(result.entity!.name).toContain('Verde');
        });
    });

    it('should return not found when no matching name exists', async () => {
      await provider
        .addInteraction()
        .given('no entity with name "Entidade Inexistente XYZ" exists')
        .uponReceiving('a request to search by non-existent name')
        .withRequest('GET', '/api/search/name', (builder) => {
          builder.query({ name: 'Entidade Inexistente XYZ' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: false,
          });
        })
        .executeTest(async (mockServer) => {
          apiService = TestBed.inject(ApiService);
          (apiService as any).baseUrl = mockServer.url + '/api';

          const result = await firstValueFrom(
            apiService.searchByName('Entidade Inexistente XYZ')
          );

          expect(result.found).toBe(false);
          expect(result.entity).toBeUndefined();
        });
    });
  });

  describe('entity with critical risk level', () => {
    it('should return entity with multiple occurrences and critical risk', async () => {
      await provider
        .addInteraction()
        .given('an entity with critical risk level exists')
        .uponReceiving('a request to search entity with critical risk')
        .withRequest('GET', '/api/search/document', (builder) => {
          builder.query({ document: '44555666000181', type: 'cnpj' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: true,
            entity: {
              id: like('4'),
              name: like('Mineradora Vermelha S.A.'),
              document: like('44555666000181'),
              documentType: like('cnpj'),
              score: integer(89),
              riskLevel: like('Crítico'),
              occurrences: eachLike(
                {
                  id: like('occ-8'),
                  date: like('2024-06-01T00:00:00.000Z'),
                  description: like('Embargo total de atividades por contaminação'),
                  status: like('Ativo'),
                  source: like('IBAMA'),
                  sourceUrl: like('https://ibama.gov.br/consulta/456780'),
                  category: like('Ambiental IBAMA'),
                },
                1 // Minimum of 1 occurrence
              ),
            },
          });
        })
        .executeTest(async (mockServer) => {
          apiService = TestBed.inject(ApiService);
          (apiService as any).baseUrl = mockServer.url + '/api';

          const result = await firstValueFrom(
            apiService.searchByDocument('44555666000181', 'cnpj')
          );

          expect(result.found).toBe(true);
          expect(result.entity).toBeDefined();
          expect(result.entity!.score).toBe(89);
          expect(result.scoreResult!.riskLevel).toBe('Crítico');
        });
    });
  });
});
