// ========================================
// src/screens/main/NFCSendScreen/index.tsx
// Tela para enviar via NFC
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNFC } from '../../../hooks/useNFC';
import { usePhantom } from '../../../hooks/usePhantom';
import { useBalance } from '../../../hooks/useBalance';
import SolanaService from '../../../services/solana/SolanaService';
import { NFCTransactionResult } from '../../../services/nfc/NFCService';
import { styles } from './styles';

interface NFCSendScreenProps {
  onBack?: () => void;
  initialAmount?: string;
  receiverPublicKey?: string;
}

const NFCSendScreen: React.FC<NFCSendScreenProps> = ({ 
  onBack, 
  initialAmount = '50,00',
  receiverPublicKey = '' 
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [receiverAddress, setReceiverAddress] = useState(receiverPublicKey);
  const [equivalentSOL, setEquivalentSOL] = useState<number>(0);
  const [isCalculatingSOL, setIsCalculatingSOL] = useState(false);

  const { isConnected, publicKey } = usePhantom();
  const { balance } = useBalance(publicKey);
  const { 
    status, 
    message, 
    isActive, 
    currentTransactionData,
    estimatedFee,
    startSending, 
    stop, 
    checkNFCStatus 
  } = useNFC(handleTransactionComplete);

  // Atualizar equivalente em SOL quando o valor muda
  useEffect(() => {
    updateSOLEquivalent();
  }, [amount]);

  // Verificar NFC ao montar o componente
  useEffect(() => {
    verifyNFCStatus();
  }, []);

  /**
   * Atualiza valor equivalente em SOL
   */
  const updateSOLEquivalent = async () => {
    try {
      const numericAmount = parseFloat(amount.replace(',', '.'));
      if (numericAmount > 0) {
        setIsCalculatingSOL(true);
        const solanaService = SolanaService.getInstance();
        const solAmount = await solanaService.convertUSDToSOL(numericAmount);
        setEquivalentSOL(solAmount);
      } else {
        setEquivalentSOL(0);
      }
    } catch (error) {
      console.error('❌ Erro ao calcular equivalente SOL:', error);
      setEquivalentSOL(0);
    } finally {
      setIsCalculatingSOL(false);
    }
  };

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
    if (result.success && result.signature) {
      Alert.alert(
        'Transferência Concluída! ✅',
        `Transação enviada com sucesso!\n\nSignature: ${result.signature.slice(0, 8)}...\n\nValor: $${result.transactionData?.amount.toFixed(2)} (${result.transactionData?.amountSOL.toFixed(6)} SOL)`,
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
   * Inicia processo de envio
   */
  const handleProcurarDispositivo = async () => {
    try {
      // Validações básicas
      if (!isConnected) {
        Alert.alert('Erro', 'Não conectado com Phantom Wallet');
        return;
      }

      const numericAmount = parseFloat(amount.replace(',', '.'));
      if (numericAmount <= 0) {
        Alert.alert('Erro', 'Digite um valor válido maior que zero');
        return;
      }

      if (!balance || balance.balance < equivalentSOL) {
        Alert.alert(
          'Saldo Insuficiente',
          `Você precisa de pelo menos ${equivalentSOL.toFixed(6)} SOL para esta transferência.\n\nSaldo atual: ${balance?.balance.toFixed(6) || '0'} SOL`
        );
        return;
      }

      // Para modo NFC, usar endereço do dispositivo receptor
      const targetAddress = receiverAddress.trim() || 'DISCOVERY_MODE';
      
      if (receiverAddress.trim() && !SolanaService.isValidAddress(receiverAddress)) {
        Alert.alert('Erro', 'Endereço do destinatário inválido');
        return;
      }

      console.log('📤 Iniciando envio NFC:', { numericAmount, targetAddress });
      await startSending(numericAmount, targetAddress);

    } catch (error) {
      console.error('❌ Erro ao iniciar envio:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao iniciar transferência'
      );
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
        'Há uma transferência em andamento. Deseja cancelar?',
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
   * Formata valor monetário
   */
  const formatAmount = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toFixed(2).replace('.', ',');
  };

  /**
   * Handler para mudança de valor
   */
  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setAmount(formatted);
  };

  /**
   * Obtém texto do status atual
   */
  const getStatusText = () => {
    switch (status) {
      case 'SEARCHING':
        return 'Procurando dispositivo...';
      case 'CONNECTED':
        return 'Dispositivo conectado!';
      case 'SENDING_DATA':
        return 'Enviando dados da transação...';
      case 'PROCESSING_TRANSACTION':
        return 'Processando transação...';
      case 'SUCCESS':
        return 'Transferência concluída!';
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
      default:
        return '#797979';
    }
  };

  // Tela de operação ativa (procurando/enviando)
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
            <Text style={styles.modeButtonTextActive}>Enviar</Text>
          </View>

          <View style={styles.amountCard}>
            <View style={styles.amountHeader}>
              <Image 
                source={require('../../../../assets/icons/solana.png')}
                style={styles.solanaIcon}
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <Text style={styles.amountInput}>{amount}</Text>
            </View>

            {/* Informações adicionais do valor */}
            <View style={styles.equivalentInfo}>
              <Text style={styles.equivalentSOLText}>
                ≈ {equivalentSOL.toFixed(6)} SOL
              </Text>
              {estimatedFee && (
                <Text style={styles.feeText}>
                  Taxa: ~{estimatedFee.toFixed(6)} SOL
                </Text>
              )}
            </View>
          </View>

          <View style={styles.nfcIconContainer}>
            <View style={styles.nfcAnimationContainer}>
              {status === 'PROCESSING_TRANSACTION' ? (
                <ActivityIndicator size="large" color="#AB9FF3" />
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

            {currentTransactionData && (
              <View style={styles.transactionInfoContainer}>
                <Text style={styles.transactionInfoTitle}>Dados da Transação:</Text>
                <Text style={styles.transactionInfoText}>
                  Valor: ${currentTransactionData.amount.toFixed(2)} ({currentTransactionData.amountSOL.toFixed(6)} SOL)
                </Text>
                <Text style={styles.transactionInfoText}>
                  Para: {currentTransactionData.receiverPublicKey.slice(0, 8)}...
                </Text>
                <Text style={styles.transactionInfoText}>
                  Preço SOL: ${currentTransactionData.solPrice.toFixed(2)}
                </Text>
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

  // Tela inicial de configuração
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
          <Text style={styles.modeButtonTextActive}>Enviar</Text>
        </View>

        <View style={styles.amountCard}>
          <View style={styles.amountHeader}>
            <Image 
              source={require('../../../../assets/icons/solana.png')}
              style={styles.solanaIcon}
              resizeMode="contain"
            />
            {/* Informações de saldo */}
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Saldo disponível:</Text>
              <Text style={styles.balanceValue}>
                {balance ? `${balance.balance.toFixed(6)} SOL` : 'Carregando...'}
              </Text>
            </View>
          </View>
          
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor="#666"
            />
          </View>

          {/* Equivalente em SOL */}
          <View style={styles.equivalentInfo}>
            {isCalculatingSOL ? (
              <ActivityIndicator size="small" color="#AB9FF3" />
            ) : (
              <>
                <Text style={styles.equivalentSOLText}>
                  ≈ {equivalentSOL.toFixed(6)} SOL
                </Text>
                {estimatedFee && (
                  <Text style={styles.feeText}>
                    Taxa estimada: ~{estimatedFee.toFixed(6)} SOL
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        {/* Campo opcional para endereço do destinatário */}
        <View style={styles.receiverCard}>
          <Text style={styles.receiverLabel}>
            Destinatário (opcional - pode ser descoberto via NFC):
          </Text>
          <TextInput
            style={styles.receiverInput}
            value={receiverAddress}
            onChangeText={setReceiverAddress}
            placeholder="Endereço da wallet Solana..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
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
              (!isConnected || !balance || parseFloat(amount.replace(',', '.')) <= 0) && styles.primaryButtonDisabled
            ]}
            onPress={handleProcurarDispositivo}
            disabled={!isConnected || !balance || parseFloat(amount.replace(',', '.')) <= 0}
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

export default NFCSendScreen;