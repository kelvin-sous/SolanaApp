export const SOLANA_NETWORKS = {
  DEVNET: 'devnet' as const,
  TESTNET: 'testnet' as const,
  MAINNET: 'mainnet-beta' as const,
};

export const RPC_ENDPOINTS = {
  [SOLANA_NETWORKS.DEVNET]: 'https://api.devnet.solana.com',
  [SOLANA_NETWORKS.TESTNET]: 'https://api.testnet.solana.com',
  [SOLANA_NETWORKS.MAINNET]: 'https://api.mainnet-beta.solana.com',
};

export const CURRENT_NETWORK = SOLANA_NETWORKS.DEVNET;