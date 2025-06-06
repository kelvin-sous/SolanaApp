// ========================================
// src/constants/networks.ts
// Configurações de rede Solana
// ========================================

import { SOLANA_CONFIG } from './config';

export const SOLANA_NETWORKS = {
  mainnet: 'mainnet-beta',
  testnet: 'testnet', 
  devnet: 'devnet'
} as const;

export type SolanaNetwork = keyof typeof SOLANA_NETWORKS;

export const RPC_ENDPOINTS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  testnet: 'https://api.testnet.solana.com',
  devnet: 'https://api.devnet.solana.com'
} as const;

// Rede atual (importada da config)
export const CURRENT_NETWORK = SOLANA_CONFIG.NETWORK;

// Configurações específicas por rede
export const NETWORK_CONFIG = {
  mainnet: {
    name: 'Mainnet Beta',
    shortName: 'Mainnet',
    rpcEndpoint: RPC_ENDPOINTS.mainnet,
    explorerUrl: 'https://explorer.solana.com',
    isMainnet: true,
    chainId: 101,
  },
  testnet: {
    name: 'Testnet',
    shortName: 'Testnet', 
    rpcEndpoint: RPC_ENDPOINTS.testnet,
    explorerUrl: 'https://explorer.solana.com?cluster=testnet',
    isMainnet: false,
    chainId: 102,
  },
  devnet: {
    name: 'Devnet',
    shortName: 'Devnet',
    rpcEndpoint: RPC_ENDPOINTS.devnet,
    explorerUrl: 'https://explorer.solana.com?cluster=devnet',
    isMainnet: false,
    chainId: 103,
  },
} as const;

// Função para obter configuração da rede atual
export function getCurrentNetworkConfig() {
  return NETWORK_CONFIG[CURRENT_NETWORK];
}

// Função para obter URL do explorador para uma transação
export function getExplorerUrl(signature: string, network: SolanaNetwork = CURRENT_NETWORK) {
  const config = NETWORK_CONFIG[network];
  return `${config.explorerUrl}/tx/${signature}`;
}

// Função para obter URL do explorador para um endereço
export function getExplorerAddressUrl(address: string, network: SolanaNetwork = CURRENT_NETWORK) {
  const config = NETWORK_CONFIG[network];
  return `${config.explorerUrl}/address/${address}`;
}