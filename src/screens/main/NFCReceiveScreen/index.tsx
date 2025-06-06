// ========================================
// src/screens/main/NFCReceiveScreen/index.tsx
// Tela para receber via NFC - Implementação com funcionalidade real
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNFC } from '../../../hooks/useNFC';
import { usePhantom } from '../../../hooks/usePhantom';
import { useBalance } from '../../../hooks/useBalance';
import { NFCTransactionResult, NFCTransactionData } from '../../../services/nfc/NFCService';
import { styles } from './styles';

interface NFCReceiveScreenProps {
  onBack?: () => void;
}

const NFCReceiveScreen: React.FC<NFCReceiveScreenProps> = ({ onBack }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { isConnected, publicKey } = usePhantom();
  const { balance, refreshBalance } = useBalance(publicKey);
  const { 
    status, 
    message, 
    isActive, 
    currentTransactionData,
    estimatedFee,
    startReceiving, 
    confirmTransaction,
    stop, 
    checkNFCStatus 
  } = useNFC(handleTransactionComplete);

  // Verificar NFC ao montar o componente
  useEffect(() => {
    verifyNFCStatus();
  }, []);

  // Mostrar confirmação quando dados são recebidos
  useEffect(() => {
    if (currentTransactionData && status === 'CONFIRMING') {
      setShowConfirmation(true);
    } else {
      setShowConfirmation(false);
    }
  }, [currentTransactionData, status]);

  /**
   * Verifica status do NFC
   */
  const verifyNFCStatus = async () => {
    try {
      const nfcStatus = await checkNFCStatus();
      if (!nfcStatus.supported) {
        Alert.alert(
          'NFC não suportado',
          'Este dispositivo não suporta NFC.',
          [{ text: 'OK', onPress: handleVoltar }]
        );
      } else if (!nfcStatus.enabled) {
        Alert.alert(
          'NFC desabilitado',
          'Por favor, habilite o NFC nas configurações do dispositivo.',
          [
            { text: 'Cancelar', onPress: handleVoltar },
            { text: 'Configurações', onPress: () => {/* TODO: Abrir configurações */} }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Erro ao verificar NFC:', error);
    }
  };

  /**
   * Callback quando transação é concluída
   */
  function handleTransactionComplete(result: NFCTransactionResult) {
    // Atualizar saldo após transação bem-sucedida
    if (result.success) {
      setTimeout(() => {
        refreshBalance();
      }, 2000);

      Alert.alert(
        'Transferência Recebida! ✅',
        `Você recebeu uma transferência!\n\nValor: $${result.transactionData?.amount.toFixed(2)} (${result.transactionData?.amountSOL.toFixed(6)} SOL)\n\nSignature: ${result.signature?.slice(0, 8)}...`,
        [
          { 
            text: 'Ver no Explorer', 
            onPress: () => openTransactionExplorer(result.signature!) 
          },
          { text: 'OK', onPress: handleVoltar }
        ]
      );
    } else {
      Alert.alert(
        'Erro na Transferência ❌',
        result.error || 'Erro desconhecido na transação',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Abre explorador de transações
   */
  const openTransactionExplorer = (signature: string) => {
    // TODO: Implementar abertura do explorador
    console.log('🔍 Abrir explorador para signature:', signature);
  };

  /**
   * Inicia processo de recebimento
   */
  const handleProcurarDispositivo = async () => {
    try {
      if (!isConnected) {
        Alert.alert('Erro', 'Não conectado com Phantom Wallet');
        return;
      }

      console.log('📡 Iniciando recebimento via NFC...');
      await startReceiving();

    } catch (error) {
      console.error('❌ Erro ao iniciar recebimento:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao iniciar recebimento'
      );
    }
  };

  /**
   * Aceita a transação recebida
   */
  const handleAceitarTransacao = async () => {
    try {
      setShowConfirmation(false);
      await confirmTransaction(true);
    } catch (error) {
      console.error('❌ Erro ao aceitar transação:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao processar transação'
      );
    }
  };

  /**
   * Rejeita a transação recebida
   */
  const handleRejeitarTransacao = async () => {
    try {
      setShowConfirmation(false);
      await confirmTransaction(false);
    } catch (error) {
      console.error('❌ Erro ao rejeitar transação:', error);
    }
  };

  /**
   * Cancela operação atual
   */
  const handleCancelar = async () => {
    try {
      await stop();
    } catch (error) {
      console.error('❌ Erro ao cancelar:', error);
    }
  };

  /**
   * Volta para tela anterior
   */
  const handleVoltar = () => {
    if (isActive) {
      Alert.alert(
        'Operação em Andamento',
        'Há uma operação de recebimento em andamento. Deseja cancelar?',
        [
          { text: 'Não', style: 'cancel' },
          { 
            text: 'Sim, Cancelar', 
            style: 'destructive',
            onPress: async () => {
              await handleCancelar();
              if (onBack) onBack();
            }
          }
        ]
      );
    } else {
      if (onBack) onBack();
    }
  };

  /**
   * Obtém texto do status atual
   */
  const getStatusText = () => {
    switch (status) {
      case 'SEARCHING':
        return 'Aguardando dispositivo...';
      case 'CONNECTED':
        return 'Dispositivo conectado!';
      case 'RECEIVING_DATA':
        return 'Recebendo dados da transação...';
      case 'CONFIRMING':
        return 'Confirme os dados da transação';
      case 'PROCESSING_TRANSACTION':
        return 'Processando transação...';
      case 'SUCCESS':
        return 'Transferência recebida!';
      case 'ERROR':
        return message || 'Erro na operação';
      default:
        return 'Mantenha próximo ao dispositivo';
    }
  };

  /**
   * Obtém cor do status
   */
  const getStatusColor = () => {
    switch (status) {
      case 'SUCCESS':
        return '#22c55e';
      case 'ERROR':
        return '#ef4444';
      case 'CONNECTED':
      case 'PROCESSING_TRANSACTION':
        return '#3b82f6';
      case 'CONFIRMING':
        return '#f59e0b';
      default:
        return '#666';
    }
  };

  // Tela de confirmação de transação
  if (showConfirmation && currentTransactionData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#262728" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image 
              source={require('../../../../assets/icons/nfcBRANCO.png')}
              style={styles.nfcHeaderIcon}
              resizeMode="contain"
            />
          </View>

          <View style={styles.modeSelectorSingle}>
            <Text style={styles.modeButtonTextActive}>Receber</Text>
          </View>

          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>
              Confirmar Recebimento
            </Text>

            <View style={styles.transactionDetails}>
              <View style={styles.amountDisplay}>
                <Text style={styles.amountLabel}>Valor a receber:</Text>
                <Text style={styles.amountValue}>
                  ${currentTransactionData.amount.toFixed(2)}
                </Text>
                <Text style={styles.amountSOL}>
                  {currentTransactionData.amountSOL.toFixed(6)} SOL
                </Text>
              </View>

              <View style={styles.transactionInfo}>
                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>De:</Text>
                  <Text style={styles.transactionValue}>
                    {currentTransactionData.senderPublicKey.slice(0, 8)}...{currentTransactionData.senderPublicKey.slice(-8)}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>Para:</Text>
                  <Text style={styles.transactionValue}>
                    {currentTransactionData.receiverPublicKey.slice(0, 8)}...{currentTransactionData.receiverPublicKey.slice(-8)}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>Preço SOL:</Text>
                  <Text style={styles.transactionValue}>
                    ${currentTransactionData.solPrice.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>Timestamp:</Text>
                  <Text style={styles.transactionValue}>
                    {new Date(currentTransactionData.timestamp).toLocaleString('pt-BR')}
                  </Text>
                </View>

                {estimatedFee && (
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>Taxa estimada:</Text>
                    <Text style={styles.transactionValue}>
                      ~{estimatedFee.toFixed(6)} SOL
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Verifique cuidadosamente os dados da transação antes de confirmar. 
                Esta ação não pode ser desfeita.
              </Text>
            </View>
          </View>

          <View style={styles.spacer} />

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAceitarTransacao}
            >
              <Text style={styles.acceptButtonText}>✅ Aceitar Transação</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={handleRejeitarTransacao}
            >
              <Text style={styles.rejectButtonText}>❌ Rejeitar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Tela de operação ativa (procurando/recebendo)
  if (isActive) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#262728" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image 
              source={require('../../../../assets/icons/nfcBRANCO.png')}
              style={styles.nfcHeaderIcon}
              resizeMode="contain"
            />
          </View>

          <View style={styles.modeSelectorSingle}>
            <Text style={styles.modeButtonTextActive}>Receber</Text>
          </View>

          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Sua wallet:</Text>
            <Text style={styles.walletAddress}>
              {publicKey ? `${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}` : 'Carregando...'}
            </Text>
            <Text style={styles.walletBalance}>
              Saldo: {balance ? `${balance.balance.toFixed(6)} SOL` : 'Carregando...'}
            </Text>
          </View>

          <View style={styles.nfcIconContainer}>
            <View style={styles.nfcAnimationContainer}>
              {status === 'PROCESSING_TRANSACTION' ? (
                <ActivityIndicator size="large" color="#3b82f6" />
              ) : (
                <Image 
                  source={require('../../../../assets/icons/nfcCINZA.png')}
                  style={styles.nfcIconSearchingImage}
                  resizeMode="contain"
                />
              )}
            </View>
            
            <Text style={[styles.searchingText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>

            {message && status === 'ERROR' && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{message}</Text>
              </View>
            )}
          </View>

          <View style={styles.spacer} />

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleCancelar}
              disabled={status === 'PROCESSING_TRANSACTION'}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Tela inicial de recebimento
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image 
            source={require('../../../../assets/icons/nfcBRANCO.png')}
            style={styles.nfcHeaderIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.modeSelectorSingle}>
          <Text style={styles.modeButtonTextActive}>Receber</Text>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Sua wallet:</Text>
          <Text style={styles.walletAddress}>
            {publicKey ? `${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}` : 'Conecte sua wallet'}
          </Text>
          {balance && (
            <Text style={styles.walletBalance}>
              Saldo atual: {balance.balance.toFixed(6)} SOL
            </Text>
          )}
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Como receber:</Text>
          <Text style={styles.instructionsText}>
            1. Toque em "Procurar dispositivo"{'\n'}
            2. Mantenha seu telefone próximo ao dispositivo do remetente{'\n'}
            3. Confirme os dados da transação quando solicitado{'\n'}
            4. Aguarde a confirmação na blockchain
          </Text>
        </View>

        <View style={styles.nfcIconContainer}>
          <Image 
            source={require('../../../../assets/icons/nfcBRANCO2.png')}
            style={styles.nfcIconLargeImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.spacer} />

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              !isConnected && styles.primaryButtonDisabled
            ]}
            onPress={handleProcurarDispositivo}
            disabled={!isConnected}
          >
            <Text style={styles.primaryButtonText}>Procurar dispositivo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleVoltar}
          >
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Status de conexão */}
        <View style={styles.statusInfo}>
          <Text style={styles.statusInfoText}>
            Status: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
          </Text>
          {!isConnected && (
            <Text style={styles.statusWarning}>
              Conecte-se com Phantom Wallet para continuar
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NFCReceiveScreen;