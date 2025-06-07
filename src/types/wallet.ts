// ========================================
// src/types/wallet.ts
// Tipos corrigidos para o wallet
// ========================================

import { PublicKey } from '@solana/web3.js';

// ✨ INTERFACE PARA SALDO DO SOLANA (CORRIGIDA)
export interface SolanaBalance {
  balance: number;
  lamports: number;
  decimals: number;
  uiAmount: number | null;
  uiAmountString: string;
}

export interface WalletInfo {
  publicKey: PublicKey;
  balance: number;
  isConnected: boolean;
  network: SolanaNetwork;
}

export interface WalletTransaction {
  signature: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  timestamp: Date;
  status: WalletTransactionStatus;
  type: WalletTransactionType;
}

export type WalletTransactionStatus = 'pending' | 'confirmed' | 'failed';
export type WalletTransactionType = 'send' | 'receive';
export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta';

export interface SendTransactionParams {
  to: string;
  amount: number;
  memo?: string;
}

export interface WalletTransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}