// ========================================
// src/services/nfc/NFCService.ts
// Serviço NFC com verificação de plataforma - CORRIGIDO
// ========================================

import { Platform, Alert } from 'react-native';
import { PublicKey } from '@solana/web3.js';
import SolanaService, { SolanaTransactionRequest, SolanaTransactionResult } from '../solana/SolanaService';
import PhantomService from '../phantom/PhantomService';
import { PhantomSession } from '../../types/phantom';
import { NFC_CONFIG } from '../../constants/config';

// Import condicional do NFC Manager
let NfcManager: any = null;
let NfcTech: any = null;
let Ndef: any = null;
let NfcEvents: any = null;

try {
  if (Platform.OS === 'android' || !__DEV__) {
    // Só importar NFC no Android ou em builds de produção
    const nfcModule = require('react-native-nfc-manager');
    NfcManager = nfcModule.default;
    NfcTech = nfcModule.NfcTech;
    Ndef = nfcModule.Ndef;
    NfcEvents = nfcModule.NfcEvents;
  }
} catch (error) {
  console.log('⚠️ NFC Manager não disponível nesta plataforma');
}

export interface NFCTransactionData {
  amount: number; // Valor em USD
  amountSOL: number; // Valor em SOL
  senderPublicKey: string;
  receiverPublicKey: string;
  timestamp: number;
  nonce: string; // Para evitar replay attacks
  solPrice: number; // Preço do SOL no momento da transação
}

export interface NFCTransactionResult {
  success: boolean;
  transactionData?: NFCTransactionData;
  signature?: string;
  error?: string;
}

export type NFCTransactionStatus = 
  | 'IDLE' 
  | 'SEARCHING' 
  | 'CONNECTED' 
  | 'SENDING_DATA' 
  | 'RECEIVING_DATA' 
  | 'CONFIRMING' 
  | 'PROCESSING_TRANSACTION' 
  | 'SUCCESS' 
  | 'ERROR';

export interface NFCStatusCallback {
  onStatusChange: (status: NFCTransactionStatus, message?: string) => void;
  onDataReceived?: (data: NFCTransactionData) => void;
  onTransactionComplete?: (result: NFCTransactionResult) => void;
}

class NFCService {
  private static instance: NFCService;
  private isInitialized = false;
  private currentCallback: NFCStatusCallback | null = null;
  private currentTransactionData: NFCTransactionData | null = null;
  private solanaService: SolanaService;
  private phantomService: PhantomService;
  private isNFCSupported = false;

  private constructor() {
    this.solanaService = SolanaService.getInstance();
    this.phantomService = PhantomService.getInstance();
    this.isNFCSupported = this.checkNFCSupport();
  }

  public static getInstance(): NFCService {
    if (!NFCService.instance) {
      NFCService.instance = new NFCService();
    }
    return NFCService.instance;
  }

  /**
   * Verifica se NFC é suportado na plataforma atual
   */
  private checkNFCSupport(): boolean {
    if (Platform.OS === 'ios' && __DEV__) {
      console.log('⚠️ NFC não suportado no iOS em desenvolvimento (Expo Go)');
      return false;
    }
    
    if (!NfcManager) {
      console.log('⚠️ NFC Manager não está disponível');
      return false;
    }
    
    return true;
  }

  /**
   * Inicializa o serviço NFC
   */
  async initialize(): Promise<boolean> {
    try {
      if (!this.isNFCSupported) {
        throw new Error('NFC não é suportado nesta plataforma/ambiente');
      }

      if (this.isInitialized) {
        return true;
      }

      console.log('📡 Inicializando NFC...');
      
      // Verificar se NFC está disponível
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        throw new Error('NFC não é suportado neste dispositivo');
      }

      // Inicializar NFC Manager
      await NfcManager.start();
      
      // Verificar se NFC está habilitado
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        throw new Error('NFC está desabilitado. Por favor, habilite nas configurações.');
      }

      this.isInitialized = true;
      console.log('✅ NFC inicializado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao inicializar NFC:', error);
      
      // Mostrar dialog para configurações se NFC estiver desabilitado
      if (error instanceof Error && error.message.includes('desabilitado')) {
        this.showNFCSettingsDialog();
      }
      
