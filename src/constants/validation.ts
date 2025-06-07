// ========================================
// src/constants/validation.ts
// Constantes e funções de validação
// ========================================

export const VALIDATION_RULES = {
  // Valores mínimos e máximos para transações
  TRANSACTION: {
    MIN_USD_AMOUNT: 0.01, // $0.01 mínimo
    MAX_USD_AMOUNT: 10000, // $10,000 máximo para devnet
    MIN_SOL_AMOUNT: 0.000001, // ~1 lamport
    MAX_SOL_AMOUNT: 1000, // 1000 SOL máximo para devnet
  },
  
  // Validações de endereços
  ADDRESS: {
    SOLANA_ADDRESS_LENGTH: 44, // Base58 encoding
    REQUIRED_CHARS: /^[1-9A-HJ-NP-Za-km-z]+$/, // Base58 characters
  },
  
  // Validações de tempo
  TIME: {
    MAX_TRANSACTION_AGE: 5 * 60 * 1000, // 5 minutos
    MIN_TIMESTAMP: Date.now() - (24 * 60 * 60 * 1000), // 24 horas atrás
  },
  
  // Validações de NFC
  NFC: {
    MAX_DATA_SIZE: 8192, // 8KB
    MIN_DATA_SIZE: 100, // 100 bytes
    REQUIRED_FIELDS: [
      'amount',
      'amountSOL', 
      'senderPublicKey',
      'receiverPublicKey',
      'timestamp',
      'nonce'
    ],
  },
} as const;

/**
 * Valida endereço Solana
 */
export function validateSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  if (address.length !== VALIDATION_RULES.ADDRESS.SOLANA_ADDRESS_LENGTH) {
    return false;
  }
  
  return VALIDATION_RULES.ADDRESS.REQUIRED_CHARS.test(address);
}

/**
 * Valida valor da transação
 */
export function validateTransactionAmount(usdAmount: number, solAmount: number): string[] {
  const errors: string[] = [];
  
  if (usdAmount < VALIDATION_RULES.TRANSACTION.MIN_USD_AMOUNT) {
    errors.push(`Valor mínimo: $${VALIDATION_RULES.TRANSACTION.MIN_USD_AMOUNT}`);
  }
  
  if (usdAmount > VALIDATION_RULES.TRANSACTION.MAX_USD_AMOUNT) {
    errors.push(`Valor máximo: $${VALIDATION_RULES.TRANSACTION.MAX_USD_AMOUNT}`);
  }
  
  if (solAmount < VALIDATION_RULES.TRANSACTION.MIN_SOL_AMOUNT) {
    errors.push(`Valor SOL muito pequeno`);
  }
  
  if (solAmount > VALIDATION_RULES.TRANSACTION.MAX_SOL_AMOUNT) {
    errors.push(`Valor SOL muito grande`);
  }
  
  return errors;
}

/**
 * Valida timestamp da transação
 */
export function validateTransactionTimestamp(timestamp: number): boolean {
  const now = Date.now();
  const age = now - timestamp;
  
  return age >= 0 && age <= VALIDATION_RULES.TIME.MAX_TRANSACTION_AGE;
}