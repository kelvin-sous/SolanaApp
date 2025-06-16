// ========================================
// src/screens/main/QRPayScreen/index.tsx
// Tela de Scanner QR Code com integração Phantom Wallet
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useBalance } from '../../../hooks/useBalance';
import SendPaymentScreen from '../SendPaymentScreen';
import QRCodeService from '../../../services/qr/QRCodeService';
import SolanaService from '../../../services/solana/SolanaService';
import { validateSolanaAddress, validateTransactionAmount } from '../../../constants/validation';
import { styles } from './styles';

interface QRPayScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
  session?: any;
}

interface RecipientData {
  address: string;
  label?: string;
  message?: string;
  amount?: number;
  amountUSD?: number;
}

const QRPayScreen: React.FC<QRPayScreenProps> = ({ onBack, publicKey, session }) => {
  // Estados principais
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [recipientData, setRecipientData] = useState<RecipientData | null>(null);
  const [showSendScreen, setShowSendScreen] = useState(false);
  const [isProcessingQR, setIsProcessingQR] = useState(false);

  // Câmera
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);

  // Hooks
  const { balance, isLoading: balanceLoading, refreshBalance } = useBalance(publicKey);

  // Services
  const qrService = QRCodeService.getInstance();

  // ========================================
  // INICIALIZAÇÃO DA CÂMERA
  // ========================================

  useEffect(() => {
    initializeCamera();
  }, [permission]);

  const initializeCamera = async () => {
    try {
      console.log('🎥 Inicializando câmera...');
      
      if (permission === null) {
        console.log('⏳ Permissões ainda carregando...');
        return;
      }

      if (!permission.granted && permission.canAskAgain) {
        console.log('📱 Solicitando permissão da câmera...');
        const result = await requestPermission();
        if (result.granted) {
          setCameraReady(true);
          console.log('✅ Permissão concedida!');
        }
      } else if (permission.granted) {
        console.log('✅ Permissão já concedida!');
        setCameraReady(true);
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar câmera:', error);
    }
  };

  // ========================================
  // VALIDAÇÃO DE SALDO
  // ========================================

  const checkSufficientBalance = async (
    requestedAmount: number, 
    amountType: 'SOL' | 'USD' = 'SOL'
  ): Promise<{ sufficient: boolean; requiredSOL: number }> => {
    try {
      console.log('🔍 Verificando saldo suficiente...', { requestedAmount, amountType });
      
      if (!balance) {
        console.log('⚠️ Saldo não carregado ainda');
        return { sufficient: false, requiredSOL: 0 };
      }

      let requiredSOL = requestedAmount;

      // Se o valor for em USD, converter para SOL
      if (amountType === 'USD') {
        console.log('💱 Convertendo USD para SOL...');
        const solanaService = SolanaService.getInstance();
        const priceData = await solanaService.getSOLPrice();
        requiredSOL = requestedAmount / priceData.usd;
        console.log('💱 Conversão resultado:', requiredSOL, 'SOL');
      }

      const availableSOL = balance.balance;
      const estimatedFee = 0.000005; // Taxa estimada de transação
      const totalRequired = requiredSOL + estimatedFee;

      console.log('💰 Verificação de saldo detalhada:', {
        disponível: availableSOL,
        necessário: requiredSOL,
        taxa: estimatedFee,
        totalNecessário: totalRequired,
        suficiente: availableSOL >= totalRequired
      });

      return { 
        sufficient: availableSOL >= totalRequired, 
        requiredSOL: totalRequired 
      };

    } catch (error) {
      console.error('❌ Erro ao verificar saldo:', error);
      return { sufficient: false, requiredSOL: 0 };
    }
  };

  const showInsufficientBalanceAlert = (
    requestedAmount: number, 
    amountType: 'SOL' | 'USD' = 'SOL',
    requiredSOL: number
  ) => {
    const currentBalance = balance?.balance || 0;
    const amountText = amountType === 'USD' 
      ? `$${requestedAmount.toFixed(2)} USD` 
      : `${requestedAmount.toFixed(4)} SOL`;

    Alert.alert(
      '💸 Saldo Insuficiente',
      `Você não possui SOL suficiente para esta transação.\n\n` +
      `💰 Saldo atual: ${currentBalance.toFixed(4)} SOL\n` +
      `📤 Valor solicitado: ${amountText}\n` +
      `📋 Total necessário: ${requiredSOL.toFixed(6)} SOL\n\n` +
      `Adicione SOL à sua carteira para continuar.`,
      [
        {
          text: 'Atualizar Saldo',
          onPress: () => refreshBalance(),
          style: 'default'
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
  };

  // ========================================
  // PROCESSAMENTO DE QR CODE
  // ========================================

  const parseQRCodeData = (qrString: string): RecipientData | null => {
    try {
      console.log('🔍 Tentando parsear como JSON...');
      const qrData = JSON.parse(qrString);
      
      // Validar estrutura do QR Code
      if (!qrData.recipient && !qrData.address) {
        throw new Error('QR Code não contém endereço de destino');
      }

      return {
        address: qrData.recipient || qrData.address,
        label: qrData.label || 'Transferência SOL',
        message: qrData.message || undefined,
        amount: qrData.amount || undefined,
        amountUSD: qrData.amountUSD || undefined
      };
      
    } catch (error) {
      console.log('⚠️ Não é JSON, tentando como endereço simples...');
      
      // Tentar como endereço Solana direto
      const trimmedData = qrString.trim();
      if (validateSolanaAddress(trimmedData)) {
        return {
          address: trimmedData,
          label: 'Transferência SOL',
          message: undefined
        };
      }
      
      console.error('❌ Dados do QR Code inválidos:', error);
      return null;
    }
  };

  const processQRCodeWithBalanceCheck = async (qrString: string) => {
    try {
      console.log('🔍 Processando QR Code:', qrString.slice(0, 50) + '...');
      setIsProcessingQR(true);

      // Parsear dados do QR Code
      const recipientInfo = parseQRCodeData(qrString);
      
      if (!recipientInfo) {
        Alert.alert('Erro', 'QR Code não contém dados válidos para transferência SOL');
        return;
      }

      console.log('📋 Dados do destinatário:', recipientInfo);

      // Validar endereço
      if (!validateSolanaAddress(recipientInfo.address)) {
        Alert.alert('Erro', 'Endereço Solana inválido no QR Code');
        return;
      }

      // Se há valor especificado no QR Code, verificar saldo
      if (recipientInfo.amount || recipientInfo.amountUSD) {
        console.log('💳 QR Code contém valor - verificando saldo...');

        // Aguardar carregamento do saldo se necessário
        if (balanceLoading) {
          console.log('⏳ Aguardando carregamento do saldo...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const amountToCheck = recipientInfo.amount || recipientInfo.amountUSD;
        const amountType = recipientInfo.amount ? 'SOL' : 'USD';
        
        // Validar valores
        if (amountType === 'USD' && recipientInfo.amountUSD) {
          const errors = validateTransactionAmount(recipientInfo.amountUSD, recipientInfo.amount || 0);
          if (errors.length > 0) {
            Alert.alert('Valor Inválido', errors.join('\n'));
            return;
          }
        }

        const balanceCheck = await checkSufficientBalance(amountToCheck!, amountType);

        if (!balanceCheck.sufficient) {
          console.log('❌ Saldo insuficiente detectado');
          showInsufficientBalanceAlert(amountToCheck!, amountType, balanceCheck.requiredSOL);
          return;
        }

        console.log('✅ Saldo suficiente confirmado');
      }

      // Saldo suficiente ou sem valor específico - prosseguir
      console.log('🚀 Prosseguindo para tela de pagamento...');
      setRecipientData(recipientInfo);
      setShowSendScreen(true);

    } catch (error) {
      console.error('❌ Erro ao processar QR Code:', error);
      Alert.alert('Erro', 'Não foi possível processar o QR Code');
    } finally {
      setIsProcessingQR(false);
    }
  };

  // ========================================
  // HANDLERS DE EVENTOS
  // ========================================

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      if (result.granted) {
        setCameraReady(true);
        Alert.alert('Sucesso', 'Câmera habilitada!');
      } else {
        Alert.alert(
          'Permissão Negada', 
          'Para escanear QR Codes, é necessário permitir o acesso à câmera.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      Alert.alert('Erro', 'Não foi possível solicitar permissão da câmera.');
    }
  };

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    console.log('📱 QR Code detectado:', result.data);
    
    if (result.data && !isProcessingQR) {
      processQRCodeWithBalanceCheck(result.data);
    }
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      Alert.alert('Erro', 'Digite os dados do QR Code ou um endereço Solana');
      return;
    }
    
    processQRCodeWithBalanceCheck(manualInput.trim());
  };

  const handleBackFromSendScreen = () => {
    setShowSendScreen(false);
    setRecipientData(null);
    setManualInput('');
    // Reativar scanner se estiver escaneando
  };

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  // Se deve mostrar a tela de envio
  if (showSendScreen && recipientData) {
    return (
      <SendPaymentScreen
        onBack={handleBackFromSendScreen}
        publicKey={publicKey}
        session={session}
        recipientData={recipientData}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../../../assets/icons/qr-codeBRANCO.png')} 
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </View>

      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Pagar</Text>
        {/* Indicador de Saldo */}
        {balance && (
          <Text style={styles.balanceIndicator}>
            💰 Saldo: {balance.balance.toFixed(4)} SOL
          </Text>
        )}
        {balanceLoading && (
          <Text style={styles.balanceIndicator}>
            🔄 Carregando saldo...
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Câmera / Scanner */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraViewfinder}>
            {cameraReady && permission?.granted ? (
              <View style={styles.cameraWrapper}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  onBarcodeScanned={isProcessingQR ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                >
                  <View style={styles.scannerOverlay}>
                    <View style={styles.cornerTopLeft} />
                    <View style={styles.cornerTopRight} />
                    <View style={styles.cornerBottomLeft} />
                    <View style={styles.cornerBottomRight} />
                    
                    {/* Instruções */}
                    <View style={styles.instructionOverlay}>
                      <Text style={styles.instructionText}>
                        {isProcessingQR ? 'Processando...' : 'Aponte para o QR Code'}
                      </Text>
                      {isProcessingQR && (
                        <ActivityIndicator size="small" color="#FFFFFF" style={{ marginTop: 8 }} />
                      )}
                    </View>
                  </View>
                </CameraView>
              </View>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Text style={styles.idleText}>
                  {permission === null ? 'Carregando câmera...' : 
                   !permission?.granted ? 'Câmera não autorizada' : 
                   'Aponte a câmera para o QR Code'}
                </Text>
                
                {permission && !permission.granted && (
                  <TouchableOpacity 
                    style={styles.permissionButton}
                    onPress={handleRequestPermission}
                  >
                    <Text style={styles.permissionButtonText}>
                      {permission.canAskAgain ? 'Permitir Câmera' : 'Abrir Configurações'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {permission === null && (
                  <ActivityIndicator size="small" color="#AB9FF3" style={{ marginTop: 10 }} />
                )}
              </View>
            )}
          </View>
        </View>

        {/* Botão Input Manual */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.manualButton}
            onPress={() => setShowManualInput(!showManualInput)}
            disabled={isProcessingQR}
          >
            <Text style={styles.manualButtonText}>
              {showManualInput ? 'Ocultar Input Manual' : 'Inserir Manualmente'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Manual */}
        {showManualInput && (
          <View style={styles.manualInputContainer}>
            <Text style={styles.manualInputLabel}>
              Cole os dados do QR Code ou endereço Solana:
            </Text>
            <TextInput
              style={styles.manualTextInput}
              placeholder="Dados do QR Code ou endereço Solana..."
              placeholderTextColor="#888888"
              value={manualInput}
              onChangeText={setManualInput}
              multiline
              numberOfLines={4}
              editable={!isProcessingQR}
            />
            <TouchableOpacity 
              style={[styles.processButton, isProcessingQR && styles.processButtonDisabled]}
              onPress={handleManualInput}
              disabled={!manualInput.trim() || isProcessingQR}
            >
              {isProcessingQR ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.processButtonText}>Processar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Botão Voltar */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
          disabled={isProcessingQR}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QRPayScreen;