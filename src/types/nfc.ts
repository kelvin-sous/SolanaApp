// ========================================
// src/types/nfc.ts
// Tipos específicos para operações NFC - CORRIGIDO
// ========================================

import { PublicKey } from '@solana/web3.js';
import { SolanaNetwork } from './wallet'; // ✅ Importação corrigida

// ========================================
// TIPOS BÁSICOS DE NFC
// ========================================

export type NFCOperationStatus = 
  | 'IDLE'                    // Inativo
  | 'INITIALIZING'           // Inicializando
  | 'SEARCHING'              // Procurando dispositivo
  | 'CONNECTED'              // Conectado
  | 'SENDING_DATA'           // Enviando dados
  | 'RECEIVING_DATA'         // Recebendo dados
  | 'PROCESSING_TRANSACTION' // Processando transação
  | 'SUCCESS'                // Sucesso
  | 'ERROR'                  // Erro
  | 'CANCELLED';             // Cancelado

export type NFCOperationType = 'SEND' | 'RECEIVE';

// ✅ Usando o tipo correto de SolanaNetwork
export type NFCNetworkType = SolanaNetwork;

// ========================================
// INTERFACES PARA COMPATIBILIDADE COM NFCService
// ========================================

export interface NFCStatusCallback {
  onStatusChange: (status: NFCOperationStatus, message?: string) => void;
  onDataReceived?: (data: NFCTransactionData) => void;
  onTransactionComplete?: (result: NFCTransactionResult) => void;
  onError?: (error: string) => void;
  onProgress?: (percentage: number, stage: string) => void;
}

// ========================================
// INTERFACES DE DADOS DE TRANSAÇÃO
// ========================================

export interface NFCTransactionData {
  // Valores monetários
  amount: number;              // Valor em USD
  amountSOL: number;          // Valor em SOL
  solPrice: number;           // Preço do SOL no momento da transação
  
  // Endereços
  senderPublicKey: string;    // Chave pública do remetente
  receiverPublicKey: string;  // Chave pública do destinatário
  
  // Metadados
  timestamp: number;          // Timestamp da criação
  nonce: string;              // Nonce único para prevenir replay
  network: NFCNetworkType;    // Rede Solana
  memo?: string;              // Memo opcional
  
  // Validação (calculado automaticamente)
  dataHash?: string;          // Hash para validação de integridade
}

export interface NFCTransactionRequest {
  // Dados básicos
  amountUSD: number;
  receiverPublicKey: string;
  memo?: string;
  
  // Configurações
  network?: NFCNetworkType;
  timeout?: number;
  
  // Callbacks
  onProgress?: (status: NFCOperationStatus, message?: string) => void;
  onComplete?: (result: NFCTransactionResult) => void;
  onError?: (error: NFCError) => void;
}

export interface NFCReceiveRequest {
  // Configurações
  timeout?: number;
  autoAccept?: boolean;
  
  // Filtros (opcional)
  expectedSender?: string;
  maxAmount?: number;
  
  // Callbacks
  onProgress?: (status: NFCOperationStatus, message?: string) => void;
  onDataReceived?: (data: NFCTransactionData) => void;
  onComplete?: (result: NFCTransactionResult) => void;
  onError?: (error: NFCError) => void;
}

// ========================================
// INTERFACES DE RESULTADO
// ========================================

export interface NFCTransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  transactionData?: NFCTransactionData;
  
  // Metadados do resultado (opcionais para compatibilidade)
  completedAt?: number;
  operationType?: NFCOperationType;
  networkUsed?: NFCNetworkType;
  
  // Informações de performance (opcionais)
  operationDuration?: number;  // Em milliseconds
  dataSize?: number;          // Tamanho dos dados transmitidos
}

export interface NFCConnectionResult {
  connected: boolean;
  deviceInfo?: NFCDeviceInfo;
  error?: string;
  connectionTime?: number;
}

// ========================================
// INTERFACES DE STATUS E DISPOSITIVO
// ========================================

export interface NFCStatus {
  supported: boolean;
  enabled: boolean;
  available: boolean;
  error?: string;
  
  // Informações do dispositivo
  deviceCapabilities?: NFCCapabilities;
}

export interface NFCDeviceInfo {
  id?: string;
  type?: string;
  maxDataSize?: number;
  supportedTechnologies?: string[];
  
