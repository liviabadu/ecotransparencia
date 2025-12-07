import { TestBed } from '@angular/core/testing';
import { DocumentValidationService } from './document-validation.service';

describe('DocumentValidationService', () => {
  let service: DocumentValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('detectDocumentType', () => {
    it('should detect CPF with mask (XXX.XXX.XXX-XX)', () => {
      expect(service.detectDocumentType('123.456.789-09')).toBe('cpf');
    });

    it('should detect CPF without mask (11 digits)', () => {
      expect(service.detectDocumentType('12345678909')).toBe('cpf');
    });

    it('should detect CNPJ with mask (XX.XXX.XXX/XXXX-XX)', () => {
      expect(service.detectDocumentType('12.345.678/0001-95')).toBe('cnpj');
    });

    it('should detect CNPJ without mask (14 digits)', () => {
      expect(service.detectDocumentType('12345678000195')).toBe('cnpj');
    });

    it('should detect name when input is not CPF or CNPJ', () => {
      expect(service.detectDocumentType('Empresa Teste Ltda')).toBe('name');
    });

    it('should detect name for alphanumeric strings', () => {
      expect(service.detectDocumentType('João Silva 123')).toBe('name');
    });

    it('should detect name for strings with less than 11 digits', () => {
      expect(service.detectDocumentType('1234567890')).toBe('name');
    });

    it('should detect name for strings with more than 14 digits', () => {
      expect(service.detectDocumentType('123456789012345')).toBe('name');
    });
  });

  describe('validateCPF', () => {
    it('should return true for valid CPF with mask', () => {
      expect(service.validateCPF('123.456.789-09')).toBe(true);
    });

    it('should return true for valid CPF without mask', () => {
      expect(service.validateCPF('12345678909')).toBe(true);
    });

    it('should return false for CPF with invalid check digits', () => {
      expect(service.validateCPF('123.456.789-00')).toBe(false);
    });

    it('should return false for CPF with all same digits', () => {
      expect(service.validateCPF('111.111.111-11')).toBe(false);
    });

    it('should return false for CPF with wrong length', () => {
      expect(service.validateCPF('1234567890')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.validateCPF('')).toBe(false);
    });

    it('should return true for another valid CPF', () => {
      // CPF: 529.982.247-25 is valid
      expect(service.validateCPF('529.982.247-25')).toBe(true);
    });

    it('should return true for CPF from test data (João da Silva)', () => {
      expect(service.validateCPF('123.456.789-09')).toBe(true);
    });
  });

  describe('validateCNPJ', () => {
    it('should return true for valid CNPJ with mask', () => {
      expect(service.validateCNPJ('12.345.678/0001-95')).toBe(true);
    });

    it('should return true for valid CNPJ without mask', () => {
      expect(service.validateCNPJ('12345678000195')).toBe(true);
    });

    it('should return false for CNPJ with invalid check digits', () => {
      expect(service.validateCNPJ('12.345.678/0001-00')).toBe(false);
    });

    it('should return false for CNPJ with all same digits', () => {
      expect(service.validateCNPJ('11.111.111/1111-11')).toBe(false);
    });

    it('should return false for CNPJ with wrong length', () => {
      expect(service.validateCNPJ('1234567800019')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.validateCNPJ('')).toBe(false);
    });

    it('should return true for CNPJ from test data (Empresa Verde Sustentável)', () => {
      expect(service.validateCNPJ('11.222.333/0001-81')).toBe(true);
    });

    it('should return true for CNPJ from test data (Indústria Amarela)', () => {
      expect(service.validateCNPJ('22.333.444/0001-81')).toBe(true);
    });

    it('should return true for CNPJ from test data (Construtora Laranja)', () => {
      expect(service.validateCNPJ('33.444.555/0001-81')).toBe(true);
    });

    it('should return true for CNPJ from test data (Mineradora Vermelha)', () => {
      expect(service.validateCNPJ('44.555.666/0001-81')).toBe(true);
    });
  });

  describe('validateName', () => {
    it('should return true for name with 3 or more characters', () => {
      expect(service.validateName('ABC')).toBe(true);
    });

    it('should return true for name with many characters', () => {
      expect(service.validateName('Empresa Teste Ltda')).toBe(true);
    });

    it('should return false for name with less than 3 characters', () => {
      expect(service.validateName('AB')).toBe(false);
    });

    it('should return false for name with 1 character', () => {
      expect(service.validateName('A')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.validateName('')).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(service.validateName('  AB  ')).toBe(false);
    });

    it('should return true for trimmed name with 3+ characters', () => {
      expect(service.validateName('  ABC  ')).toBe(true);
    });
  });

  describe('validate (general validation)', () => {
    it('should validate CPF correctly', () => {
      const result = service.validate('123.456.789-09');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('cpf');
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return error for invalid CPF', () => {
      const result = service.validate('123.456.789-00');
      expect(result.isValid).toBe(false);
      expect(result.type).toBe('cpf');
      expect(result.errorMessage).toBe('CPF inválido. Verifique os dígitos informados.');
    });

    it('should validate CNPJ correctly', () => {
      const result = service.validate('12.345.678/0001-95');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('cnpj');
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return error for invalid CNPJ', () => {
      const result = service.validate('12.345.678/0001-00');
      expect(result.isValid).toBe(false);
      expect(result.type).toBe('cnpj');
      expect(result.errorMessage).toBe('CNPJ inválido. Verifique os dígitos informados.');
    });

    it('should validate name correctly', () => {
      const result = service.validate('Empresa Teste');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('name');
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return error for name with less than 3 characters', () => {
      const result = service.validate('AB');
      expect(result.isValid).toBe(false);
      expect(result.type).toBe('name');
      expect(result.errorMessage).toBe('Informe pelo menos 3 caracteres para realizar a busca');
    });

    it('should return error for empty input', () => {
      const result = service.validate('');
      expect(result.isValid).toBe(false);
      expect(result.type).toBe('name');
      expect(result.errorMessage).toBe('Informe um nome, CPF ou CNPJ para realizar a busca');
    });

    it('should return error for whitespace only input', () => {
      const result = service.validate('   ');
      expect(result.isValid).toBe(false);
      expect(result.type).toBe('name');
      expect(result.errorMessage).toBe('Informe um nome, CPF ou CNPJ para realizar a busca');
    });
  });

  describe('stripMask', () => {
    it('should remove CPF mask', () => {
      expect(service.stripMask('123.456.789-09')).toBe('12345678909');
    });

    it('should remove CNPJ mask', () => {
      expect(service.stripMask('12.345.678/0001-95')).toBe('12345678000195');
    });

    it('should return same string if no mask', () => {
      expect(service.stripMask('12345678909')).toBe('12345678909');
    });
  });

  describe('applyMask', () => {
    describe('CPF mask (XXX.XXX.XXX-XX)', () => {
      it('should apply CPF mask to 11 digits', () => {
        expect(service.applyMask('12345678909')).toBe('123.456.789-09');
      });

      it('should apply partial CPF mask for 3 digits', () => {
        expect(service.applyMask('123')).toBe('123');
      });

      it('should apply partial CPF mask for 4 digits', () => {
        expect(service.applyMask('1234')).toBe('123.4');
      });

      it('should apply partial CPF mask for 6 digits', () => {
        expect(service.applyMask('123456')).toBe('123.456');
      });

      it('should apply partial CPF mask for 7 digits', () => {
        expect(service.applyMask('1234567')).toBe('123.456.7');
      });

      it('should apply partial CPF mask for 9 digits', () => {
        expect(service.applyMask('123456789')).toBe('123.456.789');
      });

      it('should apply partial CPF mask for 10 digits', () => {
        expect(service.applyMask('1234567890')).toBe('123.456.789-0');
      });

      it('should not allow more than 11 digits for CPF', () => {
        expect(service.applyMask('123456789012')).toBe('12.345.678/9012');
      });
    });

    describe('CNPJ mask (XX.XXX.XXX/XXXX-XX)', () => {
      it('should apply CNPJ mask to 14 digits', () => {
        expect(service.applyMask('12345678000195')).toBe('12.345.678/0001-95');
      });

      it('should apply partial CNPJ mask for 12 digits', () => {
        expect(service.applyMask('123456780001')).toBe('12.345.678/0001');
      });

      it('should apply partial CNPJ mask for 13 digits', () => {
        expect(service.applyMask('1234567800019')).toBe('12.345.678/0001-9');
      });

      it('should not allow more than 14 digits', () => {
        expect(service.applyMask('123456789012345')).toBe('12.345.678/9012-34');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for empty input', () => {
        expect(service.applyMask('')).toBe('');
      });

      it('should strip non-numeric characters and apply mask', () => {
        expect(service.applyMask('123.456')).toBe('123.456');
      });

      it('should handle input with existing mask and reapply correctly', () => {
        expect(service.applyMask('123.456.789-09')).toBe('123.456.789-09');
      });

      it('should return only digits for 1-2 digits', () => {
        expect(service.applyMask('12')).toBe('12');
      });

      it('should return only digits for 1 digit', () => {
        expect(service.applyMask('1')).toBe('1');
      });
    });
  });

  describe('isNumericInput', () => {
    it('should return true for digits only', () => {
      expect(service.isNumericInput('12345678909')).toBe(true);
    });

    it('should return true for CPF with mask', () => {
      expect(service.isNumericInput('123.456.789-09')).toBe(true);
    });

    it('should return true for CNPJ with mask', () => {
      expect(service.isNumericInput('12.345.678/0001-95')).toBe(true);
    });

    it('should return false for text input', () => {
      expect(service.isNumericInput('Empresa Teste')).toBe(false);
    });

    it('should return false for mixed input', () => {
      expect(service.isNumericInput('123ABC')).toBe(false);
    });

    it('should return false for empty input', () => {
      expect(service.isNumericInput('')).toBe(false);
    });
  });
});
