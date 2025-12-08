import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Search } from './search';
import { DocumentValidationService } from '../../services/document-validation.service';
import { ScoreService } from '../../services/score.service';

// Mock data matching Pact contracts
const mockEntities: Record<string, any> = {
  '11222333000181': {
    found: true,
    entity: {
      id: '1',
      name: 'Empresa Verde Sustentável Ltda',
      document: '11222333000181',
      documentType: 'cnpj',
      score: 15,
      riskLevel: 'Baixo',
      occurrences: [
        {
          id: 'occ-1',
          date: '2023-06-15T00:00:00.000Z',
          description: 'Advertência por descarte irregular de resíduos - situação regularizada',
          status: 'Baixado',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/123456',
          category: 'Ambiental IBAMA',
        },
      ],
    },
  },
  '22333444000181': {
    found: true,
    entity: {
      id: '2',
      name: 'Indústria Amarela S.A.',
      document: '22333444000181',
      documentType: 'cnpj',
      score: 42,
      riskLevel: 'Médio',
      occurrences: [
        {
          id: 'occ-2',
          date: '2024-03-20T00:00:00.000Z',
          description: 'Auto de infração por emissão de poluentes acima do permitido',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/234567',
          category: 'Ambiental IBAMA',
        },
      ],
    },
  },
  '33444555000181': {
    found: true,
    entity: {
      id: '3',
      name: 'Construtora Laranja Ltda',
      document: '33444555000181',
      documentType: 'cnpj',
      score: 68,
      riskLevel: 'Alto',
      occurrences: [
        {
          id: 'occ-4',
          date: '2024-05-12T00:00:00.000Z',
          description: 'Embargo de obra por desmatamento ilegal em área de preservação',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/345678',
          category: 'Ambiental IBAMA',
        },
      ],
    },
  },
  '44555666000181': {
    found: true,
    entity: {
      id: '4',
      name: 'Mineradora Vermelha S.A.',
      document: '44555666000181',
      documentType: 'cnpj',
      score: 89,
      riskLevel: 'Crítico',
      occurrences: [
        {
          id: 'occ-8',
          date: '2024-06-01T00:00:00.000Z',
          description: 'Embargo total de atividades por contaminação de lençol freático',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/456780',
          category: 'Ambiental IBAMA',
        },
        {
          id: 'occ-9',
          date: '2024-05-20T00:00:00.000Z',
          description: 'Auto de infração por mineração em área de unidade de conservação',
          status: 'Ativo',
          source: 'ICMBio',
          sourceUrl: 'https://icmbio.gov.br/consulta/567891',
          category: 'Ambiental ICMBio',
        },
        {
          id: 'occ-12',
          date: '2024-01-20T00:00:00.000Z',
          description: 'Autuação por trabalho em condições degradantes',
          status: 'Ativo',
          source: 'MTE',
          sourceUrl: 'https://mte.gov.br/consulta/678901',
          category: 'Trabalhista',
        },
      ],
    },
  },
  '12345678909': {
    found: true,
    entity: {
      id: '5',
      name: 'João da Silva Teste',
      document: '12345678909',
      documentType: 'cpf',
      score: 35,
      riskLevel: 'Médio',
      occurrences: [
        {
          id: 'occ-16',
          date: '2024-02-15T00:00:00.000Z',
          description: 'Auto de infração por pesca ilegal em área protegida',
          status: 'Ativo',
          source: 'IBAMA',
          sourceUrl: 'https://ibama.gov.br/consulta/890123',
          category: 'Ambiental IBAMA',
        },
      ],
    },
  },
};

const mockNameSearch: Record<string, any> = {
  'Mineradora Vermelha': mockEntities['44555666000181'],
  'Empresa Verde': mockEntities['11222333000181'],
};

