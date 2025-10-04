// ========================================
// src/hooks/useQRCode.ts
// Hook simplificado para gerenciar QR Code scanning e transações
// ========================================

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import QRCodeService from '../services/qr/QRCodeService';

// Tipos locais para evitar conflitos de importação
interface QRCodeData {
  type: 'SOLANA_PAY' | 'WALLET_ADDRESS' | 'CUSTOM_TRANSACTION';
  recipient: string;
  amount?: number;
  amountUSD?: number;
  label?: string;
  message?: string;
  timestamp: number;
  network: string;
}

interface TransactionPreview {
  from: string;
  to: string;
  amountSOL: number;
  amountUSD: number;
  estimatedFee: number;
  estimatedTotal: number;
  pricePerSOL: number;
  isValid: boolean;
  errors: string[];
}

export interface UseQRCodeReturn {
  // Estados
  isScanning: boolean;
  isProcessing: boolean;
  scannedData: QRCodeData | null;
  transactionPreview: TransactionPreview | null;
  error: string | null;
  
  // Métodos
  startScanning: () => void;
  stopScanning: () => void;
  processQRCode: (qrString: string, fromPublicKey: string) => Promise<void>;
  executeTransaction: (session: any) => Promise<{ success: boolean; signature?: string }>;
  clearData: () => void;
  
  // Utilitários
  isValidQRCode: (qrString: string) => boolean;
  formatQRData: (data: QRCodeData) => any;
}

export const useQRCode = (): UseQRCodeReturn => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<QRCodeData | null>(null);
  const [transactionPreview, setTransactionPreview] = useState<TransactionPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qrService = QRCodeService.getInstance();

  const startScanning = useCallback(() => {
    console.log('Iniciando scan de QR Code...');
    setIsScanning(true);
    setError(null);
  }, []);

  const stopScanning = useCallback(() => {
    console.log('Parando scan de QR Code...');
    setIsScanning(false);
  }, []);

  const processQRCode = useCallback(async (qrString: string, fromPublicKey: string) => {
    try {
      console.log('Processando QR Code escaneado...');
      setIsProcessing(true);
      setError(null);

      // Processar QR Code
      const result = await qrService.processScannedQRCode(qrString);
      
      if (!result.isValid) {
        throw new Error(result.error || 'QR Code inválido');
      }

      console.log('QR Code válido processado');
      setScannedData(result.data!);

      // Criar preview da transação
      const preview = await qrService.createTransactionPreview(fromPublicKey, result.data!);
      setTransactionPreview(preview);

      if (!preview.isValid) {
        throw new Error(`Transação inválida: ${preview.errors.join(', ')}`);
      }

      console.log('Preview da transação criado');
      
    } catch (err) {
      console.error('Erro ao processar QR Code:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      
      Alert.alert(
        'Erro no QR Code',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsProcessing(false);
      setIsScanning(false);
    }
  }, [qrService]);

  const executeTransaction = useCallback(async (session: any): Promise<{ success: boolean; signature?: string }> => {
    try {
      if (!transactionPreview) {
        throw new Error('Nenhuma transação para executar');
      }

      console.log('Executando transação...');
      setIsProcessing(true);
      setError(null);

      const result = await qrService.executeTransaction(transactionPreview, session);

      if (result.success) {
        console.log('Transação executada com sucesso!');
        
        Alert.alert(
          'Pagamento Realizado',
          `Transação concluída com sucesso!\n\nSignature: ${result.signature?.slice(0, 8)}...`,
          [{ text: 'OK', style: 'default' }]
        );

        // Limpar dados após sucesso
        clearData();
      } else {
        throw new Error(result.error || 'Falha na transação');
      }

      return result;
      
    } catch (err) {
      console.error('Erro ao executar transação:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro na transação';
      setError(errorMessage);
      
      Alert.alert(
        'Erro na Transação',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );

      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  }, [transactionPreview, qrService]);

  const clearData = useCallback(() => {
    console.log('Limpando dados do QR Code...');
    setScannedData(null);
    setTransactionPreview(null);
    setError(null);
    setIsScanning(false);
    setIsProcessing(false);
  }, []);

  const isValidQRCode = useCallback((qrString: string): boolean => {
    return qrService.isValidQRCode(qrString);
  }, [qrService]);

  const formatQRData = useCallback((data: QRCodeData) => {
    return qrService.formatQRCodeData(data);
  }, [qrService]);

  return {
    // Estados
    isScanning,
    isProcessing,
    scannedData,
    transactionPreview,
    error,
    
    // Métodos
    startScanning,
    stopScanning,
    processQRCode,
    executeTransaction,
    clearData,
    
    // Utilitários
    isValidQRCode,
    formatQRData
  };
};