  // Metadados da conexão
  connectedAt: number;
  signalStrength?: number;
}

export interface NFCCapabilities {
  maxDataSize: number;
  supportedFormats: string[];
  canWrite: boolean;
  canRead: boolean;
  supportsEncryption: boolean;
}

// ========================================
// INTERFACES DE ERRO
// ========================================

export interface NFCError {
  code: NFCErrorCode;
  message: string;
  details?: string;
  
  // Contexto do erro
  operationType?: NFCOperationType;
  operationStatus?: NFCOperationStatus;
  timestamp: number;
  
  // Informações de recovery
  isRecoverable: boolean;
  suggestedAction?: string;
}

export enum NFCErrorCode {
  // Erros de dispositivo
  NOT_SUPPORTED = 'NFC_NOT_SUPPORTED',
  NOT_ENABLED = 'NFC_NOT_ENABLED',
  PERMISSION_DENIED = 'NFC_PERMISSION_DENIED',
  
  // Erros de conexão
  CONNECTION_FAILED = 'NFC_CONNECTION_FAILED',
  CONNECTION_LOST = 'NFC_CONNECTION_LOST',
  TIMEOUT = 'NFC_TIMEOUT',
  
  // Erros de dados
  DATA_CORRUPTED = 'NFC_DATA_CORRUPTED',
  DATA_TOO_LARGE = 'NFC_DATA_TOO_LARGE',
  INVALID_DATA = 'NFC_INVALID_DATA',
  CHECKSUM_FAILED = 'NFC_CHECKSUM_FAILED',
  
  // Erros de transação
  TRANSACTION_FAILED = 'NFC_TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS = 'NFC_INSUFFICIENT_FUNDS',
  INVALID_ADDRESS = 'NFC_INVALID_ADDRESS',
  NETWORK_ERROR = 'NFC_NETWORK_ERROR',
  
  // Erros de validação
  VALIDATION_FAILED = 'NFC_VALIDATION_FAILED',
  EXPIRED_DATA = 'NFC_EXPIRED_DATA',
  REPLAY_ATTACK = 'NFC_REPLAY_ATTACK',
  
  // Erros do usuário
  CANCELLED = 'NFC_CANCELLED',
  REJECTED = 'NFC_REJECTED',
  
  // Erros gerais
  UNKNOWN_ERROR = 'NFC_UNKNOWN_ERROR'
}

// ========================================
// INTERFACES DE CONFIGURAÇÃO
// ========================================

export interface NFCConfig {
  // Timeouts
  connectionTimeout: number;
  transactionTimeout: number;
  dataTimeout: number;
  
  // Limites
  maxDataSize: number;
  maxRetries: number;
  
  // Validação
  validateChecksums: boolean;
  checkDataAge: boolean;
  maxDataAge: number;
  
  // Segurança
  requireEncryption: boolean;
  allowTestnetTransactions: boolean;
  maxTransactionAmount: number;
  
  // Debug
  enableDebugLogs: boolean;
  enablePerformanceMetrics: boolean;
}

export interface NFCSecuritySettings {
  // Validações obrigatórias
  requireAddressValidation: boolean;
  requireAmountConfirmation: boolean;
  requireTimestampValidation: boolean;
  
  // Limites de segurança
  maxSingleTransaction: number;
  maxDailyAmount: number;
  
  // Detecção de fraude
  detectSuspiciousPatterns: boolean;
  blockRepeatedAddresses: boolean;
  requireManualConfirmation: boolean;
  
  // Whitelist/Blacklist
  trustedAddresses?: string[];
  blockedAddresses?: string[];
}

// ========================================
// INTERFACES DE CALLBACK (VERSÃO UNIFICADA)
// ========================================

export interface NFCStatusCallback {
  onStatusChange: (status: NFCOperationStatus, message?: string) => void;
  onDataReceived?: (data: NFCTransactionData) => void;
  onTransactionComplete?: (result: NFCTransactionResult) => void;
  onError?: (error: string) => void;
  onProgress?: (percentage: number, stage: string) => void;
}

