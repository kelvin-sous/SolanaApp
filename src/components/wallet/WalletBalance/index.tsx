// ========================================
// src/components/wallet/WalletBalance/index.tsx
// Componente para exibir saldo da wallet
// ========================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { useBalance } from '../../../hooks/useBalance';
import { COLORS } from '../../../constants/colors';
import SolanaService from '../../../services/solana/SolanaService';

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
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lamports:</Text>
                <Text style={styles.detailValue}>
                  {balance.balanceLamports.toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rede:</Text>
                <Text style={styles.detailValue}>
                  {balance.network.toUpperCase()}
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
                    // Implementar redirecionamento para faucet
                    console.log('🚰 Redirecionar para faucet');
                  }}
                >
                  <Text style={styles.faucetButtonText}>🚰 Faucet Devnet</Text>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_100,
  },
  refreshButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  balanceContainer: {
    minHeight: 120,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  mainBalance: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    fontFamily: 'monospace',
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  detailsContainer: {
    backgroundColor: COLORS.GRAY_50,
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: 'monospace',
  },
  noBalanceContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.WARNING + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.WARNING + '40',
  },
  noBalanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WARNING,
    marginBottom: 8,
  },
  noBalanceText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  faucetButton: {
    backgroundColor: COLORS.INFO,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  faucetButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ERROR,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default WalletBalance;