// ========================================
// src/hooks/useBalance.ts
// Hook para gerenciar saldo da wallet
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import SolanaService, { SolanaBalance } from '../services/solana/SolanaService';

export interface UseBalanceReturn {
  balance: SolanaBalance | null;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
}

export const useBalance = (publicKey: PublicKey | null): UseBalanceReturn => {
  const [balance, setBalance] = useState<SolanaBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const solanaService = SolanaService.getInstance();

  // Carrega saldo quando publicKey muda
  useEffect(() => {
    if (publicKey) {
      loadBalance();
    } else {
      setBalance(null);
      setError(null);
    }
  }, [publicKey]);

  const loadBalance = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      setError(null);

      const balanceData = await solanaService.getBalance(publicKey);
      setBalance(balanceData);
      
      console.log('💰 Saldo carregado:', balanceData.balance, 'SOL');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar saldo';
      console.error('❌ Erro ao carregar saldo:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, solanaService]);

  const refreshBalance = useCallback(async () => {
    await loadBalance();
  }, [loadBalance]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    clearError
  };
};