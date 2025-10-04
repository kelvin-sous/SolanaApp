// ========================================
// src/hooks/useBalance.ts
// Hook final completo para gerenciar saldo da wallet
// ========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';
import SolanaService from '../services/solana/SolanaService';
import { SolanaBalance } from '../types/wallet';

export interface UseBalanceReturn {
  balance: SolanaBalance | null;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
  lastUpdated: Date | null;
}

export const useBalance = (publicKey: PublicKey | null): UseBalanceReturn => {
  const [balance, setBalance] = useState<SolanaBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Ref para evitar múltiplas requisições simultâneas
  const isLoadingRef = useRef(false);
  
  const solanaService = SolanaService.getInstance();

  // Carrega saldo quando publicKey muda
  useEffect(() => {
    if (publicKey) {
      loadBalance();
    } else {
      resetState();
    }
  }, [publicKey]);

  // Reset do estado quando não há publicKey
  const resetState = useCallback(() => {
    setBalance(null);
    setError(null);
    setLastUpdated(null);
    setIsLoading(false);
    isLoadingRef.current = false;
  }, []);

  const loadBalance = useCallback(async () => {
    if (!publicKey || isLoadingRef.current) {
      console.log('⏸Ignorando carregamento: sem publicKey ou já carregando');
      return;
    }

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      console.log('Carregando saldo para:', publicKey.toString().slice(0, 8) + '...');
      
      const balanceData = await solanaService.getBalance(publicKey);
      
      if (balanceData) {
        setBalance(balanceData);
        setLastUpdated(new Date());
        console.log('Saldo carregado:', balanceData.balance, 'SOL');
      } else {
        throw new Error('Dados de saldo não encontrados');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar saldo';
      console.error('Erro ao carregar saldo:', errorMessage);
      setError(errorMessage);
      
      // Em caso de erro, manter o saldo anterior se existir
      if (!balance) {
        setBalance(null);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [publicKey, solanaService, balance]);

  const refreshBalance = useCallback(async () => {
    console.log('Refresh manual do saldo solicitado');
    await loadBalance();
  }, [loadBalance]);

  const clearError = useCallback(() => {
    console.log('Limpando erro do saldo');
    setError(null);
  }, []);

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    clearError,
    lastUpdated
  };
};