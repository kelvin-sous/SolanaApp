// ========================================
// src/hooks/useCryptoPrices.ts
// Hook otimizado para evitar rate limit
// ========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import CryptoPriceService from '../services/crypto/CryptoPriceService';

interface CoinPriceData {
  symbol: string;
  price: number;
  priceChange24h: number;
  percentChange24h: number;
  lastUpdated: number;
}

interface UseCryptoPricesReturn {
  prices: Map<string, CoinPriceData>;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  refreshPrices: () => Promise<void>;
  clearError: () => void;
  cacheStatus: any;
}

export const useCryptoPrices = (
  coinIds: string[],
  updateInterval: number = 30000, // ✨ MUDADO: 30 segundos (era 3)
  autoUpdate: boolean = true
): UseCryptoPricesReturn => {
  const [prices, setPrices] = useState<Map<string, CoinPriceData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [cacheStatus, setCacheStatus] = useState<any>({});
  
  const priceService = useRef(CryptoPriceService.getInstance());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // ✨ FUNÇÃO OTIMIZADA PARA BUSCAR PREÇOS
  const fetchPrices = useCallback(async () => {
    if (!coinIds.length) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 [Hook] Iniciando busca otimizada para:', coinIds);
      
      // Buscar preços crypto + taxa BRL
      const [cryptoPrices, brlRate] = await Promise.all([
        priceService.current.getCoinPrices(coinIds),
        priceService.current.getBRLExchangeRate()
      ]);

      // ✨ CRIAR DADOS BRL SINTÉTICO
      const solData = cryptoPrices.get('solana');
      if (solData) {
        const brlData = priceService.current.createBRLData(solData, brlRate);
        cryptoPrices.set('brl-token', brlData);
        console.log(`🇧🇷 [Hook] BRL criado: $${brlData.price.toFixed(4)} (${brlData.percentChange24h.toFixed(2)}%)`);
      }
      
      if (isMountedRef.current) {
        setPrices(new Map(cryptoPrices));
        setLastUpdate(Date.now());
        setCacheStatus(priceService.current.getServiceStatus());
        
        console.log('✅ [Hook] Preços atualizados:', {
          moedas: cryptoPrices.size,
          temSOL: cryptoPrices.has('solana'),
          temUSDC: cryptoPrices.has('usd-coin'),
          temBRL: cryptoPrices.has('brl-token')
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ [Hook] Erro na busca:', errorMessage);
      
      if (isMountedRef.current) {
        setError(errorMessage);
        // Manter preços anteriores em caso de erro (não limpar)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [coinIds]);

  // ✨ REFRESH MANUAL COM DEBOUNCE
  const refreshPrices = useCallback(async () => {
    // Evitar múltiplos refreshes rápidos
    if (isLoading) {
      console.log('⏳ [Hook] Refresh já em andamento, ignorando...');
      return;
    }
    
    console.log('🔄 [Hook] Refresh manual solicitado');
    await fetchPrices();
  }, [fetchPrices, isLoading]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✨ CONFIGURAR INTERVALOS OTIMIZADOS
  useEffect(() => {
    if (!autoUpdate || !coinIds.length) {
      console.log('⏸️ [Hook] Auto-update desabilitado');
      return;
    }

    console.log(`⏰ [Hook] Configurando intervalo: ${updateInterval / 1000}s`);

    // Buscar imediatamente
    fetchPrices();

    // Configurar intervalo mais conservador
    if (updateInterval > 0) {
      intervalRef.current = setInterval(() => {
        console.log('⏰ [Hook] Intervalo disparado - verificando cache...');
        fetchPrices();
      }, updateInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('⏹️ [Hook] Intervalo limpo');
      }
    };
  }, [fetchPrices, updateInterval, autoUpdate]);

  // ✨ CLEANUP
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ✨ LOG DE STATUS DETALHADO
  useEffect(() => {
    if (prices.size > 0 || error) {
      const status = {
        moedas: prices.size,
        ultimaAtualizacao: lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Nunca',
        temErro: !!error,
        carregando: isLoading,
        cache: cacheStatus,
        precos: Array.from(prices.entries()).map(([id, data]) => ({
          id,
          symbol: data.symbol,
          price: `$${data.price.toFixed(4)}`,
          change: `${data.percentChange24h.toFixed(2)}%`
        }))
      };
      
      console.log('📊 [Hook] Status completo:', status);
    }
  }, [prices, lastUpdate, error, isLoading, cacheStatus]);

  return {
    prices,
    isLoading,
    error,
    lastUpdate,
    refreshPrices,
    clearError,
    cacheStatus
  };
};

export default useCryptoPrices;