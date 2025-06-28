// ========================================
// src/constants/nfc.ts
// Constantes específicas para operações NFC
// ========================================

import { NFCConfig, NFCSecuritySettings, NFCValidationRule } from '../types/nfc';

// ========================================
// CONFIGURAÇÕES PRINCIPAIS DO NFC
// ========================================

export const NFC_CONSTANTS = {
  // Versão do protocolo NFC
  PROTOCOL_VERSION: '1.0.0',
  
  // Identificadores
  DATA_TYPE: 'SOLANA_TRANSFER',
  APP_IDENTIFIER: 'SolanaWalletTCC',
  
  // Timeouts (em milliseconds)
  TIMEOUTS: {
    CONNECTION: 30 * 1000,        // 30 segundos para conectar
    DATA_TRANSFER: 15 * 1000,     // 15 segundos para transferir dados
    TRANSACTION: 5 * 60 * 1000,   // 5 minutos para processar transação
    VALIDATION: 10 * 1000,        // 10 segundos para validar dados
    USER_RESPONSE: 2 * 60 * 1000, // 2 minutos para resposta do usuário
  },
  
  // Limites de dados
  DATA_LIMITS: {
    MAX_SIZE: 8192,               // 8KB máximo para NFC
    MIN_SIZE: 100,                // 100 bytes mínimo
    COMPRESSION_THRESHOLD: 6000,   // Comprimir se > 6KB
    WARNING_THRESHOLD: 7000,       // Aviso se > 7KB
  },
  
  // Limites de transação
  TRANSACTION_LIMITS: {
    MIN_USD: 0.01,                // $0.01 mínimo
    MAX_USD: 10000,               // $10,000 máximo para devnet
    MIN_SOL: 0.000001,            // ~1 lamport
    MAX_SOL: 1000,                // 1000 SOL máximo para devnet
    SUSPICIOUS_THRESHOLD: 1000,    // $1000 para alertas de segurança
  },
  
  // Configurações de retry
  RETRY: {
    MAX_ATTEMPTS: 3,              // Máximo 3 tentativas
    DELAY_BASE: 1000,             // 1 segundo base
    DELAY_MULTIPLIER: 2,          // Multiplicador exponential backoff
    MAX_DELAY: 10000,             // 10 segundos máximo de delay
  },
  
  // Configurações de validação
  VALIDATION: {
    MAX_AGE: 5 * 60 * 1000,       // 5 minutos máximo idade dos dados
    CHECKSUM_ENABLED: true,        // Habilitar verificação de checksum
    TIMESTAMP_TOLERANCE: 60000,    // 1 minuto de tolerância para timestamp
    PRICE_TOLERANCE: 0.05,         // 5% de tolerância para preço SOL/USD
  }
} as const;

// ========================================
// CONFIGURAÇÃO PADRÃO DO NFC
// ========================================

export const DEFAULT_NFC_CONFIG: NFCConfig = {
  // Timeouts
  connectionTimeout: NFC_CONSTANTS.TIMEOUTS.CONNECTION,
  transactionTimeout: NFC_CONSTANTS.TIMEOUTS.TRANSACTION,
  dataTimeout: NFC_CONSTANTS.TIMEOUTS.DATA_TRANSFER,
  
  // Limites
  maxDataSize: NFC_CONSTANTS.DATA_LIMITS.MAX_SIZE,
  maxRetries: NFC_CONSTANTS.RETRY.MAX_ATTEMPTS,
  
  // Validação
  validateChecksums: NFC_CONSTANTS.VALIDATION.CHECKSUM_ENABLED,
  checkDataAge: true,
  maxDataAge: NFC_CONSTANTS.VALIDATION.MAX_AGE,
  
  // Segurança
  requireEncryption: false, // Opcional para devnet
  allowTestnetTransactions: true,
  maxTransactionAmount: NFC_CONSTANTS.TRANSACTION_LIMITS.MAX_USD,
  
  // Debug
  enableDebugLogs: __DEV__,
  enablePerformanceMetrics: __DEV__
};

// ========================================
// CONFIGURAÇÕES DE SEGURANÇA
// ========================================

