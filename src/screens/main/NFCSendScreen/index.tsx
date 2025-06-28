// ========================================
// src/screens/main/NFCSendScreen/index.tsx
// Tela de envio via NFC - COMPLETA
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
  TextInput,
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
import SolanaService from '../../../services/solana/SolanaService';
import RealtimePriceService from '../../../services/crypto/RealtimePriceService';
import { NFCTransactionResult } from '../../../types/nfc';
import { formatAddress, formatSOL, formatUSD } from '../../../utils/explorer';
import { validateSolanaAddress, validateTransactionAmount } from '../../../constants/validation';
import { styles } from './styles';

interface NFCSendScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
  session?: any;
}

const NFCSendScreen: React.FC<NFCSendScreenProps> = ({
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
    startSending,
    stop,
    clearError,
    checkNFCStatus,
    isNFCAvailable,
    setOnTransactionComplete
  } = useNFC();

  // Estado local
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [solAmount, setSolAmount] = useState('0.000000');
  const [solPrice, setSolPrice] = useState(150);
  const [memo, setMemo] = useState('');
  const [isValidatingForm, setIsValidatingForm] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    initializeScreen();
    setupTransactionCompleteHandler();
    setupBackHandler();

    return () => {
      // Cleanup ao desmontar
      stop();
    };
  }, []);

  useEffect(() => {
    // Atualizar valor SOL quando USD ou preço muda
    if (amount) {
      const usdValue = parseFloat(amount) || 0;
      const solValue = usdValue / solPrice;
      setSolAmount(solValue.toFixed(6));
    } else {
      setSolAmount('0.000000');
    }
  }, [amount, solPrice]);

  const initializeScreen = async () => {
    try {
      // Verificar NFC
      const nfcStatus = await checkNFCStatus();
      if (!nfcStatus.supported || !nfcStatus.enabled) {
        Alert.alert(
          'NFC Não Disponível',
          nfcStatus.error || 'NFC não está disponível neste dispositivo',
          [{ text: 'OK', onPress: onBack }]
        );
        return;
      }

      // Buscar preço do SOL
      await fetchSOLPrice();
    } catch (err) {
      console.error('❌ Erro ao inicializar tela de envio:', err);
    }
  };

  const fetchSOLPrice = async () => {
    try {
      const priceService = RealtimePriceService.getInstance();
      const prices = priceService.getCurrentPrices();
      const solPriceData = prices.get('solana');
      
      if (solPriceData?.price) {
        setSolPrice(solPriceData.price);
        console.log('💰 Preço SOL em tempo real:', solPriceData.price);
      } else {
        // Fallback para SolanaService
        const solanaService = SolanaService.getInstance();
        const priceData = await solanaService.getSOLPrice();
        setSolPrice(priceData.usd);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar preço SOL:', error);
      setSolPrice(150); // Fallback
    }
  };

  const setupTransactionCompleteHandler = () => {
    setOnTransactionComplete(async (result: NFCTransactionResult) => {
      try {
        console.log('🎉 Transação NFC de envio concluída:', result);
        
        if (result.success && result.signature && result.transactionData) {
          // Salvar no banco de dados
          await saveTransfer({
            transaction_signature: result.signature,
            from_address: result.transactionData.senderPublicKey,
            to_address: result.transactionData.receiverPublicKey,
            amount_sol: result.transactionData.amountSOL,
            amount_usd: result.transactionData.amount,
            fee_sol: 0.000005,
            status: 'confirmed',
            transfer_type: 'send',
            memo: result.transactionData.memo,
            network: 'devnet'
          });

          // Atualizar saldo
          await refreshBalance();

          Alert.alert(
            '🎉 Pagamento Enviado!',
            `✅ Você enviou ${formatUSD(result.transactionData.amount)} (${formatSOL(result.transactionData.amountSOL)})!\n\n` +
            `📧 Para: ${formatAddress(result.transactionData.receiverPublicKey)}\n` +
            `🔗 Signature: ${result.signature.slice(0, 8)}...\n\n` +
            `💰 Seu saldo foi atualizado.`,
            [
              {
                text: 'Ver Explorer',
                onPress: () => {
                  console.log('🔗 Explorer URL:', `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`);
                }
              },
              {
                text: 'Concluir',
                onPress: () => {
                  // Limpar formulário e voltar
                  resetForm();
                  onBack();
                }
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
          'Deseja realmente cancelar o envio NFC?',
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
  // VALIDAÇÃO
  // ========================================

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validar conexão Phantom
    if (!isConnected) {
      errors.push('Phantom Wallet não conectado');
    }

    // Validar NFC
    if (!isNFCAvailable) {
      errors.push('NFC não está disponível');
    }

    // Validar destinatário
    if (!recipient.trim()) {
      errors.push('Digite o endereço do destinatário');
    } else if (!validateSolanaAddress(recipient.trim())) {
      errors.push('Endereço do destinatário inválido');
    } else if (recipient.trim() === publicKey.toString()) {
      errors.push('Não é possível enviar para si mesmo');
    }

    // Validar valor
    const usdValue = parseFloat(amount) || 0;
    const solValue = parseFloat(solAmount) || 0;
    
    if (!amount.trim() || usdValue <= 0) {
      errors.push('Digite um valor válido');
    } else {
      const amountErrors = validateTransactionAmount(usdValue, solValue);
      errors.push(...amountErrors);
    }

    // Validar saldo
    const availableBalance = balance?.balance || 0;
    const estimatedFee = 0.000005;
    const totalNeeded = solValue + estimatedFee;

    if (availableBalance < totalNeeded) {
      errors.push(
        `Saldo insuficiente. Necessário: ${totalNeeded.toFixed(6)} SOL, Disponível: ${availableBalance.toFixed(6)} SOL`
      );
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // ========================================
  // HANDLERS
  // ========================================

  const handleStartSending = async () => {
    try {
      setIsValidatingForm(true);
      
      // Validar formulário
      const validation = validateForm();
      setFormErrors(validation.errors);

      if (!validation.isValid) {
        Alert.alert(
          'Erro na Validação',
          validation.errors.join('\n'),
          [{ text: 'OK' }]
        );
        return;
      }

      // Confirmar operação
      const usdValue = parseFloat(amount);
      const solValue = parseFloat(solAmount);
      const estimatedFee = 0.000005;

      Alert.alert(
        '💸 Confirmar Envio NFC',
        `Você enviará:\n\n` +
        `💰 Valor: ${formatUSD(usdValue)} (${formatSOL(solValue)})\n` +
        `📧 Para: ${formatAddress(recipient.trim())}\n` +
        `💸 Taxa: ${formatSOL(estimatedFee)}\n` +
        `📋 Total: ${formatSOL(solValue + estimatedFee)}\n\n` +
        `Aproxime o dispositivo do destinatário para continuar.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                clearError();
                await startSending(usdValue, recipient.trim());
              } catch (err) {
                console.error('❌ Erro ao iniciar envio:', err);
                Alert.alert(
                  'Erro',
                  err instanceof Error ? err.message : 'Erro ao iniciar envio NFC'
                );
              }
            }
          }
        ]
      );

    } catch (err) {
      console.error('❌ Erro na preparação do envio:', err);
      Alert.alert('Erro', 'Erro ao preparar envio');
    } finally {
      setIsValidatingForm(false);
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

  const resetForm = () => {
    setRecipient('');
    setAmount('');
    setSolAmount('0.000000');
    setMemo('');
    setFormErrors([]);
    clearError();
  };

  const handleRetry = () => {
    clearError();
    setFormErrors([]);
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

  const renderSendForm = () => {
    if (isActive) return null;

    const hasErrors = formErrors.length > 0;
    const isFormValid = validateForm().isValid;

    return (
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Dados da Transferência</Text>

        {/* Campo Destinatário */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Endereço do Destinatário</Text>
          <TextInput
            style={[
              styles.textInput,
              hasErrors && formErrors.some(e => e.includes('destinatário')) && styles.inputError
            ]}
            placeholder="Digite ou cole o endereço Solana"
            placeholderTextColor="#666666"
            value={recipient}
            onChangeText={setRecipient}
            autoCapitalize="none"
            autoCorrect={false}
            multiline={false}
          />
        </View>

        {/* Campo Valor */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Valor a Enviar</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[
                styles.amountInput,
                hasErrors && formErrors.some(e => e.includes('valor')) && styles.inputError
              ]}
              placeholder="0.00"
              placeholderTextColor="#666666"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          </View>
          <Text style={styles.solEquivalent}>
            = {solAmount} SOL
          </Text>
        </View>

        {/* Campo Memo (Opcional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Memo (Opcional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Descrição da transferência"
            placeholderTextColor="#666666"
            value={memo}
            onChangeText={setMemo}
            maxLength={100}
          />
        </View>

        {/* Resumo da Transação */}
        {amount && recipient && isFormValid && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Valor:</Text>
              <Text style={styles.summaryValue}>{formatUSD(parseFloat(amount))}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Em SOL:</Text>
              <Text style={styles.summaryValue}>{formatSOL(parseFloat(solAmount))}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa estimada:</Text>
              <Text style={styles.summaryValue}>{formatSOL(0.000005)}</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total:</Text>
              <Text style={styles.summaryTotalValue}>
                {formatSOL(parseFloat(solAmount) + 0.000005)}
              </Text>
            </View>
          </View>
        )}

        {/* Erros de Validação */}
        {hasErrors && (
          <View style={styles.errorContainer}>
            {formErrors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                ❌ {error}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderNFCStatus = () => {
    if (!isActive) return null;

    return (
      <View style={styles.nfcStatusContainer}>
        {/* Animação NFC */}
        <View style={styles.nfcAnimationContainer as ViewStyle}>
          <NFCConnectionAnimation
            status={status}
            size="large"
            showDevices={true}
            showWaves={status === 'SEARCHING'}
            showParticles={status === 'CONNECTED' || status === 'SENDING_DATA'}
            deviceDistance={status === 'CONNECTED' ? 20 : 60}
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

        {/* Instruções baseadas no status */}
        {status === 'SEARCHING' && (
          <Text style={styles.instructionText}>
            Aproxime o dispositivo do destinatário...
          </Text>
        )}

        {status === 'CONNECTED' && (
          <Text style={styles.instructionText}>
            Dispositivo conectado! Enviando dados...
          </Text>
        )}

        {status === 'SENDING_DATA' && (
          <Text style={styles.instructionText}>
            Enviando dados da transação...
          </Text>
        )}

        {status === 'SUCCESS' && (
          <Text style={styles.successText}>
            ✅ Dados enviados com sucesso!
          </Text>
        )}
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
    const validation = validateForm();
    const canStart = validation.isValid && !isActive;
    const showStop = isActive;

    return (
      <View style={styles.actionButtons}>
        {!showStop ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !canStart && styles.primaryButtonDisabled
            ]}
            onPress={error ? handleRetry : handleStartSending}
            disabled={(!canStart && !error) || isValidatingForm}
          >
            <Text style={styles.primaryButtonText}>
              {error ? 'Tentar Novamente' : '📡 Iniciar Envio NFC'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStop}
          >
            <Text style={styles.primaryButtonText}>
              ⏹️ Cancelar Envio
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
        NFC: {isNFCAvailable ? '✅ Disponível' : '❌ Indisponível'} • 
        Phantom: {isConnected ? '✅ Conectado' : '❌ Desconectado'}
      </Text>
      <Text style={styles.statusInfoText}>
        Preço SOL: {formatUSD(solPrice)}/SOL
      </Text>
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../../assets/icons/nfcBRANCO.png')}
            style={styles.nfcHeaderIcon as ImageStyle}
            resizeMode="contain"
          />
        </View>

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            📤 Enviar via NFC
          </Text>
        </View>

        {/* Informações da carteira */}
        {renderWalletInfo()}

        {/* Formulário ou Status NFC */}
        {isActive ? renderNFCStatus() : renderSendForm()}

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

export default NFCSendScreen;