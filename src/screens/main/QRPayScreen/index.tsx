// ========================================
// src/screens/main/QRPayScreen/index.tsx
// Tela de Scanner QR Code com verificação de saldo
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
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useQRCode } from '../../../hooks/useQRCode';
import { useBalance } from '../../../hooks/useBalance';
import SendPaymentScreen from '../SendPaymentScreen';
import SolanaService from '../../../services/solana/SolanaService';
import { styles } from './styles';

interface QRPayScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
  session?: any;
}

const QRPayScreen: React.FC<QRPayScreenProps> = ({ onBack, publicKey, session }) => {
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [recipientData, setRecipientData] = useState<any>(null);
  const [showSendScreen, setShowSendScreen] = useState(false);

  const { isProcessing, clearData } = useQRCode();
  const { balance, isLoading: balanceLoading, refreshBalance } = useBalance(publicKey);

  // Verificar permissões ao carregar a tela
  useEffect(() => {
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
          }
        } else if (permission.granted) {
          console.log('✅ Permissão já concedida!');
          setCameraReady(true);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar câmera:', error);
      }
    };

    initializeCamera();
  }, [permission]);

  // ✨ FUNÇÃO PARA VERIFICAR SALDO SUFICIENTE (CORRIGIDA)
  const checkSufficientBalance = async (requestedAmount: number, amountType: 'SOL' | 'USD' = 'SOL'): Promise<boolean> => {
    try {
      console.log('🔍 Verificando saldo suficiente...', { requestedAmount, amountType, balance: balance?.balance });
      
      if (!balance) {
        console.log('⚠️ Saldo não carregado ainda');
        return false;
      }

      let requiredSOL = requestedAmount;

      // Se o valor for em USD, converter para SOL
      if (amountType === 'USD') {
        console.log('💱 Convertendo USD para SOL...');
        const solanaService = SolanaService.getInstance();
        requiredSOL = await solanaService.convertUSDToSOL(requestedAmount);
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

      return availableSOL >= totalRequired;

    } catch (error) {
      console.error('❌ Erro ao verificar saldo:', error);
      return false;
    }
  };

  // ✨ FUNÇÃO PARA MOSTRAR ALERT DE SALDO INSUFICIENTE
  const showInsufficientBalanceAlert = (requestedAmount: number, amountType: 'SOL' | 'USD' = 'SOL') => {
    const currentBalance = balance?.balance || 0;
    const amountText = amountType === 'USD' 
      ? `$${requestedAmount.toFixed(2)} USD` 
      : `${requestedAmount.toFixed(4)} SOL`;

    Alert.alert(
      '💸 Saldo Insuficiente',
      `Você não possui SOL suficiente para esta transação.\n\n` +
      `💰 Saldo atual: ${currentBalance.toFixed(4)} SOL\n` +
      `📤 Valor solicitado: ${amountText}\n\n` +
      `Adicione SOL à sua carteira para continuar.`,
      [
        {
          text: 'Faucet Devnet',
          onPress: () => {
            console.log('🚰 Redirecionando para faucet...');
            // Aqui você pode implementar abertura do faucet
            // Linking.openURL('https://faucet.solana.com');
          },
          style: 'default'
        },
        {
          text: 'Atualizar Saldo',
          onPress: () => {
            refreshBalance();
          },
          style: 'default'
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
  };

  // ✨ FUNÇÃO PARA PROCESSAR QR CODE COM VERIFICAÇÃO DE SALDO (CORRIGIDA)
  const processQRCodeWithBalanceCheck = async (qrData: any) => {
    try {
      console.log('🔍 Processando QR Code com verificação:', qrData);

      // Estruturar dados do destinatário
      const recipientInfo = {
        address: qrData.recipient || qrData.address,
        label: qrData.label || 'Transferência SOL',
        message: qrData.message || null,
        amount: qrData.amount || null,
        amountUSD: qrData.amountUSD || null
      };

      console.log('📋 Dados estruturados:', recipientInfo);

      // Se há valor especificado no QR Code, verificar saldo
      if (recipientInfo.amount || recipientInfo.amountUSD) {
        console.log('💳 QR Code contém valor - verificando saldo...');

        // Aguardar um momento para garantir que o saldo está carregado
        if (balanceLoading) {
          console.log('⏳ Aguardando carregamento do saldo...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        let hasBalance = false;

        if (recipientInfo.amount) {
          console.log('💰 Verificando saldo para SOL:', recipientInfo.amount);
          hasBalance = await checkSufficientBalance(recipientInfo.amount, 'SOL');
        } else if (recipientInfo.amountUSD) {
          console.log('💰 Verificando saldo para USD:', recipientInfo.amountUSD);
          hasBalance = await checkSufficientBalance(recipientInfo.amountUSD, 'USD');
        }

        console.log('✅ Resultado verificação saldo:', hasBalance);

        if (!hasBalance) {
          console.log('❌ Saldo insuficiente detectado');
          showInsufficientBalanceAlert(
            recipientInfo.amount || recipientInfo.amountUSD,
            recipientInfo.amount ? 'SOL' : 'USD'
          );
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
    }
  };

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      if (result.granted) {
        setCameraReady(true);
        Alert.alert('Sucesso', 'Câmera habilitada!');
      } else {
        Alert.alert('Erro', 'Permissão de câmera negada.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível solicitar permissão da câmera.');
    }
  };

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    console.log('📱 QR Code detectado:', result.data);
    if (result.data && !isProcessing) {
      try {
        // Tentar parsear como JSON primeiro
        const qrData = JSON.parse(result.data);
        processQRCodeWithBalanceCheck(qrData);
      } catch (error) {
        // Se não for JSON, tratar como endereço simples
        if (result.data.length === 44) {
          processQRCodeWithBalanceCheck({
            address: result.data,
            label: 'Transferência SOL',
            message: null
          });
        } else {
          Alert.alert('Erro', 'QR Code não contém um endereço Solana válido');
        }
      }
    }
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      Alert.alert('Erro', 'Digite os dados do QR Code');
      return;
    }
    
    try {
      const qrData = JSON.parse(manualInput.trim());
      processQRCodeWithBalanceCheck(qrData);
    } catch (error) {
      const address = manualInput.trim();
      if (address.length === 44) {
        processQRCodeWithBalanceCheck({
          address: address,
          label: 'Transferência SOL',
          message: null
        });
      } else {
        Alert.alert('Erro', 'Dados inválidos.');
      }
    }
  };

  // Se deve mostrar a tela de envio
  if (showSendScreen && recipientData) {
    return (
      <SendPaymentScreen
        onBack={() => {
          setShowSendScreen(false);
          setRecipientData(null);
        }}
        publicKey={publicKey}
        session={session}
        recipientData={recipientData}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      <View style={styles.header}>
        <Image 
          source={require('../../../../assets/icons/qr-codeBRANCO.png')} 
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Pagar</Text>
        {/* ✨ INDICADOR DE SALDO */}
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

      <View style={styles.contentContainer}>
        <View style={styles.cameraContainer}>
          <View style={styles.cameraViewfinder}>
            {cameraReady && permission?.granted ? (
              <View style={styles.cameraWrapper}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                >
                  <View style={styles.scannerOverlay}>
                    <View style={styles.cornerTopLeft} />
                    <View style={styles.cornerTopRight} />
                    <View style={styles.cornerBottomLeft} />
                    <View style={styles.cornerBottomRight} />
                  </View>
                </CameraView>
              </View>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Text style={styles.idleText}>
                  {permission === null ? 'Carregando câmera...' : 
                   !permission.granted ? 'Câmera não autorizada' : 
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

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.manualButton}
            onPress={() => setShowManualInput(!showManualInput)}
          >
            <Text style={styles.manualButtonText}>Inserir Manualmente</Text>
          </TouchableOpacity>
        </View>

        {showManualInput && (
          <View style={styles.manualInputContainer}>
            <Text style={styles.manualInputLabel}>Cole os dados do QR Code:</Text>
            <TextInput
              style={styles.manualTextInput}
              placeholder="Dados do QR Code..."
              placeholderTextColor="#888888"
              value={manualInput}
              onChangeText={setManualInput}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity 
              style={styles.processButton}
              onPress={handleManualInput}
              disabled={!manualInput.trim()}
            >
              <Text style={styles.processButtonText}>Processar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QRPayScreen;