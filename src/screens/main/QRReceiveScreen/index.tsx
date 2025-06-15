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
  ScrollView,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import QRCode from 'react-native-qrcode-svg';
import QRCodeService from '../../../services/qr/QRCodeService';
import { styles } from './styles';

interface QRReceiveScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
}

const QRReceiveScreen: React.FC<QRReceiveScreenProps> = ({ onBack, publicKey }) => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const copyQRData = async () => {
    if (qrData) {
      try {
        await Clipboard.setString(qrData);
        Alert.alert('Sucesso', 'Dados do QR Code copiados para área de transferência');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível copiar os dados');
      }
    }
  };

  const shareAddress = async () => {
    try {
      await Clipboard.setString(publicKey.toString());
      Alert.alert('Endereço Copiado', 'Endereço da carteira copiado para área de transferência');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar o endereço');
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

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Container do QR Code */}
        <View style={styles.qrCodeContainer}>
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Gerando QR Code...</Text>
            </View>
          ) : qrData ? (
            <View style={styles.qrCodeContent}>
              <QRCode
                value={qrData}
                size={220}
                color="#FFFFFF"
                backgroundColor="transparent"
                logoSize={30}
                logoBackgroundColor="transparent"
              />
              <TouchableOpacity style={styles.copyButton} onPress={copyQRData}>
                <Text style={styles.copyButtonText}>Copiar Dados</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.qrPlaceholderText}>QR Code será exibido aqui</Text>
            </View>
          )}
        </View>

        {/* Informações da carteira */}
        <View style={styles.walletInfo}>
          <Text style={styles.walletLabel}>Endereço da Carteira:</Text>
          <TouchableOpacity onPress={shareAddress} activeOpacity={0.7}>
            <Text style={styles.walletAddress}>
              {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </Text>
            <Text style={styles.tapToCopy}>Toque para copiar endereço completo</Text>
          </TouchableOpacity>
        </View>

        {/* Informações adicionais */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como receber pagamentos:</Text>
          <Text style={styles.infoText}>
            • Compartilhe este QR Code com quem vai enviar{'\n'}
            • O pagador irá escanear e digitar o valor{'\n'}
            • Você receberá a confirmação da transação
          </Text>
        </View>
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