export interface NFCEventHandlers {
  onConnectionEstablished?: (deviceInfo: NFCDeviceInfo) => void;
  onConnectionLost?: () => void;
  onDataTransferStart?: (operationType: NFCOperationType) => void;
  onDataTransferComplete?: (success: boolean, dataSize?: number) => void;
  onValidationStart?: () => void;
  onValidationComplete?: (success: boolean, errors?: string[]) => void;
}

// ========================================
// INTERFACES DE FORMATAÇÃO
// ========================================

export interface NFCDataPacket {
  // Metadados do pacote
  version: string;
  type: 'SOLANA_TRANSFER' | 'SOLANA_REQUEST' | 'CUSTOM';
  packetId: string;
  
  // Dados principais
  data: NFCTransactionData;
  
  // Validação
  checksum: string;
  signature?: string;
  
  // Timestamps
  createdAt: number;
  expiresAt?: number;
}

export interface NFCDataValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  
  // Detalhes da validação
  structureValid: boolean;
  checksumValid: boolean;
  timestampValid: boolean;
  addressesValid: boolean;
  amountsValid: boolean;
  
  // Score de confiança (0-100)
  confidenceScore: number;
}

// ========================================
// INTERFACES DE MÉTRICAS
// ========================================

export interface NFCPerformanceMetrics {
  // Tempos de operação
  connectionTime: number;
  dataTransferTime: number;
  validationTime: number;
  transactionTime: number;
  totalOperationTime: number;
  
  // Dados transferidos
  bytesTransferred: number;
  transferSpeed: number; // bytes/second
  
  // Qualidade da conexão
  signalStrength?: number;
  errorRate?: number;
  retryCount: number;
  
  // Sucesso/falha
  operationSuccess: boolean;
  failureReason?: string;
}

export interface NFCSessionMetrics {
  sessionsCount: number;
  successfulSessions: number;
  failedSessions: number;
  averageSessionDuration: number;
  totalDataTransferred: number;
  
  // Por tipo de operação
  sendOperations: number;
  receiveOperations: number;
  
  // Erros mais comuns
  commonErrors: Array<{
    code: NFCErrorCode;
    count: number;
    percentage: number;
  }>;
}

// ========================================
// TIPOS UTILITÁRIOS
// ========================================

export type NFCOperationResult<T = any> = {
  success: boolean;
  data?: T;
  error?: NFCError;
  metrics?: NFCPerformanceMetrics;
};

export type NFCEventType = 
  | 'connection_established'
  | 'connection_lost'
  | 'data_received'
  | 'data_sent'
  | 'transaction_complete'
  | 'operation_cancelled'
  | 'error_occurred';

export interface NFCEvent<T = any> {
  type: NFCEventType;
  data?: T;
  timestamp: number;
  operationType?: NFCOperationType;
  operationId?: string;
}

// ========================================
// INTERFACES PARA HOOKS
// ========================================

export interface UseNFCOptions {
  autoInitialize?: boolean;
  enableMetrics?: boolean;
  securitySettings?: Partial<NFCSecuritySettings>;
  config?: Partial<NFCConfig>;
  
  // Callbacks globais
  onAnyError?: (error: NFCError) => void;
  onAnySuccess?: (result: NFCTransactionResult) => void;
}

export interface UseNFCReturn {
  // Status atual
  status: NFCOperationStatus;
  message: string | null;
  isActive: boolean;
  error: NFCError | null;
  
  // Dados da operação atual
  currentTransactionData: NFCTransactionData | null;
  estimatedFee: number | null;
  confirmationRequired: boolean;
  
  // Capabilities do dispositivo
  isNFCAvailable: boolean;
  deviceCapabilities: NFCCapabilities | null;
  
  // Funções principais
  startSending: (request: NFCTransactionRequest) => Promise<void>;
  startReceiving: (request?: NFCReceiveRequest) => Promise<void>;
  confirmTransaction: (accept: boolean) => Promise<void>;
  stop: () => Promise<void>;
  
  // Utilitários
  checkNFCStatus: () => Promise<NFCStatus>;
  clearError: () => void;
  getMetrics: () => NFCSessionMetrics | null;
  
  // Configuração
  updateConfig: (config: Partial<NFCConfig>) => void;
  updateSecuritySettings: (settings: Partial<NFCSecuritySettings>) => void;
  
  // Event handlers
  setEventHandlers: (handlers: Partial<NFCEventHandlers>) => void;
}

