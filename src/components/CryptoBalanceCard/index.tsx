// ========================================
// src/components/CryptoBalanceCard/index.tsx
// Card 100% SILENCIOSO - Zero logs de atualização
// ========================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { useBalance } from '../../hooks/useBalance';
import { useRealtimePrices } from '../../hooks/useRealtimePrices';
import { styles } from './styles';

interface CryptoBalanceCardProps {
  publicKey: PublicKey | null;
}

interface DisplayCoin {
  symbol: string;
  name: string;
  icon: any;
  balance: number;
  marketPrice: number;
  priceChange24h: number;
  percentChange24h: number;
  source: 'websocket' | 'api' | 'cache';
}

const CryptoBalanceCard: React.FC<CryptoBalanceCardProps> = ({ publicKey }) => {
  const { balance: solBalance, isLoading: solLoading } = useBalance(publicKey);
  
  // ✨ HOOK DE TEMPO REAL - INCLUINDO BRL
  const {
    prices,
    isConnected,
    error: realtimeError,
    lastUpdate,
    status,
    reconnect
  } = useRealtimePrices(
    ['solana', 'usd-coin', 'brl-token'],
    true
  );

  // ✨ CALCULAR DADOS EM TEMPO REAL (SILENCIOSO)
  const displayCoins: DisplayCoin[] = useMemo(() => {
    const solBalanceValue = solBalance?.balance || 0;
    const solPriceData = prices.get('solana');
    const usdcPriceData = prices.get('usd-coin');
    const brlPriceData = prices.get('brl-token');
    
    // Se não tiver dados essenciais ainda
    if (!solPriceData || !usdcPriceData) {
      return [];
    }

    const solPrice = solPriceData.price;
    const usdcPrice = usdcPriceData.price;
    const solUsdValue = solBalanceValue * solPrice;

    const brlPrice = brlPriceData?.price || 0.19;
    const brlChange24h = brlPriceData?.percentChange24h || 0;
    const brlPriceChange24h = brlPriceData?.priceChange24h || 0;
    const brlSource = brlPriceData?.source || 'cache';

    const coins: DisplayCoin[] = [
      {
        symbol: 'SOL',
        name: 'Solana',
        icon: require('../../../assets/icons/solana.png'),
        balance: solBalanceValue,
        marketPrice: solPrice,
        priceChange24h: solPriceData.priceChange24h,
        percentChange24h: solPriceData.percentChange24h,
        source: solPriceData.source
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        icon: require('../../../assets/icons/usdc.png'),
        balance: solUsdValue,
        marketPrice: usdcPrice,
        priceChange24h: usdcPriceData.priceChange24h,
        percentChange24h: usdcPriceData.percentChange24h,
        source: usdcPriceData.source
      },
      {
        symbol: 'BRL',
        name: 'Real Brasileiro',
        icon: require('../../../assets/icons/brlCOIN.png'),
        balance: solUsdValue / brlPrice,
        marketPrice: brlPrice,
        priceChange24h: brlPriceChange24h,
        percentChange24h: brlChange24h,
        source: brlSource
      }
    ];

    // ✨ SILENCIOSO: Sem nenhum log aqui
    return coins;
  }, [solBalance, prices]);

  // ✨ FORMATAÇÕES
  const formatMarketPrice = (price: number): string => {
    if (price === 0) return 'Conectando...';
    
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    }
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatPriceChange = (priceChange: number, percentChange: number): {
    dollarChange: string;
    percentChangeText: string;
    color: string;
  } => {
    if (priceChange === 0 && percentChange === 0) {
      return {
        dollarChange: '$0.000',
        percentChangeText: '0.00%',
        color: '#888888'
      };
    }

    const sign = priceChange >= 0 ? '+' : '';
    const color = priceChange >= 0 ? '#00D4AA' : '#FF6B6B';
    
    return {
      dollarChange: `${sign}$${Math.abs(priceChange).toFixed(3)}`,
      percentChangeText: `${sign}${percentChange.toFixed(2)}%`,
      color: color
    };
  };

  const getConnectionStatus = (): string => {
    if (!isConnected) return 'Desconectado';
    if (!lastUpdate) return 'Conectando...';
    
    const secondsAgo = Math.floor((Date.now() - lastUpdate) / 1000);
    
    if (secondsAgo < 2) return 'Tempo Real';
    if (secondsAgo < 60) return `${secondsAgo}s atrás`;
    
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m atrás`;
  };

  // ✨ HANDLERS (SILENCIOSOS)
  const handleReconnect = () => {
    // ✨ SILENCIOSO: Reconectar sem log
    reconnect();
  };

  const handleCoinPress = (coin: DisplayCoin) => {
    // ✨ SILENCIOSO: Interação sem log
  };

  if (!publicKey) {
    return null;
  }

  // ✨ ESTADO DE ERRO
  if (realtimeError && !isConnected && displayCoins.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>📡 Conexão WebSocket</Text>
          <Text style={styles.errorMessage}>{realtimeError}</Text>
          <Text style={styles.errorSubtext}>
            Tentando reconectar automaticamente...
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleReconnect}
          >
            <Text style={styles.retryButtonText}>Reconectar Agora</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ✨ LOADING INICIAL
  if (!isConnected && displayCoins.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#AB9FF3" />
          <Text style={styles.loadingText}>Conectando WebSocket...</Text>
          <Text style={styles.loadingSubtext}>
            Binance Stream: SOL + USDC + BRL em tempo real
          </Text>
          <Text style={styles.loadingSubtext}>
            📊 Preços: {status.pricesCount || 0} • 
            👥 Subs: {status.subscribersCount || 0}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.coinsContainer}>
        {displayCoins.map((coin, index) => {
          const changeData = formatPriceChange(coin.priceChange24h, coin.percentChange24h);
          
          return (
            <TouchableOpacity
              key={`${coin.symbol}-${index}`}
              style={[
                styles.coinRow,
                index === displayCoins.length - 1 && styles.lastCoinRow
              ]}
              activeOpacity={0.7}
              onPress={() => handleCoinPress(coin)}
            >
              <View style={styles.coinLeft}>
                <View style={styles.coinIconContainer}>
                  <Image 
                    source={coin.icon}
                    style={styles.coinIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.coinInfo}>
                  <Text style={styles.coinSymbol}>
                    {coin.symbol}
                  </Text>
                  <Text style={styles.marketPrice}>
                    {formatMarketPrice(coin.marketPrice)}
                  </Text>
                </View>
              </View>

              <View style={styles.coinRight}>
                <View style={styles.priceChangeContainer}>
                  <Text style={[
                    styles.dollarChange,
                    { color: changeData.color }
                  ]}>
                    {changeData.dollarChange}
                  </Text>
                  <Text style={[
                    styles.percentChange,
                    { color: changeData.color }
                  ]}>
                    {changeData.percentChangeText}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Overlay de carregamento do saldo SOL */}
      {solLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#AB9FF3" />
          <Text style={styles.loadingText}>Atualizando saldo SOL...</Text>
        </View>
      )}
    </View>
  );
};

export default CryptoBalanceCard;