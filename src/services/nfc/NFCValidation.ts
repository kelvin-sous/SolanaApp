// ========================================
// src/services/nfc/NFCValidation.ts
// Validação básica de dados para operações NFC
// ========================================

import { PublicKey } from '@solana/web3.js';
import { NFC_CONFIG } from '../../constants/config';
import { NFCTransactionData } from '../../types/nfc';

// ========================================
// INTERFACES DE VALIDAÇÃO
// ========================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SecurityCheck {
  checkName: string;
  passed: boolean;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
}

export class NFCValidation {
  private readonly SUSPICIOUS_AMOUNT_THRESHOLD = 1000; // $1000 USD
  private readonly MAX_TRANSACTION_AGE = NFC_CONFIG.VALIDATION.MAX_TRANSACTION_AGE;
  private readonly REQUIRED_FIELDS = NFC_CONFIG.VALIDATION.REQUIRED_FIELDS;

  /**
   * Valida dados completos da transação NFC
   */
  validateTransactionData(data: NFCTransactionData): ValidationResult {
    console.log('🔍 Iniciando validação dos dados NFC...');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const securityChecks: SecurityCheck[] = [];

    try {
      // 1. Validação estrutural
      const structuralResult = this.validateStructure(data);
      errors.push(...structuralResult.errors);
      warnings.push(...structuralResult.warnings);

      // 2. Validação de valores
      const amountResult = this.validateAmounts(data);
      errors.push(...amountResult.errors);
      warnings.push(...amountResult.warnings);

      // 3. Validação de endereços
      const addressResult = this.validateAddresses(data);
      errors.push(...addressResult.errors);
      warnings.push(...addressResult.warnings);

      // 4. Validação temporal
      const timeResult = this.validateTimestamp(data);
      errors.push(...timeResult.errors);
      warnings.push(...timeResult.warnings);

      // 5. Validação de segurança
      const securityResult = this.performSecurityChecks(data);
      securityChecks.push(...securityResult);
      
      // Adicionar erros críticos de segurança
      securityChecks
        .filter(check => check.severity === 'ERROR')
        .forEach(check => errors.push(check.message));

      // Adicionar avisos de segurança
      securityChecks
        .filter(check => check.severity === 'WARNING')
        .forEach(check => warnings.push(check.message));

      // 6. Determinar nível de segurança
      const securityLevel = this.calculateSecurityLevel(securityChecks, errors.length, warnings.length);

      const isValid = errors.length === 0;

      console.log('✅ Validação concluída:', {
        isValid,
        errors: errors.length,
        warnings: warnings.length,
        securityLevel
      });

      return {
        isValid,
        errors,
        warnings,
        securityLevel
      };

    } catch (error) {
      console.error('❌ Erro durante validação:', error);
      return {
        isValid: false,
        errors: [`Erro interno de validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
        warnings: [],
        securityLevel: 'LOW'
      };
    }
  }

  /**
   * Valida estrutura dos dados
   */
  private validateStructure(data: any): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar campos obrigatórios
    for (const field of this.REQUIRED_FIELDS) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push(`Campo obrigatório ausente: ${field}`);
      }
    }

    // Verificar tipos
    const typeChecks = [
      { field: 'amount', type: 'number', value: data.amount },
      { field: 'amountSOL', type: 'number', value: data.amountSOL },
      { field: 'senderPublicKey', type: 'string', value: data.senderPublicKey },
      { field: 'receiverPublicKey', type: 'string', value: data.receiverPublicKey },
      { field: 'timestamp', type: 'number', value: data.timestamp },
      { field: 'nonce', type: 'string', value: data.nonce },
      { field: 'solPrice', type: 'number', value: data.solPrice }
    ];

    typeChecks.forEach(check => {
      if (check.field in data && typeof check.value !== check.type) {
        errors.push(`Campo ${check.field} deve ser do tipo ${check.type}`);
      }
    });

    return { errors, warnings };
  }

  /**
   * Valida valores monetários
   */
  private validateAmounts(data: NFCTransactionData): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar valor USD
    if (data.amount <= 0) {
      errors.push('Valor em USD deve ser maior que zero');
    }

    if (data.amount < NFC_CONFIG.MIN_AMOUNT) {
      errors.push(`Valor mínimo: $${NFC_CONFIG.MIN_AMOUNT}`);
    }

    if (data.amount > NFC_CONFIG.MAX_AMOUNT) {
      errors.push(`Valor máximo: $${NFC_CONFIG.MAX_AMOUNT}`);
    }

    // Validar valor SOL
    if (data.amountSOL <= 0) {
      errors.push('Valor em SOL deve ser maior que zero');
    }

    // Validar preço SOL
    if (data.solPrice <= 0) {
      errors.push('Preço do SOL inválido');
    }

    if (data.solPrice < 1 || data.solPrice > 10000) {
      warnings.push('Preço do SOL parece incomum');
    }

    // Verificar consistência entre USD e SOL
    const expectedSOL = data.amount / data.solPrice;
    const difference = Math.abs(expectedSOL - data.amountSOL);
    const tolerance = expectedSOL * 0.01; // 1% de tolerância

    if (difference > tolerance) {
      warnings.push('Inconsistência entre valores USD e SOL');
    }

    // Alertas para valores suspeitos
    if (data.amount > this.SUSPICIOUS_AMOUNT_THRESHOLD) {
      warnings.push(`Valor alto detectado: $${data.amount}`);
    }

    return { errors, warnings };
  }

  /**
   * Valida endereços Solana
   */
  private validateAddresses(data: NFCTransactionData): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar endereço do remetente
    try {
      new PublicKey(data.senderPublicKey);
    } catch {
      errors.push('Endereço do remetente inválido');
    }

    // Validar endereço do destinatário
    try {
      new PublicKey(data.receiverPublicKey);
    } catch {
      errors.push('Endereço do destinatário inválido');
    }

    // Verificar se são endereços diferentes
    if (data.senderPublicKey === data.receiverPublicKey) {
      errors.push('Remetente e destinatário não podem ser o mesmo');
    }

    return { errors, warnings };
  }

  /**
   * Valida timestamp
   */
  private validateTimestamp(data: NFCTransactionData): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const now = Date.now();
    const age = now - data.timestamp;

    // Verificar se timestamp não é futuro
    if (data.timestamp > now + 60000) { // 1 minuto de tolerância
      errors.push('Timestamp não pode ser futuro');
    }

    // Verificar idade máxima
    if (age > this.MAX_TRANSACTION_AGE) {
      errors.push('Dados da transação muito antigos');
    }

    // Avisos para dados antigos
    const oneHourAgo = now - (60 * 60 * 1000);
    if (data.timestamp < oneHourAgo) {
      warnings.push('Dados criados há mais de 1 hora');
    }

    return { errors, warnings };
  }

  /**
   * Realiza verificações de segurança
   */
  private performSecurityChecks(data: NFCTransactionData): SecurityCheck[] {
    const checks: SecurityCheck[] = [];

    // 1. Verificar nonce único/válido
    checks.push(this.validateNonce(data.nonce));

    // 2. Verificar rede
    checks.push(this.validateNetwork(data.network));

    // 3. Verificar padrões suspeitos
    checks.push(...this.detectSuspiciousPatterns(data));

    return checks;
  }

  /**
   * Valida nonce
   */
  private validateNonce(nonce: string): SecurityCheck {
    const isValid = Boolean(
      nonce && 
      nonce.length >= 8 && 
      nonce.length <= 64 &&
      /^[a-zA-Z0-9_-]+$/.test(nonce)
    );

    return {
      checkName: 'Nonce Validation',
      passed: isValid,
      severity: isValid ? 'INFO' : 'ERROR',
      message: isValid ? 'Nonce válido' : 'Nonce inválido ou inseguro'
    };
  }

  /**
   * Valida rede
   */
  private validateNetwork(network: string): SecurityCheck {
    const supportedNetworks = ['devnet', 'testnet', 'mainnet-beta'];
    const isSupported = supportedNetworks.includes(network);

    return {
      checkName: 'Network Validation',
      passed: isSupported,
      severity: isSupported ? 'INFO' : 'ERROR',
      message: isSupported ? `Rede suportada: ${network}` : `Rede não suportada: ${network}`
    };
  }

  /**
   * Detecta padrões suspeitos
   */
  private detectSuspiciousPatterns(data: NFCTransactionData): SecurityCheck[] {
    const checks: SecurityCheck[] = [];

    // Valor muito alto
    if (data.amount > this.SUSPICIOUS_AMOUNT_THRESHOLD) {
      checks.push({
        checkName: 'High Value Detection',
        passed: false,
        severity: 'WARNING',
        message: `Valor alto detectado: $${data.amount}`
      });
    }

    // Preço SOL muito discrepante
    const currentEstimateSOL = 150; // Estimativa atual
    const priceDifference = Math.abs(data.solPrice - currentEstimateSOL) / currentEstimateSOL;
    
    if (priceDifference > 0.5) { // 50% de diferença
      checks.push({
        checkName: 'Price Discrepancy Detection',
        passed: false,
        severity: 'WARNING',
        message: `Preço SOL muito discrepante: $${data.solPrice}`
      });
    }

    return checks;
  }

  /**
   * Calcula nível de segurança baseado nas verificações
   */
  private calculateSecurityLevel(
    checks: SecurityCheck[], 
    errorCount: number, 
    warningCount: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (errorCount > 0) {
      return 'LOW';
    }

    const criticalFailures = checks.filter(c => !c.passed && c.severity === 'ERROR').length;
    const warnings = checks.filter(c => !c.passed && c.severity === 'WARNING').length;

    if (criticalFailures > 0 || warnings > 3) {
      return 'LOW';
    }

    if (warnings > 1 || warningCount > 2) {
      return 'MEDIUM';
    }

    return 'HIGH';
  }
}