export const DEFAULT_SECURITY_SETTINGS: NFCSecuritySettings = {
  // Validações obrigatórias
  requireAddressValidation: true,
  requireAmountConfirmation: true,
  requireTimestampValidation: true,
  
  // Limites de segurança
  maxSingleTransaction: NFC_CONSTANTS.TRANSACTION_LIMITS.SUSPICIOUS_THRESHOLD,
  maxDailyAmount: 5000, // $5000 por dia
  
  // Detecção de fraude
  detectSuspiciousPatterns: true,
  blockRepeatedAddresses: false, // Permitir endereços repetidos
  requireManualConfirmation: true,
  
  // Listas (inicialmente vazias)
  trustedAddresses: [],
  blockedAddresses: []
};

// ========================================
// REGRAS DE VALIDAÇÃO
// ========================================

export const NFC_VALIDATION_RULES: NFCValidationRule[] = [
  {
    name: 'amount_positive',
    description: 'Valor deve ser positivo',
    validate: (data) => data.amount > 0,
    errorMessage: 'Valor deve ser maior que zero',
    severity: 'ERROR'
  },
  {
    name: 'amount_within_limits',
    description: 'Valor deve estar dentro dos limites',
    validate: (data) => data.amount >= NFC_CONSTANTS.TRANSACTION_LIMITS.MIN_USD && 
                        data.amount <= NFC_CONSTANTS.TRANSACTION_LIMITS.MAX_USD,
    errorMessage: `Valor deve estar entre $${NFC_CONSTANTS.TRANSACTION_LIMITS.MIN_USD} e $${NFC_CONSTANTS.TRANSACTION_LIMITS.MAX_USD}`,
    severity: 'ERROR'
  },
  {
    name: 'sol_amount_positive',
    description: 'Valor SOL deve ser positivo',
    validate: (data) => data.amountSOL > 0,
    errorMessage: 'Valor SOL deve ser maior que zero',
    severity: 'ERROR'
  },
  {
    name: 'addresses_different',
    description: 'Endereços devem ser diferentes',
    validate: (data) => data.senderPublicKey !== data.receiverPublicKey,
    errorMessage: 'Remetente e destinatário não podem ser iguais',
    severity: 'ERROR'
  },
  {
    name: 'timestamp_recent',
    description: 'Timestamp deve ser recente',
    validate: (data) => (Date.now() - data.timestamp) <= NFC_CONSTANTS.VALIDATION.MAX_AGE,
    errorMessage: 'Dados muito antigos',
    severity: 'ERROR'
  },
  {
    name: 'nonce_present',
    description: 'Nonce deve estar presente',
    validate: (data) => Boolean(data.nonce && data.nonce.length >= 8),
    errorMessage: 'Nonce inválido',
    severity: 'ERROR'
  },
  {
    name: 'price_reasonable',
    description: 'Preço SOL deve ser razoável',
    validate: (data) => data.solPrice >= 1 && data.solPrice <= 10000,
    errorMessage: 'Preço SOL inválido',
    severity: 'WARNING'
  },
  {
    name: 'amount_consistency',
    description: 'Consistência entre USD e SOL',
    validate: (data) => {
      const expectedSOL = data.amount / data.solPrice;
      const difference = Math.abs(expectedSOL - data.amountSOL);
      const tolerance = expectedSOL * NFC_CONSTANTS.VALIDATION.PRICE_TOLERANCE;
      return difference <= tolerance;
    },
    errorMessage: 'Inconsistência entre valores USD e SOL',
    severity: 'WARNING'
  },
  {
    name: 'network_supported',
    description: 'Rede deve ser suportada',
    validate: (data) => ['devnet', 'testnet', 'mainnet-beta'].includes(data.network),
    errorMessage: 'Rede não suportada',
    severity: 'ERROR'
  },
  {
    name: 'suspicious_amount',
    description: 'Detectar valores suspeitos',
    validate: (data) => data.amount <= NFC_CONSTANTS.TRANSACTION_LIMITS.SUSPICIOUS_THRESHOLD,
    errorMessage: `Valor alto detectado: $${NFC_CONSTANTS.TRANSACTION_LIMITS.SUSPICIOUS_THRESHOLD}+`,
    severity: 'WARNING'
  }
];

