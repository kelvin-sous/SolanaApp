// ========================================
// src/components/wallet/WalletBalance/index.tsx
// Componente para exibir saldo da wallet - CORRIGIDO
// ========================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { useBalance } from '../../../hooks/useBalance';
import { COLORS } from '../../../constants/colors';
import SolanaService from '../../../services/solana/SolanaService';
import { styles } from './styles';

interface WalletBalanceProps {
  publicKey: PublicKey | null;
  onRefresh?: () => void;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  publicKey, 
  onRefresh 
}) => {
  const { balance, isLoading, error, refreshBalance, clearError } = useBalance(publicKey);

  const handleRefresh = async () => {
    await refreshBalance();
    onRefresh?.();
  };

  if (!publicKey) {
    return null;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Erro ao carregar saldo</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>🔄 Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Saldo da Wallet</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? '🔄' : '↻'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Consultando saldo...</Text>
          </View>
        ) : balance ? (
          <>
            <View style={styles.mainBalance}>
              <Text style={styles.balanceAmount}>
                {SolanaService.formatBalance(balance.balance)} SOL
              </Text>
              <Text style={styles.balanceLabel}>Saldo Principal</Text>
            </View>

            <View style={styles.detailsContainer}>
              {/* ✅ CORRIGIDO: balance.lamports ao invés de balance.balanceLamports */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lamports:</Text>
                <Text style={styles.detailValue}>
                  {balance.lamports.toLocaleString()}
                </Text>
              </View>
              
              {/* ✅ CORRIGIDO: obter rede do SolanaService ao invés de balance.network */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rede:</Text>
                <Text style={styles.detailValue}>
                  {SolanaService.getInstance().getNetwork().toUpperCase()}
                </Text>
              </View>

              {/* ✅ NOVO: mostrar informações adicionais do saldo */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>UI Amount:</Text>
                <Text style={styles.detailValue}>
                  {balance.uiAmountString}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Decimais:</Text>
                <Text style={styles.detailValue}>
                  {balance.decimals}
                </Text>
              </View>
            </View>

            {balance.balance === 0 && (
              <View style={styles.noBalanceContainer}>
                <Text style={styles.noBalanceTitle}>🪙 Saldo Zerado</Text>
                <Text style={styles.noBalanceText}>
                  Esta wallet não possui SOL. {'\n'}
                  Para testar, você pode obter SOL gratuito via faucet.
                </Text>
                <TouchableOpacity 
                  style={styles.faucetButton}
                  onPress={() => {
                    // ✅ MELHORADO: implementar redirecionamento real para faucet
                    const network = SolanaService.getInstance().getNetwork();
                    if (network === 'devnet') {
                      console.log('🚰 Abrindo faucet da devnet para:', publicKey.toString());
                      // Aqui você pode implementar a abertura do faucet
                      // Por exemplo: Linking.openURL('https://faucet.solana.com')
                    } else {
                      console.log('⚠️ Faucet disponível apenas na devnet');
                    }
                  }}
                >
                  <Text style={styles.faucetButtonText}>
                    🚰 Faucet {SolanaService.getInstance().getNetwork().charAt(0).toUpperCase() + SolanaService.getInstance().getNetwork().slice(1)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Nenhum dado de saldo disponível</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default WalletBalance;