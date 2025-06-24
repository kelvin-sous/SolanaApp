// ========================================
// src/hooks/useTransfers.ts
// Hook para gerenciar transferências
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import TransferService, { Transfer, TransferFilter } from '../services/database/TransferService';

interface UseTransfersReturn {
  transfers: Transfer[];
  isLoading: boolean;
  error: string | null;
  stats: {
    totalSent: number;
    totalReceived: number;
    totalTransactions: number;
    pendingCount: number;
  };
  
  // Funções
  refreshTransfers: () => Promise<void>;
  saveTransfer: (transfer: Omit<Transfer, 'id' | 'created_at' | 'updated_at'>) => Promise<Transfer>;
  updateTransferStatus: (signature: string, status: 'confirmed' | 'failed') => Promise<void>;
  clearError: () => void;
}

export const useTransfers = (
  publicKey: PublicKey | null,
  filters: Omit<TransferFilter, 'address'> = { limit: 50 }
): UseTransfersReturn => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    totalTransactions: 0,
    pendingCount: 0
  });

  const transferService = TransferService.getInstance();

  // ✨ BUSCAR TRANSFERÊNCIAS
  const refreshTransfers = useCallback(async () => {
    if (!publicKey) {
      setTransfers([]);
      setStats({
        totalSent: 0,
        totalReceived: 0,
        totalTransactions: 0,
        pendingCount: 0
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const address = publicKey.toString();
      console.log('🔄 [useTransfers] Buscando transferências...');

      // Buscar transferências e estatísticas em paralelo
      const [transfersData, statsData] = await Promise.all([
        transferService.getTransfersByAddress(address, filters),
        transferService.getTransferStats(address)
      ]);

      setTransfers(transfersData);
      setStats(statsData);

      console.log('✅ [useTransfers] Dados carregados:', {
        transfers: transfersData.length,
        stats: statsData
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar transferências';
      console.error('❌ [useTransfers] Erro:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, JSON.stringify(filters)]);

  // ✨ SALVAR NOVA TRANSFERÊNCIA
  const saveTransfer = useCallback(async (
    transfer: Omit<Transfer, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Transfer> => {
    try {
      console.log('💾 [useTransfers] Salvando transferência...');
      
      const savedTransfer = await transferService.saveTransfer(transfer);
      
      // Atualizar lista local
      setTransfers(prev => [savedTransfer, ...prev]);
      
      // Atualizar estatísticas
      if (publicKey) {
        const newStats = await transferService.getTransferStats(publicKey.toString());
        setStats(newStats);
      }

      console.log('✅ [useTransfers] Transferência salva');
      return savedTransfer;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar transferência';
      console.error('❌ [useTransfers] Erro ao salvar:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, [publicKey]);

  // ✨ ATUALIZAR STATUS
  const updateTransferStatus = useCallback(async (
    signature: string, 
    status: 'confirmed' | 'failed'
  ) => {
    try {
      console.log('🔄 [useTransfers] Atualizando status:', { signature: signature.slice(0, 8) + '...', status });

      const confirmedAt = status === 'confirmed' ? new Date() : undefined;
      await transferService.updateTransferStatus(signature, status, confirmedAt);

      // Atualizar lista local
      setTransfers(prev => 
        prev.map(transfer => 
          transfer.transaction_signature === signature 
            ? { ...transfer, status, confirmed_at: confirmedAt?.toISOString() }
            : transfer
        )
      );

      // Atualizar estatísticas
      if (publicKey) {
        const newStats = await transferService.getTransferStats(publicKey.toString());
        setStats(newStats);
      }

      console.log('✅ [useTransfers] Status atualizado');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
      console.error('❌ [useTransfers] Erro ao atualizar:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, [publicKey]);

  // ✨ LIMPAR ERRO
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✨ CARREGAR DADOS INICIAL
  useEffect(() => {
    refreshTransfers();
  }, [refreshTransfers]);

  // ✨ RECARREGAR A CADA 30 SEGUNDOS (PARA PEGAR CONFIRMAÇÕES)
  useEffect(() => {
    if (!publicKey) return;

    const interval = setInterval(() => {
      // Só recarregar se tiver transferências pendentes
      const hasPending = transfers.some(t => t.status === 'pending');
      if (hasPending) {
        console.log('🔄 [useTransfers] Recarregando (transferências pendentes)');
        refreshTransfers();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [publicKey, transfers, refreshTransfers]);

  // ✨ LOG DE STATUS
  useEffect(() => {
    if (transfers.length > 0) {
      console.log('📊 [useTransfers] Status atual:', {
        total: transfers.length,
        pending: transfers.filter(t => t.status === 'pending').length,
        confirmed: transfers.filter(t => t.status === 'confirmed').length,
        failed: transfers.filter(t => t.status === 'failed').length,
        stats
      });
    }
  }, [transfers, stats]);

  return {
    transfers,
    isLoading,
    error,
    stats,
    refreshTransfers,
    saveTransfer,
    updateTransferStatus,
    clearError
  };
};

export default useTransfers;