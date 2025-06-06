// ========================================
// App.tsx - Integração final com sua estrutura existente
// ========================================

// Polyfill necessário para Solana Web3.js
import 'react-native-get-random-values';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import PhantomConnectScreen from './src/screens/auth/PhantomConnectScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import { usePhantom } from './src/hooks/usePhantom';
import { appStyles } from './src/styles/app.styles';

export default function App() {
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
}