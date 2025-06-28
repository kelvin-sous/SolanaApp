// ========================================
// src/utils/nfc.ts
// Funções utilitárias para operações NFC
// ========================================

import { PublicKey } from '@solana/web3.js';
import { Platform } from 'react-native';
import { 
  NFCTransactionData, 
  NFCError, 
  NFCErrorCode, 
  NFCOperationStatus, 
  NFCOperationType,
  NFCNetworkType,
  NFCPerformanceMetrics,
  NFCDataValidation
} from '../types/nfc';
import { NFC_CONFIG } from '../constants/config';

// ========================================
// UTILITÁRIOS DE VALIDAÇÃO
// ========================================

/**
 * Valida se um endereço Solana é válido
 */
export function validateSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida formato de endereço base58
 */
export function validateBase58Format(address: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address) && address.length === 44;
}

/**
 * Valida valor monetário
 */
export function validateAmount(amount: number, min: number = 0.01, max: number = 10000): {
  isValid: boolean;
  error?: string;
} {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Valor deve ser um número válido' };
  }

  if (amount <= 0) {
    return { isValid: false, error: 'Valor deve ser maior que zero' };
  }

  if (amount < min) {
    return { isValid: false, error: `Valor mínimo: $${min}` };
  }

  if (amount > max) {
    return { isValid: false, error: `Valor máximo: $${max}` };
  }

  return { isValid: true };
}

/**
 * Valida timestamp
 */
export function validateTimestamp(timestamp: number, maxAge: number = NFC_CONFIG.VALIDATION.MAX_TRANSACTION_AGE): {
  isValid: boolean;
  error?: string;
  age: number;
} {
  const now = Date.now();
  const age = now - timestamp;

  if (timestamp > now + 60000) { // 1 minuto de tolerância para o futuro
    return { 
      isValid: false, 
      error: 'Timestamp não pode ser futuro',
      age 
    };
  }

  if (age > maxAge) {
    return { 
      isValid: false, 
      error: 'Dados muito antigos',
      age 
    };
  }

  if (age < 0) {
    return { 
      isValid: false, 
      error: 'Timestamp inválido',
      age 
    };
  }

  return { isValid: true, age };
}

/**
 * Validação completa de dados de transação NFC
 */
export function validateNFCTransactionData(data: NFCTransactionData): NFCDataValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar estrutura básica
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Dados de transação inválidos'],
      warnings: [],
      structureValid: false,
      checksumValid: false,
      timestampValid: false,
      addressesValid: false,
      amountsValid: false,
      confidenceScore: 0
    };
  }

  // Validar campos obrigatórios
  const requiredFields = ['amount', 'amountSOL', 'senderPublicKey', 'receiverPublicKey', 'timestamp', 'nonce'];
  let structureValid = true;

  for (const field of requiredFields) {
    if (!(field in data) || data[field as keyof NFCTransactionData] == null) {
      errors.push(`Campo obrigatório ausente: ${field}`);
      structureValid = false;
    }
  }

  // Validar valores
  const amountValidation = validateAmount(data.amount);
  let amountsValid = amountValidation.isValid;
  if (!amountValidation.isValid) {
    errors.push(amountValidation.error!);
  }

  if (data.amountSOL <= 0) {
    errors.push('Valor SOL deve ser maior que zero');
    amountsValid = false;
  }

  // Validar endereços
  let addressesValid = true;
  if (!validateSolanaAddress(data.senderPublicKey)) {
    errors.push('Endereço do remetente inválido');
    addressesValid = false;
  }

  if (!validateSolanaAddress(data.receiverPublicKey)) {
    errors.push('Endereço do destinatário inválido');
    addressesValid = false;
  }

  if (data.senderPublicKey === data.receiverPublicKey) {
    errors.push('Remetente e destinatário não podem ser iguais');
    addressesValid = false;
  }

  // Validar timestamp
  const timestampValidation = validateTimestamp(data.timestamp);
  const timestampValid = timestampValidation.isValid;
  if (!timestampValidation.isValid) {
    errors.push(timestampValidation.error!);
  }

  // Verificar consistência USD/SOL
  if (data.solPrice > 0) {
    const expectedSOL = data.amount / data.solPrice;
    const difference = Math.abs(expectedSOL - data.amountSOL);
    const tolerance = expectedSOL * 0.05; // 5% de tolerância

    if (difference > tolerance) {
      warnings.push('Inconsistência entre valores USD e SOL');
    }
  }

  // Calcular score de confiança
  let confidenceScore = 100;
  confidenceScore -= errors.length * 20;
  confidenceScore -= warnings.length * 10;
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    structureValid,
    checksumValid: true, // Implementar se necessário
    timestampValid,
    addressesValid,
    amountsValid,
    confidenceScore
  };
}

// ========================================
// UTILITÁRIOS DE FORMATAÇÃO
// ========================================

/**
 * Formata endereço para exibição
 */
