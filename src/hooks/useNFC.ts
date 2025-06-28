// ========================================
// src/hooks/useNFC.ts
// Hook para gerenciar operações NFC REAIS
// ========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { PublicKey } from '@solana/web3.js';
import NFCService, { NFCStatusCallback } from '../services/nfc/NFCService';
import PhantomService from '../services/phantom/PhantomService';
import SolanaService from '../services/solana/SolanaService';
import { 
  NFCTransactionData, 
  NFCOperationStatus, 
  NFCTransactionResult
} from '../types/nfc';
import { usePhantom } from './usePhantom';

// ========================================
// INTERFACES DO HOOK
// ========================================

export interface UseNFCReturn {
  // Status
  status: NFCOperationStatus;
  message: string | null;
  isActive: boolean;
  error: string | null;
  
  // Dados da transação atual
  currentTransactionData: NFCTransactionData | null;
  estimatedFee: number | null;
  confirmationRequired: boolean;
  
  // Funções principais
  startSending: (amountUSD: number, receiverPublicKey: string) => Promise<void>;
  startReceiving: () => Promise<void>;
  confirmTransaction: (accept: boolean) => Promise<void>;
  stop: () => Promise<void>;
  clearError: () => void;
  
  // Verificações
  checkNFCStatus: () => Promise<{ supported: boolean; enabled: boolean; error?: string }>;
  isNFCAvailable: boolean;
  
  // Callbacks configuráveis
  setOnTransactionComplete: (callback: (result: NFCTransactionResult) => void) => void;
}

