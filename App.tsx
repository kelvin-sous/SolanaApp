// Polyfill necessário para Solana Web3.js
import 'react-native-get-random-values';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import PhantomConnectScreen from './src/screens/auth/PhantomConnectScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <PhantomConnectScreen />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});