export function formatAddress(address: string, startChars: number = 8, endChars: number = 8): string {
  if (!address || address.length <= startChars + endChars) {
    return address || '';
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Formata valor monetário
 */
export function formatCurrency(amount: number, currency: 'USD' | 'SOL' = 'USD', decimals?: number): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(decimals || 2)}`;
  } else {
    return `${amount.toFixed(decimals || 6)} SOL`;
  }
}

/**
 * Formata duração em texto legível
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Formata timestamp para data/hora legível
 */
export function formatTimestamp(timestamp: number, includeTime: boolean = true): string {
  const date = new Date(timestamp);
  
  if (includeTime) {
    return date.toLocaleString('pt-BR');
  }
  return date.toLocaleDateString('pt-BR');
}

/**
 * Formata tamanho de dados
 */
export function formatDataSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

/**
 * Formata status de operação para exibição
 */
export function formatOperationStatus(status: NFCOperationStatus): string {
  const statusMap: Record<NFCOperationStatus, string> = {
    'IDLE': 'Inativo',
    'INITIALIZING': 'Inicializando...',
    'SEARCHING': 'Procurando dispositivo...',
    'CONNECTED': 'Conectado',
    'SENDING_DATA': 'Enviando dados...',
    'RECEIVING_DATA': 'Recebendo dados...',
    'PROCESSING_TRANSACTION': 'Processando transação...',
    'SUCCESS': 'Concluído com sucesso',
    'ERROR': 'Erro',
    'CANCELLED': 'Cancelado'
  };

  return statusMap[status] || status;
}

// ========================================
// UTILITÁRIOS DE ERRO
// ========================================

/**
 * Cria objeto de erro NFC padronizado
 */
export function createNFCError(
  code: NFCErrorCode,
  message: string,
  details?: string,
  operationType?: NFCOperationType,
  isRecoverable: boolean = true
): NFCError {
  return {
    code,
    message,
    details,
    operationType,
    timestamp: Date.now(),
    isRecoverable,
    suggestedAction: getSuggestedAction(code)
  };
}

/**
 * Obtém ação sugerida para cada tipo de erro
 */
export function getSuggestedAction(errorCode: NFCErrorCode): string {
  const actions: Record<NFCErrorCode, string> = {
    [NFCErrorCode.NOT_SUPPORTED]: 'Use um dispositivo com suporte a NFC',
    [NFCErrorCode.NOT_ENABLED]: 'Ative o NFC nas configurações do dispositivo',
    [NFCErrorCode.PERMISSION_DENIED]: 'Conceda permissão de NFC ao aplicativo',
    [NFCErrorCode.CONNECTION_FAILED]: 'Aproxime mais os dispositivos e tente novamente',
    [NFCErrorCode.CONNECTION_LOST]: 'Mantenha os dispositivos próximos durante a operação',
    [NFCErrorCode.TIMEOUT]: 'Tente novamente com dispositivos mais próximos',
    [NFCErrorCode.DATA_CORRUPTED]: 'Verifique a conexão e tente novamente',
    [NFCErrorCode.DATA_TOO_LARGE]: 'Reduza o tamanho dos dados ou use outro método',
    [NFCErrorCode.INVALID_DATA]: 'Verifique os dados e tente novamente',
    [NFCErrorCode.CHECKSUM_FAILED]: 'Dados corrompidos - tente novamente',
    [NFCErrorCode.TRANSACTION_FAILED]: 'Verifique saldo e conexão Phantom',
    [NFCErrorCode.INSUFFICIENT_FUNDS]: 'Adicione SOL à sua carteira',
    [NFCErrorCode.INVALID_ADDRESS]: 'Verifique o endereço do destinatário',
    [NFCErrorCode.NETWORK_ERROR]: 'Verifique sua conexão com a internet',
    [NFCErrorCode.VALIDATION_FAILED]: 'Verifique os dados da transação',
    [NFCErrorCode.EXPIRED_DATA]: 'Gere novos dados de transação',
    [NFCErrorCode.REPLAY_ATTACK]: 'Dados de transação já foram usados',
    [NFCErrorCode.CANCELLED]: 'Operação cancelada pelo usuário',
    [NFCErrorCode.REJECTED]: 'Transação rejeitada pelo usuário',
    [NFCErrorCode.UNKNOWN_ERROR]: 'Tente novamente ou contate o suporte'
  };

  return actions[errorCode] || 'Tente novamente';
}

/**
 * Determina se um erro é recuperável
 */
export function isErrorRecoverable(errorCode: NFCErrorCode): boolean {
  const unrecoverableErrors = [
    NFCErrorCode.NOT_SUPPORTED,
    NFCErrorCode.PERMISSION_DENIED,
    NFCErrorCode.DATA_TOO_LARGE,
    NFCErrorCode.INVALID_ADDRESS
  ];

  return !unrecoverableErrors.includes(errorCode);
}

// ========================================
// UTILITÁRIOS DE DEVICE E PLATAFORMA
// ========================================

/**
 * Verifica se a plataforma suporta NFC
 */
export function isPlatformNFCSupported(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

/**
 * Obtém configurações específicas da plataforma
 */
export function getPlatformNFCSettings(): {
  maxDataSize: number;
  defaultTimeout: number;
  supportsBackground: boolean;
} {
  if (Platform.OS === 'ios') {
    return {
      maxDataSize: 8192, // 8KB
      defaultTimeout: 30000, // 30s
      supportsBackground: false
    };
  } else {
    return {
      maxDataSize: 8192, // 8KB
      defaultTimeout: 60000, // 60s
      supportsBackground: true
    };
  }
}

/**
 * Detecta capacidades do dispositivo
 */
export function detectDeviceCapabilities(): {
  canWrite: boolean;
  canRead: boolean;
  maxDataSize: number;
  supportedTechnologies: string[];
} {
  const platformSettings = getPlatformNFCSettings();
  
  return {
    canWrite: true,
    canRead: true,
    maxDataSize: platformSettings.maxDataSize,
    supportedTechnologies: ['NDEF', 'ISO14443']
  };
}

// ========================================
// UTILITÁRIOS DE PERFORMANCE
// ========================================

/**
 * Cria métricas de performance vazias
 */
export function createEmptyMetrics(): NFCPerformanceMetrics {
  return {
    connectionTime: 0,
    dataTransferTime: 0,
    validationTime: 0,
    transactionTime: 0,
    totalOperationTime: 0,
    bytesTransferred: 0,
    transferSpeed: 0,
    retryCount: 0,
    operationSuccess: false
  };
}

/**
 * Calcula velocidade de transferência
 */
export function calculateTransferSpeed(bytes: number, timeMs: number): number {
  if (timeMs <= 0) return 0;
  return (bytes * 1000) / timeMs; // bytes por segundo
}

/**
 * Mede tempo de execução de uma função
 */
export async function measureExecutionTime<T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await operation();
  const duration = Date.now() - startTime;
  
  return { result, duration };
}

// ========================================
// UTILITÁRIOS DE SEGURANÇA
// ========================================

/**
 * Gera nonce único
 */
export function generateNonce(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${randomPart}`;
}

