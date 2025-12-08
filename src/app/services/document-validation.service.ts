import { Injectable } from '@angular/core';

export type DocumentType = 'cpf' | 'cnpj' | 'name';

export interface ValidationResult {
  isValid: boolean;
  type: DocumentType;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentValidationService {
  /**
   * Detects the type of document based on input format
   * CA06 - Automatic document type identification
   */
  detectDocumentType(input: string): DocumentType {
    const stripped = this.stripMask(input);

    // Check for CPF pattern (11 digits or masked format)
    const cpfMaskPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (cpfMaskPattern.test(input) || (stripped.length === 11 && /^\d+$/.test(stripped))) {
      return 'cpf';
    }

    // Check for CNPJ pattern (14 digits or masked format)
    const cnpjMaskPattern = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (cnpjMaskPattern.test(input) || (stripped.length === 14 && /^\d+$/.test(stripped))) {
      return 'cnpj';
    }

    return 'name';
  }

  /**
   * Validates CPF with check digit verification
   * CA03 - CPF format validation
   */
  validateCPF(cpf: string): boolean {
    const stripped = this.stripMask(cpf);

    if (stripped.length !== 11 || !/^\d+$/.test(stripped)) {
      return false;
    }

    // Check for all same digits (invalid CPFs like 111.111.111-11)
    if (/^(\d)\1{10}$/.test(stripped)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(stripped[i], 10) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(stripped[9], 10)) {
      return false;
    }

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(stripped[i], 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(stripped[10], 10)) {
      return false;
    }

    return true;
  }

  /**
   * Validates CNPJ with check digit verification
   * CA04 - CNPJ format validation
   */
  validateCNPJ(cnpj: string): boolean {
    const stripped = this.stripMask(cnpj);

    if (stripped.length !== 14 || !/^\d+$/.test(stripped)) {
      return false;
    }

    // Check for all same digits (invalid CNPJs like 11.111.111/1111-11)
    if (/^(\d)\1{13}$/.test(stripped)) {
      return false;
    }

    // Validate first check digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(stripped[i], 10) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(stripped[12], 10)) {
      return false;
    }

    // Validate second check digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(stripped[i], 10) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(stripped[13], 10)) {
      return false;
    }

    return true;
  }

  /**
   * Validates name with minimum character requirement
   * CA02 - Name validation with minimum 3 characters
   */
  validateName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length >= 3;
  }

  /**
   * General validation method that detects type and validates accordingly
   * Returns validation result with error messages matching acceptance criteria
   */
  validate(input: string): ValidationResult {
    const trimmed = input.trim();

    // Check for empty input - CT17
    if (trimmed.length === 0) {
      return {
        isValid: false,
        type: 'name',
        errorMessage: 'Informe um nome, CPF ou CNPJ para realizar a busca',
      };
    }

    const type = this.detectDocumentType(trimmed);

    switch (type) {
      case 'cpf':
        if (this.validateCPF(trimmed)) {
          return { isValid: true, type: 'cpf' };
        }
        // CA05 - Error message for invalid document
        return {
          isValid: false,
          type: 'cpf',
          errorMessage: 'CPF inválido. Verifique os dígitos informados.',
        };

      case 'cnpj':
        if (this.validateCNPJ(trimmed)) {
          return { isValid: true, type: 'cnpj' };
        }
        // CA05 - Error message for invalid document
        return {
          isValid: false,
          type: 'cnpj',
          errorMessage: 'CNPJ inválido. Verifique os dígitos informados.',
        };

      case 'name':
      default:
        if (this.validateName(trimmed)) {
          return { isValid: true, type: 'name' };
        }
        // CA02 - Error message for name with less than 3 characters
        return {
          isValid: false,
          type: 'name',
          errorMessage: 'Informe pelo menos 3 caracteres para realizar a busca',
        };
    }
  }

  /**
   * Validates input as CNPJ only
   * Returns validation result with error messages for CNPJ-only search
   */
  validateCnpjOnly(input: string): ValidationResult {
    const trimmed = input.trim();

    // Check for empty input
    if (trimmed.length === 0) {
      return {
        isValid: false,
        type: 'cnpj',
        errorMessage: 'Informe o CNPJ para realizar a busca',
      };
    }

    // Check if it looks like a CNPJ (14 digits or formatted)
    const stripped = this.stripMask(trimmed);
    if (stripped.length !== 14 || !/^\d+$/.test(stripped)) {
      return {
        isValid: false,
        type: 'cnpj',
        errorMessage: 'Informe um CNPJ válido (14 dígitos)',
      };
    }

    // Validate CNPJ check digits
    if (this.validateCNPJ(trimmed)) {
      return { isValid: true, type: 'cnpj' };
    }

    return {
      isValid: false,
      type: 'cnpj',
      errorMessage: 'CNPJ inválido. Verifique os dígitos informados.',
    };
  }

  /**
   * Removes mask characters from CPF/CNPJ
   */
  stripMask(input: string): string {
    return input.replace(/[.\-/]/g, '');
  }

  /**
   * Checks if the input contains only numeric characters (with or without mask)
   * Used to determine if mask should be applied
   */
  isNumericInput(input: string): boolean {
    if (!input || input.length === 0) {
      return false;
    }
    const stripped = this.stripMask(input);
    return stripped.length > 0 && /^\d+$/.test(stripped);
  }

  /**
   * Applies CPF or CNPJ mask based on the number of digits
   * CPF: XXX.XXX.XXX-XX (11 digits)
   * CNPJ: XX.XXX.XXX/XXXX-XX (14 digits)
   */
  applyMask(input: string): string {
    if (!input) {
      return '';
    }

    // Extract only digits
    const digits = input.replace(/\D/g, '');

    if (digits.length === 0) {
      return '';
    }

    // Determine if it's CPF (up to 11 digits) or CNPJ (12-14 digits)
    if (digits.length <= 11) {
      return this.applyCPFMask(digits);
    } else {
      return this.applyCNPJMask(digits);
    }
  }

  /**
   * Applies CPF mask: XXX.XXX.XXX-XX
   */
  private applyCPFMask(digits: string): string {
    const d = digits.substring(0, 11); // Limit to 11 digits
    let result = '';

    for (let i = 0; i < d.length; i++) {
      if (i === 3 || i === 6) {
        result += '.';
      } else if (i === 9) {
        result += '-';
      }
      result += d[i];
    }

    return result;
  }

  /**
   * Applies CNPJ mask: XX.XXX.XXX/XXXX-XX
   * Public method for CNPJ-only masking
   */
  applyCNPJMask(input: string): string {
    if (!input) {
      return '';
    }

    // Extract only digits
    const digits = input.replace(/\D/g, '').substring(0, 14); // Limit to 14 digits

    if (digits.length === 0) {
      return '';
    }

    let result = '';

    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 5) {
        result += '.';
      } else if (i === 8) {
        result += '/';
      } else if (i === 12) {
        result += '-';
      }
      result += digits[i];
    }

    return result;
  }
}
