// ========================================
// src/types/phantom.ts
// Tipos para integração com Phantom - Atualizado com NFC
// ========================================

import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

// ========================================
// Tipos básicos de conexão
// ========================================

export interface PhantomConnectResponse {
  public_key: string;
  session: string;
}

export interface PhantomSession {
  publicKey: PublicKey;
  session: string;
  dappKeyPair: nacl.BoxKeyPair;
  sharedSecret: Uint8Array;
  phantomEncryptionPublicKey: string;
}

export interface PhantomConnectionData {
  dappKeyPair: nacl.BoxKeyPair;
  resolve: (value: PhantomSession) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export type PhantomConnectionResult = 'CONNECTED' | 'DOWNLOAD_NEEDED' | 'ERROR';

export interface PhantomServiceConfig {
  connectUrl: string;
  appUrl: string;
  sessionStorageKey: string;
  downloadUrls: {
    ios: string;
    android: string;
    web: string;
  };
}

export interface PhantomEventData {
  phantom_encryption_public_key?: string;
  nonce?: string;
  data?: string;
  errorCode?: string;
  errorMessage?: string;
  signature?: string;
  transaction?: string;
}

// ========================================
// Tipos de criptografia
// ========================================

export interface EncryptedPayload {
  nonce: string;
  data: string;
}

export interface DecryptedConnectData {
  public_key: string;
  session: string;
}

export interface PhantomError {
  errorCode: string;
  errorMessage: string;
}

// ========================================
// Tipos de transações
// ========================================

export interface PhantomTransactionRequest {
  transaction: string; // serialized transaction, base58-encoded
  session: string;
  sendOptions?: PhantomSendOptions;
}

export interface PhantomSignTransactionRequest {
  transaction: string; // serialized transaction, base58-encoded
  session: string;
}

export interface PhantomSignMessageRequest {
  message: string; // message to sign, base58-encoded
  session: string;
  display?: 'utf8' | 'hex'; // how to display the message
}

export interface PhantomSendOptions {
  skipPreflight?: boolean;
  preflightCommitment?: string;
  maxRetries?: number;
}

export interface PhantomSignedTransactionResponse {
  signature: string;
}

export interface PhantomSignedMessageResponse {
  signature: string;
}

export interface PhantomTransactionResponse {
  transaction: string; // signed serialized transaction, base58-encoded
}

// ========================================
// Tipos específicos para NFC
// ========================================

export interface PhantomNFCTransactionData {
  // Dados da transação
  amount: number; // Valor em USD
  amountSOL: number; // Valor em SOL
  senderPublicKey: string;
  receiverPublicKey: string;
  
  // Metadados
  timestamp: number;
  nonce: string; // Para prevenir replay attacks
  solPrice: number; // Preço do SOL no momento da transação
  
  // Informações da rede
  network: 'mainnet-beta' | 'testnet' | 'devnet';
  
  // Hash de verificação (opcional)
  dataHash?: string;
}

export interface PhantomNFCTransactionResult {
  success: boolean;
  transactionData?: PhantomNFCTransactionData;
  signature?: string;
  error?: string;
  errorCode?: string;
}

// ========================================
// Tipos de status e controle
// ========================================

export type PhantomNFCStatus = 
  | 'IDLE'
  | 'INITIALIZING'
  | 'SEARCHING' 
  | 'CONNECTED' 
  | 'SENDING_DATA' 
  | 'RECEIVING_DATA' 
  | 'CONFIRMING' 
  | 'PROCESSING_TRANSACTION' 
  | 'SUCCESS' 
  | 'ERROR'
  | 'CANCELLED';

export interface PhantomNFCStatusCallback {
  onStatusChange: (status: PhantomNFCStatus, message?: string) => void;
  onDataReceived?: (data: PhantomNFCTransactionData) => void;
  onTransactionComplete?: (result: PhantomNFCTransactionResult) => void;
  onError?: (error: PhantomError) => void;
}

// ========================================
// Tipos de configuração e validação
// ========================================

export interface PhantomNFCConfig {
  maxDataSize: number;
  connectionTimeout: number;
  transactionTimeout: number;
  retryAttempts: number;
  
  // Validações
  validateAddresses: boolean;
  validateAmounts: boolean;
  validateTimestamps: boolean;
  
  // Configurações de segurança
  requireManualConfirmation: boolean;
  maxTransactionAge: number; // em milliseconds
}

export interface PhantomTransactionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ========================================
// Tipos utilitários
// ========================================

export interface PhantomWalletInfo {
  publicKey: string;
  balance: number; // em SOL
  network: string;
  isConnected: boolean;
}

export interface PhantomNetworkInfo {
  network: string;
  endpoint: string;
  version?: string;
  currentSlot?: number;
}

export interface PhantomPriceData {
  solToUsd: number;
  usdToSol: number;
  lastUpdated: number;
  source: string;
}

// ========================================
// Tipos de eventos do sistema
// ========================================

export interface PhantomConnectEvent {
  type: 'CONNECT_SUCCESS' | 'CONNECT_ERROR' | 'CONNECT_CANCELLED';
  data?: PhantomSession | PhantomError;
}

export interface PhantomTransactionEvent {
  type: 'TRANSACTION_SIGNED' | 'TRANSACTION_SENT' | 'TRANSACTION_CONFIRMED' | 'TRANSACTION_ERROR';
  data?: {
    signature?: string;
    transaction?: string;
    error?: PhantomError;
  };
}

export interface PhantomNFCEvent {
  type: 'NFC_CONNECTED' | 'NFC_DATA_RECEIVED' | 'NFC_TRANSACTION_COMPLETE' | 'NFC_ERROR';
  data?: PhantomNFCTransactionData | PhantomNFCTransactionResult | PhantomError;
}

// ========================================
// Union types para facilitar uso
// ========================================

export type PhantomEvent = PhantomConnectEvent | PhantomTransactionEvent | PhantomNFCEvent;

export type PhantomOperationResult = PhantomSession | PhantomNFCTransactionResult | PhantomError;

export type PhantomRequestType = 
  | 'connect'
  | 'signAndSendTransaction'
  | 'signTransaction'
  | 'signMessage'
  | 'nfcTransfer';

// ========================================
// Interfaces para hooks
// ========================================

export interface UsePhantomReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  publicKey: PublicKey | null;
  session: PhantomSession | null;
  connect: () => Promise<'CONNECTED' | 'DOWNLOAD_NEEDED'>;
  disconnect: () => Promise<void>;
  testDeepLink: () => Promise<void>;
}

export interface UseNFCReturn {
  status: PhantomNFCStatus;
  message: string | null;
  isActive: boolean;
  currentTransactionData: PhantomNFCTransactionData | null;
  estimatedFee: number | null;
  
  startSending: (amountUSD: number, receiverPublicKey: string) => Promise<void>;
  startReceiving: () => Promise<void>;
  confirmTransaction: (accept: boolean) => Promise<void>;
  stop: () => Promise<void>;
  checkNFCStatus: () => Promise<{ supported: boolean; enabled: boolean; error?: string }>;
  
  onTransactionComplete?: (result: PhantomNFCTransactionResult) => void;
}