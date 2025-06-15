// ========================================
// src/types/transaction.ts
// Tipos para transações
// ========================================

import { PublicKey } from '@solana/web3.js';

export interface Transaction {
  signature: string;
  from: PublicKey;
  to: PublicKey;
  amount: number;
  fee: number;
  timestamp: Date;
  status: TransactionStatus;
  type: TransactionType;
  memo?: string;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type TransactionType = 'send' | 'receive' | 'swap' | 'stake';

export interface CreateTransactionParams {
  to: string | PublicKey;
  amount: number;
  memo?: string;
}

export interface TransactionFee {
  baseFee: number;
  priorityFee?: number;
  total: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
  transaction?: Transaction;
}

export interface TransactionHistory {
  transactions: Transaction[];
  hasMore: boolean;
  lastSignature?: string;
}