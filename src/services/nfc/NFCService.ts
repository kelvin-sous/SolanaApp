// ========================================
// src/services/nfc/NFCService.ts
// Serviço NFC REAL usando react-native-nfc-manager - CORRIGIDO
// ========================================

import { Platform } from 'react-native';
import { PublicKey } from '@solana/web3.js';
import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';
import { NFC_CONFIG } from '../../constants/config';
import SolanaService from '../solana/SolanaService';
import PhantomService from '../phantom/PhantomService';
import { NFCDataFormatter } from './NFCDataFormatter';

// ========================================
// INTERFACES BÁSICAS (Re-export dos tipos principais)
// ========================================

export interface NFCTransactionData {
  amount: number; // USD
  amountSOL: number; // SOL
  senderPublicKey: string;
  receiverPublicKey: string;
  timestamp: number;
  nonce: string;
  solPrice: number;
  network: 'devnet' | 'testnet' | 'mainnet-beta';
  memo?: string;
}

export interface NFCStatus {
  supported: boolean;
  enabled: boolean;
  error?: string;
}

export interface NFCTransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  transactionData?: NFCTransactionData;
}

export type NFCOperationStatus = 
  | 'IDLE'
  | 'INITIALIZING'
  | 'SEARCHING'
  | 'CONNECTED'
  | 'SENDING_DATA'
  | 'RECEIVING_DATA'
  | 'PROCESSING_TRANSACTION'
  | 'SUCCESS'
  | 'ERROR'
  | 'CANCELLED';

export interface NFCStatusCallback {
  onStatusChange: (status: NFCOperationStatus, message?: string) => void;
  onDataReceived?: (data: NFCTransactionData) => void;
  onTransactionComplete?: (result: NFCTransactionResult) => void;
  onError?: (error: string) => void;
}

// ========================================
// CLASSE PRINCIPAL DO SERVIÇO NFC REAL
// ========================================

class NFCService {
  private static instance: NFCService;
  private isInitialized = false;
  private currentStatus: NFCOperationStatus = 'IDLE';
  private statusCallback: NFCStatusCallback | null = null;
  private operationTimeout: NodeJS.Timeout | null = null;
  private dataFormatter: NFCDataFormatter;
  private isNfcEnabled = false;

  constructor() {
    this.dataFormatter = new NFCDataFormatter();
    this.initializeNFC();
  }

  public static getInstance(): NFCService {
    if (!NFCService.instance) {
      NFCService.instance = new NFCService();
    }
    return NFCService.instance;
  }

  // ========================================
  // INICIALIZAÇÃO REAL DO NFC
  // ========================================

  /**
   * Inicializa o NFC Manager
   */
  private async initializeNFC(): Promise<void> {
    try {
      console.log('🔄 Inicializando NFC Manager...');
      
      const supported = await NfcManager.isSupported();
      if (!supported) {
        console.log('❌ NFC não suportado neste dispositivo');
        return;
      }

      await NfcManager.start();
      this.isInitialized = true;
      
      // Verificar se NFC está habilitado
      const enabled = await NfcManager.isEnabled();
      this.isNfcEnabled = enabled;
      
      console.log('✅ NFC Manager inicializado:', { supported, enabled });

      // Configurar listeners para eventos NFC
      this.setupNFCListeners();
      
    } catch (error) {
      console.error('❌ Erro ao inicializar NFC:', error);
      this.isInitialized = false;
    }
  }

