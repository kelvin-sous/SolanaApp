// ========================================
// src/screens/main/NFCReceiveScreen/index.tsx
// Tela de recebimento via NFC - COMPLETA
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { usePhantom } from '../../../hooks/usePhantom';
import { useBalance } from '../../../hooks/useBalance';
import { useTransfers } from '../../../hooks/useTransfers';
import useNFC from '../../../hooks/useNFC';
import NFCConnectionAnimation from '../../../components/NFC/NFCConnectionAnimation';
import NFCStatusIndicator from '../../../components/NFC/NFCStatusIndicator';
import NFCTransactionPreview from '../../../components/NFC/NFCTransactionPreview';
import { NFCTransactionData, NFCOperationStatus } from '../../../types/nfc';
import { formatAddress, formatSOL, formatUSD } from '../../../utils/explorer';
import { styles } from './styles';

interface NFCReceiveScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
  session?: any;
}

const NFCReceiveScreen: React.FC<NFCReceiveScreenProps> = ({
  onBack,
  publicKey,
  session
}) => {
  // ========================================
  // HOOKS E ESTADO
  // ========================================
  
  const { isConnected } = usePhantom();
  const { balance, refreshBalance } = useBalance(publicKey);
  const { saveTransfer, updateTransferStatus } = useTransfers(publicKey);
  
  const {
    status,
    message,
    isActive,
    error,
    currentTransactionData,
    estimatedFee,
    confirmationRequired,
    startReceiving,
    confirmTransaction,
    stop,
    clearError,
    checkNFCStatus,
    isNFCAvailable,
    setOnTransactionComplete
  } = useNFC();

  const [nfcStatus, setNfcStatus] = useState<{ supported: boolean; enabled: boolean; error?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    initializeNFCStatus();
    setupTransactionCompleteHandler();
    setupBackHandler();

    return () => {
      // Cleanup ao desmontar
      stop();
    };
  }, []);

  const initializeNFCStatus = async () => {
    try {
      const status = await checkNFCStatus();
      setNfcStatus(status);
      
      if (!status.supported || !status.enabled) {
        Alert.alert(
          'NFC Não Disponível',
          status.error || 'NFC não está disponível neste dispositivo',
          [
            { text: 'OK', onPress: onBack }
          ]
        );
      }
    } catch (err) {
      console.error('❌ Erro ao verificar NFC:', err);
      Alert.alert(
        'Erro NFC',
        'Não foi possível verificar o status do NFC',
        [{ text: 'OK', onPress: onBack }]
      );
    }
  };

  const setupTransactionCompleteHandler = () => {
    setOnTransactionComplete(async (result) => {
      try {
        console.log('🎉 Transação NFC concluída:', result);
        
        if (result.success && result.signature && result.transactionData) {
          // Salvar no banco de dados
          await saveTransfer({
            transaction_signature: result.signature,
            from_address: result.transactionData.senderPublicKey,
            to_address: result.transactionData.receiverPublicKey,
            amount_sol: result.transactionData.amountSOL,
            amount_usd: result.transactionData.amount,
            fee_sol: estimatedFee || 0.000005,
            status: 'confirmed',
            transfer_type: 'receive',
            memo: result.transactionData.memo,
            network: 'devnet'
          });

          // Atualizar saldo
          await refreshBalance();

          Alert.alert(
            '🎉 Pagamento Recebido!',
            `✅ Você recebeu ${formatUSD(result.transactionData.amount)} (${formatSOL(result.transactionData.amountSOL)})!\n\n` +
            `📧 De: ${formatAddress(result.transactionData.senderPublicKey)}\n` +
            `🔗 Signature: ${result.signature.slice(0, 8)}...\n\n` +
            `💰 Seu novo saldo será atualizado em instantes.`,
            [
              {
                text: 'Ver Explorer',
                onPress: () => {
                  console.log('🔗 Explorer URL:', `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`);
                }
              },
              {
                text: 'Concluir',
                onPress: onBack
              }
            ]
          );
        }
      } catch (err) {
        console.error('❌ Erro ao processar transação completa:', err);
      }
    });
  };

  const setupBackHandler = () => {
    const backAction = () => {
      if (isActive) {
        Alert.alert(
          'Cancelar Operação NFC',
          'Deseja realmente cancelar o recebimento NFC?',
          [
            { text: 'Não', style: 'cancel' },
            { text: 'Sim', onPress: handleStop }
          ]
        );
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  };

  // ========================================
  // HANDLERS
  // ========================================

  const handleStartReceiving = async () => {
    try {
      if (!isConnected) {
        Alert.alert('Erro', 'Phantom Wallet não conectado');
        return;
      }

      if (!isNFCAvailable) {
        Alert.alert('Erro', 'NFC não está disponível');
        return;
      }

      clearError();
      await startReceiving();
    } catch (err) {
      console.error('❌ Erro ao iniciar recebimento:', err);
      Alert.alert(
        'Erro',
        err instanceof Error ? err.message : 'Erro ao iniciar recebimento NFC'
      );
    }
  };

  const handleStop = async () => {
    try {
      await stop();
      console.log('⏹️ Operação NFC cancelada');
    } catch (err) {
      console.error('❌ Erro ao parar NFC:', err);
    }
  };

  const handleConfirmTransaction = async (accept: boolean) => {
    try {
      setIsProcessing(true);
      await confirmTransaction(accept);
      
      if (!accept) {
        Alert.alert('Cancelado', 'Transação rejeitada pelo usuário');
      }
    } catch (err) {
      console.error('❌ Erro na confirmação:', err);
      Alert.alert(
        'Erro',
        err instanceof Error ? err.message : 'Erro ao processar transação'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    clearError();
    handleStartReceiving();
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderWalletInfo = () => (
    <View style={styles.walletCard}>
      <Text style={styles.walletLabel}>Sua Carteira</Text>
      <Text style={styles.walletAddress}>
        {formatAddress(publicKey.toString(), 12, 12)}
      </Text>
      <Text style={styles.walletBalance}>
        💰 {formatSOL(balance?.balance || 0)}
      </Text>
    </View>
  );

  const renderInstructions = () => {
    if (confirmationRequired || isActive) return null;

    return (
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>Como receber via NFC</Text>
        <Text style={styles.instructionsText}>
          1. Toque em "Aguardar Pagamento" para ativar o recebimento{'\n'}
          2. Peça para o remetente aproximar o dispositivo dele{'\n'}
          3. Mantenha os dispositivos próximos (até 4cm){'\n'}
          4. Confirme os dados da transação quando aparecerem{'\n'}
          5. A transferência será processada automaticamente
        </Text>
      </View>
    );
  };

  const renderNFCStatus = () => {
    if (confirmationRequired) return null;

    return (
      <View style={styles.nfcIconContainer}>
        {/* Animação NFC */}
        <View style={styles.nfcAnimationContainer as ViewStyle}>
          <NFCConnectionAnimation
            status={status}
            size="large"
            showDevices={isActive}
            showWaves={status === 'SEARCHING'}
            showParticles={status === 'CONNECTED' || status === 'RECEIVING_DATA'}
            deviceDistance={status === 'CONNECTED' ? 30 : 60}
          />
        </View>

        {/* Indicador de Status */}
        <NFCStatusIndicator
          status={status}
          message={message}
          size="medium"
          showMessage={true}
          showIcon={false}
          animated={true}
        />

        {/* Texto adicional baseado no status */}
        {status === 'SEARCHING' && (
          <Text style={styles.searchingText}>
            Aproxime o dispositivo do remetente...
          </Text>
        )}

        {status === 'CONNECTED' && (
          <Text style={styles.searchingText}>
            Dispositivo conectado! Aguardando dados...
          </Text>
        )}

        {status === 'RECEIVING_DATA' && (
          <Text style={styles.searchingText}>
            Recebendo dados da transação...
          </Text>
        )}
      </View>
    );
  };

  const renderTransactionConfirmation = () => {
    if (!confirmationRequired || !currentTransactionData) return null;

    return (
      <View style={styles.confirmationCard}>
        <Text style={styles.confirmationTitle}>
          💰 Confirmar Recebimento
        </Text>

        <NFCTransactionPreview
          transactionData={currentTransactionData}
          estimatedFee={estimatedFee || 0.000005}
          onConfirm={() => handleConfirmTransaction(true)}
          onReject={() => handleConfirmTransaction(false)}
          isLoading={isProcessing}
          showNetworkInfo={true}
          showSecurityInfo={true}
        />
      </View>
    );
  };

  const renderErrorState = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          ❌ {error}
        </Text>
      </View>
    );
  };

  const renderActionButtons = () => {
    if (confirmationRequired) return null;

    const canStart = !isActive && isNFCAvailable && isConnected;
    const showStop = isActive;

    return (
      <View style={styles.actionButtons}>
        {!showStop ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !canStart && styles.primaryButtonDisabled
            ]}
            onPress={error ? handleRetry : handleStartReceiving}
            disabled={!canStart && !error}
          >
            <Text style={styles.primaryButtonText}>
              {error ? 'Tentar Novamente' : '📡 Aguardar Pagamento'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStop}
          >
            <Text style={styles.primaryButtonText}>
              ⏹️ Cancelar
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onBack}
          disabled={isActive}
        >
          <Text style={styles.secondaryButtonText}>
            Voltar
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatusInfo = () => (
    <View style={styles.statusInfo}>
      <Text style={styles.statusInfoText}>
        NFC: {nfcStatus?.supported ? '✅ Suportado' : '❌ Não suportado'} • 
        Phantom: {isConnected ? '✅ Conectado' : '❌ Desconectado'}
      </Text>
      {!isNFCAvailable && (
        <Text style={styles.statusWarning}>
          ⚠️ Verifique se o NFC está ativado nas configurações
        </Text>
      )}
    </View>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../../assets/icons/nfcBRANCO.png')}
            style={styles.nfcHeaderIcon as ImageStyle}
            resizeMode="contain"
          />
        </View>

        {/* Modo único - Receber */}
        <View style={styles.modeSelectorSingle}>
          <Text style={styles.modeButtonTextActive}>
            📥 Receber via NFC
          </Text>
        </View>

        {/* Informações da carteira */}
        {renderWalletInfo()}

        {/* Instruções */}
        {renderInstructions()}

        {/* Status NFC ou Confirmação */}
        {confirmationRequired ? renderTransactionConfirmation() : renderNFCStatus()}

        {/* Estado de erro */}
        {renderErrorState()}

        {/* Spacer para empurrar botões para baixo */}
        <View style={styles.spacer} />

        {/* Botões de ação */}
        {renderActionButtons()}

        {/* Informações de status */}
        {renderStatusInfo()}
      </ScrollView>
    </View>
  );
};

export default NFCReceiveScreen;