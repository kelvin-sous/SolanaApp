// ========================================
// src/hooks/useRealtimePrices.ts
// Hook estável - CORRIGE Maximum update depth exceeded
// ========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import RealtimePriceService from '../services/crypto/RealtimePriceService';

interface CoinPriceData {
  symbol: string;
  price: number;
  priceChange24h: number;
  percentChange24h: number;
  lastUpdated: number;
  source: 'websocket' | 'api' | 'cache';
}

interface UseRealtimePricesReturn {
  prices: Map<string, CoinPriceData>;
  isConnected: boolean;
  error: string | null;
  lastUpdate: number;
  status: any;
  reconnect: () => void;
}

// ✅ EXPORTAÇÃO CORRETA
export const useRealtimePrices = (
  coinIds: string[],
  enabled: boolean = true
): UseRealtimePricesReturn => {
  const [prices, setPrices] = useState<Map<string, CoinPriceData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [status, setStatus] = useState<any>({});
  
  // Refs para evitar re-renders
  const realtimeService = useRef(RealtimePriceService.getInstance());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hookId = useRef(`hook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const coinIdsRef = useRef<string[]>([]);
  const enabledRef = useRef(enabled);

  // ✨ CALLBACK ESTÁVEL - NÃO MUDA
  const handlePriceUpdate = useCallback((newPrices: Map<string, CoinPriceData>) => {
    // ✨ SILENCIOSO: Sem logs para terminal limpo
    
    setPrices(new Map(newPrices));
    setLastUpdate(Date.now());
    setIsConnected(true);
    setError(null);
  }, []);

  // ✨ RECONECTAR - FUNÇÃO ESTÁVEL
  const reconnect = useCallback(() => {
    console.log('🔄 [Hook] Reconnect manual');
    setError(null);
    
    // Limpar subscription atual
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    // Reconectar serviço
    realtimeService.current.disconnect();
    realtimeService.current = RealtimePriceService.getInstance();
    
    // Reinscrever se habilitado
    if (enabledRef.current && coinIdsRef.current.length > 0) {
      setTimeout(() => {
        unsubscribeRef.current = realtimeService.current.subscribe(
          hookId.current,
          coinIdsRef.current,
          handlePriceUpdate
        );
      }, 1000); // Aguardar 1 segundo antes de reinscrever
    }
  }, [handlePriceUpdate]);

  // ✨ EFFECT PRINCIPAL - APENAS QUANDO coinIds REALMENTE MUDAM
  useEffect(() => {
    // Atualizar refs
    enabledRef.current = enabled;
    
    // Verificar se coinIds realmente mudaram
    const coinIdsChanged = JSON.stringify(coinIdsRef.current) !== JSON.stringify(coinIds);
    
    if (!coinIdsChanged && unsubscribeRef.current) {
      return;
    }
    
    coinIdsRef.current = [...coinIds];
    
    if (!enabled || !coinIds.length) {
      // Limpar subscription se existir
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    // Limpar subscription anterior
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    try {
      // Nova subscription
      unsubscribeRef.current = realtimeService.current.subscribe(
        hookId.current,
        coinIds,
        handlePriceUpdate
      );
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ [Hook] Erro na subscription:', errorMessage);
      setError(errorMessage);
      setIsConnected(false);
    }

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [JSON.stringify(coinIds), enabled, handlePriceUpdate]);

  // ✨ STATUS UPDATE - INTERVALO FIXO, SEM DEPENDÊNCIAS PROBLEMÁTICAS
  useEffect(() => {
    if (!enabled) return;

    const updateStatus = () => {
      const serviceStatus = realtimeService.current.getStatus();
      setStatus(serviceStatus);
      setIsConnected(serviceStatus.isConnected);
    };

    // Primeira atualização
    updateStatus();
    
    // Atualizar a cada 15 segundos
    const interval = setInterval(updateStatus, 15000);

    return () => clearInterval(interval);
  }, [enabled]); // Apenas enabled

  // ✨ CLEANUP FINAL
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    prices,
    isConnected,
    error,
    lastUpdate,
    status,
    reconnect
  };
};

// ✅ EXPORTAÇÃO DEFAULT TAMBÉM
export default useRealtimePrices;