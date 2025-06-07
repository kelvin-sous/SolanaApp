// ========================================
// src/screens/main/QRReceiveScreen/index.tsx
// Tela de Receber via QR Code
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import QRCodeService from '../../../services/qr/QRCodeService';
import { styles } from './styles';

interface QRReceiveScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
}

const QRReceiveScreen: React.FC<QRReceiveScreenProps> = ({ onBack, publicKey }) => {
  const [amountUSD, setAmountUSD] = useState('');
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInputs, setShowInputs] = useState(true);

  const qrService = QRCodeService.getInstance();

  useEffect(() => {
    // Gerar QR Code simples com apenas o endereço ao carregar
    generateSimpleQR();
  }, [publicKey]);

  const generateSimpleQR = async () => {
    try {
      setIsGenerating(true);
      const simpleQR = qrService.generateSimpleAddressQR(publicKey.toString());
      setQrData(simpleQR);
      console.log('✅ QR Code simples gerado');
    } catch (error) {
      console.error('❌ Erro ao gerar QR simples:', error);
      Alert.alert('Erro', 'Não foi possível gerar QR Code');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomQR = async () => {
    try {
      setIsGenerating(true);

      const amountValue = parseFloat(amountUSD) || undefined;
      
      const qrString = await qrService.generateReceiveQRData({
        publicKey: publicKey.toString(),
        amountUSD: amountValue,
        label: label || undefined,
        message: message || undefined
      });

      setQrData(qrString);
      setShowInputs(false);
      
      console.log('✅ QR Code personalizado gerado');
      
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Não foi possível gerar QR Code: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetToSimple = () => {
    setAmountUSD('');
    setLabel('');
    setMessage('');
    setShowInputs(true);
    generateSimpleQR();
  };

  const copyQRData = () => {
    if (qrData) {
      // Em uma implementação real, usar Clipboard
      Alert.alert('QR Code', 'Dados copiados para área de transferência');
    }
  };

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
        <Text style={styles.title}>Receber</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Container do QR Code */}
        <View style={styles.qrCodeContainer}>
          <View style={styles.qrCodePlaceholder}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#262728" />
                <Text style={styles.loadingText}>Gerando QR Code...</Text>
              </View>
            ) : qrData ? (
              <View style={styles.qrCodeContent}>
                <Text style={styles.qrCodeData}>{qrData}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={copyQRData}>
                  <Text style={styles.copyButtonText}>Copiar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.qrPlaceholderText}>QR Code será exibido aqui</Text>
            )}
          </View>
        </View>

        {/* Informações da carteira */}
        <View style={styles.walletInfo}>
          <Text style={styles.walletLabel}>Endereço da Carteira:</Text>
          <Text style={styles.walletAddress}>
            {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
          </Text>
        </View>

        {/* Formulário de personalização */}
        {showInputs && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputSectionTitle}>Personalizar QR Code (Opcional)</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor (USD):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: 10.50"
                placeholderTextColor="#888888"
                value={amountUSD}
                onChangeText={setAmountUSD}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Pagamento de serviço"
                placeholderTextColor="#888888"
                value={label}
                onChangeText={setLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mensagem:</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                placeholder="Mensagem adicional (opcional)"
                placeholderTextColor="#888888"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={styles.generateButton}
              onPress={generateCustomQR}
              disabled={isGenerating}
            >
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Gerando...' : 'Gerar QR Personalizado'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botão para voltar ao QR simples */}
        {!showInputs && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetToSimple}
            >
              <Text style={styles.resetButtonText}>Voltar ao QR Simples</Text>
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
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QRReceiveScreen;