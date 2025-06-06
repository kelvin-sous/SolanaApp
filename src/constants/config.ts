// ========================================
// src/constants/config.ts
// Configurações do aplicativo - Atualizado para NFC
// ========================================

export const APP_CONFIG = {
  NAME: 'Solana Wallet TCC',
  VERSION: '1.0.0',
  APP_URL: 'https://solana-wallet-tcc.app',
  DEEP_LINK_SCHEME: 'exp',
  TIMEOUT_DURATION: 120000, // 2 minutos
  
  // URLs de redirecionamento para diferentes operações
  REDIRECT_URLS: {
    PHANTOM_CONNECT: 'exp://phantom-connect',
    PHANTOM_TRANSACTION: 'exp://phantom-transaction', 
    PHANTOM_SIGN: 'exp://phantom-sign',
  },
} as const;

export const PHANTOM_CONFIG = {
  CONNECT_URL: 'https://phantom.app/ul/v1/connect',
  SIGN_AND_SEND_URL: 'https://phantom.app/ul/v1/signAndSendTransaction',
  SIGN_TRANSACTION_URL: 'https://phantom.app/ul/v1/signTransaction',
  SIGN_MESSAGE_URL: 'https://phantom.app/ul/v1/signMessage',
  SESSION_STORAGE_KEY: 'phantom_session',
  DOWNLOAD_URLS: {
    ios: 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977',
    android: 'https://play.google.com/store/apps/details?id=app.phantom',
    web: 'https://phantom.app/download',
  },
} as const;

export const STORAGE_KEYS = {
  PHANTOM_SESSION: 'phantom_session',
  USER_PREFERENCES: 'user_preferences',
  TRANSACTION_HISTORY: 'transaction_history',
  NFC_SETTINGS: 'nfc_settings',
} as const;

// Configurações específicas para NFC
export const NFC_CONFIG = {
  MAX_DATA_SIZE: 8192, // 8KB máximo para dados NFC
  TRANSACTION_TIMEOUT: 300000, // 5 minutos
  RETRY_ATTEMPTS: 3,
  CONNECTION_TIMEOUT: 30000, // 30 segundos para conectar
  
  // Tipos MIME para diferentes dados
  MIME_TYPES: {
    TRANSACTION_DATA: 'application/solana-transaction',
    TEXT_PLAIN: 'text/plain',
  },
  
  // Códigos de erro NFC
  ERROR_CODES: {
    NOT_SUPPORTED: 'NFC_NOT_SUPPORTED',
    NOT_ENABLED: 'NFC_NOT_ENABLED',
    CONNECTION_FAILED: 'NFC_CONNECTION_FAILED',
    DATA_CORRUPTED: 'NFC_DATA_CORRUPTED',
    TIMEOUT: 'NFC_TIMEOUT',
    CANCELLED: 'NFC_CANCELLED',
  },
} as const;

// Configurações da rede Solana
export const SOLANA_CONFIG = {
  NETWORK: 'devnet' as const,
  COMMITMENT: 'confirmed' as const,
  
  // Endpoints RPC
  RPC_ENDPOINTS: {
    mainnet: 'https://api.mainnet-beta.solana.com',
    testnet: 'https://api.testnet.solana.com', 
    devnet: 'https://api.devnet.solana.com',
  },
  
  // Configurações de transação
  TRANSACTION: {
    DEFAULT_FEE: 0.000005, // SOL
    MAX_RETRIES: 3,
    CONFIRMATION_TIMEOUT: 60000, // 1 minuto
  },
  
  // Explorador de blockchain
  EXPLORER_URLS: {
    mainnet: 'https://explorer.solana.com',
    testnet: 'https://explorer.solana.com?cluster=testnet',
    devnet: 'https://explorer.solana.com?cluster=devnet',
  },
} as const;

// Configurações de preços (para conversão USD/SOL)
export const PRICE_CONFIG = {
  // Para devnet, usar preços mockados
  MOCK_PRICES: {
    SOL_TO_USD: 180.50,
    UPDATE_INTERVAL: 300000, // 5 minutos
  },
  
  // APIs de preço para mainnet (futuro)
  PRICE_APIS: {
    COINGECKO: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
    COINBASE: 'https://api.coinbase.com/v2/exchange-rates?currency=SOL',
  },
} as const;

// Configurações de UI
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  LOADING_TIMEOUT: 10000,
  
  // Cores do tema
  COLORS: {
    PRIMARY: '#AB9FF3',
    SECONDARY: '#6B46C1',
    SUCCESS: '#22C55E',
    ERROR: '#EF4444',
    WARNING: '#F59E0B',
    BACKGROUND: '#262728',
    SURFACE: '#373737',
    TEXT_PRIMARY: '#FFFFFF',
    TEXT_SECONDARY: '#AAAAAA',
  },
} as const;