describe('Search', () => {
  let component: Search;
  let fixture: any;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Search, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // CA01 - Campo de Busca Visível
  describe('CA01 - Search field visibility', () => {
    it('should have a visible search input field', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const searchInput = compiled.querySelector('input[type="text"]');
      expect(searchInput).toBeTruthy();
    });

    it('should have a search button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const searchButton = compiled.querySelector('button[type="submit"]');
      expect(searchButton).toBeTruthy();
    });

    it('should have placeholder text for CNPJ in search input', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const searchInput = compiled.querySelector('input[type="text"]') as HTMLInputElement;
      expect(searchInput.placeholder).toContain('CNPJ');
    });
  });

  // CA05 - Mensagem de Erro para Documento Inválido
  describe('CA05 - Invalid document error', () => {
    it('should show error for invalid CNPJ', async () => {
      component.searchTerm.set('12.345.678/0001-00');
      await component.onSearch();
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('CNPJ inválido. Verifique os dígitos informados.');
    });

    it('should show error for incomplete CNPJ', async () => {
      component.searchTerm.set('12.345.678/0001');
      await component.onSearch();
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Informe um CNPJ válido (14 dígitos)');
    });
  });

  // CT17 - Campo de busca vazio
  describe('CT17 - Empty search field', () => {
    it('should show error for empty search', async () => {
      component.searchTerm.set('');
      await component.onSearch();
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Informe o CNPJ para realizar a busca');
    });

    it('should show error for whitespace only search', async () => {
      component.searchTerm.set('   ');
      await component.onSearch();
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Informe o CNPJ para realizar a busca');
    });
  });

  // CA07 - Exibição do Score de Risco
  describe('CA07 - Score display', () => {
    it('should display score after successful search', async () => {
      component.searchTerm.set('11.222.333/0001-81');
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document') && request.params.get('document') === '11222333000181'
      );
      req.flush(mockEntities['11222333000181']);

      await searchPromise;
      fixture.detectChanges();

      expect(component.searchResult()).toBeTruthy();
      expect(component.searchResult()?.scoreResult?.score).toBe(15);
    });

    it('should display risk level indicator', async () => {
      component.searchTerm.set('11.222.333/0001-81');
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush(mockEntities['11222333000181']);

      await searchPromise;
      fixture.detectChanges();

      expect(component.searchResult()?.scoreResult?.riskLevel).toBe('Baixo');
    });
  });

  // CA12 - Mensagem para Nenhum Resultado
  describe('CA12 - No results message', () => {
    it('should show message when no results found', async () => {
      component.searchTerm.set('99.999.999/0001-91');
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush({ found: false });

      await searchPromise;
      fixture.detectChanges();

      expect(component.noResultsFound()).toBe(true);
    });
  });

  // CA13 - Feedback Visual Durante Processamento
  describe('CA13 - Loading indicator', () => {
    it('should set loading to true when search starts', async () => {
      component.searchTerm.set('11.222.333/0001-81');

      // Start search but don't await yet
      const searchPromise = component.onSearch();

      // Check loading state immediately after call
      expect(component.isLoading()).toBe(true);

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush(mockEntities['11222333000181']);

      // Wait for completion
      await searchPromise;
      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
    });
  });

  // CT09-CT12 - Score risk level colors
  describe('Risk level colors', () => {
    it('should return correct color for each risk level', () => {
      const scoreService = TestBed.inject(ScoreService);

      expect(scoreService.getRiskColor('Baixo')).toBe('green');
      expect(scoreService.getRiskColor('Médio')).toBe('yellow');
      expect(scoreService.getRiskColor('Alto')).toBe('orange');
      expect(scoreService.getRiskColor('Crítico')).toBe('red');
    });
  });

  // Integration tests for different entities (CNPJ only)
  describe('Search integration tests', () => {
    it('should find Empresa Verde by CNPJ', async () => {
      component.searchTerm.set('11.222.333/0001-81');
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush(mockEntities['11222333000181']);

      await searchPromise;
      fixture.detectChanges();

      expect(component.searchResult()?.found).toBe(true);
      expect(component.searchResult()?.entity?.name).toBe('Empresa Verde Sustentável Ltda');
      expect(component.searchResult()?.scoreResult?.riskLevel).toBe('Baixo');
    });

    it('should find Indústria Amarela with Médio risk', async () => {
      component.searchTerm.set('22.333.444/0001-81');
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush(mockEntities['22333444000181']);

      await searchPromise;
      fixture.detectChanges();

      expect(component.searchResult()?.found).toBe(true);
      expect(component.searchResult()?.scoreResult?.riskLevel).toBe('Médio');
    });

    it('should find Construtora Laranja with Alto risk', async () => {
      component.searchTerm.set('33.444.555/0001-81');
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush(mockEntities['33444555000181']);

      await searchPromise;
      fixture.detectChanges();

      expect(component.searchResult()?.found).toBe(true);
      expect(component.searchResult()?.scoreResult?.riskLevel).toBe('Alto');
    });

    it('should find Mineradora Vermelha with Crítico risk', async () => {
      component.searchTerm.set('44.555.666/0001-81');
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush(mockEntities['44555666000181']);

      await searchPromise;
      fixture.detectChanges();

      expect(component.searchResult()?.found).toBe(true);
      expect(component.searchResult()?.scoreResult?.riskLevel).toBe('Crítico');
    });
  });

  // Reset functionality
  describe('Reset functionality', () => {
    it('should clear results when clearSearch is called', async () => {
      component.searchTerm.set('11.222.333/0001-81');
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush(mockEntities['11222333000181']);

      await searchPromise;
      fixture.detectChanges();

      expect(component.searchResult()).toBeTruthy();

      component.clearSearch();
      fixture.detectChanges();

      expect(component.searchResult()).toBeNull();
      expect(component.searchTerm()).toBe('');
    });
  });

  // CA08 - Category grouping
  describe('CA08 - Category grouping', () => {
    it('should group occurrences by category', async () => {
      component.searchTerm.set('44.555.666/0001-81'); // Mineradora Vermelha
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush(mockEntities['44555666000181']);

      await searchPromise;
      fixture.detectChanges();

      const result = component.searchResult();
      expect(result?.scoreResult?.categorySummaries).toBeDefined();
      expect(result?.scoreResult?.categorySummaries?.length).toBeGreaterThan(0);
    });
  });

  // CA10 - Occurrence details
  describe('CA10 - Occurrence details', () => {
    it('should have complete occurrence data', async () => {
      component.searchTerm.set('44.555.666/0001-81');
      const searchPromise = component.onSearch();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/search/document')
      );
      req.flush(mockEntities['44555666000181']);

      await searchPromise;
      fixture.detectChanges();

      const result = component.searchResult();
      const category = result?.scoreResult?.categorySummaries?.[0];
      const occurrence = category?.occurrences?.[0];

      expect(occurrence?.date).toBeDefined();
      expect(occurrence?.description).toBeDefined();
      expect(occurrence?.status).toBeDefined();
      expect(occurrence?.source).toBeDefined();
      expect(occurrence?.sourceUrl).toBeDefined();
    });
  });

  // Input masking for CNPJ
  describe('Input masking', () => {
    describe('CNPJ mask', () => {
      it('should apply CNPJ mask when entering 14 digits', () => {
        component.onInputChange('12345678000195');
        expect(component.searchTerm()).toBe('12.345.678/0001-95');
      });

      it('should apply partial CNPJ mask for partial input', () => {
        component.onInputChange('1234');
        expect(component.searchTerm()).toBe('12.34');
      });

      it('should apply partial CNPJ mask for 8 digits', () => {
        component.onInputChange('12345678');
        expect(component.searchTerm()).toBe('12.345.678');
      });

      it('should apply partial CNPJ mask for 12 digits', () => {
        component.onInputChange('123456780001');
        expect(component.searchTerm()).toBe('12.345.678/0001');
      });

      it('should apply partial CNPJ mask for 13 digits', () => {
        component.onInputChange('1234567800019');
        expect(component.searchTerm()).toBe('12.345.678/0001-9');
      });

      it('should maintain mask when input already has CNPJ mask', () => {
        component.onInputChange('12.345.678/0001-95');
        expect(component.searchTerm()).toBe('12.345.678/0001-95');
      });
    });

    describe('Non-numeric input', () => {
      it('should not apply mask to text input', () => {
        component.onInputChange('Empresa Teste');
        expect(component.searchTerm()).toBe('Empresa Teste');
      });

      it('should not apply mask to mixed alphanumeric input', () => {
        component.onInputChange('Empresa123');
        expect(component.searchTerm()).toBe('Empresa123');
      });

      it('should handle empty input', () => {
        component.onInputChange('');
        expect(component.searchTerm()).toBe('');
      });
    });

    describe('Integration with search input', () => {
      it('should update input value with CNPJ mask via template', async () => {
        // Simulate user typing digits
        component.onInputChange('11222333000181');
        fixture.detectChanges();

        // The value binding should show the masked value
        expect(component.searchTerm()).toBe('11.222.333/0001-81');
      });

      it('should validate masked CNPJ correctly on search', async () => {
        component.onInputChange('11222333000181');
        fixture.detectChanges();

        const searchPromise = component.onSearch();

        const req = httpMock.expectOne((request) =>
          request.url.includes('/api/search/document')
        );
        req.flush(mockEntities['11222333000181']);

        await searchPromise;
        fixture.detectChanges();

        expect(component.searchResult()?.found).toBe(true);
        expect(component.searchResult()?.entity?.name).toBe('Empresa Verde Sustentável Ltda');
      });

      it('should show error for invalid masked CNPJ on search', async () => {
        component.onInputChange('12345678000100');
        fixture.detectChanges();

        await component.onSearch();
        fixture.detectChanges();

        expect(component.errorMessage()).toBe('CNPJ inválido. Verifique os dígitos informados.');
      });
    });
  });
});
