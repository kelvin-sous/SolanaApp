// ========================================
// src/screens/auth/PhantomConnectScreen/index.tsx
// Tela principal para conexão com Phantom Wallet
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  Linking,
  Image
} from 'react-native';
import { usePhantom } from '../../../hooks/usePhantom';
import HomeScreen from '../../main/HomeScreen';
import { COLORS } from '../../../constants/colors';
import { styles } from './styles';

const PhantomConnectScreen: React.FC = () => {
  const {
    isConnected,
    isLoading,
    error,
    publicKey,
    connect,
    disconnect
  } = usePhantom();

  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      const result = await connect();
      if (result === 'DOWNLOAD_NEEDED') {
        Alert.alert(
          'Phantom não encontrado',
          'O aplicativo Phantom Wallet não está instalado. Você foi redirecionado para a página de download.'
        );
      }
    } catch (err) {
      console.error('Erro ao conectar:', err);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Desconectar Wallet',
      'Tem certeza que deseja desconectar sua wallet?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Desconectar', 
          style: 'destructive',
          onPress: disconnect 
        }
      ]
    );
  };

  const copyAddress = () => {
    if (publicKey) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Endereço copiado!', publicKey.toString().slice(0, 8) + '...');
    }
  };

  const openPhantomWebsite = () => {
    Linking.openURL('https://phantom.app');
  };

  const openSupport = () => {
    Linking.openURL('https://help.phantom.app');
  };

  // Se conectado, mostrar a HomeScreen
  if (isConnected && publicKey) {
    return <HomeScreen />;
  }

  // Renderizar tela quando NÃO conectado (estilo Phantom)
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            FAÇA LOGIN COM SUA{'\n'}PHANTOM WALLET
          </Text>
        </View>

        {/* Phantom Card */}
        <View style={styles.phantomCardContainer}>
          <View style={styles.phantomCardBack} />
          <View style={styles.phantomCardFront}>
            <View style={styles.phantomLogo}>
              <Image 
                source={require('../../../../assets/icons/phantom.png')}
                style={styles.phantomLogoImage}
                resizeMode="contain"
              />
              <Text style={styles.phantomLogoText}>PHANTOM</Text>
            </View>

            <View style={styles.connectButtonContainer}>
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.connectButtonText}>Conectar Phantom</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={openPhantomWebsite}>
                <Text style={styles.noPhantomText}>NÃO TENHO PHANTOM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#FF000020', borderColor: '#FF0000' }]}>
            <Text style={[styles.errorTitle, { color: '#FFF' }]}>⚠️ Erro</Text>
            <Text style={[styles.errorText, { color: '#FFF' }]}>{error}</Text>
          </View>
        )}

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => Alert.alert('Contato', 'TCC - Unieuro, Aguas Claras DF')}>
            <Text style={styles.footerLink}>CONTATO</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openPhantomWebsite}>
            <Text style={styles.footerLink}>PHANTOM</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openSupport}>
            <Text style={styles.footerLink}>SUPORTE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PhantomConnectScreen;