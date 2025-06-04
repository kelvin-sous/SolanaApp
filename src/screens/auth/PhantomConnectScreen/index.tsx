// ========================================
// src/screens/auth/PhantomConnectScreen/index.tsx
// Novo design baseado no Figma
// ========================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { usePhantom } from '../../../hooks/usePhantom';
import PhantomService from '../../../services/phantom/PhantomService';
import WalletBalance from '../../../components/wallet/WalletBalance';

const PhantomConnectScreen: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    publicKey,
    connectOrDownload,
    disconnect,
    error,
    clearError
  } = usePhantom();

  // Função de teste para deep linking (temporária)
  const testDeepLink = async () => {
    const phantomServiceInstance = PhantomService.getInstance();
    await phantomServiceInstance.testDeepLink();
  };

  // Handler principal - sempre tenta conectar
  const handleConnect = async () => {
    try {
      clearError();

      console.log('🔘 Usuário clicou em conectar');
      const result = await connectOrDownload();

      switch (result) {
        case 'CONNECTED':
          Alert.alert(
            '🎉 Conectado!',
            'Phantom Wallet conectada com sucesso!\n\nAgora você pode fazer transações na blockchain Solana.',
            [{ text: 'Perfeito!', style: 'default' }]
          );
          break;

        case 'DOWNLOAD_NEEDED':
          Alert.alert(
            '📱 Phantom Wallet',
            'A Phantom Wallet não foi encontrada no seu dispositivo.\n\nA página de download foi aberta. Após instalar, volte aqui e tente novamente.',
            [{ text: 'Entendi', style: 'default' }]
          );
          break;

        case 'ERROR':
          Alert.alert(
            '❌ Erro na Conexão',
            'Ocorreu um erro ao tentar conectar. Verifique os detalhes no console e tente novamente.',
            [{ text: 'OK', style: 'default' }]
          );
          break;
      }
    } catch (error) {
      console.error('❌ Erro no handleConnect:', error);
      Alert.alert(
        '❌ Erro Inesperado',
        'Ocorreu um erro inesperado. Tente novamente.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Handler para desconectar
  const handleDisconnect = () => {
    Alert.alert(
      '🔌 Desconectar Wallet',
      'Tem certeza que deseja desconectar sua Phantom Wallet?\n\nVocê precisará conectar novamente para fazer transações.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnect();
              Alert.alert('✅ Desconectado', 'Phantom Wallet desconectada com sucesso.');
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao desconectar. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  // Estado conectado
  if (isConnected && publicKey) {
    return (
      <SafeAreaView style={styles.connectedContainer}>
        <StatusBar style="dark" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.connectedHeader}>
            <Text style={styles.connectedTitle}>🎉 Conectada!</Text>
            <Text style={styles.connectedSubtitle}>
              Phantom Wallet conectada com sucesso
            </Text>
          </View>

          <View style={styles.walletCard}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✅</Text>
            </View>

            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Endereço da Wallet:</Text>
              <Text style={styles.walletAddressFull}>
                {publicKey.toString()}
              </Text>

              <Text style={styles.walletLabel}>Endereço Resumido:</Text>
              <Text style={styles.walletAddress}>
                {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>🟢 Conectado à Rede Devnet</Text>
            </View>
          </View>

          {/* Componente de Saldo */}
          <WalletBalance
            publicKey={publicKey}
            onRefresh={() => console.log('💰 Saldo atualizado!')}
          />

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => Alert.alert('🚀 Em Breve', 'Funcionalidades de transação em desenvolvimento!')}
            >
              <Text style={styles.primaryButtonText}>💸 Fazer Transação</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Alert.alert('📊 Em Breve', 'Histórico de transações em desenvolvimento!')}
            >
              <Text style={styles.secondaryButtonText}>📊 Ver Histórico</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectButtonText}>🔌 Desconectar Wallet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Estado de login (design do Figma)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>FAÇA LOGIN COM SUA</Text>
          <Text style={styles.title}>PHANTOM WALLET</Text>
        </View>

        <View style={styles.cardContainer}>
          {/* Card Branco de Fundo */}
          <View style={styles.whiteCard}>
            {/* Card Principal Phantom */}
            <View style={styles.phantomCard}>
              <View style={styles.phantomHeader}>
                <View>
                  <Image
                    source={require('../../../../assets/icons/phantom.png')}
                    style={styles.phantomIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.phantomTitle}>PHANTOM</Text>
              </View>

              <TouchableOpacity
                style={[styles.connectButton, isConnecting && styles.buttonDisabled]}
                onPress={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <View style={styles.loadingInline}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.connectButtonText}>Conectando...</Text>
                  </View>
                ) : (
                  <Text style={styles.connectButtonText}>Conectar Phantom</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.downloadLink}>
                <Text style={styles.downloadText}>NÃO TENHO PHANTOM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton}>
            <Text style={styles.footerText}>CONTATO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Text style={styles.footerText}>PHANTOM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Text style={styles.footerText}>SUPORTE</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>❌ Erro</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.errorButton} onPress={clearError}>
              <Text style={styles.errorButtonText}>Limpar Erro</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Estilos para tela de login (design Figma)
  phantomIconImage: {
    width: 40,
    height: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#262728',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteCard: {
    position: 'absolute',
    top: 100,
    left: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    width: '95%',
    maxWidth: 340,
    height: '95%',
    maxHeight: 305,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  phantomCard: {
    position: 'absolute',
    top: -20,
    left: 30,
    backgroundColor: '#AB9FF3',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },

  phantomHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  phantomIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  phantomIcon: {
    fontSize: 32,
  },
  phantomTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  connectButton: {
    backgroundColor: '#373737',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#555555',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadLink: {
    padding: 8,
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 30,
  },
  footerButton: {
    padding: 12,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Estilos para estado conectado
  connectedContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  connectedHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  connectedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  connectedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  walletCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconText: {
    fontSize: 48,
  },
  walletInfo: {
    marginBottom: 20,
  },
  walletLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  walletAddressFull: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  walletAddress: {
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    textAlign: 'center',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PhantomConnectScreen;