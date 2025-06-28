// ========================================
// src/screens/main/NFCScreen/index.tsx
// Tela de seleção NFC - CORRIGIDA: Com publicKey e session
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { usePhantom } from '../../../hooks/usePhantom';
import { useBalance } from '../../../hooks/useBalance';
import NFCSendScreen from '../NFCSendScreen';
import NFCReceiveScreen from '../NFCReceiveScreen';
import NFCService from '../../../services/nfc/NFCService';
import { styles } from './styles';

interface NFCScreenProps {
  onBack: () => void;
}

type NFCMode = 'selection' | 'send' | 'receive';

const NFCScreen: React.FC<NFCScreenProps> = ({ onBack }) => {
  const [currentMode, setCurrentMode] = useState<NFCMode>('selection');
  const [selectedMode, setSelectedMode] = useState<'send' | 'receive' | null>(null);

  const { isConnected, publicKey, session } = usePhantom();
  const { balance } = useBalance(publicKey);

  // Verificar NFC ao montar o componente
  useEffect(() => {
    checkNFCAvailability();
  }, []);

  /**
   * Verifica disponibilidade do NFC
   */
  const checkNFCAvailability = async () => {
    try {
      const nfcService = NFCService.getInstance();
      const nfcStatus = await nfcService.checkNFCStatus();
      
      if (!nfcStatus.supported) {
        Alert.alert(
          'NFC não suportado',
          'Este dispositivo não suporta NFC.',
          [{ text: 'OK', onPress: onBack }]
        );
      } else if (!nfcStatus.enabled) {
        Alert.alert(
          'NFC desabilitado',
          'Para usar transferências via NFC, você precisa habilitar o NFC nas configurações do dispositivo.',
          [
            { text: 'Cancelar', onPress: onBack },
            { text: 'Configurações', onPress: () => {/* TODO: Abrir configurações */} }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Erro ao verificar NFC:', error);
    }
  };

  /**
   * Navega para tela de envio
   */
  const handleSendMode = () => {
    if (!isConnected || !publicKey) {
      Alert.alert('Erro', 'Não conectado com Phantom Wallet');
      return;
    }

    if (!balance || balance.balance <= 0) {
      Alert.alert(
        'Saldo Insuficiente',
        'Você precisa ter SOL na sua carteira para enviar transferências.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedMode('send');
    setCurrentMode('send');
  };

  /**
   * Navega para tela de recebimento
   */
  const handleReceiveMode = () => {
    if (!isConnected || !publicKey) {
      Alert.alert('Erro', 'Não conectado com Phantom Wallet');
      return;
    }

    setSelectedMode('receive');
    setCurrentMode('receive');
  };

  /**
   * Volta para seleção de modo
   */
  const handleBackToSelection = () => {
    setCurrentMode('selection');
    setSelectedMode(null);
  };

  /**
   * Volta para HomeScreen
   */
  const handleBackToHome = () => {
    setCurrentMode('selection');
    setSelectedMode(null);
    onBack();
  };

  // Renderizar tela de envio
  if (currentMode === 'send' && publicKey) {
    return (
      <NFCSendScreen 
        onBack={handleBackToSelection}
        publicKey={publicKey}
        session={session}
      />
    );
  }

  // Renderizar tela de recebimento
  if (currentMode === 'receive' && publicKey) {
    return (
      <NFCReceiveScreen 
        onBack={handleBackToSelection}
        publicKey={publicKey}
        session={session}
      />
    );
  }

  // Tela de seleção de modo NFC
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* SCROLLVIEW COM FLEX PARA BOTÃO FIXO */}
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={{ flex: 1 }}
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
            <Text style={styles.modeButtonTextActive}>Transferências NFC</Text>
          </View>

          {/* Card de informações da carteira */}
          <View style={styles.walletInfoCard}>
            <Text style={styles.walletInfoLabel}>Sua carteira:</Text>
            <Text style={styles.walletInfoAddress}>
              {publicKey ? `${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}` : 'Carregando...'}
            </Text>
            <Text style={styles.walletInfoBalance}>
              Saldo: {balance ? `${balance.balance.toFixed(6)} SOL` : 'Carregando...'}
            </Text>
            <Text style={styles.walletInfoStatus}>
              Status: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
            </Text>
          </View>

          {/* Opções de modo NFC */}
          <View style={styles.modeOptionsContainer}>
            <TouchableOpacity 
              style={[
                styles.modeOptionButton,
                (!isConnected || !publicKey) && styles.modeOptionButtonDisabled
              ]}
              onPress={handleSendMode}
              disabled={!isConnected || !publicKey}
            >
              <View style={styles.modeOptionIconContainer}>
                <Image 
                  source={require('../../../../assets/icons/nfcBRANCO.png')}
                  style={[styles.modeOptionIcon, { transform: [{ rotate: '45deg' }] }]}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.modeOptionContent}>
                <Text style={styles.modeOptionTitle}>📤 Enviar</Text>
                <Text style={styles.modeOptionDescription}>
                  Envie SOL para outro dispositivo via NFC
                </Text>
                <Text style={styles.modeOptionNote}>
                  Requer saldo disponível
                </Text>
                {!isConnected && (
                  <Text style={styles.modeOptionError}>
                    ⚠️ Conecte-se com Phantom
                  </Text>
                )}
                {isConnected && balance && balance.balance <= 0 && (
                  <Text style={styles.modeOptionError}>
                    ⚠️ Saldo insuficiente
                  </Text>
                )}
              </View>
              <Text style={styles.modeOptionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.modeOptionButton,
                (!isConnected || !publicKey) && styles.modeOptionButtonDisabled
              ]}
              onPress={handleReceiveMode}
              disabled={!isConnected || !publicKey}
            >
              <View style={styles.modeOptionIconContainer}>
                <Image 
                  source={require('../../../../assets/icons/nfcBRANCO.png')}
                  style={[styles.modeOptionIcon, { transform: [{ rotate: '-45deg' }] }]}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.modeOptionContent}>
                <Text style={styles.modeOptionTitle}>📥 Receber</Text>
                <Text style={styles.modeOptionDescription}>
                  Receba SOL de outro dispositivo via NFC
                </Text>
                <Text style={styles.modeOptionNote}>
                  Aguarda conexão do remetente
                </Text>
                {!isConnected && (
                  <Text style={styles.modeOptionError}>
                    ⚠️ Conecte-se com Phantom
                  </Text>
                )}
              </View>
              <Text style={styles.modeOptionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Instruções de uso */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Como usar transferências NFC:</Text>
            <View style={styles.instructionStep}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Escolha se você quer enviar ou receber SOL
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Mantenha os dispositivos próximos (até 4cm)
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Confirme os dados da transação quando solicitado
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>
                Aguarde a confirmação na blockchain Solana
              </Text>
            </View>
          </View>

          {/* Informações de segurança */}
          <View style={styles.securityContainer}>
            <Text style={styles.securityTitle}>🔒 Segurança NFC:</Text>
            <Text style={styles.securityText}>
              • As transferências NFC usam a tecnologia de campo próximo{'\n'}
              • Sempre verifique os dados antes de confirmar{'\n'}
              • Mantenha os dispositivos próximos durante toda a operação{'\n'}
              • As transações são processadas na blockchain Solana
            </Text>
          </View>

          <View style={{ height: 40 }} />

          {/* Status de conexão */}
          {!isConnected && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Conecte-se com Phantom Wallet para usar transferências NFC
              </Text>
            </View>
          )}

          {isConnected && (!balance || balance.balance <= 0) && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ℹ️ Você pode receber SOL, mas precisa de saldo para enviar
              </Text>
            </View>
          )}
        </ScrollView>

        {/* BOTÃO FIXO NA PARTE INFERIOR */}
        <View style={styles.fixedBottomContainer}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default NFCScreen;