// ========================================
// TEMPLATES DE MENSAGENS
// ========================================

export const NFC_MESSAGES = {
  // Status messages
  STATUS: {
    IDLE: 'Aguardando operação',
    INITIALIZING: 'Inicializando NFC...',
    SEARCHING: 'Procurando dispositivo...',
    CONNECTED: 'Dispositivo encontrado!',
    SENDING_DATA: 'Enviando dados...',
    RECEIVING_DATA: 'Recebendo dados...',
    PROCESSING_TRANSACTION: 'Processando transação...',
    SUCCESS: 'Operação concluída!',
    ERROR: 'Erro na operação',
    CANCELLED: 'Operação cancelada'
  },
  
  // Instruções
  INSTRUCTIONS: {
    SEND: 'Aproxime o dispositivo receptor para enviar a transferência',
    RECEIVE: 'Aproxime o dispositivo emissor para receber a transferência',
    KEEP_CLOSE: 'Mantenha os dispositivos próximos (até 4cm)',
    PROCESSING: 'Não afaste os dispositivos durante o processo',
    CONFIRM: 'Verifique os dados antes de confirmar',
    WAIT: 'Aguarde a confirmação na blockchain'
  },
  
  // Erros comuns
  ERRORS: {
    NFC_NOT_SUPPORTED: 'Este dispositivo não suporta NFC',
    NFC_NOT_ENABLED: 'NFC não está habilitado. Ative nas configurações.',
    PHANTOM_NOT_CONNECTED: 'Phantom Wallet não está conectado',
    INSUFFICIENT_BALANCE: 'Saldo insuficiente para a transação',
    INVALID_ADDRESS: 'Endereço do destinatário inválido',
    CONNECTION_FAILED: 'Falha na conexão NFC. Tente aproximar mais os dispositivos.',
    DATA_CORRUPTED: 'Dados corrompidos. Tente novamente.',
    TIMEOUT: 'Operação expirou. Tente novamente.',
    TRANSACTION_FAILED: 'Falha na transação. Verifique saldo e conexão.',
    USER_CANCELLED: 'Operação cancelada pelo usuário'
  },
  
  // Sucessos
  SUCCESS: {
    DATA_SENT: 'Dados enviados com sucesso!',
    DATA_RECEIVED: 'Dados recebidos com sucesso!',
    TRANSACTION_COMPLETE: 'Transação concluída com sucesso!',
    CONNECTION_ESTABLISHED: 'Conexão estabelecida!'
  },
  
  // Avisos
  WARNINGS: {
    HIGH_AMOUNT: 'Valor alto detectado. Verifique cuidadosamente.',
    OLD_DATA: 'Dados antigos. Verifique se ainda é válido.',
    PRICE_DISCREPANCY: 'Preço SOL parece incomum.',
    WEAK_SIGNAL: 'Sinal NFC fraco. Aproxime mais os dispositivos.'
  }
} as const;

// ========================================
// CONFIGURAÇÕES DE ANIMAÇÃO
// ========================================

export const NFC_ANIMATIONS = {
  // Durações (em milliseconds)
  DURATIONS: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    PULSE: 1000,
    SCAN: 2000,
    CONNECTING: 1500
  },
  
  // Configurações de pulse para searching
  PULSE_CONFIG: {
    duration: 1000,
    minScale: 0.8,
    maxScale: 1.2,
    iterations: -1 // Infinito
  },
  
  // Configurações de rotação para loading
  ROTATION_CONFIG: {
    duration: 2000,
    iterations: -1,
    easing: 'linear'
  },
  
  // Configurações de fade
  FADE_CONFIG: {
    duration: 300,
    easing: 'ease-in-out'
  }
} as const;

// ========================================
// CORES ESPECÍFICAS PARA NFC
// ========================================

