import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

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
}

// Novos tipos para criptografia
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

// Tipos para transações (futuro)
export interface PhantomTransactionRequest {
  transaction: string; // serialized transaction, base58-encoded
  session: string;
  sendOptions?: any;
}

export interface PhantomSignedTransactionResponse {
  signature: string;
}