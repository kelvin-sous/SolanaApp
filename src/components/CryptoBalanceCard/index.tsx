// ========================================
// src/components/CryptoBalanceCard/index.tsx
// Card para exibir saldos de múltiplas moedas
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { useBalance } from '../../hooks/useBalance';
import SolanaService from '../../services/solana/SolanaService';
import { styles } from './styles';

interface CryptoBalanceCardProps {
  publicKey: PublicKey | null;
}

interface CoinData {
  symbol: string;
  name: string;
  icon: any;
  balance: number;
  usdValue: number;
  change24h: number;
}

const CryptoBalanceCard: React.FC<CryptoBalanceCardProps> = ({ publicKey }) => {
  const { balance: solBalance, isLoading: solLoading } = useBalance(publicKey);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  // Inicializar dados das moedas
  useEffect(() => {
    initializeCoinData();
  }, [solBalance]);

  // Buscar preços a cada 30 segundos
  useEffect(() => {
    if (publicKey) {
      fetchPrices();
      const interval = setInterval(fetchPrices, 30000);
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  const initializeCoinData = () => {
    const solBalanceValue = solBalance?.balance || 0;
    
    const initialCoins: CoinData[] = [
      {
        symbol: 'SOL',
        name: 'Solana',
        icon: require('../../../assets/icons/solana.png'),
        balance: solBalanceValue,
        usdValue: 0,
        change24h: 0
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        icon: require('../../../assets/icons/usdc.png'),
        balance: 0, // Por enquanto 0, pode ser implementado depois
        usdValue: 0,
        change24h: 0
      },
      {
        symbol: 'BRL',
        name: 'Real Brasileiro',
        icon: require('../../../assets/icons/brlCOIN.png'),
        balance: 0,
        usdValue: 0,
        change24h: 0
      }
    ];

    setCoins(initialCoins);
  };

  const fetchPrices = async () => {
    try {
      setIsLoadingPrices(true);
      
      // Buscar preço do SOL
      const solanaService = SolanaService.getInstance();
      const solPrice = await solanaService.getSOLPrice();
      
      // Simular dados para USDC e BRL (você pode implementar APIs reais depois)
      const usdcPrice = 1.00; // USDC sempre ~$1
      const brlRate = 5.20; // Exemplo: 1 USD = 5.20 BRL
      
      const solBalanceValue = solBalance?.balance || 0;
      const solUsdValue = solBalanceValue * solPrice.usd;
      const brlValue = solUsdValue * brlRate;

      setCoins(prevCoins => [
        {
          ...prevCoins[0],
          balance: solBalanceValue,
          usdValue: solUsdValue,
          change24h: getCoinChange('SOL')
        },
        {
          ...prevCoins[1],
          balance: solUsdValue / usdcPrice, // Equivalente em USDC
          usdValue: solUsdValue,
          change24h: getCoinChange('USDC')
        },
        {
          ...prevCoins[2],
          balance: brlValue,
          usdValue: solUsdValue,
          change24h: getCoinChange('BRL')
        }
      ]);

    } catch (error) {
      console.error('❌ Erro ao buscar preços:', error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Simular variação de preço baseada na moeda
  const getCoinChange = (symbol: string) => {
    switch (symbol) {
      case 'SOL':
        // SOL pode ter variações maiores (-10% a +10%)
        return (Math.random() - 0.5) * 20;
      case 'USDC':
        // USDC é estável (-0.5% a +0.5%)
        return (Math.random() - 0.5) * 1;
      case 'BRL':
        // BRL pode variar conforme câmbio (-5% a +5%)
        return (Math.random() - 0.5) * 10;
      default:
        return 0;
    }
  };

  const formatBalance = (balance: number, symbol: string): string => {
    if (symbol === 'BRL') {
      return balance.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    
    if (balance >= 1000) {
      return balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    
    return balance.toFixed(symbol === 'SOL' ? 4 : 2);
  };

  const formatUsdValue = (usdValue: number): string => {
    if (usdValue >= 1000) {
      return `$${(usdValue / 1000).toFixed(1)}K`;
    }
    return `$${usdValue.toFixed(2)}`;
  };

  const formatChange = (change: number, usdValue: number): { percentage: string; valueChange: string } => {
    const sign = change >= 0 ? '+' : '';
    const percentage = `${sign}${change.toFixed(2)}%`;
    
    // Calcular variação em valor absoluto
    const valueChange = (usdValue * change) / 100;
    const formattedValueChange = `${sign}${Math.abs(valueChange).toFixed(2)}`;
    
    return {
      percentage,
      valueChange: formattedValueChange
    };
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? '#00D4AA' : '#FF6B6B';
  };

  if (!publicKey) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Portfólio</Text>
        {isLoadingPrices && (
          <ActivityIndicator size="small" color="#AB9FF3" />
        )}
      </View>

      <View style={styles.coinsContainer}>
        {coins.map((coin, index) => (
          <TouchableOpacity
            key={coin.symbol}
            style={[
              styles.coinRow,
              index === coins.length - 1 && styles.lastCoinRow
            ]}
            activeOpacity={0.7}
            onPress={() => {
              console.log(`📊 Detalhes de ${coin.symbol}`);
              // Aqui você pode implementar navegação para detalhes da moeda
            }}
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
                <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                <Text style={styles.coinBalance}>
                  {formatBalance(coin.balance, coin.symbol)}
                </Text>
              </View>
            </View>

            <View style={styles.coinRight}>
              <View style={styles.coinValueChangeContainer}>
                <Text style={[
                  styles.coinValueChange,
                  { color: getChangeColor(coin.change24h) }
                ]}>
                  {formatChange(coin.change24h, coin.usdValue).valueChange}
                </Text>
                <Text style={[
                  styles.coinChange,
                  { color: getChangeColor(coin.change24h) }
                ]}>
                  {formatChange(coin.change24h, coin.usdValue).percentage}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {solLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#AB9FF3" />
          <Text style={styles.loadingText}>Atualizando saldos...</Text>
        </View>
      )}
    </View>
  );
};

export default CryptoBalanceCard;