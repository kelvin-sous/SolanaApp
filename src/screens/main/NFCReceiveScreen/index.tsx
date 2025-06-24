// ========================================
// src/screens/main/NFCReceiveScreen/index.tsx
// Tela para receber via NFC - INTEGRAÇÃO COMPLETA
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
import { useTransfers } from '../../../hooks/useTransfers';
import { NFCTransactionResult, NFCTransactionData } from '../../../services/nfc/NFCService';
import { styles } from './styles';

interface NFCReceiveScreenProps {
  onBack?: () => void;
}

const NFCReceiveScreen: React.FC<NFCReceiveScreenProps> = ({ onBack }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTransactionData, setPendingTransactionData] = useState<NFCTransactionData | null>(null);
  
  const { isConnected, publicKey, session } = usePhantom();
  const { balance, refreshBalance } = useBalance(publicKey);
  const { saveTransfer, updateTransferStatus } = useTransfers(publicKey);
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
      setPendingTransactionData(currentTransactionData);
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
   * ✨ CALLBACK INTEGRADO COM BANCO DE DADOS
   */
  function handleTransactionComplete(result: NFCTransactionResult) {
    console.log('🎉 NFCReceiveScreen - Transação completa:', result);

    if (result.success && result.signature && result.transactionData) {
      // Salvar no banco com método NFC
      saveTransferToDatabase(result)
        .then(() => {
          // Atualizar saldo
          setTimeout(() => {
            refreshBalance();
          }, 2000);

          // Mostrar sucesso
          Alert.alert(
            'Transferência Recebida! ✅',
            `Você recebeu uma transferência via NFC!\n\n` +
            `💰 Valor: $${result.transactionData!.amount.toFixed(2)} (${result.transactionData!.amountSOL.toFixed(6)} SOL)\n` +
            `📧 De: ${result.transactionData!.senderPublicKey.slice(0, 8)}...${result.transactionData!.senderPublicKey.slice(-8)}\n` +
            `🔗 Signature: ${result.signature!.slice(0, 8)}...\n\n` +
            `✅ Transferência salva no histórico`,
            [
              { 
                text: 'Ver Explorer', 
                onPress: () => openTransactionExplorer(result.signature!) 
              },
              { text: 'OK', onPress: handleVoltar }
            ]
          );
        })
        .catch((dbError) => {
          console.error('❌ Erro ao salvar no banco:', dbError);
          
          // Mesmo com erro no banco, a transação foi bem-sucedida
          Alert.alert(
            'Transferência Recebida! ⚠️',
            `Transferência recebida com sucesso, mas houve um problema ao salvar no histórico.\n\n` +
            `💰 Valor: $${result.transactionData!.amount.toFixed(2)} (${result.transactionData!.amountSOL.toFixed(6)} SOL)\n` +
            `🔗 Signature: ${result.signature!.slice(0, 8)}...\n\n` +
            `A transação foi processada corretamente na blockchain.`,
            [
              { 
                text: 'Ver Explorer', 
                onPress: () => openTransactionExplorer(result.signature!) 
              },
              { text: 'OK', onPress: handleVoltar }
            ]
          );
        });
    } else {
      Alert.alert(
        'Erro na Transferência ❌',
        result.error || 'Erro desconhecido na transação NFC',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * ✨ SALVAR NO BANCO DE DADOS
   */
  const saveTransferToDatabase = async (result: NFCTransactionResult): Promise<void> => {
    if (!result.success || !result.signature || !result.transactionData || !publicKey) {
      throw new Error('Dados insuficientes para salvar no banco');
    }

    try {
      console.log('💾 Salvando transferência NFC recebida no banco...');

      // Salvar como confirmed (transação já foi executada)
      await saveTransfer({
        transaction_signature: result.signature,
        from_address: result.transactionData.senderPublicKey,
        to_address: publicKey.toString(),
        amount_sol: result.transactionData.amountSOL,
        amount_usd: result.transactionData.amount,
        fee_sol: estimatedFee || 0.000005,
        status: 'confirmed',
        transfer_type: 'receive',
        method: 'nfc',
        memo: 'Transferência recebida via NFC',
        network: 'devnet'
      });

      console.log('✅ Transferência NFC recebida salva no banco com sucesso');

    } catch (error) {
      console.error('❌ Erro ao salvar transferência NFC recebida:', error);
      throw error;
    }
  };

  /**
   * Abre explorador de transações
   */
  const openTransactionExplorer = (signature: string) => {
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    console.log('🔍 Abrir explorador:', explorerUrl);
    // TODO: Implementar abertura do navegador
  };

  /**
   * ✨ INICIA PROCESSO DE RECEBIMENTO COM VALIDAÇÕES
   */
  const handleProcurarDispositivo = async () => {
    try {
      if (!isConnected || !publicKey || !session) {
        Alert.alert('Erro', 'Não conectado com Phantom Wallet');
        return;
      }

      console.log('📡 Iniciando recebimento NFC com dados validados:', {
        publicKey: publicKey.toString(),
        session: !!session,
        balance: balance?.balance
      });

      await startReceiving();

    } catch (error) {
      console.error('❌ Erro ao iniciar recebimento NFC:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao iniciar recebimento NFC'
      );
    }
  };

  /**
   * ✨ ACEITA A TRANSAÇÃO COM INTEGRAÇÃO NO BANCO
   */
  const handleAceitarTransacao = async () => {
    if (!pendingTransactionData) {
      Alert.alert('Erro', 'Dados da transação não encontrados');
      return;
    }

    try {
      console.log('✅ Aceitando transação NFC...', pendingTransactionData);
      
      setShowConfirmation(false);
      setPendingTransactionData(null);
      
      // Confirmar transação via NFC Service
      await confirmTransaction(true, pendingTransactionData);

    } catch (error) {
      console.error('❌ Erro ao aceitar transação NFC:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao processar transação NFC'
      );
    }
  };

  /**
   * Rejeita a transação recebida
   */
  const handleRejeitarTransacao = async () => {
    try {
      console.log('❌ Rejeitando transação NFC...');
      
      setShowConfirmation(false);
      setPendingTransactionData(null);
      
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
    if (isActive || showConfirmation) {
      Alert.alert(
        'Operação em Andamento',
        'Há uma operação de recebimento NFC em andamento. Deseja cancelar?',
        [
          { text: 'Não', style: 'cancel' },
          { 
            text: 'Sim, Cancelar', 
            style: 'destructive',
            onPress: async () => {
              await handleCancelar();
              setShowConfirmation(false);
              setPendingTransactionData(null);
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

  // ========================================
  // RENDERIZAÇÃO - TELA DE CONFIRMAÇÃO
  // ========================================

  if (showConfirmation && pendingTransactionData) {
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
            <Text style={styles.modeButtonTextActive}>Confirmar Recebimento</Text>
          </View>

          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>
              Confirmar Recebimento via NFC
            </Text>

            <View style={styles.transactionDetails}>
              <View style={styles.amountDisplay}>
                <Text style={styles.amountLabel}>Valor a receber:</Text>
                <Text style={styles.amountValue}>
                  ${pendingTransactionData.amount.toFixed(2)}
                </Text>
                <Text style={styles.amountSOL}>
                  {pendingTransactionData.amountSOL.toFixed(6)} SOL
                </Text>
              </View>

              <View style={styles.transactionInfo}>
                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>De:</Text>
                  <Text style={styles.transactionValue}>
                    {pendingTransactionData.senderPublicKey.slice(0, 8)}...{pendingTransactionData.senderPublicKey.slice(-8)}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>Para:</Text>
                  <Text style={styles.transactionValue}>
                    {publicKey ? `${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}` : 'Sua wallet'}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>Preço SOL:</Text>
                  <Text style={styles.transactionValue}>
                    ${pendingTransactionData.solPrice.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>Timestamp:</Text>
                  <Text style={styles.transactionValue}>
                    {new Date(pendingTransactionData.timestamp).toLocaleString('pt-BR')}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>Rede:</Text>
                  <Text style={styles.transactionValue}>
                    Solana {pendingTransactionData.network.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>Método:</Text>
                  <Text style={styles.transactionValue}>
                    NFC
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

  // ========================================
  // RENDERIZAÇÃO - TELA ATIVA
  // ========================================

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
            <Text style={styles.modeButtonTextActive}>Receber via NFC</Text>
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

  // ========================================
  // RENDERIZAÇÃO - TELA INICIAL
  // ========================================

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
          <Text style={styles.modeButtonTextActive}>Receber via NFC</Text>
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
          <Text style={styles.instructionsTitle}>Como receber via NFC:</Text>
          <Text style={styles.instructionsText}>
            1. Toque em "Procurar dispositivo"{'\n'}
            2. Mantenha seu telefone próximo ao dispositivo do remetente{'\n'}
            3. Confirme os dados da transação quando solicitado{'\n'}
            4. Aguarde a confirmação na blockchain Solana
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