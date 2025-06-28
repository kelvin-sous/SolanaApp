// ========================================
// App.tsx - Com verificação de plataforma para iOS e NFC REAL
// ========================================

import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Polyfill necessário para Solana Web3.js
import 'react-native-get-random-values';

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, Text, Alert } from 'react-native';
import { appStyles } from './src/styles/app.styles';

// Imports condicionais para evitar problemas no iOS
let PhantomConnectScreen: any;
let HomeScreen: any;
let usePhantom: any;
let NFCInitializer: any;

try {
  PhantomConnectScreen = require('./src/screens/auth/PhantomConnectScreen').default;
  HomeScreen = require('./src/screens/main/HomeScreen').default;
  usePhantom = require('./src/hooks/usePhantom').usePhantom;
  
  // ✨ NOVO: Import do NFCInitializer
  NFCInitializer = require('./src/services/nfc/NFCInitializer').NFCInitializer;
} catch (error) {
  console.error('❌ Erro ao importar componentes:', error);
}

export default function App() {
  // ✨ NOVO: Estado para inicialização do NFC
  const [nfcInitialized, setNfcInitialized] = useState(false);
  const [nfcError, setNfcError] = useState<string | null>(null);

  // ✨ NOVO: Inicializar NFC quando app carrega
  useEffect(() => {
    initializeNFC();
    
    // Cleanup quando app é fechado
    return () => {
      if (NFCInitializer) {
        NFCInitializer.cleanup().catch((error: any) => {
          console.error('❌ Erro ao limpar NFC:', error);
        });
      }
    };
  }, []);

  // ✨ NOVO: Função para inicializar NFC
  const initializeNFC = async () => {
    try {
      if (!NFCInitializer) {
        console.log('⚠️ NFCInitializer não disponível (normal em iOS/Expo Go)');
        setNfcError('NFC não disponível nesta plataforma');
        setNfcInitialized(true); // Continua sem NFC
        return;
      }

      console.log('🔄 Inicializando NFC...');
      
      // Verificar disponibilidade primeiro
      const availability = await NFCInitializer.checkAvailability();
      console.log('📱 Disponibilidade NFC:', availability);

      if (!availability.supported) {
        console.log('ℹ️ NFC não suportado neste dispositivo');
        setNfcError('NFC não suportado neste dispositivo');
        setNfcInitialized(true); // Continua sem NFC
        return;
      }

      if (!availability.enabled) {
        console.log('⚠️ NFC não habilitado nas configurações');
        setNfcError('NFC não habilitado nas configurações');
        setNfcInitialized(true); // Continua sem NFC
        return;
      }

      // Inicializar NFC
      const success = await NFCInitializer.initialize();
      
      if (success) {
        console.log('🎉 NFC inicializado com sucesso!');
        setNfcError(null);
      } else {
        console.log('❌ Falha ao inicializar NFC');
        setNfcError('Falha ao inicializar NFC');
      }

      setNfcInitialized(true);

    } catch (error) {
      console.error('❌ Erro na inicialização do NFC:', error);
      setNfcError(error instanceof Error ? error.message : 'Erro desconhecido');
      setNfcInitialized(true); // Continua mesmo com erro
    }
  };

  // Se não conseguiu importar os componentes (erro de dependências nativas)
  if (!PhantomConnectScreen || !HomeScreen || !usePhantom) {
    return (
      <View style={[appStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <StatusBar style="light" />
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          🚧 Funcionalidades Limitadas
        </Text>
        <Text style={{ color: '#AAAAAA', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
          {Platform.OS === 'ios'
            ? 'Para usar todas as funcionalidades NFC no iOS, você precisa criar um development build.\n\nEste é um limite do Expo Go, não do seu código.'
            : 'Algumas dependências não puderam ser carregadas. Verifique a instalação.'}
        </Text>
      </View>
    );
  }

  // ✨ NOVO: Mostrar loading enquanto inicializa NFC
  if (!nfcInitialized) {
    return (
      <View style={[appStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <StatusBar style="light" />
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          🔄 Inicializando App...
        </Text>
        <Text style={{ color: '#AAAAAA', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
          Verificando funcionalidades NFC...
        </Text>
      </View>
    );
  }

  // Componente principal funcional
  return <MainApp nfcError={nfcError} />;
}

// ✨ ATUALIZADO: Componente principal com informações de NFC
const MainApp: React.FC<{ nfcError: string | null }> = ({ nfcError }) => {
  const { isConnected, publicKey, disconnect } = usePhantom();

  // ✨ NOVO: Mostrar aviso sobre NFC se houver erro (apenas uma vez)
  useEffect(() => {
    if (nfcError && Platform.OS === 'android') {
      // Mostrar aviso apenas no Android, no iOS é esperado
      const timeout = setTimeout(() => {
        Alert.alert(
          'Aviso NFC',
          `${nfcError}\n\nVocê ainda pode usar todas as outras funcionalidades do app, apenas as transferências NFC não estarão disponíveis.`,
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }, 2000); // Delay para não atrapalhar outras inicializações

      return () => clearTimeout(timeout);
    }
  }, [nfcError]);

  // Renderizar tela de conexão se não estiver conectado
  if (!isConnected || !publicKey) {
    return (
      <View style={appStyles.container}>
        <StatusBar style="light" />
        <PhantomConnectScreen />
      </View>
    );
  }

  // Renderizar HomeScreen quando conectado
  return (
    <View style={appStyles.container}>
      <StatusBar style="light" />
      <HomeScreen
        publicKey={publicKey}
        disconnect={disconnect}
      />
      
      {/* ✨ NOVO: Indicador de status NFC no canto da tela (opcional) */}
      {__DEV__ && (
        <View style={{
          position: 'absolute',
          top: 50,
          right: 10,
          backgroundColor: 'rgba(0,0,0,0.7)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          zIndex: 1000,
        }}>
          <Text style={{
            color: nfcError ? '#ef4444' : '#22c55e',
            fontSize: 10,
            fontWeight: '600',
          }}>
            NFC: {nfcError ? '❌' : '✅'}
          </Text>
        </View>
      )}
    </View>
  );
};

// ========================================
// LOGS DE DEBUG PARA DESENVOLVIMENTO
// ========================================

if (__DEV__) {
  console.log('🚀 App iniciado em modo desenvolvimento');
  console.log('📱 Plataforma:', Platform.OS);
  console.log('🔧 Versão:', Platform.Version);
  
  // Log de funcionalidades disponíveis
  const features = {
    phantom: !!usePhantom,
    nfc: !!NFCInitializer,
    platform: Platform.OS,
  };
  console.log('🎯 Funcionalidades disponíveis:', features);
}