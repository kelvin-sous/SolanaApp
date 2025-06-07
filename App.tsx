// ========================================
// App.tsx - Com verificação de plataforma para iOS
// ========================================

// Polyfill necessário para Solana Web3.js
import 'react-native-get-random-values';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, Text } from 'react-native';
import { appStyles } from './src/styles/app.styles';

// Imports condicionais para evitar problemas no iOS
let PhantomConnectScreen: any;
let HomeScreen: any;
let usePhantom: any;

try {
  PhantomConnectScreen = require('./src/screens/auth/PhantomConnectScreen').default;
  HomeScreen = require('./src/screens/main/HomeScreen').default;
  usePhantom = require('./src/hooks/usePhantom').usePhantom;
} catch (error) {
  console.error('❌ Erro ao importar componentes:', error);
}

export default function App() {
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

  // Componente principal funcional
  return <MainApp />;
}

// Componente principal separado
const MainApp: React.FC = () => {
  const { isConnected, publicKey, disconnect } = usePhantom();

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
    </View>
  );
};