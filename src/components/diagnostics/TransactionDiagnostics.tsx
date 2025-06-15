// ========================================
// src/components/diagnostics/TransactionDiagnostics.tsx
// Componente para diagnosticar problemas de transação
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import PhantomService from '../../services/phantom/PhantomService';
import SolanaService from '../../services/solana/SolanaService';

interface TransactionDiagnosticsProps {
  publicKey: PublicKey;
  onClose: () => void;
}

const TransactionDiagnostics: React.FC<TransactionDiagnosticsProps> = ({
  publicKey,
  onClose
}) => {
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>({});

  const addDiagnostic = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    const diagnostic = {
      test,
      status,
      message,
      details,
      timestamp: new Date()
    };
    
    console.log(`🔍 [${test}] ${status.toUpperCase()}: ${message}`, details || '');
    setDiagnostics(prev => [...prev, diagnostic]);
  };

  const runDiagnostics = async () => {
    try {
      setIsRunning(true);
      setDiagnostics([]);
      setTestResults({});

      addDiagnostic('INIT', 'success', 'Iniciando diagnósticos de transação...');

      // 1. Verificar PhantomService
      await testPhantomService();
      
      // 2. Verificar SolanaService
      await testSolanaService();
      
      // 3. Verificar conectividade de rede
      await testNetworkConnectivity();
      
      // 4. Verificar saldo
      await testBalance();
      
      // 5. Teste de transação simples
      await testSimpleTransaction();
      
      // 6. Verificar URLs de deep linking
      await testDeepLinking();

      addDiagnostic('COMPLETE', 'success', 'Diagnósticos concluídos!');
      
    } catch (error) {
      addDiagnostic('FATAL', 'error', 'Erro fatal nos diagnósticos', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testPhantomService = async () => {
    try {
      const phantomService = PhantomService.getInstance();
      
      // Verificar se está conectado
      const isConnected = phantomService.isConnected();
      addDiagnostic('PHANTOM_CONNECTION', isConnected ? 'success' : 'error', 
        `Phantom ${isConnected ? 'conectado' : 'não conectado'}`);
      
      if (isConnected) {
        const session = phantomService.getCurrentSession();
        const currentPublicKey = phantomService.getPublicKey();
        
        addDiagnostic('PHANTOM_SESSION', session ? 'success' : 'error',
          `Sessão ${session ? 'válida' : 'inválida'}`, {
            hasSession: !!session,
            hasPublicKey: !!currentPublicKey,
            sessionKeys: session ? Object.keys(session) : []
          });
          
        // Verificar se as chaves coincidem
        if (currentPublicKey && publicKey) {
          const keysMatch = currentPublicKey.toString() === publicKey.toString();
          addDiagnostic('KEY_MATCH', keysMatch ? 'success' : 'warning',
            `Chaves ${keysMatch ? 'coincidem' : 'não coincidem'}`, {
              phantomKey: currentPublicKey.toString().slice(0, 8) + '...',
              componentKey: publicKey.toString().slice(0, 8) + '...'
            });
        }
      }
      
    } catch (error) {
      addDiagnostic('PHANTOM_SERVICE', 'error', 'Erro ao testar PhantomService', error);
    }
  };

  const testSolanaService = async () => {
    try {
      const solanaService = SolanaService.getInstance();
      const connection = solanaService.getConnection();
      
      // Testar conexão RPC
      const blockHeight = await connection.getBlockHeight();
      addDiagnostic('SOLANA_RPC', 'success', `RPC conectado. Block height: ${blockHeight}`);
      
      // Testar network
      const network = solanaService.getNetwork();
      addDiagnostic('SOLANA_NETWORK', 'success', `Rede: ${network}`);
      
      // Testar recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      addDiagnostic('RECENT_BLOCKHASH', 'success', `Blockhash obtido: ${blockhash.slice(0, 8)}...`);
      
    } catch (error) {
      addDiagnostic('SOLANA_SERVICE', 'error', 'Erro ao testar SolanaService', error);
    }
  };

  const testNetworkConnectivity = async () => {
    try {
      // Testar conectividade com endpoint Solana
      const response = await fetch('https://api.devnet.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth'
        })
      });
      
      if (response.ok) {
        addDiagnostic('NETWORK_SOLANA', 'success', 'Conectividade com Solana OK');
      } else {
        addDiagnostic('NETWORK_SOLANA', 'warning', `Resposta Solana: ${response.status}`);
      }
      
    } catch (error) {
      addDiagnostic('NETWORK_CONNECTIVITY', 'error', 'Erro de conectividade', error);
    }
  };

  const testBalance = async () => {
    try {
      const solanaService = SolanaService.getInstance();
      const balance = await solanaService.getBalance(publicKey);
      
      addDiagnostic('BALANCE_CHECK', 'success', `Saldo: ${balance.balance} SOL`, {
        balance: balance.balance,
        lamports: balance.lamports,
        decimals: balance.decimals
      });
      
      if (balance.balance === 0) {
        addDiagnostic('BALANCE_WARNING', 'warning', 'Saldo zerado - transações falharão');
      }
      
    } catch (error) {
      addDiagnostic('BALANCE_ERROR', 'error', 'Erro ao obter saldo', error);
    }
  };

  const testSimpleTransaction = async () => {
    try {
      const solanaService = SolanaService.getInstance();
      const connection = solanaService.getConnection();
      
      // Criar transação de teste (sem executar)
      const testTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Enviar para si mesmo
          lamports: 1, // 1 lamport
        })
      );

      // Obter blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      testTransaction.recentBlockhash = blockhash;
      testTransaction.feePayer = publicKey;

      // Tentar serializar
      const serialized = testTransaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });
      
      addDiagnostic('TRANSACTION_CREATE', 'success', 
        `Transação criada e serializada. Tamanho: ${serialized.length} bytes`);
      
      // Simular fee calculation
      const feeForMessage = await connection.getFeeForMessage(testTransaction.compileMessage());
      addDiagnostic('TRANSACTION_FEE', 'success', 
        `Taxa calculada: ${feeForMessage.value} lamports`);
        
    } catch (error) {
      addDiagnostic('TRANSACTION_TEST', 'error', 'Erro ao criar transação de teste', error);
    }
  };

  const testDeepLinking = async () => {
    try {
      const APP_CONFIG = {
        DEEP_LINK_SCHEME: 'exp', // ou o scheme do seu app
        APP_URL: 'https://solana-wallet-tcc.app'
      };
      
      // Testar criação de redirect URLs
      const testUrl = `${APP_CONFIG.DEEP_LINK_SCHEME}://test-redirect`;
      addDiagnostic('DEEP_LINK_FORMAT', 'success', `URL de teste: ${testUrl}`);
      
      // Verificar se o Phantom está instalado
      const { Linking } = require('react-native');
      const canOpenPhantom = await Linking.canOpenURL('https://phantom.app');
      addDiagnostic('PHANTOM_INSTALLED', canOpenPhantom ? 'success' : 'warning',
        `Phantom ${canOpenPhantom ? 'detectado' : 'não detectado'}`);
        
    } catch (error) {
      addDiagnostic('DEEP_LINKING', 'error', 'Erro ao testar deep linking', error);
    }
  };

  const testTransactionWithPhantom = async () => {
    try {
      if (!PhantomService.getInstance().isConnected()) {
        Alert.alert('Erro', 'Phantom não está conectado');
        return;
      }

      addDiagnostic('PHANTOM_TX_START', 'success', 'Iniciando teste de transação com Phantom...');
      
      const solanaService = SolanaService.getInstance();
      const connection = solanaService.getConnection();
      
      // Criar transação muito pequena (1 lamport para si mesmo)
      const testTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 1,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      testTransaction.recentBlockhash = blockhash;
      testTransaction.feePayer = publicKey;

      addDiagnostic('PHANTOM_TX_CREATED', 'success', 'Transação de teste criada');

      // Tentar executar com Phantom
      const phantomService = PhantomService.getInstance();
      const signature = await phantomService.executeTransaction(testTransaction);
      
      addDiagnostic('PHANTOM_TX_SUCCESS', 'success', 
        `Transação executada! Signature: ${signature.slice(0, 8)}...`);
        
      Alert.alert('Sucesso!', `Transação de teste executada com sucesso!\n\nSignature: ${signature.slice(0, 16)}...`);
      
    } catch (error) {
      addDiagnostic('PHANTOM_TX_FAILED', 'error', 'Falha na transação de teste', error);
      Alert.alert('Erro', `Transação de teste falhou: ${error}`);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Diagnóstico de Transações</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isRunning && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#AB9FF3" />
            <Text style={styles.loadingText}>Executando diagnósticos...</Text>
          </View>
        )}

        {diagnostics.map((diagnostic, index) => (
          <View key={index} style={styles.diagnosticItem}>
            <View style={styles.diagnosticHeader}>
              <Text style={styles.diagnosticIcon}>
                {getStatusIcon(diagnostic.status)}
              </Text>
              <Text style={styles.diagnosticTest}>{diagnostic.test}</Text>
              <Text style={[styles.diagnosticStatus, { color: getStatusColor(diagnostic.status) }]}>
                {diagnostic.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.diagnosticMessage}>{diagnostic.message}</Text>
            {diagnostic.details && (
              <Text style={styles.diagnosticDetails}>
                {JSON.stringify(diagnostic.details, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          <Text style={styles.actionButtonText}>
            {isRunning ? 'Executando...' : '🔄 Executar Novamente'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.testButton]} 
          onPress={testTransactionWithPhantom}
          disabled={isRunning}
        >
          <Text style={styles.actionButtonText}>
            🧪 Testar Transação Real
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  diagnosticItem: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  diagnosticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  diagnosticIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  diagnosticTest: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  diagnosticStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  diagnosticMessage: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  diagnosticDetails: {
    fontSize: 11,
    color: '#888888',
    fontFamily: 'monospace',
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 4,
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    backgroundColor: '#AB9FF3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionDiagnostics;