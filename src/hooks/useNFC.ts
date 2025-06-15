// ========================================
// src/hooks/useNFC.ts
// Hook para gerenciar transferências via NFC
// ========================================

import { useState, useCallback, useRef } from 'react';
import NFCService, { 
  NFCTransactionStatus, 
  NFCTransactionData, 
  NFCTransactionResult,
  NFCStatusCallback 
} from '../services/nfc/NFCService';
import { usePhantom } from './usePhantom';

export interface UseNFCReturn {
  // Estados
  status: NFCTransactionStatus;
  message: string | null;
  isActive: boolean;
  currentTransactionData: NFCTransactionData | null;
  estimatedFee: number | null;
  
  // Métodos de envio
  startSending: (amountUSD: number, receiverPublicKey: string) => Promise<void>;
  
  // Métodos de recebimento
  startReceiving: () => Promise<void>;
  confirmTransaction: (accept: boolean) => Promise<void>;
  
  // Controles
  stop: () => Promise<void>;
  checkNFCStatus: () => Promise<{ supported: boolean; enabled: boolean; error?: string }>;
  
  // Callbacks
  onTransactionComplete?: (result: NFCTransactionResult) => void;
}

export const useNFC = (
  onTransactionComplete?: (result: NFCTransactionResult) => void
): UseNFCReturn => {
  const [status, setStatus] = useState<NFCTransactionStatus>('IDLE');
  const [message, setMessage] = useState<string | null>(null);
  const [currentTransactionData, setCurrentTransactionData] = useState<NFCTransactionData | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  const { session, isConnected } = usePhantom();
  const nfcService = NFCService.getInstance();
  const callbackRef = useRef<NFCStatusCallback | null>(null);

  // Criar callback para o NFCService
  const createNFCCallback = useCallback((): NFCStatusCallback => {
    return {
      onStatusChange: (newStatus: NFCTransactionStatus, newMessage?: string) => {
        console.log('📡 NFC Status:', newStatus, newMessage);
        setStatus(newStatus);
        setMessage(newMessage || null);
        
        // Atualizar estado ativo
        setIsActive(newStatus !== 'IDLE' && newStatus !== 'SUCCESS' && newStatus !== 'ERROR');
      },
      
      onDataReceived: (data: NFCTransactionData) => {
        console.log('📨 Dados recebidos via NFC:', data);
        setCurrentTransactionData(data);
      },
      
      onTransactionComplete: (result: NFCTransactionResult) => {
        console.log('✅ Transação NFC concluída:', result);
        setCurrentTransactionData(null);
        setIsActive(false);
        
        if (onTransactionComplete) {
          onTransactionComplete(result);
        }
      }
    };
  }, [onTransactionComplete]);

  // Estimar taxa da transação
  const estimateTransactionFee = useCallback(async () => {
    try {
      const fee = await nfcService.estimateTransactionFee();
      setEstimatedFee(fee);
      return fee;
    } catch (error) {
      console.error('❌ Erro ao estimar taxa:', error);
      setEstimatedFee(0.000005); // Fallback
      return 0.000005;
    }
  }, [nfcService]);

  // Iniciar envio
  const startSending = useCallback(async (
    amountUSD: number, 
    receiverPublicKey: string
  ): Promise<void> => {
    try {
      if (!isConnected || !session) {
        throw new Error('Não conectado com Phantom Wallet');
      }

      if (isActive) {
        throw new Error('Operação NFC já está ativa');
      }

      // Validar inputs
      if (amountUSD <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      if (!receiverPublicKey.trim()) {
        throw new Error('Endereço do destinatário é obrigatório');
      }

      console.log('🚀 Iniciando envio NFC:', { amountUSD, receiverPublicKey });

      // Estimar taxa
      await estimateTransactionFee();

      // Criar callback
      const callback = createNFCCallback();
      callbackRef.current = callback;

      // Iniciar processo de envio
      await nfcService.startSending(amountUSD, receiverPublicKey, callback);

    } catch (error) {
      console.error('❌ Erro ao iniciar envio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatus('ERROR');
      setMessage(errorMessage);
      setIsActive(false);
      throw error;
    }
  }, [isConnected, session, isActive, createNFCCallback, estimateTransactionFee]);

  // Iniciar recebimento
  const startReceiving = useCallback(async (): Promise<void> => {
    try {
      if (!isConnected || !session) {
        throw new Error('Não conectado com Phantom Wallet');
      }

      if (isActive) {
        throw new Error('Operação NFC já está ativa');
      }

      console.log('📡 Iniciando recebimento NFC...');

      // Estimar taxa
      await estimateTransactionFee();

      // Criar callback
      const callback = createNFCCallback();
      callbackRef.current = callback;

      // Iniciar processo de recebimento
      await nfcService.startReceiving(callback);

    } catch (error) {
      console.error('❌ Erro ao iniciar recebimento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatus('ERROR');
      setMessage(errorMessage);
      setIsActive(false);
      throw error;
    }
  }, [isConnected, session, isActive, createNFCCallback, estimateTransactionFee]);

  // Confirmar transação
  const confirmTransaction = useCallback(async (accept: boolean): Promise<void> => {
    try {
      if (!currentTransactionData) {
        throw new Error('Nenhuma transação pendente para confirmar');
      }

      console.log('🔐 Confirmando transação:', accept ? 'ACEITA' : 'REJEITADA');

      await nfcService.confirmReceiving(accept);

      if (!accept) {
        setCurrentTransactionData(null);
        setStatus('IDLE');
        setMessage(null);
        setIsActive(false);
      }

    } catch (error) {
      console.error('❌ Erro ao confirmar transação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatus('ERROR');
      setMessage(errorMessage);
      setIsActive(false);
      throw error;
    }
  }, [currentTransactionData, nfcService]);

  // Parar operação
  const stop = useCallback(async (): Promise<void> => {
    try {
      console.log('⏹️ Parando operação NFC...');
      
      await nfcService.stop();
      
      setStatus('IDLE');
      setMessage(null);
      setCurrentTransactionData(null);
      setIsActive(false);
      callbackRef.current = null;
      
      console.log('✅ Operação NFC parada');
    } catch (error) {
      console.error('❌ Erro ao parar NFC:', error);
      // Mesmo com erro, resetar o estado
      setStatus('IDLE');
      setMessage(null);
      setCurrentTransactionData(null);
      setIsActive(false);
      callbackRef.current = null;
    }
  }, [nfcService]);

  // Verificar status do NFC
  const checkNFCStatus = useCallback(async () => {
    try {
      return await nfcService.checkNFCStatus();
    } catch (error) {
      console.error('❌ Erro ao verificar status NFC:', error);
      return {
        supported: false,
        enabled: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }, [nfcService]);

  return {
    // Estados
    status,
    message,
    isActive,
    currentTransactionData,
    estimatedFee,
    
    // Métodos
    startSending,
    startReceiving,
    confirmTransaction,
    stop,
    checkNFCStatus,
    
    // Callback
    onTransactionComplete
  };
};