export const NFC_COLORS = {
  // Status colors
  STATUS: {
    IDLE: '#6B7280',         // Gray
    SEARCHING: '#F59E0B',    // Amber
    CONNECTED: '#3B82F6',    // Blue
    SENDING: '#8B5CF6',      // Purple
    RECEIVING: '#10B981',    // Emerald
    PROCESSING: '#AB9FF3',   // Light purple
    SUCCESS: '#22C55E',      // Green
    ERROR: '#EF4444',        // Red
    CANCELLED: '#9CA3AF'     // Gray
  },
  
  // Indicador NFC
  INDICATOR: {
    BACKGROUND: '#262728',
    BORDER: '#AB9FF3',
    PULSE: '#AB9FF3',
    TEXT: '#FFFFFF',
    ICON: '#AB9FF3'
  },
  
  // Ondas de conexão
  WAVES: {
    PRIMARY: '#AB9FF3',
    SECONDARY: '#8B5CF6',
    TERTIARY: '#6B46C1',
    BACKGROUND: 'rgba(171, 159, 243, 0.1)'
  }
} as const;

// ========================================
// CONFIGURAÇÕES DE DISPOSITIVO
// ========================================

export const DEVICE_CONFIGS = {
  // iOS específico
  IOS: {
    maxDataSize: 8192,
    supportedTechnologies: ['NDEF'],
    defaultTimeout: 30000,
    supportsBackground: false,
    requiresPermission: false
  },
  
  // Android específico
  ANDROID: {
    maxDataSize: 8192,
    supportedTechnologies: ['NDEF', 'ISO14443', 'ISO15693'],
    defaultTimeout: 60000,
    supportsBackground: true,
    requiresPermission: true
  }
} as const;

// ========================================
// MÉTRICAS E MONITORAMENTO
// ========================================

export const NFC_METRICS = {
  // Eventos que devem ser rastreados
  TRACKED_EVENTS: [
    'nfc_operation_started',
    'nfc_connection_established',
    'nfc_data_transferred',
    'nfc_transaction_completed',
    'nfc_operation_failed',
    'nfc_operation_cancelled'
  ],
  
  // Intervalos de coleta
  COLLECTION_INTERVALS: {
    PERFORMANCE: 1000,      // A cada segundo durante operação
    HEARTBEAT: 5000,        // A cada 5 segundos
    SESSION_SUMMARY: 60000  // A cada minuto
  },
  
  // Limites para alertas
  PERFORMANCE_THRESHOLDS: {
    CONNECTION_TIME: 5000,     // 5s para conectar
    TRANSFER_TIME: 10000,      // 10s para transferir
    VALIDATION_TIME: 2000,     // 2s para validar
    TOTAL_OPERATION_TIME: 30000 // 30s total
  }
} as const;

// ========================================
// CONFIGURAÇÕES DE DESENVOLVIMENTO
// ========================================

export const NFC_DEV_CONFIG = {
  // Simulação para desenvolvimento
  SIMULATION: {
    ENABLED: __DEV__,
    CONNECTION_DELAY: 2000,
    TRANSFER_DELAY: 3000,
    SUCCESS_RATE: 0.9, // 90% de sucesso
    SIMULATE_ERRORS: true
  },
  
  // Logs de debug
  DEBUG: {
    ENABLED: __DEV__,
    LOG_DATA_CONTENT: false, // Não logar conteúdo sensível por padrão
    LOG_PERFORMANCE: true,
    LOG_VALIDATION: true,
    LOG_ERRORS: true
  },
  
  // Testes automatizados
  TESTING: {
    ENABLE_TEST_MODES: __DEV__,
    MOCK_DEVICE_RESPONSES: __DEV__,
    VALIDATE_ALL_SCENARIOS: __DEV__
  }
} as const;

// ========================================
// EXPORT CONSOLIDADO
// ========================================

export const NFC_CONFIG_BUNDLE = {
  constants: NFC_CONSTANTS,
  defaultConfig: DEFAULT_NFC_CONFIG,
  securitySettings: DEFAULT_SECURITY_SETTINGS,
  validationRules: NFC_VALIDATION_RULES,
  messages: NFC_MESSAGES,
  animations: NFC_ANIMATIONS,
  colors: NFC_COLORS,
  deviceConfigs: DEVICE_CONFIGS,
  metrics: NFC_METRICS,
  devConfig: NFC_DEV_CONFIG
} as const;

// Export individual para facilitar imports
export default NFC_CONFIG_BUNDLE;