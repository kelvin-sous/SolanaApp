// ========================================
// src/screens/main/QRPayScreen/index.tsx
// Tela de Pagar via QR Code Scanner
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
import { useQRCode } from '../../../hooks/useQRCode';
import { styles } from './styles';

interface QRPayScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
  session?: any; // Session opcional para evitar erros
}

const QRPayScreen: React.FC<QRPayScreenProps> = ({ onBack, publicKey, session }) => {
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  const {
    isScanning,
    isProcessing,
    scannedData,
    transactionPreview,
    error,
    startScanning,
    stopScanning,
    processQRCode,
    executeTransaction,
    clearData,
    formatQRData
  } = useQRCode();

  // Simular scan automático após 3 segundos (para demo)
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        // Em uma implementação real, isso seria substituído pela câmera
        simulateQRScan();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const simulateQRScan = () => {
    // QR Code de exemplo para testes
    const mockQRCode = JSON.stringify({
      type: 'WALLET_ADDRESS',
      recipient: 'HN7cABqLq46Es1jh92dQQisAQ662SmxELLLsHHe4YWrH', // Endereço de exemplo
      amount: 0.1,
      amountUSD: 10.0,
      label: 'Pagamento de teste',
      message: 'Teste de pagamento via QR',
      timestamp: Date.now(),
      network: 'devnet'
    });
    
    processQRCode(mockQRCode, publicKey.toString());
  };

  const handleStartScan = () => {
    clearData();
    startScanning();
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      Alert.alert('Erro', 'Digite os dados do QR Code');
      return;
    }
    
    processQRCode(manualInput.trim(), publicKey.toString());
  };

  const handleConfirmTransaction = () => {
    if (!transactionPreview) {
      Alert.alert('Erro', 'Nenhuma transação para confirmar');
      return;
    }

    Alert.alert(
      'Confirmar Pagamento',
      `Deseja pagar ${transactionPreview.amountSOL.toFixed(6)} SOL (~${transactionPreview.amountUSD.toFixed(2)}) para ${transactionPreview.to.slice(0, 8)}...?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'default',
          onPress: () => executeTransaction(session)
        }
      ]
    );
  };

  const handleCancel = () => {
    stopScanning();
    clearData();
  };

  const renderScanningState = () => (
    <View style={styles.scanningContainer}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={styles.scanningText}>Escaneando QR Code...</Text>
      <Text style={styles.scanningSubtext}>Aponte a câmera para o QR Code</Text>
      
      <TouchableOpacity 
        style={styles.cancelScanButton}
        onPress={handleCancel}
      >
        <Text style={styles.cancelScanText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransactionPreview = () => {
    if (!transactionPreview || !scannedData) return null;

    const formattedData = formatQRData(scannedData);

    return (
      <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Confirmar Pagamento</Text>
          
          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Para:</Text>
            <Text style={styles.previewValue}>{formattedData.recipient}</Text>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Valor:</Text>
            <Text style={styles.previewValue}>{formattedData.amount}</Text>
          </View>

          {formattedData.label && (
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Descrição:</Text>
              <Text style={styles.previewValue}>{formattedData.label}</Text>
            </View>
          )}

          {formattedData.message && (
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Mensagem:</Text>
              <Text style={styles.previewValue}>{formattedData.message}</Text>
            </View>
          )}

          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Taxa estimada:</Text>
            <Text style={styles.previewValue}>{transactionPreview.estimatedFee.toFixed(6)} SOL</Text>
          </View>

          <View style={[styles.previewSection, styles.totalSection]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {transactionPreview.estimatedTotal.toFixed(6)} SOL
            </Text>
          </View>

          {!transactionPreview.isValid && (
            <View style={styles.errorSection}>
              <Text style={styles.errorTitle}>Erros encontrados:</Text>
              {transactionPreview.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>• {error}</Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.previewActions}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.confirmButton, 
              !transactionPreview.isValid && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirmTransaction}
            disabled={!transactionPreview.isValid || isProcessing}
          >
            <Text style={styles.confirmButtonText}>
              {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderIdleState = () => (
    <>
      {/* Container da câmera/scanner */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraViewfinder}>
          <Text style={styles.idleText}>Toque para escanear QR Code</Text>
          
          {/* Cantos do viewfinder */}
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>
      </View>

      {/* Botões de ação */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={handleStartScan}
        >
          <Text style={styles.scanButtonText}>Escanear QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.manualButton}
          onPress={() => setShowManualInput(!showManualInput)}
        >
          <Text style={styles.manualButtonText}>Inserir Manualmente</Text>
        </TouchableOpacity>
      </View>

      {/* Input manual */}
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
    </>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* Header com ícone QR-Code */}
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
      </View>

      {/* Conteúdo dinâmico baseado no estado */}
      <View style={styles.contentContainer}>
        {isScanning && renderScanningState()}
        {transactionPreview && renderTransactionPreview()}
        {!isScanning && !transactionPreview && renderIdleState()}
      </View>

      {/* Botão Voltar */}
      {!isScanning && !transactionPreview && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default QRPayScreen;