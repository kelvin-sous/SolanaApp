// ========================================
// src/hooks/useBalance.ts
// Hook para gerenciar saldo da wallet
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import SolanaService, { SolanaBalance } from '../services/solana/SolanaService';

export interface UseBalanceReturn {
  // Estado
  balance: SolanaBalance | null;
  isLoading: boolean;
  error: string | null;
  
  // Ações
  refreshBalance: () => Promise<void>;
  clearError: () => void;
}

export const useBalance = (publicKey: PublicKey | null): UseBalanceReturn => {
  const [balance, setBalance] = useState<SolanaBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const solanaService = SolanaService.getInstance();

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Buscar saldo
  const fetchBalance = useCallback(async (pubKey: PublicKey) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('💰 Buscando saldo para:', pubKey.toString().slice(0, 8) + '...');
      
      const balanceData = await solanaService.getBalance(pubKey);
      setBalance(balanceData);
      
      console.log('✅ Saldo atualizado:', balanceData.balance, 'SOL');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar saldo';
      setError(errorMessage);
      console.error('❌ Erro ao buscar saldo:', err);
    } finally {
      setIsLoading(false);
    }
  }, [solanaService]);

  // Função para atualizar saldo manualmente
  const refreshBalance = useCallback(async () => {
    if (publicKey) {
      await fetchBalance(publicKey);
    }
  }, [publicKey, fetchBalance]);

  // Buscar saldo quando a chave pública mudar
  useEffect(() => {
    if (publicKey) {
      fetchBalance(publicKey);
    } else {
      // Limpar saldo quando não há chave pública
      setBalance(null);
      setError(null);
    }
  }, [publicKey, fetchBalance]);

  // Auto-refresh a cada 30 segundos quando conectado
  useEffect(() => {
    if (!publicKey || isLoading) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh do saldo...');
      fetchBalance(publicKey);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [publicKey, isLoading, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    clearError
  };
};

export default useBalance;