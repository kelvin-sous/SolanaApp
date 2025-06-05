// Polyfill necessário para Solana Web3.js
import 'react-native-get-random-values';

import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import PhantomConnectScreen from './src/screens/auth/PhantomConnectScreen';
import { appStyles } from './src/styles/app.styles';

export default function App() {
  return (
    <View style={appStyles.container}>
      <PhantomConnectScreen />
      <StatusBar style="light" />
    </View>
  );
}