/**
 * Calcula hash simples para verificação de integridade
 */
export function calculateSimpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Detecta padrões suspeitos em dados
 */
export function detectSuspiciousPatterns(data: NFCTransactionData): string[] {
  const suspiciousPatterns: string[] = [];

  // Valor muito alto
  if (data.amount > 1000) {
    suspiciousPatterns.push('Valor muito alto');
  }

  // Endereços com padrões repetitivos
  const hasRepeatingPattern = (str: string) => /(.)\1{3,}/.test(str);
  
  if (hasRepeatingPattern(data.senderPublicKey) || hasRepeatingPattern(data.receiverPublicKey)) {
    suspiciousPatterns.push('Endereço com padrão suspeito');
  }

  // Preço SOL muito discrepante
  const expectedPrice = 150; // Preço estimado
  if (Math.abs(data.solPrice - expectedPrice) / expectedPrice > 0.5) {
    suspiciousPatterns.push('Preço SOL muito discrepante');
  }

  return suspiciousPatterns;
}

// ========================================
// UTILITÁRIOS DE CONVERSÃO
// ========================================

/**
 * Converte SOL para lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000); // 1 SOL = 10^9 lamports
}

/**
 * Converte lamports para SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}

/**
 * Converte USD para SOL usando preço fornecido
 */
export function usdToSol(usd: number, solPrice: number): number {
  if (solPrice <= 0) {
    throw new Error('Preço do SOL deve ser maior que zero');
  }
  return usd / solPrice;
}

/**
 * Converte SOL para USD usando preço fornecido
 */
export function solToUsd(sol: number, solPrice: number): number {
  return sol * solPrice;
}

// ========================================
// UTILITÁRIOS DE DEBUG
// ========================================

/**
 * Log formatado para operações NFC
 */
export function nfcLog(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const prefix = `[NFC ${level.toUpperCase()}] ${timestamp}:`;
  
  if (data) {
    console[level](`${prefix} ${message}`, data);
  } else {
    console[level](`${prefix} ${message}`);
  }
}

/**
 * Cria snapshot do estado atual para debug
 */
export function createDebugSnapshot(
  status: NFCOperationStatus,
  data?: NFCTransactionData,
  error?: NFCError
): object {
  return {
    timestamp: Date.now(),
    status,
    data: data ? {
      amount: data.amount,
      amountSOL: data.amountSOL,
      sender: formatAddress(data.senderPublicKey),
      receiver: formatAddress(data.receiverPublicKey),
      network: data.network
    } : null,
    error: error ? {
      code: error.code,
      message: error.message,
      recoverable: error.isRecoverable
    } : null,
    platform: Platform.OS,
    nfcSupported: isPlatformNFCSupported()
  };
}