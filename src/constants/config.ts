export const APP_CONFIG = {
  NAME: 'Solana Wallet TCC',
  VERSION: '1.0.0',
  APP_URL: 'https://solana-wallet-tcc.app',
  DEEP_LINK_SCHEME: 'exp',
  TIMEOUT_DURATION: 120000, // 2 minutos
} as const;

export const PHANTOM_CONFIG = {
  CONNECT_URL: 'https://phantom.app/ul/v1/connect',
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
} as const;