  /**
   * ✅ CORRIGIDO: Configura listeners para eventos NFC
   */
  private setupNFCListeners(): void {
    try {
      // ✅ CORRIGIDO: Listener para quando NFC é habilitado/desabilitado
      // Usar casting para evitar problemas de tipo
      (NfcManager as any).setEventListener(NfcEvents.StateChanged, (enabled: boolean) => {
        console.log('📡 Estado NFC mudou:', enabled);
        this.isNfcEnabled = enabled;
      });

      // ✅ CORRIGIDO: Listener para descoberta de tags
      // Usar casting para evitar problemas de tipo
      (NfcManager as any).setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
        console.log('🏷️ Tag NFC descoberta:', tag);
        this.handleTagDiscovered(tag);
      });

    } catch (error) {
      console.error('❌ Erro ao configurar listeners NFC:', error);
    }
  }

  // ========================================
  // VERIFICAÇÃO DE STATUS REAL
  // ========================================

  /**
   * Verifica o status real do NFC no dispositivo
   */
  async checkNFCStatus(): Promise<NFCStatus> {
    try {
      console.log('🔄 Verificando status real do NFC...');

      if (!this.isInitialized) {
        await this.initializeNFC();
      }

      const supported = await NfcManager.isSupported();
      if (!supported) {
        return {
          supported: false,
          enabled: false,
          error: 'Este dispositivo não suporta NFC'
        };
      }

      const enabled = await NfcManager.isEnabled();
      this.isNfcEnabled = enabled;

      console.log('✅ Status NFC verificado:', { supported, enabled });

      return {
        supported,
        enabled,
        error: !enabled ? 'NFC não está habilitado nas configurações' : undefined
      };

    } catch (error) {
      console.error('❌ Erro ao verificar status NFC:', error);
      return {
        supported: false,
        enabled: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ========================================
  // OPERAÇÕES DE ENVIO REAL
  // ========================================

  /**
   * Inicia processo de envio via NFC REAL
   */
  async startSending(
    amountUSD: number,
    receiverPublicKey: string,
    callback: NFCStatusCallback
  ): Promise<void> {
    try {
      console.log('🚀 Iniciando envio NFC REAL...', { amountUSD, receiverPublicKey: receiverPublicKey.slice(0, 8) + '...' });
      
      this.statusCallback = callback;
      this.updateStatus('INITIALIZING', 'Preparando para envio...');

      // Validar pré-requisitos
      await this.validateSendingPrerequisites(amountUSD, receiverPublicKey);

      // Preparar dados da transação
      const transactionData = await this.prepareTransactionData(
        amountUSD,
        PhantomService.getInstance().getPublicKey()!.toString(),
        receiverPublicKey
      );

      // Formatar dados para transmissão NFC
      const ndefData = this.dataFormatter.formatForTransmission(transactionData);
      
      // Configurar timeout
      this.setupOperationTimeout();

      // Iniciar escaneamento NFC real
      await this.performRealNFCSending(ndefData);

    } catch (error) {
      console.error('❌ Erro no envio NFC real:', error);
      this.updateStatus('ERROR', error instanceof Error ? error.message : 'Erro desconhecido');
      this.cleanup();
      throw error;
    }
  }

  /**
   * ✅ CORRIGIDO: Implementação REAL do envio NFC
   */
  private async performRealNFCSending(ndefData: string): Promise<void> {
    try {
      console.log('📡 Iniciando envio NFC real...');
      
      this.updateStatus('SEARCHING', 'Procurando dispositivo receptor...');

      // Parar qualquer escaneamento anterior
      await this.stopNFCOperations();

      // Configurar tecnologia NFC
      await NfcManager.requestTechnology([NfcTech.Ndef]);

      // ✅ CORRIGIDO: Criar payload NDEF
      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(ndefData, 'en', 'text/plain')
      ]);

      if (!bytes) {
        throw new Error('Falha ao criar payload NDEF');
      }

      console.log('📦 Payload NDEF criado:', bytes.length, 'bytes');

      // Aguardar dispositivo receptor
      this.updateStatus('SEARCHING', 'Aproxime o dispositivo receptor...');

      // ✅ CORRIGIDO: Escrever dados NDEF usando abordagem mais robusta
      try {
        // Método mais compatível - usar writeNdefMessage diretamente
        await (NfcManager as any).writeNdefMessage(bytes);
      } catch (writeError: any) {
        console.error('❌ Erro ao escrever NDEF:', writeError);
        throw new Error('Falha ao escrever dados NFC: ' + (writeError?.message || 'Método não disponível'));
      }

      console.log('✅ Dados enviados via NFC!');
      this.updateStatus('SENDING_DATA', 'Dados enviados! Aguardando confirmação...');

      // Simular pequeno delay para feedback visual
      setTimeout(() => {
        this.updateStatus('SUCCESS', 'Dados enviados com sucesso!');
        this.cleanup();
      }, 1000);

    } catch (error: any) {
      console.error('❌ Erro no envio NFC real:', error);
      
      if (error?.message?.includes('cancelled')) {
        this.updateStatus('CANCELLED', 'Operação cancelada');
      } else {
        this.updateStatus('ERROR', 'Falha no envio NFC: ' + (error?.message || 'Erro desconhecido'));
      }
      
      this.cleanup();
      throw error;
    }
  }

  // ========================================
  // OPERAÇÕES DE RECEBIMENTO REAL
  // ========================================

  /**
   * Inicia processo de recebimento via NFC REAL
   */
  async startReceiving(callback: NFCStatusCallback): Promise<void> {
    try {
      console.log('📥 Iniciando recebimento NFC REAL...');
      
      this.statusCallback = callback;
      this.updateStatus('INITIALIZING', 'Preparando para receber...');

      // Validar pré-requisitos
      await this.validateReceivingPrerequisites();

      // Configurar timeout
      this.setupOperationTimeout();

      // Iniciar escaneamento NFC real
      await this.performRealNFCReceiving();

    } catch (error) {
      console.error('❌ Erro no recebimento NFC real:', error);
      this.updateStatus('ERROR', error instanceof Error ? error.message : 'Erro desconhecido');
      this.cleanup();
      throw error;
    }
  }

  /**
   * ✅ CORRIGIDO: Implementação REAL do recebimento NFC
   */
  private async performRealNFCReceiving(): Promise<void> {
    try {
      console.log('📡 Iniciando escaneamento NFC real...');
      
      this.updateStatus('SEARCHING', 'Aguardando dispositivo emissor...');

      // Parar qualquer operação anterior
      await this.stopNFCOperations();

      // Configurar tecnologia NFC para leitura
      await NfcManager.requestTechnology([NfcTech.Ndef]);

      this.updateStatus('SEARCHING', 'Aproxime o dispositivo do remetente...');

      // Aguardar tag NFC
      const tag = await this.waitForNFCTag();

      if (tag) {
        await this.processReceivedTag(tag);
      }

    } catch (error: any) {
      console.error('❌ Erro no recebimento NFC real:', error);
      
      if (error?.message?.includes('cancelled')) {
        this.updateStatus('CANCELLED', 'Operação cancelada');
      } else {
        this.updateStatus('ERROR', 'Falha no recebimento NFC: ' + (error?.message || 'Erro desconhecido'));
      }
      
      this.cleanup();
      throw error;
    }
  }

  /**
   * ✅ CORRIGIDO: Aguarda por uma tag NFC
   */
  private async waitForNFCTag(): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout aguardando tag NFC'));
      }, 30000); // 30 segundos

      // ✅ CORRIGIDO: Usar método direto com casting
      const tagListener = (tag: any) => {
        clearTimeout(timeout);
        // ✅ CORRIGIDO: Desregistrar usando casting
        try {
          (NfcManager as any).unregisterTagEvent();
        } catch (error) {
          console.log('ℹ️ Erro ao desregistrar tag event:', error);
        }
        resolve(tag);
      };

      // ✅ CORRIGIDO: Registrar listener usando casting
      try {
        (NfcManager as any).registerTagEvent(tagListener);
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error('Erro ao registrar tag event: ' + (error instanceof Error ? error.message : 'Erro desconhecido')));
      }
    });
  }

  /**
   * Processa tag NFC recebida
   */
  private async processReceivedTag(tag: any): Promise<void> {
    try {
      console.log('🏷️ Processando tag NFC recebida...');
      this.updateStatus('CONNECTED', 'Dispositivo conectado!');
      this.updateStatus('RECEIVING_DATA', 'Recebendo dados...');

      // Extrair dados NDEF
      const ndefMessage = tag.ndefMessage;
      if (!ndefMessage || ndefMessage.length === 0) {
        throw new Error('Nenhum dado NDEF encontrado na tag');
      }

      // Decodificar primeiro record
      const firstRecord = ndefMessage[0];
      const payload = Ndef.text.decodePayload(firstRecord.payload);
      
      console.log('📨 Dados recebidos via NFC:', payload.length, 'chars');

      // Parsear dados da transação
      const transactionData = this.dataFormatter.parseFromTransmission(payload);
      
      console.log('✅ Dados parseados com sucesso:', {
        amount: transactionData.amount,
        from: transactionData.senderPublicKey.slice(0, 8) + '...',
        to: transactionData.receiverPublicKey.slice(0, 8) + '...'
      });

      // Notificar callback
      if (this.statusCallback?.onDataReceived) {
        this.statusCallback.onDataReceived(transactionData);
      }

      this.updateStatus('SUCCESS', 'Dados recebidos com sucesso!');
      this.cleanup();

    } catch (error: any) {
      console.error('❌ Erro ao processar tag NFC:', error);
      throw new Error('Falha ao processar dados NFC: ' + (error?.message || 'Erro desconhecido'));
    }
  }

  /**
   * Manipula tag descoberta via listener
   */
  private async handleTagDiscovered(tag: any): Promise<void> {
    try {
      if (this.currentStatus === 'SEARCHING' && this.statusCallback) {
        console.log('🎯 Tag descoberta durante operação ativa');
        await this.processReceivedTag(tag);
      }
    } catch (error) {
      console.error('❌ Erro ao processar tag descoberta:', error);
    }
  }

  // ========================================
  // VALIDAÇÕES E PREPARAÇÕES (MANTIDAS)
  // ========================================

  /**
   * Valida pré-requisitos para envio
   */
  private async validateSendingPrerequisites(amountUSD: number, receiverPublicKey: string): Promise<void> {
    // Verificar NFC
    const nfcStatus = await this.checkNFCStatus();
    if (!nfcStatus.supported || !nfcStatus.enabled) {
      throw new Error(nfcStatus.error || 'NFC não disponível');
    }

    // Verificar Phantom
    const phantomService = PhantomService.getInstance();
    if (!phantomService.isConnected()) {
      throw new Error('Phantom Wallet não conectado');
    }

    // Validar valor
    if (amountUSD <= 0 || amountUSD < 0.01) {
      throw new Error('Valor mínimo: $0.01');
    }

    if (amountUSD > 10000) {
      throw new Error('Valor máximo: $10,000');
    }

    // Validar endereço
    try {
      new PublicKey(receiverPublicKey);
    } catch {
      throw new Error('Endereço do destinatário inválido');
    }
  }

  /**
   * Valida pré-requisitos para recebimento
   */
  private async validateReceivingPrerequisites(): Promise<void> {
    // Verificar NFC
    const nfcStatus = await this.checkNFCStatus();
    if (!nfcStatus.supported || !nfcStatus.enabled) {
      throw new Error(nfcStatus.error || 'NFC não disponível');
    }

    // Verificar Phantom
    const phantomService = PhantomService.getInstance();
    if (!phantomService.isConnected()) {
      throw new Error('Phantom Wallet não conectado');
    }
  }

  /**
   * Prepara dados da transação
   */
  private async prepareTransactionData(
    amountUSD: number,
    senderPublicKey: string,
    receiverPublicKey: string
  ): Promise<NFCTransactionData> {
    // Obter preço atual do SOL
    const solanaService = SolanaService.getInstance();
    const priceData = await solanaService.getSOLPrice();
    const amountSOL = amountUSD / priceData.usd;

    // Gerar nonce único
    const nonce = this.generateNonce();

    return {
      amount: amountUSD,
      amountSOL: amountSOL,
      senderPublicKey,
      receiverPublicKey,
      timestamp: Date.now(),
      nonce,
      solPrice: priceData.usd,
      network: 'devnet'
    };
  }

  // ========================================
  // UTILITÁRIOS E LIMPEZA
  // ========================================

  /**
   * ✅ CORRIGIDO: Para todas as operações NFC
   */
  private async stopNFCOperations(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
      
      // ✅ CORRIGIDO: Desregistrar tag event usando casting
      try {
        (NfcManager as any).unregisterTagEvent();
      } catch (unregisterError) {
        console.log('ℹ️ Nenhum tag event para desregistrar');
      }
    } catch (error: any) {
      // Ignorar erros de cancelamento
      console.log('ℹ️ Erro ao cancelar operação NFC (normal):', error?.message);
    }
  }

  /**
   * Para operação atual
   */
  async stop(): Promise<void> {
    try {
      console.log('⏹️ Parando operação NFC real...');
      this.updateStatus('CANCELLED', 'Operação cancelada');
      
      await this.stopNFCOperations();
      this.cleanup();
    } catch (error) {
      console.error('❌ Erro ao parar NFC:', error);
    }
  }

  /**
   * Atualiza status da operação
   */
  private updateStatus(status: NFCOperationStatus, message?: string): void {
    this.currentStatus = status;
    console.log(`📡 NFC Status: ${status}${message ? ` - ${message}` : ''}`);
    
    if (this.statusCallback?.onStatusChange) {
      this.statusCallback.onStatusChange(status, message);
    }

    if (status === 'ERROR' && message && this.statusCallback?.onError) {
      this.statusCallback.onError(message);
    }
  }

  /**
   * Configura timeout para operação
   */
  private setupOperationTimeout(): void {
    if (this.operationTimeout) {
      clearTimeout(this.operationTimeout);
    }

    this.operationTimeout = setTimeout(() => {
      console.log('⏰ Timeout da operação NFC');
      this.updateStatus('ERROR', 'Timeout: operação não completada');
      this.stop();
    }, 60000); // 1 minuto timeout
  }

  /**
   * Gera nonce único
   */
  private generateNonce(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Limpa recursos
   */
  private cleanup(): void {
    if (this.operationTimeout) {
      clearTimeout(this.operationTimeout);
      this.operationTimeout = null;
    }

    this.statusCallback = null;
    this.currentStatus = 'IDLE';
    
    // Limpar operações NFC em background
    this.stopNFCOperations().catch(() => {});
  }

  // ========================================
  // GETTERS
  // ========================================

  getCurrentStatus(): NFCOperationStatus {
    return this.currentStatus;
  }

  isActive(): boolean {
    return this.currentStatus !== 'IDLE' && 
           this.currentStatus !== 'SUCCESS' && 
           this.currentStatus !== 'ERROR' &&
           this.currentStatus !== 'CANCELLED';
  }

  /**
   * ✅ CORRIGIDO: Cleanup ao destruir instância
   */
  async destroy(): Promise<void> {
    try {
      await this.stop();
      // ✅ CORRIGIDO: Usar casting para setEventListener
      (NfcManager as any).setEventListener(NfcEvents.StateChanged, null);
      (NfcManager as any).setEventListener(NfcEvents.DiscoverTag, null);
      // ✅ REMOVIDO: await NfcManager.stop() - não existe
    } catch (error) {
      console.error('❌ Erro ao destruir NFCService:', error);
    }
  }
}

export default NFCService;