      throw error;
    }
  }

  /**
   * Mostra dialog para ir às configurações de NFC
   */
  private showNFCSettingsDialog(): void {
    Alert.alert(
      'NFC Desabilitado',
      'Para usar transferências via NFC, você precisa habilitar o NFC nas configurações do dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Configurações', 
          onPress: () => {
            try {
              if (NfcManager && NfcManager.goToNfcSetting) {
                NfcManager.goToNfcSetting();
              }
            } catch (error) {
              console.error('❌ Erro ao abrir configurações NFC:', error);
            }
          }
        }
      ]
    );
  }

  /**
   * Inicia processo de envio via NFC
   */
  async startSending(
    amountUSD: number,
    receiverPublicKey: string,
    callback: NFCStatusCallback
  ): Promise<void> {
    try {
      if (!this.isNFCSupported) {
        // Simular funcionalidade para desenvolvimento iOS
        this.simulateNFCTransfer(amountUSD, receiverPublicKey, callback, 'send');
        return;
      }

      await this.initialize();

      // Verificar se está conectado com Phantom
      const session = this.phantomService.getCurrentSession();
      if (!session) {
        throw new Error('Não conectado com Phantom Wallet');
      }

      this.currentCallback = callback;
      callback.onStatusChange('SEARCHING', 'Preparando transação...');

      // Preparar dados da transação
      const transactionData = await this.prepareTransactionData(
        amountUSD,
        session,
        receiverPublicKey
      );

      this.currentTransactionData = transactionData;
      callback.onStatusChange('SEARCHING', 'Procurando dispositivo...');

      // Configurar NFC para escrita P2P
      await this.setupNFCWriter(transactionData);

    } catch (error) {
      console.error('❌ Erro ao iniciar envio NFC:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      callback.onStatusChange('ERROR', errorMessage);
    }
  }

  /**
   * Inicia processo de recebimento via NFC
   */
  async startReceiving(callback: NFCStatusCallback): Promise<void> {
    try {
      if (!this.isNFCSupported) {
        // Simular funcionalidade para desenvolvimento iOS
        this.simulateNFCTransfer(0, '', callback, 'receive');
        return;
      }

      await this.initialize();

      // Verificar se está conectado com Phantom
      const session = this.phantomService.getCurrentSession();
      if (!session) {
        throw new Error('Não conectado com Phantom Wallet');
      }

      this.currentCallback = callback;
      callback.onStatusChange('SEARCHING', 'Aguardando dispositivo...');

      // Configurar NFC para leitura P2P
      await this.setupNFCReader();

    } catch (error) {
      console.error('❌ Erro ao iniciar recebimento NFC:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      callback.onStatusChange('ERROR', errorMessage);
    }
  }

  /**
   * Simula transferência NFC para desenvolvimento
   */
  private simulateNFCTransfer(
    amountUSD: number,
    receiverPublicKey: string,
    callback: NFCStatusCallback,
    mode: 'send' | 'receive'
  ): void {
    console.log('🧪 Simulando transferência NFC para desenvolvimento iOS');
    
    callback.onStatusChange('SEARCHING', 'Modo simulação - NFC não disponível no Expo Go');
    
    setTimeout(() => {
      if (mode === 'send') {
        callback.onStatusChange('SUCCESS', 'Simulação de envio concluída (funciona apenas em builds nativos)');
      } else {
        callback.onStatusChange('SUCCESS', 'Simulação de recebimento concluída (funciona apenas em builds nativos)');
      }
    }, 2000);
  }

  /**
   * Prepara dados de transação para envio via NFC
   */
  async prepareTransactionData(
    amountUSD: number,
    senderSession: PhantomSession,
    receiverPublicKey: string
  ): Promise<NFCTransactionData> {
    try {
      console.log('📋 Preparando dados da transação...');

      // Validar endereço do destinatário se fornecido
      if (receiverPublicKey && receiverPublicKey !== 'DISCOVERY_MODE' && !SolanaService.isValidAddress(receiverPublicKey)) {
        throw new Error('Endereço do destinatário inválido');
      }

      // Converter USD para SOL
      const amountSOL = await this.solanaService.convertUSDToSOL(amountUSD);
      const priceData = await this.solanaService.getSOLPrice();

      // Verificar saldo suficiente
      const balance = await this.solanaService.getBalance(senderSession.publicKey);
      if (balance.balance < amountSOL) {
        throw new Error(`Saldo insuficiente. Disponível: ${balance.balance.toFixed(4)} SOL`);
      }

      // Gerar nonce único
      const nonce = Date.now().toString() + Math.random().toString(36);

      const transactionData: NFCTransactionData = {
        amount: amountUSD,
        amountSOL,
        senderPublicKey: senderSession.publicKey.toString(),
        receiverPublicKey: receiverPublicKey || senderSession.publicKey.toString(), // Fallback para desenvolvimento
        timestamp: Date.now(),
        nonce,
        // ✅ CORRIGIDO: usar .usd ao invés de .solToUsd
        solPrice: priceData.usd
      };

      console.log('✅ Dados da transação preparados:', {
        amountUSD,
        amountSOL: amountSOL.toFixed(6),
        // ✅ CORRIGIDO: usar .usd ao invés de .solToUsd
        solPrice: priceData.usd
      });

      return transactionData;

    } catch (error) {
      console.error('❌ Erro ao preparar dados da transação:', error);
      throw error;
    }
  }

  /**
   * Configura NFC para escrita (modo envio)
   */
  private async setupNFCWriter(transactionData: NFCTransactionData): Promise<void> {
    if (!this.isNFCSupported || !NfcManager) return;

    try {
      console.log('📤 Configurando NFC para envio...');

      // Registrar tecnologias NFC
      await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA]);

      // Serializar dados da transação
      const ndefMessage = this.serializeTransactionData(transactionData);

      // Listener para detecção de tag/dispositivo
      NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: any) => {
        try {
          console.log('🏷️ Tag/Dispositivo detectado:', tag);
          
          if (this.currentCallback) {
            this.currentCallback.onStatusChange('CONNECTED', 'Dispositivo conectado');
            this.currentCallback.onStatusChange('SENDING_DATA', 'Enviando dados...');
          }

          // Escrever dados NDEF
          await NfcManager.ndefHandler.writeNdefMessage(ndefMessage);
          
          console.log('✅ Dados enviados via NFC');
          
          if (this.currentCallback) {
            this.currentCallback.onStatusChange('SUCCESS', 'Dados enviados com sucesso');
          }

        } catch (error) {
          console.error('❌ Erro ao escrever NFC:', error);
          if (this.currentCallback) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar dados';
            this.currentCallback.onStatusChange('ERROR', errorMessage);
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao configurar NFC writer:', error);
      throw error;
    }
  }

  /**
   * Configura NFC para leitura (modo recebimento)
   */
  private async setupNFCReader(): Promise<void> {
    if (!this.isNFCSupported || !NfcManager) return;

    try {
      console.log('📥 Configurando NFC para recebimento...');

      // Registrar tecnologias NFC
      await NfcManager.requestTechnology([NfcTech.Ndef]);

      // Listener para detecção de tag/dados
      NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: any) => {
        try {
          console.log('🏷️ Dados recebidos via NFC:', tag);
          
          if (this.currentCallback) {
            this.currentCallback.onStatusChange('CONNECTED', 'Dispositivo conectado');
            this.currentCallback.onStatusChange('RECEIVING_DATA', 'Recebendo dados...');
          }

          // Ler dados NDEF
          const ndefRecords = tag.ndefMessage;
          if (!ndefRecords || ndefRecords.length === 0) {
            throw new Error('Nenhum dado NDEF encontrado');
          }

          // Deserializar dados da transação
          const transactionData = this.deserializeTransactionData(ndefRecords);
          
          console.log('💰 Dados da transação recebidos:', transactionData);

          if (this.currentCallback) {
            this.currentCallback.onStatusChange('CONFIRMING', 'Confirme a transação');
            if (this.currentCallback.onDataReceived) {
              this.currentCallback.onDataReceived(transactionData);
            }
          }

        } catch (error) {
          console.error('❌ Erro ao ler NFC:', error);
          if (this.currentCallback) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao receber dados';
            this.currentCallback.onStatusChange('ERROR', errorMessage);
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao configurar NFC reader:', error);
      throw error;
    }
  }

  /**
   * Serializa dados da transação para NDEF
   */
  private serializeTransactionData(data: NFCTransactionData): any[] {
    if (!Ndef) {
      throw new Error('NDEF não está disponível');
    }

    try {
      const jsonString = JSON.stringify(data);
      const textRecord = Ndef.textRecord(jsonString);
      
      console.log('📦 Dados serializados para NFC:', {
        size: jsonString.length,
        preview: jsonString.substring(0, 100) + '...'
      });
      
      return [textRecord];
    } catch (error) {
      console.error('❌ Erro ao serializar dados:', error);
      throw new Error('Falha ao preparar dados para envio via NFC');
    }
  }

  /**
   * Deserializa dados da transação do NDEF
   */
  private deserializeTransactionData(ndefRecords: any[]): NFCTransactionData {
    if (!Ndef) {
      throw new Error('NDEF não está disponível');
    }

    try {
      // Encontrar record de texto
      const textRecord = ndefRecords.find(record => 
        record.tnf === Ndef.TNF_WELL_KNOWN && 
        record.type && 
        String.fromCharCode.apply(null, Array.from(record.type)) === 'T'
      );

      if (!textRecord || !textRecord.payload) {
        throw new Error('Record de texto não encontrado nos dados NFC');
      }

      // Converter payload para string
      const payload = textRecord.payload;
      const languageCodeLength = payload[0] & 0x3F;
      const textStartIndex = 1 + languageCodeLength;
      const jsonString = String.fromCharCode.apply(null, Array.from(payload.slice(textStartIndex)));
      
      console.log('📋 JSON recebido:', jsonString);
      
      // Parse JSON
      const transactionData: NFCTransactionData = JSON.parse(jsonString);
      
      // Validar dados recebidos
      this.validateTransactionData(transactionData);
      
      return transactionData;
    } catch (error) {
      console.error('❌ Erro ao deserializar dados:', error);
      throw new Error('Dados NFC inválidos ou corrompidos');
    }
  }

  /**
   * Valida dados da transação recebidos
   */
  private validateTransactionData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Dados da transação inválidos');
    }

    const required = ['amount', 'amountSOL', 'senderPublicKey', 'receiverPublicKey', 'timestamp', 'nonce', 'solPrice'];
    
    for (const field of required) {
      if (!(field in data)) {
        throw new Error(`Campo obrigatório ausente: ${field}`);
      }
    }

    // Validar valores
    if (data.amount <= 0 || data.amountSOL <= 0) {
      throw new Error('Valor da transação deve ser maior que zero');
    }

    // Validar chaves públicas
    try {
      new PublicKey(data.senderPublicKey);
      new PublicKey(data.receiverPublicKey);
    } catch {
      throw new Error('Chaves públicas inválidas');
    }

    // Validar timestamp (não muito antigo)
    const now = Date.now();
    const maxAge = NFC_CONFIG.TRANSACTION_TIMEOUT;
    if (now - data.timestamp > maxAge) {
      throw new Error('Dados da transação expirados');
    }

    // Verificar se o receptor é a wallet conectada
    const currentSession = this.phantomService.getCurrentSession();
    if (currentSession && data.receiverPublicKey !== currentSession.publicKey.toString()) {
      throw new Error('Esta transação não é destinada à sua wallet');
    }
  }

  /**
   * Confirma recebimento e executa a transação
   */
  async confirmReceiving(accept: boolean): Promise<void> {
    try {
      if (!this.currentCallback || !this.currentTransactionData) {
        throw new Error('Nenhuma transação pendente');
      }

      if (!accept) {
        this.currentCallback.onStatusChange('ERROR', 'Transação cancelada pelo receptor');
        return;
      }

      // Verificar se ainda está conectado com Phantom
      const session = this.phantomService.getCurrentSession();
      if (!session) {
        throw new Error('Não conectado com Phantom Wallet');
      }

      this.currentCallback.onStatusChange('PROCESSING_TRANSACTION', 'Processando transação...');

      // ✅ CORRIGIDO: usar SolanaTransactionRequest e corrigir propriedades
      const transactionRequest: SolanaTransactionRequest = {
        fromPublicKey: this.currentTransactionData.senderPublicKey,
        toPublicKey: this.currentTransactionData.receiverPublicKey,
        amount: this.currentTransactionData.amountSOL, // ✅ Propriedade principal
        amountSOL: this.currentTransactionData.amountSOL, // ✅ Propriedade opcional adicional
        memo: `NFC Transfer - ${this.currentTransactionData.nonce}`,
        timestamp: Date.now()
      };

      // Executar transação via Solana Service
      const result = await this.solanaService.executeNFCTransfer(transactionRequest, session);

      // Notificar resultado
      if (this.currentCallback.onTransactionComplete) {
        const nfcResult: NFCTransactionResult = {
          success: result.success,
          transactionData: this.currentTransactionData || undefined,
          signature: result.signature,
          error: result.error
        };
        
        this.currentCallback.onTransactionComplete(nfcResult);
      }

      if (result.success) {
        this.currentCallback.onStatusChange('SUCCESS', `Transação concluída! Signature: ${result.signature?.slice(0, 8)}...`);
        console.log('✅ Transferência NFC concluída com sucesso:', result.signature);
      } else {
        this.currentCallback.onStatusChange('ERROR', result.error || 'Erro na transação');
      }

    } catch (error) {
      console.error('❌ Erro ao confirmar recebimento:', error);
      if (this.currentCallback) {
        const errorMessage = error instanceof Error ? error.message : 'Erro na confirmação';
        this.currentCallback.onStatusChange('ERROR', errorMessage);
      }
    }
  }

  /**
   * Para a operação NFC atual
   */
  async stop(): Promise<void> {
    try {
      console.log('⏹️ Parando operação NFC...');
      
      if (this.isNFCSupported && NfcManager) {
        // Limpar listeners
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        
        // Cancelar tecnologia atual
        await NfcManager.cancelTechnologyRequest();
      }
      
      // Limpar estado
      this.currentCallback = null;
      this.currentTransactionData = null;
      
      console.log('✅ Operação NFC parada');
    } catch (error) {
      console.error('❌ Erro ao parar NFC:', error);
    }
  }

  /**
   * Verifica se NFC está disponível e habilitado
   */
  async checkNFCStatus(): Promise<{
    supported: boolean;
    enabled: boolean;
    error?: string;
  }> {
    try {
      if (!this.isNFCSupported) {
        return {
          supported: false,
          enabled: false,
          error: Platform.OS === 'ios' ? 
            'NFC requer um build nativo (não funciona no Expo Go)' : 
            'NFC não está disponível'
        };
      }

      const supported = await NfcManager.isSupported();
      if (!supported) {
        return { 
          supported: false, 
          enabled: false, 
          error: 'NFC não é suportado neste dispositivo' 
        };
      }

      const enabled = await NfcManager.isEnabled();
      return { 
        supported: true, 
        enabled,
        error: enabled ? undefined : 'NFC está desabilitado'
      };
    } catch (error) {
      return { 
        supported: false, 
        enabled: false, 
        error: error instanceof Error ? error.message : 'Erro ao verificar NFC' 
      };
    }
  }

  /**
   * Obtém dados da transação atual
   */
  getCurrentTransactionData(): NFCTransactionData | null {
    return this.currentTransactionData;
  }

  /**
   * Calcula taxa estimada da transação
   */
  async estimateTransactionFee(): Promise<number> {
    try {
      // Taxa básica de transferência SOL (aproximadamente 0.000005 SOL)
      const baseFee = 0.000005;
      
      // Em devnet, a taxa pode ser zero, mas retornamos a estimativa
      return baseFee;
    } catch (error) {
      console.error('❌ Erro ao estimar taxa:', error);
      return 0.000005; // Fallback
    }
  }

  /**
   * Limpa recursos
   */
  async cleanup(): Promise<void> {
    try {
      await this.stop();
      
      if (this.isInitialized && this.isNFCSupported) {
        // Note: NfcManager não tem método stop() na versão atual
        // Apenas limpar o estado
        this.isInitialized = false;
      }
      
      console.log('🧹 Cleanup NFC concluído');
    } catch (error) {
      console.error('❌ Erro no cleanup NFC:', error);
    }
  }
}

export default NFCService;