// ========================================
// TIPOS PARA VALIDAÇÃO E FORMATAÇÃO
// ========================================

export interface NFCValidationRule {
  name: string;
  description: string;
  validate: (data: NFCTransactionData) => boolean;
  errorMessage: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface NFCFormattingOptions {
  includeMetadata: boolean;
  compressData: boolean;
  encryptData: boolean;
  addChecksum: boolean;
  addTimestamp: boolean;
}

export interface NFCParsingOptions {
  validateChecksum: boolean;
  checkTimestamp: boolean;
  maxAge: number;
  requireEncryption: boolean;
  strictValidation: boolean;
}

// ========================================
// ENUMS AUXILIARES
// ========================================

export enum NFCDataFormat {
  JSON = 'json',
  BINARY = 'binary',
  BASE64 = 'base64',
  COMPRESSED = 'compressed'
}

export enum NFCSecurityLevel {
  NONE = 'none',
  BASIC = 'basic',
  STANDARD = 'standard',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

export enum NFCValidationLevel {
  MINIMAL = 'minimal',
  STANDARD = 'standard',
  STRICT = 'strict',
  PARANOID = 'paranoid'
}

// ========================================
// INTERFACES DE INTEGRAÇÃO
// ========================================

export interface NFCPhantomIntegration {
  session?: any;
  publicKey?: PublicKey;
  isConnected: boolean;
  
  // Funções de integração
  executeTransaction: (data: NFCTransactionData) => Promise<string>;
  validateAddress: (address: string) => boolean;
  getBalance: () => Promise<number>;
}

export interface NFCSolanaIntegration {
  network: NFCNetworkType;
  connection?: any;
  
  // Funções Solana
  getCurrentPrice: () => Promise<number>;
  validateTransaction: (data: NFCTransactionData) => Promise<boolean>;
  broadcastTransaction: (signature: string) => Promise<boolean>;
  getTransactionStatus: (signature: string) => Promise<string>;
}

// ========================================
// INTERFACES DE HISTÓRICO
// ========================================

export interface NFCTransactionHistory {
  id: string;
  transactionData: NFCTransactionData;
  result: NFCTransactionResult;
  operationType: NFCOperationType;
  
  // Timestamps
  startedAt: number;
  completedAt: number;
  duration: number;
  
  // Status
  status: 'completed' | 'failed' | 'cancelled';
  error?: NFCError;
  
  // Metadados
  deviceInfo?: NFCDeviceInfo;
  metrics?: NFCPerformanceMetrics;
}

export interface NFCSessionHistory {
  sessions: NFCTransactionHistory[];
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  
  // Estatísticas
  averageDuration: number;
  totalAmountTransferred: number;
  mostCommonErrors: NFCErrorCode[];
  
  // Filtros
  getByDateRange: (start: Date, end: Date) => NFCTransactionHistory[];
  getByType: (type: NFCOperationType) => NFCTransactionHistory[];
  getByStatus: (status: 'completed' | 'failed' | 'cancelled') => NFCTransactionHistory[];
}

// ========================================
// TIPOS PARA DESENVOLVIMENTO E DEBUG
// ========================================

export interface NFCDebugInfo {
  currentOperation?: {
    type: NFCOperationType;
    status: NFCOperationStatus;
    startTime: number;
    data?: Partial<NFCTransactionData>;
  };
  
  deviceInfo: {
    nfcSupported: boolean;
    nfcEnabled: boolean;
    capabilities?: NFCCapabilities;
  };
  
  lastError?: NFCError;
  lastTransaction?: NFCTransactionHistory;
  
  // Logs de debug
  recentLogs: Array<{
    timestamp: number;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    data?: any;
  }>;
}

export interface NFCTestingUtils {
  // Simulação
  simulateDevice: (deviceInfo: Partial<NFCDeviceInfo>) => void;
  simulateConnection: (success: boolean, delay?: number) => Promise<void>;
  simulateDataTransfer: (data: NFCTransactionData, success: boolean) => Promise<void>;
  
  // Validação
  validateTestData: (data: NFCTransactionData) => NFCDataValidation;
  generateTestTransaction: (overrides?: Partial<NFCTransactionData>) => NFCTransactionData;
  
  // Métricas
  getTestMetrics: () => NFCPerformanceMetrics;
  resetMetrics: () => void;
}