export const useNFC = (): UseNFCReturn => {
  // ========================================
  // ESTADO LOCAL
  // ========================================
  
  const [status, setStatus] = useState<NFCOperationStatus>('IDLE');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTransactionData, setCurrentTransactionData] = useState<NFCTransactionData | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [isNFCAvailable, setIsNFCAvailable] = useState(false);
  
  // ========================================
  // REFS E SERVIÇOS
  // ========================================
  
  const nfcService = NFCService.getInstance();
  const { isConnected, publicKey, session } = usePhantom();
  const onTransactionCompleteRef = useRef<((result: NFCTransactionResult) => void) | null>(null);
  
  // ========================================
  // INICIALIZAÇÃO
  // ========================================
  
  useEffect(() => {
    initializeNFC();
    return () => {
      // Cleanup ao desmontar
      nfcService.stop().catch(console.error);
    };
  }, []);

  const initializeNFC = async () => {
    try {
      const nfcStatus = await nfcService.checkNFCStatus();
      setIsNFCAvailable(nfcStatus.supported && nfcStatus.enabled);
      
      if (!nfcStatus.supported || !nfcStatus.enabled) {
        setError(nfcStatus.error || 'NFC não disponível');
      }
    } catch (err) {
      console.error('❌ Erro ao inicializar NFC:', err);
      setError('Erro ao verificar NFC');
      setIsNFCAvailable(false);
    }
  };

  // ========================================
  // CALLBACKS DO NFC SERVICE
  // ========================================
  
  const createNFCCallback = useCallback((): NFCStatusCallback => ({
    onStatusChange: (newStatus: NFCOperationStatus, newMessage?: string) => {
      console.log(`📡 NFC Status mudou: ${newStatus}${newMessage ? ` - ${newMessage}` : ''}`);
      setStatus(newStatus);
      setMessage(newMessage || null);
      
      // Limpar erro quando operação inicia com sucesso
      if (newStatus === 'SEARCHING' || newStatus === 'CONNECTED') {
        setError(null);
      }
      
      // Definir erro quando operação falha
      if (newStatus === 'ERROR') {
        setError(newMessage || 'Erro na operação NFC');
      }
    },
    
    onDataReceived: (data: NFCTransactionData) => {
      console.log('📨 Dados recebidos via NFC REAL:', {
        amount: data.amount,
        from: data.senderPublicKey.slice(0, 8) + '...',
        to: data.receiverPublicKey.slice(0, 8) + '...'
      });
      
      setCurrentTransactionData(data);
      setEstimatedFee(0.000005); // Taxa padrão SOL
      setConfirmationRequired(true);
      setMessage('Transação recebida! Verifique os dados antes de confirmar.');
    },
    
    onTransactionComplete: (result: NFCTransactionResult) => {
      console.log('🎉 Transação NFC REAL concluída:', result);
      
      // Chamar callback personalizado se definido
      if (onTransactionCompleteRef.current) {
        onTransactionCompleteRef.current(result);
      }
      
      // Limpar estado
      setCurrentTransactionData(null);
      setConfirmationRequired(false);
      setEstimatedFee(null);
    },
    
    onError: (errorMessage: string) => {
      console.error('❌ Erro NFC REAL:', errorMessage);
      setError(errorMessage);
      setStatus('ERROR');
      setMessage(null);
    }
  }), []);

  // ========================================
  // FUNÇÃO DE ENVIO REAL
  // ========================================
  
  const startSending = useCallback(async (amountUSD: number, receiverPublicKey: string): Promise<void> => {
    try {
      console.log('🚀 Iniciando envio NFC REAL...', { amountUSD, receiverPublicKey: receiverPublicKey.slice(0, 8) + '...' });
      
      // Validações pré-operação
      if (!isConnected || !publicKey || !session) {
        throw new Error('Phantom Wallet não conectado');
      }
      
      if (!isNFCAvailable) {
        throw new Error('NFC não está disponível');
      }
      
      if (amountUSD <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }
      
      try {
        new PublicKey(receiverPublicKey);
      } catch {
        throw new Error('Endereço do destinatário inválido');
      }
      
      // Limpar estado anterior
      setError(null);
      setCurrentTransactionData(null);
      setConfirmationRequired(false);
      
      // Criar callback e iniciar envio REAL
      const callback = createNFCCallback();
      await nfcService.startSending(amountUSD, receiverPublicKey, callback);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao iniciar envio NFC REAL:', errorMessage);
      setError(errorMessage);
      setStatus('ERROR');
      
      Alert.alert(
        'Erro no Envio NFC',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [isConnected, publicKey, session, isNFCAvailable, createNFCCallback]);

  // ========================================
  // FUNÇÃO DE RECEBIMENTO REAL
  // ========================================
  
  const startReceiving = useCallback(async (): Promise<void> => {
    try {
      console.log('📥 Iniciando recebimento NFC REAL...');
      
      // Validações pré-operação
      if (!isConnected || !publicKey) {
        throw new Error('Phantom Wallet não conectado');
      }
      
      if (!isNFCAvailable) {
        throw new Error('NFC não está disponível');
      }
      
      // Limpar estado anterior
      setError(null);
      setCurrentTransactionData(null);
      setConfirmationRequired(false);
      
      // Criar callback e iniciar recebimento REAL
      const callback = createNFCCallback();
      await nfcService.startReceiving(callback);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao iniciar recebimento NFC REAL:', errorMessage);
      setError(errorMessage);
      setStatus('ERROR');
      
      Alert.alert(
        'Erro no Recebimento NFC',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [isConnected, publicKey, isNFCAvailable, createNFCCallback]);

  // ========================================
  // CONFIRMAÇÃO DE TRANSAÇÃO REAL
  // ========================================
  
  const confirmTransaction = useCallback(async (accept: boolean): Promise<void> => {
    try {
      if (!currentTransactionData) {
        throw new Error('Nenhuma transação para confirmar');
      }
      
      if (!accept) {
        console.log('❌ Usuário rejeitou a transação');
        setCurrentTransactionData(null);
        setConfirmationRequired(false);
        setStatus('CANCELLED');
        setMessage('Transação cancelada pelo usuário');
        return;
      }
      
      console.log('✅ Usuário aceitou a transação, executando via Phantom...');
      setStatus('PROCESSING_TRANSACTION');
      setMessage('Processando transação via Phantom...');
      
      // Executar transação REAL via Phantom
      await executeRealTransaction(currentTransactionData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na confirmação';
      console.error('❌ Erro ao confirmar transação REAL:', errorMessage);
      setError(errorMessage);
      setStatus('ERROR');
      
      Alert.alert(
        'Erro na Transação',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setCurrentTransactionData(null);
      setConfirmationRequired(false);
      setEstimatedFee(null);
    }
  }, [currentTransactionData]);

  // ========================================
  // EXECUÇÃO DE TRANSAÇÃO REAL
  // ========================================
  
  const executeRealTransaction = async (data: NFCTransactionData): Promise<void> => {
    try {
      console.log('💳 Executando transação REAL via Phantom...');
      
      if (!session || !publicKey) {
        throw new Error('Sessão Phantom não encontrada');
      }

      // Obter serviços
      const phantomService = PhantomService.getInstance();
      const solanaService = SolanaService.getInstance();
      const connection = solanaService.getConnection();

      // Criar transação Solana
      const { Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      
      const fromPubkey = new PublicKey(data.receiverPublicKey); // Quem recebe é o usuário atual
      const toPubkey = new PublicKey(data.senderPublicKey);     // Pagamento para o remetente original
      const lamports = Math.floor(data.amountSOL * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      );

      // Configurar transação
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Executar via Phantom
      const signature = await phantomService.executeTransaction(transaction);
      
      console.log('✅ Transação REAL concluída:', signature);
      
      setStatus('SUCCESS');
      setMessage('Transação concluída com sucesso!');
      
      const result: NFCTransactionResult = {
        success: true,
        signature: signature,
        transactionData: data
      };
      
      // Chamar callback se definido
      if (onTransactionCompleteRef.current) {
        onTransactionCompleteRef.current(result);
      }
      
    } catch (error) {
      console.error('❌ Erro na execução da transação REAL:', error);
      throw new Error(`Falha na transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // ========================================
  // FUNÇÕES UTILITÁRIAS
  // ========================================
  
  const stop = useCallback(async (): Promise<void> => {
    try {
      console.log('⏹️ Parando operação NFC REAL...');
      await nfcService.stop();
      
      setCurrentTransactionData(null);
      setConfirmationRequired(false);
      setEstimatedFee(null);
      setMessage(null);
      
    } catch (err) {
      console.error('❌ Erro ao parar NFC:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkNFCStatus = useCallback(async () => {
    try {
      const status = await nfcService.checkNFCStatus();
      setIsNFCAvailable(status.supported && status.enabled);
      return status;
    } catch (err) {
      console.error('❌ Erro ao verificar status NFC:', err);
      return {
        supported: false,
        enabled: false,
        error: 'Erro ao verificar NFC'
      };
    }
  }, []);

  const setOnTransactionComplete = useCallback((callback: (result: NFCTransactionResult) => void) => {
    onTransactionCompleteRef.current = callback;
  }, []);

  // ========================================
  // ESTADO COMPUTADO
  // ========================================
  
  const isActive = status !== 'IDLE' && status !== 'SUCCESS' && status !== 'ERROR' && status !== 'CANCELLED';

  // ========================================
  // RETURN DO HOOK
  // ========================================
  
  return {
    // Status
    status,
    message,
    isActive,
    error,
    
    // Dados da transação
    currentTransactionData,
    estimatedFee,
    confirmationRequired,
    
    // Funções principais
    startSending,
    startReceiving,
    confirmTransaction,
    stop,
    clearError,
    
    // Verificações
    checkNFCStatus,
    isNFCAvailable,
    
    // Callbacks
    setOnTransactionComplete
  };
};

export default useNFC;