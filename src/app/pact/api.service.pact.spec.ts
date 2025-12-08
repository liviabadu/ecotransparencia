import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import * as path from 'path';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

const { like, eachLike, integer, decimal } = MatchersV3;

describe('ApiService Pact Tests', () => {
  let apiService: ApiService;

  // Create a new Pact instance for V2
  const provider = new PactV4({
    consumer: 'EcoTransparenciaFrontendV2',
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
    it('should return entity with ASG score when searching by valid CNPJ', async () => {
      await provider
        .addInteraction()
        .given('an entity with CNPJ 11222333000181 has embargos and autos de infracao')
        .uponReceiving('a request to search by CNPJ expecting ASG score')
        .withRequest('GET', '/api/search/document', (builder) => {
          builder.query({ document: '11222333000181', type: 'cnpj' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: true,
            entity: {
              id: like('1'),
              name: like('Empresa Verde Sustentavel Ltda'),
              document: like('11222333000181'),
              documentType: like('cnpj'),
              score: integer(45),
              riskLevel: like('Medio'),
              occurrences: eachLike({
                id: like('emb-123'),
                source: like('IBAMA'),
                category: like('Ambiental IBAMA'),
                status: like('Baixado'),
              }),
              asgScore: {
                score: integer(45),
                riskLevel: like('Medio'),
                totalOcorrencias: integer(3),
                breakdown: eachLike({
                  fonte: like('Embargos IBAMA'),
                  peso: decimal(0.5),
                  quantidadeOcorrencias: integer(2),
                  score: integer(30),
                  scorePonderado: decimal(15.0),
                }),
              },
              ocorrencias: {
                embargos: eachLike({
                  id: like('emb-123'),
                  source: like('IBAMA'),
                  category: like('Ambiental IBAMA'),
                  date: like('2024-01-15T00:00:00.000Z'),
                  description: like('Embargo por desmatamento ilegal'),
                  status: like('Baixado'),
                }),
                autosInfracao: eachLike({
                  id: like('auto-456'),
                  source: like('IBAMA'),
                  data: like('2024-02-20T10:30:00.000Z'),
                  descricao: like('Auto de infracao'),
                  numeroAuto: like('ABCD1234'),
                  tipoInfracao: like('Fauna'),
                  valorMulta: decimal(25000.0),
                }),
              },
            },
          });
        })
        .executeTest(async (mockServer) => {
          apiService = TestBed.inject(ApiService);
          (apiService as any).baseUrl = mockServer.url + '/api';

          const result = await firstValueFrom(
            apiService.searchByDocument('11222333000181', 'cnpj')
          );

          expect(result.found).toBe(true);
          expect(result.entity).toBeDefined();
          expect(result.entity!.name).toBe('Empresa Verde Sustentavel Ltda');
          expect(result.entity!.documentType).toBe('cnpj');
          expect(result.entity!.asgScore).toBeDefined();
          expect(result.entity!.asgScore!.score).toBe(45);
          expect(result.entity!.asgScore!.breakdown.length).toBeGreaterThan(0);
          expect(result.entity!.ocorrencias).toBeDefined();
          expect(result.entity!.ocorrencias!.embargos.length).toBeGreaterThan(0);
          expect(result.entity!.ocorrencias!.autosInfracao.length).toBeGreaterThan(0);
        });
    });

    it('should return entity with ASG score when searching by valid CPF', async () => {
      await provider
        .addInteraction()
        .given('a person with CPF 12345678909 has embargos and autos de infracao')
        .uponReceiving('a request to search by CPF expecting ASG score')
        .withRequest('GET', '/api/search/document', (builder) => {
          builder.query({ document: '12345678909', type: 'cpf' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: true,
            entity: {
              id: like('5'),
              name: like('Joao da Silva Teste'),
              document: like('12345678909'),
              documentType: like('cpf'),
              score: integer(28),
              riskLevel: like('Medio'),
              occurrences: eachLike({
                id: like('emb-5'),
                source: like('IBAMA'),
              }),
              asgScore: {
                score: integer(28),
                riskLevel: like('Medio'),
                totalOcorrencias: integer(2),
                breakdown: eachLike({
                  fonte: like('Embargos IBAMA'),
                  peso: decimal(0.5),
                  quantidadeOcorrencias: integer(1),
                  score: integer(20),
                  scorePonderado: decimal(10.0),
                }),
              },
              ocorrencias: {
                embargos: eachLike({
                  id: like('emb-5'),
                  source: like('IBAMA'),
                }),
                autosInfracao: eachLike({
                  id: like('auto-5'),
                  source: like('IBAMA'),
                }),
              },
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
          expect(result.entity!.name).toBe('Joao da Silva Teste');
          expect(result.entity!.documentType).toBe('cpf');
          expect(result.entity!.asgScore).toBeDefined();
          expect(result.entity!.asgScore!.totalOcorrencias).toBe(2);
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
    it('should return entity with ASG score when searching by name', async () => {
      await provider
        .addInteraction()
        .given('an entity with name containing "Empresa Verde" has multiple occurrences')
        .uponReceiving('a request to search by name expecting ASG score')
        .withRequest('GET', '/api/search/name', (builder) => {
          builder.query({ name: 'Empresa Verde' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: true,
            entity: {
              id: like('1'),
              name: like('Empresa Verde Sustentavel Ltda'),
              document: like('11222333000181'),
              documentType: like('cnpj'),
              score: integer(45),
              riskLevel: like('Medio'),
              occurrences: eachLike({
                id: like('emb-1'),
                source: like('IBAMA'),
              }),
              asgScore: {
                score: integer(45),
                riskLevel: like('Medio'),
                totalOcorrencias: integer(3),
                breakdown: eachLike({
                  fonte: like('Embargos IBAMA'),
                  peso: decimal(0.5),
                  quantidadeOcorrencias: integer(2),
                  score: integer(30),
                  scorePonderado: decimal(15.0),
                }),
              },
              ocorrencias: {
                embargos: eachLike({
                  id: like('emb-1'),
                  source: like('IBAMA'),
                }),
                autosInfracao: eachLike({
                  id: like('auto-1'),
                  source: like('IBAMA'),
                }),
              },
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
          expect(result.entity!.asgScore).toBeDefined();
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
    it('should return entity with critical ASG score and multiple breakdowns', async () => {
      await provider
        .addInteraction()
        .given('an entity with critical risk has many embargos and autos de infracao')
        .uponReceiving('a request to search entity with critical ASG risk')
        .withRequest('GET', '/api/search/document', (builder) => {
          builder.query({ document: '44555666000181', type: 'cnpj' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            found: true,
            entity: {
              id: like('8'),
              name: like('Mineradora Vermelha S.A.'),
              document: like('44555666000181'),
              documentType: like('cnpj'),
              score: integer(92),
              riskLevel: like('Critico'),
              occurrences: eachLike({
                id: like('emb-critical'),
                source: like('IBAMA'),
              }),
              asgScore: {
                score: integer(92),
                riskLevel: like('Critico'),
                totalOcorrencias: integer(8),
                breakdown: eachLike(
                  {
                    fonte: like('Embargos IBAMA'),
                    peso: decimal(0.5),
                    quantidadeOcorrencias: integer(4),
                    score: integer(100),
                    scorePonderado: decimal(50.0),
                  },
                  2
                ),
              },
              ocorrencias: {
                embargos: eachLike({
                  id: like('emb-critical'),
                  source: like('IBAMA'),
                  category: like('Ambiental IBAMA'),
                }),
                autosInfracao: eachLike({
                  id: like('auto-critical'),
                  source: like('IBAMA'),
                  tipoInfracao: like('Flora'),
                }),
              },
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
          expect(result.entity!.score).toBe(92);
          expect(result.entity!.asgScore).toBeDefined();
          expect(result.entity!.asgScore!.riskLevel).toBe('Critico');
          expect(result.entity!.asgScore!.breakdown.length).toBeGreaterThanOrEqual(2);
        });
    });
  });
});
