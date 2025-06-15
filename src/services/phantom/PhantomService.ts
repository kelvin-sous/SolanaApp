// ========================================
// src/services/phantom/PhantomService.ts
// VERSÃO COMPLETA - Mantém TODAS as funcionalidades + correções oficiais
// ========================================

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { PublicKey, Transaction } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

import {
  PhantomSession,
  PhantomConnectResponse,
  PhantomConnectionData,
  PhantomConnectionResult,
  PhantomEventData
} from '../../types/phantom';
import { PHANTOM_CONFIG, APP_CONFIG } from '../../constants/config';
import SolanaService from '../solana/SolanaService';

// ========================================
// INTERFACES COMPLETAS (ORIGINAIS + NOVAS)
// ========================================

// Interfaces originais mantidas
export interface PhantomTransactionPayload {
  transaction: string;
  sendOptions?: any;
  session: string;
}

export interface PhantomTransactionResponse {
  signature: string;
}

export interface PhantomSendTransactionParams {
  dapp_encryption_public_key: string;
  nonce: string;
  redirect_link: string;
  payload: string;
}

// Novas interfaces seguindo documentação oficial
interface SignAndSendTransactionPayload {
  transaction: string;
  sendOptions?: {
    skipPreflight?: boolean;
    preflightCommitment?: string;
    maxRetries?: number;
  };
  session: string;
}

interface SignTransactionPayload {
  transaction: string;
  session: string;
}

interface SignAndSendTransactionResponse {
  signature: string;
}

interface SignTransactionResponse {
  transaction: string;
}

class PhantomService {
  private static instance: PhantomService;
  private debugDeepLinkCount = 0;
  private currentSession: PhantomSession | null = null;
  private currentConnectionData: PhantomConnectionData | null = null;
  private currentTransactionData: {
    resolve: (signature: string) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  } | null = null;

  constructor() {
    this.setupLinkingListener();
  }

  public static getInstance(): PhantomService {
    if (!PhantomService.instance) {
      PhantomService.instance = new PhantomService();
    }
    return PhantomService.instance;
  }

  /**
   * Configura listener para deep links
   */
  private setupLinkingListener(): void {
    console.log('🔗 Configurando listener de deep links...');
    console.log('📱 Scheme esperado:', APP_CONFIG.DEEP_LINK_SCHEME);

    Linking.addEventListener('url', (event) => {
      this.debugDeepLinkCount++;
      console.log(`📨 URL recebida (${this.debugDeepLinkCount}):`, event.url);
      console.log('🕐 Horário:', new Date().toLocaleTimeString());
      this.handleIncomingURL(event.url);
    });

    // Verificar se o app foi aberto por uma URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🚀 App aberto por URL inicial:', url);
        this.handleIncomingURL(url);
      } else {
        console.log('ℹ️ App aberto normalmente (sem URL inicial)');
      }
    });

    console.log('✅ Listener configurado com sucesso');
  }

  /**
   * 🔥 ATUALIZADA: Processa URLs recebidas com debug completo
   */
  private handleIncomingURL(url: string): void {
    console.log('=== 📨 CORREÇÃO: DEEP LINK RECEBIDO ===');
    console.log('URL completa:', url);
    console.log('Timestamp:', new Date().toLocaleTimeString());
    console.log('Deep link count:', this.debugDeepLinkCount);
    console.log('Estado atual:', {
      hasConnectionData: !!this.currentConnectionData,
      hasTransactionData: !!this.currentTransactionData,
      isConnected: this.isConnected()
    });
    console.log('=======================================');

    try {
      const parsedUrl = Linking.parse(url);
      console.log('📋 CORREÇÃO: URL parseada:', {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        queryParams: Object.keys(parsedUrl.queryParams || {}),
        scheme: parsedUrl.scheme
      });

      // 🔥 CORREÇÃO: Verificação mais ampla
      const isPhantomResponse =
        url.includes('phantom') ||
        parsedUrl.path?.includes('phantom-connect') ||
        parsedUrl.path?.includes('phantom-transaction') ||
        parsedUrl.path?.includes('phantom-sign') ||
        this.isPhantomResponse(parsedUrl.queryParams || {});

      if (isPhantomResponse) {
        console.log('👻 CORREÇÃO: Resposta do Phantom detectada!');
        console.log('🔍 CORREÇÃO: Parâmetros encontrados:', {
          hasPhantomKey: !!(parsedUrl.queryParams?.phantom_encryption_public_key),
          hasNonce: !!(parsedUrl.queryParams?.nonce),
          hasData: !!(parsedUrl.queryParams?.data),
          hasError: !!(parsedUrl.queryParams?.errorCode),
          hasSignature: !!(parsedUrl.queryParams?.signature),
          hasTransaction: !!(parsedUrl.queryParams?.transaction),
          allParams: Object.keys(parsedUrl.queryParams || {})
        });

        this.processPhantomResponse(parsedUrl.queryParams || {});
      } else {
        console.log('ℹ️ CORREÇÃO: URL não é uma resposta do Phantom');
        console.log('🔍 CORREÇÃO: URL recebida mas não identificada como Phantom');

        // 🔥 CORREÇÃO: Log da URL completa para debug
        console.log('🔍 CORREÇÃO: URL completa para análise:', url);
        console.log('🔍 CORREÇÃO: Esperando padrões:', {
          paths: ['phantom-connect', 'phantom-transaction', 'phantom-sign'],
          params: ['phantom_encryption_public_key', 'nonce', 'data', 'signature', 'transaction'],
          schemes: ['solanawallet', 'phantom']
        });
      }
    } catch (error) {
      console.error('❌ CORREÇÃO: Erro ao processar URL:', error);
      if (this.currentConnectionData) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        this.currentConnectionData.reject(new Error(`CORREÇÃO: Erro ao processar resposta da Phantom: ${errorMessage}`));
        this.clearConnectionData();
      }
      if (this.currentTransactionData) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        this.currentTransactionData.reject(new Error(`CORREÇÃO: Erro ao processar resposta da Phantom: ${errorMessage}`));
        this.clearTransactionData();
      }
    }
  }

  /**
   * Verifica se é uma resposta válida do Phantom
   */
  private isPhantomResponse(queryParams: any): boolean {
    const isError = !!(queryParams.errorCode || queryParams.errorMessage);
    const isConnectSuccess = !!(
      queryParams.phantom_encryption_public_key &&
      queryParams.nonce &&
      queryParams.data
    );
    const isTransactionSuccess = !!(queryParams.signature);
    const isSignSuccess = !!(queryParams.transaction);
    const isEncryptedResponse = !!(queryParams.nonce && queryParams.data);

    console.log('🔍 Validação de resposta:', {
      isError,
      isConnectSuccess,
      isTransactionSuccess,
      isSignSuccess,
      isEncryptedResponse,
      hasPhantomKey: !!queryParams.phantom_encryption_public_key,
      hasNonce: !!queryParams.nonce,
      hasData: !!queryParams.data,
      hasSignature: !!queryParams.signature,
      hasTransaction: !!queryParams.transaction,
      errorCode: queryParams.errorCode
    });

    return isError || isConnectSuccess || isTransactionSuccess || isSignSuccess || isEncryptedResponse;
  }

  /**
   * Processa resposta do Phantom - COMPLETO COM TODAS AS FUNCIONALIDADES
   */
  private async processPhantomResponse(queryParams: PhantomEventData): Promise<void> {
    try {
      console.log('🔄 Processando resposta...');

      // Verificar se houve erro
      if (queryParams.errorCode) {
        const errorMessage = `Phantom Error: ${queryParams.errorMessage || 'Usuário cancelou ou erro desconhecido'}`;

        // Rejeitar conexão se pendente
        if (this.currentConnectionData) {
          this.currentConnectionData.reject(new Error(errorMessage));
          this.clearConnectionData();
          return;
        }

        // Rejeitar transação se pendente
        if (this.currentTransactionData) {
          this.currentTransactionData.reject(new Error(errorMessage));
          this.clearTransactionData();
          return;
        }

        throw new Error(errorMessage);
      }

      // ========================================
      // PROCESSAR RESPOSTAS DE TRANSAÇÃO (COMPLETO)
      // ========================================

      // Verificar se é resposta de transação com signature direta
      if (queryParams.signature && this.currentTransactionData) {
        console.log('✅ Signature de transação recebida:', queryParams.signature);
        this.currentTransactionData.resolve(queryParams.signature);
        this.clearTransactionData();
        return;
      }

      // Verificar se é resposta de transação (signed transaction)
      if (queryParams.transaction && this.currentTransactionData) {
        console.log('✅ Transação assinada recebida para envio manual');
        this.currentTransactionData.resolve(queryParams.transaction);
        this.clearTransactionData();
        return;
      }

      // Verificar se é resposta de transação criptografada (NOVO MÉTODO OFICIAL)
      if (queryParams.nonce && queryParams.data && this.currentTransactionData) {
        try {
          const decryptedResponse = await this.decryptResponseOfficial(queryParams.nonce, queryParams.data);

          if (decryptedResponse.signature) {
            console.log('✅ Signature descriptografada:', decryptedResponse.signature);
            this.currentTransactionData.resolve(decryptedResponse.signature);
          } else if (decryptedResponse.transaction) {
            console.log('✅ Transação assinada descriptografada');
            this.currentTransactionData.resolve(decryptedResponse.transaction);
          } else {
            throw new Error('Resposta inválida - sem signature nem transaction');
          }

          this.clearTransactionData();
          return;
        } catch (error) {
          console.error('❌ Erro ao descriptografar resposta de transação:', error);

          // FALLBACK: Tentar método original de descriptografia
          try {
            const legacyResponse = await this.decryptTransactionResponse({
              nonce: queryParams.nonce,
              data: queryParams.data
            });
            console.log('✅ Resposta descriptografada com método legacy:', legacyResponse.signature);
            this.currentTransactionData.resolve(legacyResponse.signature);
            this.clearTransactionData();
            return;
          } catch (legacyError) {
            console.error('❌ Método legacy também falhou:', legacyError);
            this.currentTransactionData.reject(error instanceof Error ? error : new Error('Erro desconhecido'));
            this.clearTransactionData();
            return;
          }
        }
      }

      // ========================================
      // PROCESSAR RESPOSTAS DE CONEXÃO (CÓDIGO ORIGINAL)
      // ========================================

      if (!this.currentConnectionData) {
        console.log('⚠️ Resposta recebida, mas nenhuma conexão pendente');
        return;
      }

      // Resposta de conexão
      const { phantom_encryption_public_key, nonce, data } = queryParams;

      if (!phantom_encryption_public_key || !nonce || !data) {
        throw new Error('Resposta inválida da Phantom - dados incompletos');
      }

      // Descriptografar dados
      const session = await this.decryptPhantomResponse({
        phantom_encryption_public_key,
        nonce,
        data,
        dappKeyPair: this.currentConnectionData.dappKeyPair
      });

      console.log('✅ Sessão criada com sucesso!');
      this.currentConnectionData.resolve(session);
      this.clearConnectionData();

    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);

      if (this.currentConnectionData) {
        this.currentConnectionData.reject(error instanceof Error ? error : new Error('Erro desconhecido'));
        this.clearConnectionData();
      }

      if (this.currentTransactionData) {
        this.currentTransactionData.reject(error instanceof Error ? error : new Error('Erro desconhecido'));
        this.clearTransactionData();
      }
    }
  }

  // ========================================
  // MÉTODOS DE TRANSAÇÃO - COMPLETOS (ORIGINAIS + NOVOS)
  // ========================================

  /**
   * Método híbrido que tenta múltiplas abordagens - MANTIDO E MELHORADO
   */
  async executeTransaction(transaction: Transaction): Promise<string> {
    console.log('🚀 Executando transação com método híbrido melhorado...');

    if (!this.currentSession) {
      throw new Error('Phantom não conectado. Conecte primeiro.');
    }

    // 🔥 NOVA ESTRATÉGIA: Seguir recomendação oficial primeiro
    const methods = [
      { name: 'Official SignAndSendTransaction', method: () => this.signAndSendTransactionOfficial(transaction) },
      { name: 'Official SignTransaction + Manual Send', method: () => this.signTransactionOfficial(transaction) },
      { name: 'Legacy SignAndSend', method: () => this.signAndSendTransaction(transaction) },
      { name: 'Legacy Sign Only + Manual Send', method: () => this.signTransaction(transaction) }
    ];

    for (const { name, method } of methods) {
      try {
        console.log(`🎯 Tentando: ${name}...`);
        const signature = await method();
        console.log(`✅ Sucesso com ${name}:`, signature);
        return signature;
      } catch (error) {
        console.log(`❌ ${name} falhou:`, error instanceof Error ? error.message : error);
        // Limpar estado antes da próxima tentativa
        this.clearTransactionData();
        await this.delay(1000); // Pequena pausa entre tentativas
      }
    }

    throw new Error('Todas as tentativas de transação falharam');
  }

  /**
   * NOVO: SignAndSendTransaction seguindo documentação oficial EXATA
   */
  private async signAndSendTransactionOfficial(transaction: Transaction): Promise<string> {
    try {
      console.log('📋 Iniciando SignAndSendTransaction oficial...');

      if (!this.currentSession) {
        throw new Error('Sessão não encontrada');
      }

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });
      const transactionBase58 = bs58.encode(serializedTransaction);

      console.log('📦 Transação serializada:', transactionBase58.length, 'chars');

      // Payload EXATO da documentação
      const payload: SignAndSendTransactionPayload = {
        transaction: transactionBase58,
        sendOptions: {
          skipPreflight: false,
          preflightCommitment: 'processed',
          maxRetries: 3
        },
        session: this.currentSession.session
      };

      const nonce = await this.generateSecureRandomBytes(24);
      const nonceBase58 = bs58.encode(nonce);
      const encryptedPayload = await this.encryptPayloadOfficial(payload, nonce);

      const redirectLink = Linking.createURL(`phantom-transaction-${Date.now()}`, {
        scheme: APP_CONFIG.DEEP_LINK_SCHEME
      });

      // URL seguindo documentação EXATA
      const baseUrl = 'https://phantom.app/ul/v1/signAndSendTransaction';
      const urlParams = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(this.currentSession.dappKeyPair.publicKey),
        nonce: nonceBase58,
        redirect_link: redirectLink,
        payload: encryptedPayload
      });

      const finalUrl = `${baseUrl}?${urlParams.toString()}`;

      console.log('🔧 URL oficial construída (tamanho):', finalUrl.length, 'chars');

      const transactionPromise = this.createTransactionPromise();
      const opened = await this.tryOpenPhantom(finalUrl);

      if (!opened) {
        throw new Error('Não foi possível abrir Phantom');
      }

      console.log('⏳ Aguardando resposta oficial...');
      return await transactionPromise;

    } catch (error) {
      console.error('❌ Erro em SignAndSendTransaction oficial:', error);
      this.clearTransactionData();
      throw error;
    }
  }

  /**
   * NOVO: SignTransaction seguindo documentação oficial EXATA
   */
  private async signTransactionOfficial(transaction: Transaction): Promise<string> {
    try {
      console.log('🖊️ Iniciando SignTransaction oficial...');

      if (!this.currentSession) {
        throw new Error('Sessão não encontrada');
      }

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });
      const transactionBase58 = bs58.encode(serializedTransaction);

      // Payload EXATO da documentação (SEM sendOptions)
      const payload: SignTransactionPayload = {
        transaction: transactionBase58,
        session: this.currentSession.session
      };

      const nonce = await this.generateSecureRandomBytes(24);
      const nonceBase58 = bs58.encode(nonce);
      const encryptedPayload = await this.encryptPayloadOfficial(payload, nonce);

      const redirectLink = Linking.createURL(`phantom-sign-${Date.now()}`, {
        scheme: APP_CONFIG.DEEP_LINK_SCHEME
      });

      // URL seguindo documentação EXATA
      const baseUrl = 'https://phantom.app/ul/v1/signTransaction';
      const urlParams = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(this.currentSession.dappKeyPair.publicKey),
        nonce: nonceBase58,
        redirect_link: redirectLink,
        payload: encryptedPayload
      });

      const finalUrl = `${baseUrl}?${urlParams.toString()}`;

      const transactionPromise = this.createTransactionPromise();
      const opened = await this.tryOpenPhantom(finalUrl);

      if (!opened) {
        throw new Error('Não foi possível abrir Phantom');
      }

      console.log('⏳ Aguardando assinatura oficial...');

      // Aguardar transação assinada
      const signedTransactionBase58 = await transactionPromise;

      // Enviar via RPC manualmente
      console.log('📤 Enviando transação assinada via RPC...');
      const solanaService = SolanaService.getInstance();
      const connection = solanaService.getConnection();

      const signedTransactionBytes = bs58.decode(signedTransactionBase58);
      const signature = await connection.sendRawTransaction(signedTransactionBytes, {
        skipPreflight: false,
        preflightCommitment: 'processed',
        maxRetries: 3
      });

      console.log('📤 Transação enviada:', signature);

      // Confirmar transação
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Transação confirmada:', signature);

      return signature;

    } catch (error) {
      console.error('❌ Erro em SignTransaction oficial:', error);
      this.clearTransactionData();
      throw error;
    }
  }

  /**
   * MANTIDO: Método melhorado original para transações com fallback
   */
  async signAndSendTransaction(transaction: Transaction): Promise<string> {
    try {
      console.log('🚀 Iniciando signAndSendTransaction legacy melhorado...');

      if (!this.currentSession) {
        throw new Error('Sessão Phantom não encontrada. Conecte primeiro.');
      }

      // Serializar transação
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });
      const transactionBase58 = bs58.encode(serializedTransaction);

      console.log('📦 Transação serializada (tamanho):', transactionBase58.length, 'chars');

      // 🔥 TENTAR MÉTODO SIMPLES PRIMEIRO (sem criptografia)
      try {
        console.log('🎯 Tentativa 1: Método simples sem criptografia...');
        const signature = await this.trySimpleSignAndSend(transactionBase58);
        if (signature) {
          console.log('✅ Transação concluída via método simples!');
          return signature;
        }
      } catch (error) {
        console.log('⚠️ Método simples falhou, tentando método criptografado...', error);
      }

      // 🔥 FALLBACK: MÉTODO CRIPTOGRAFADO ORIGINAL
      console.log('🎯 Tentativa 2: Método criptografado completo...');
      return await this.tryEncryptedSignAndSend(transaction, transactionBase58);

    } catch (error) {
      console.error('❌ Erro em signAndSendTransaction legacy:', error);
      this.clearTransactionData();
      throw error;
    }
  }

  /**
   * MANTIDO: Método alternativo usando signTransaction (sem envio automático)
   */
  async signTransaction(transaction: Transaction): Promise<string> {
    try {
      console.log('🚀 Iniciando signTransaction legacy (apenas assinatura)...');

      if (!this.currentSession) {
        throw new Error('Sessão Phantom não encontrada. Conecte primeiro.');
      }

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });
      const transactionBase58 = bs58.encode(serializedTransaction);

      const redirectLink = Linking.createURL(`phantom-sign-legacy-${Date.now()}`, {
        scheme: APP_CONFIG.DEEP_LINK_SCHEME
      });

      // URL para apenas assinar (sem enviar)
      const signUrl = `https://phantom.app/ul/v1/signTransaction?` +
        `dapp_encryption_public_key=${bs58.encode(this.currentSession.dappKeyPair.publicKey)}&` +
        `redirect_link=${encodeURIComponent(redirectLink)}&` +
        `transaction=${transactionBase58}`;

      console.log('🔗 URL de assinatura legacy:', signUrl.slice(0, 100) + '...');

      const transactionPromise = this.createTransactionPromise();
      const opened = await this.tryOpenPhantom(signUrl);

      if (!opened) {
        throw new Error('Não foi possível abrir Phantom para assinatura');
      }

      console.log('⏳ Aguardando assinatura legacy...');

      // Para signTransaction, o retorno é a transação assinada, não a signature
      const signedTransactionBase58 = await transactionPromise;

      // Enviar a transação assinada via Solana RPC
      const solanaService = SolanaService.getInstance();
      const connection = solanaService.getConnection();

      const signedTransactionBytes = bs58.decode(signedTransactionBase58);
      const signature = await connection.sendRawTransaction(signedTransactionBytes, {
        skipPreflight: false,
        preflightCommitment: 'processed',
      });

      console.log('📤 Transação enviada manualmente (legacy):', signature);

      // Confirmar transação
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Transação confirmada (legacy):', signature);

      return signature;

    } catch (error) {
      console.error('❌ Erro em signTransaction legacy:', error);
      this.clearTransactionData();
      throw error;
    }
  }

  /**
   * MANTIDO: Método simples sem criptografia (pode funcionar melhor)
   */
  private async trySimpleSignAndSend(transactionBase58: string): Promise<string> {
    // Criar URL simples sem payload criptografado
    const redirectLink = Linking.createURL(`phantom-transaction-simple-${Date.now()}`, {
      scheme: APP_CONFIG.DEEP_LINK_SCHEME
    });

    const simpleUrl = `https://phantom.app/ul/v1/signAndSendTransaction?` +
      `dapp_encryption_public_key=${bs58.encode(this.currentSession!.dappKeyPair.publicKey)}&` +
      `redirect_link=${encodeURIComponent(redirectLink)}&` +
      `transaction=${transactionBase58}`;

    console.log('🔗 URL simples (tamanho):', simpleUrl.length, 'chars');
    console.log('📱 URL simples:', simpleUrl.slice(0, 100) + '...');

    // Configurar promessa
    const transactionPromise = this.createTransactionPromise();

    // Abrir Phantom
    const opened = await this.tryOpenPhantom(simpleUrl);

    if (!opened) {
      throw new Error('Não foi possível abrir Phantom');
    }

    console.log('⏳ Aguardando resposta simples...');
    return await transactionPromise;
  }

  /**
   * MANTIDO: Método criptografado original (fallback)
   */
  private async tryEncryptedSignAndSend(transaction: Transaction, transactionBase58: string): Promise<string> {
    // Código original criptografado
    const payload: PhantomTransactionPayload = {
      transaction: transactionBase58,
      session: this.currentSession!.session,
      sendOptions: {
        skipPreflight: false,
        preflightCommitment: 'processed',
        maxRetries: 3
      }
    };

    const nonce = await this.generateSecureRandomBytes(24);
    const nonceBase58 = bs58.encode(nonce);
    const encryptedPayload = await this.encryptTransactionPayload(payload, nonce);

    const redirectLink = Linking.createURL(`phantom-transaction-encrypted-${Date.now()}`, {
      scheme: APP_CONFIG.DEEP_LINK_SCHEME
    });

    const transactionUrl = this.buildSignAndSendUrl({
      dapp_encryption_public_key: bs58.encode(this.currentSession!.dappKeyPair.publicKey),
      nonce: nonceBase58,
      redirect_link: redirectLink,
      payload: encryptedPayload
    });

    console.log('🔗 URL criptografada legacy (tamanho):', transactionUrl.length, 'chars');

    const transactionPromise = this.createTransactionPromise();
    const opened = await this.tryOpenPhantom(transactionUrl);

    if (!opened) {
      throw new Error('Não foi possível abrir Phantom para transação criptografada');
    }

    console.log('⏳ Aguardando resposta criptografada legacy...');
    return await transactionPromise;
  }

  // ========================================
  // MÉTODOS DE CRIPTOGRAFIA (ORIGINAIS + NOVOS)
  // ========================================

  /**
   * NOVO: Criptografa payload seguindo documentação oficial
   */
  private async encryptPayloadOfficial(payload: any, nonce: Uint8Array): Promise<string> {
    try {
      if (!this.currentSession) {
        throw new Error('Sessão não encontrada');
      }

      const payloadJson = JSON.stringify(payload);
      const payloadBytes = new TextEncoder().encode(payloadJson);

      console.log('🔐 Criptografando payload oficial:', payloadBytes.length, 'bytes');
      console.log('📋 Payload JSON oficial:', payloadJson);

      const encryptedData = nacl.box.after(
        payloadBytes,
        nonce,
        this.currentSession.sharedSecret
      );

      if (!encryptedData) {
        throw new Error('Falha ao criptografar payload oficial');
      }

      const encryptedBase58 = bs58.encode(encryptedData);
      console.log('✅ Payload oficial criptografado:', encryptedBase58.length, 'chars');

      return encryptedBase58;

    } catch (error) {
      console.error('❌ Erro ao criptografar payload oficial:', error);
      throw error;
    }
  }

  /**
   * NOVO: Descriptografa resposta seguindo documentação oficial
   */
  private async decryptResponseOfficial(nonceBase58: string, dataBase58: string): Promise<any> {
    try {
      if (!this.currentSession) {
        throw new Error('Sessão não encontrada');
      }

      const nonceBytes = bs58.decode(nonceBase58);
      const encryptedData = bs58.decode(dataBase58);

      console.log('🔓 Descriptografando resposta oficial...');

      const decryptedData = nacl.box.open.after(
        encryptedData,
        nonceBytes,
        this.currentSession.sharedSecret
      );

      if (!decryptedData) {
        throw new Error('Falha ao descriptografar resposta oficial');
      }

      const textDecoder = new TextDecoder();
      const decryptedJson = textDecoder.decode(decryptedData);
      const response = JSON.parse(decryptedJson);

      console.log('✅ Resposta oficial descriptografada:', Object.keys(response));
      return response;

    } catch (error) {
      console.error('❌ Erro ao descriptografar resposta oficial:', error);
      throw error;
    }
  }

  /**
   * MANTIDO: Criptografa payload da transação - LEGACY
   */
  private async encryptTransactionPayload(
    payload: PhantomTransactionPayload,
    nonce: Uint8Array
  ): Promise<string> {
    try {
      if (!this.currentSession) {
        throw new Error('Sessão não encontrada para criptografia');
      }

      // Converter payload para JSON
      const payloadJson = JSON.stringify(payload);
      const payloadBytes = new TextEncoder().encode(payloadJson);

      console.log('🔐 Criptografando payload legacy (tamanho):', payloadBytes.length, 'bytes');
      console.log('📋 Payload JSON legacy:', payloadJson);

      // Criptografar usando sharedSecret
      const encryptedData = nacl.box.after(
        payloadBytes,
        nonce,
        this.currentSession.sharedSecret
      );

      if (!encryptedData) {
        throw new Error('Falha ao criptografar payload da transação');
      }

      // Codificar em base58
      const encryptedBase58 = bs58.encode(encryptedData);
      console.log('✅ Payload legacy criptografado (tamanho):', encryptedBase58.length, 'chars');

      return encryptedBase58;

    } catch (error) {
      console.error('❌ Erro ao criptografar payload legacy:', error);
      throw new Error(`Falha na criptografia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * MANTIDO: Constrói URL para signAndSendTransaction
   */
  private buildSignAndSendUrl(params: PhantomSendTransactionParams): string {
    const baseUrl = 'https://phantom.app/ul/v1/signAndSendTransaction';

    const urlParams = new URLSearchParams({
      dapp_encryption_public_key: params.dapp_encryption_public_key,
      nonce: params.nonce,
      redirect_link: encodeURIComponent(params.redirect_link),
      payload: params.payload
    });

    const finalUrl = `${baseUrl}?${urlParams.toString()}`;

    console.log('🔧 Construindo URL de transação legacy:');
    console.log('  📍 Base URL:', baseUrl);
    console.log('  🔑 Dapp Key:', params.dapp_encryption_public_key.slice(0, 10) + '...');
    console.log('  🎲 Nonce:', params.nonce.slice(0, 10) + '...');
    console.log('  📱 Redirect:', params.redirect_link);
    console.log('  📦 Payload:', params.payload.slice(0, 20) + '...');

    return finalUrl;
  }

  /**
   * MANTIDO: Cria promessa para aguardar resposta da transação
   */
  private createTransactionPromise(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      console.log('⏳ Criando promessa de transação...');
      console.log('⏰ Timeout configurado para: 3 minutos');

      const timeout = setTimeout(() => {
        console.log('⏰ TIMEOUT DE TRANSAÇÃO ATINGIDO!');
        console.log('🕐 Tempo esperado: 3 minutos');
        console.log('📱 Deep links recebidos durante espera:', this.debugDeepLinkCount || 0);

        reject(new Error('Timeout: transação não completada em 3 minutos'));
        this.clearTransactionData();
      }, 3 * 60 * 1000); // 3 minutos

      this.currentTransactionData = {
        resolve: (signature) => {
          console.log('✅ TRANSAÇÃO RESOLVIDA COM SUCESSO!');
          console.log('📝 Signature:', signature);
          resolve(signature);
        },
        reject: (error) => {
          console.log('❌ TRANSAÇÃO REJEITADA!');
          console.log('🔍 Erro:', error.message);
          reject(error);
        },
        timeout
      };

      console.log('✅ Promessa de transação criada, aguardando resposta...');
    });
  }

  /**
   * MANTIDO: Descriptografa resposta de transação - LEGACY
   */
  private async decryptTransactionResponse(params: {
    nonce: string;
    data: string;
  }): Promise<PhantomTransactionResponse> {
    try {
      if (!this.currentSession) {
        throw new Error('Sessão não encontrada para descriptografia');
      }

      const nonceBytes = bs58.decode(params.nonce);
      const encryptedData = bs58.decode(params.data);

      console.log('🔓 Descriptografando resposta de transação legacy...');

      // Descriptografar usando sharedSecret
      const decryptedData = nacl.box.open.after(
        encryptedData,
        nonceBytes,
        this.currentSession.sharedSecret
      );

      if (!decryptedData) {
        throw new Error('Falha ao descriptografar resposta de transação');
      }

      // Converter para string e parsear JSON
      const textDecoder = new TextDecoder();
      const decryptedJson = textDecoder.decode(decryptedData);
      const response: PhantomTransactionResponse = JSON.parse(decryptedJson);

      console.log('✅ Resposta legacy descriptografada:', {
        hasSignature: !!response.signature,
        signaturePreview: response.signature?.slice(0, 8) + '...'
      });

      return response;

    } catch (error) {
      console.error('❌ Erro ao descriptografar resposta legacy:', error);
      throw new Error(`Falha na descriptografia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * MANTIDO: Limpa dados de transação
   */
  private clearTransactionData(): void {
    if (this.currentTransactionData) {
      clearTimeout(this.currentTransactionData.timeout);
      this.currentTransactionData = null;
    }
  }

  // ========================================
  // MÉTODOS ORIGINAIS DE CONEXÃO (TODOS MANTIDOS)
  // ========================================

  /**
   * MANTIDO: Descriptografa resposta do Phantom
   */
  private async decryptPhantomResponse(params: {
    phantom_encryption_public_key: string;
    nonce: string;
    data: string;
    dappKeyPair: nacl.BoxKeyPair;
  }): Promise<PhantomSession> {
    const { phantom_encryption_public_key, nonce, data, dappKeyPair } = params;

    console.log('🔓 Iniciando descriptografia avançada...');
    console.log('📊 Dados recebidos:', {
      phantomKey: phantom_encryption_public_key.slice(0, 10) + '...',
      nonce: nonce.slice(0, 10) + '...',
      data: data.slice(0, 10) + '...'
    });

    try {
      // Usar método da documentação oficial
      const phantomPublicKey = bs58.decode(phantom_encryption_public_key);
      const nonceBytes = bs58.decode(nonce);
      const encryptedData = bs58.decode(data);

      console.log('✅ Dados decodificados');

      // Criar segredo compartilhado
      const sharedSecret = nacl.box.before(phantomPublicKey, dappKeyPair.secretKey);
      console.log('✅ Segredo compartilhado criado');

      // Descriptografar usando nacl.box.open.after
      const decryptedData = nacl.box.open.after(encryptedData, nonceBytes, sharedSecret);

      if (!decryptedData) {
        throw new Error('Falha ao descriptografar dados - chave ou dados inválidos');
      }

      console.log('✅ Dados descriptografados com sucesso');

      // Converter para string e parsear JSON - SEM usar Buffer
      const textDecoder = new TextDecoder();
      const decryptedJson = textDecoder.decode(decryptedData);
      console.log('📋 JSON descriptografado (tamanho):', decryptedJson.length, 'chars');

      const connectData: PhantomConnectResponse = JSON.parse(decryptedJson);

      console.log('✅ Dados de conexão parseados:', {
        hasPublicKey: !!connectData.public_key,
        hasSession: !!connectData.session,
        publicKeyPreview: connectData.public_key?.slice(0, 8) + '...'
      });

      // Criar sessão completa
      const session: PhantomSession = {
        publicKey: new PublicKey(connectData.public_key),
        session: connectData.session,
        dappKeyPair,
        sharedSecret,
        phantomEncryptionPublicKey: phantom_encryption_public_key
      };

      return session;
    } catch (error) {
      console.error('❌ Erro detalhado na descriptografia:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        phantomKeyLength: phantom_encryption_public_key.length,
        nonceLength: nonce.length,
        dataLength: data.length
      });
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha na descriptografia: ${errorMessage}`);
    }
  }

  /**
   * MANTIDO: Limpa dados de conexão
   */
  private clearConnectionData(): void {
    if (this.currentConnectionData) {
      clearTimeout(this.currentConnectionData.timeout);
      this.currentConnectionData = null;
    }
  }

  /**
   * MANTIDO: Conecta com Phantom ou redireciona para download
   */
  async connectOrDownload(): Promise<PhantomSession | 'DOWNLOAD_NEEDED'> {
    try {
      console.log('🚀 Iniciando conexão com Phantom...');

      // 🔥 NOVO: Teste a APP_URL primeiro
      await this.testAppUrl(APP_CONFIG.APP_URL);

      // Limpar conexão anterior
      this.clearConnectionData();

      // 1. Gerar chaves
      console.log('🔑 Gerando chaves de criptografia...');
      const secretKey = await this.generateSecureRandomBytes(32);
      const dappKeyPair = nacl.box.keyPair.fromSecretKey(secretKey);
      const dappEncryptionPublicKey = bs58.encode(dappKeyPair.publicKey);

      console.log('--- Depuração de Chaves Dapp ---');
      console.log('dappEncryptionPublicKey (Base58):', dappEncryptionPublicKey);
      console.log('dappEncryptionPublicKey (Length):', dappEncryptionPublicKey.length);
      console.log('dappKeyPair.publicKey (Raw Uint8Array):', dappKeyPair.publicKey);
      console.log('dappKeyPair.secretKey (Raw Uint8Array):', dappKeyPair.secretKey);
      console.log('--- Fim Depuração de Chaves ---');

      console.log('✅ Chaves geradas:', {
        publicKeyLength: dappEncryptionPublicKey.length,
        publicKeyPreview: dappEncryptionPublicKey.slice(0, 10) + '...'
      });

      // 2. Criar URLs com scheme correto do config
      console.log('🔗 Criando URLs...');
      const redirectLink = Linking.createURL('phantom-connect', {
        scheme: APP_CONFIG.DEEP_LINK_SCHEME
      });
      const connectUrl = this.buildConnectUrl({
        app_url: APP_CONFIG.APP_URL,
        dapp_encryption_public_key: dappEncryptionPublicKey,
        redirect_link: redirectLink,
        cluster: 'devnet'
      });

      console.log('✅ URLs criadas');
      console.log('📱 Redirect Link:', redirectLink);
      console.log('🌐 Connect URL comprimento:', connectUrl.length, 'caracteres');

      // 3. Configurar promessa de resposta
      const connectionPromise = this.createConnectionPromise(dappKeyPair);

      // 4. Verificar se Phantom está instalado ANTES de tentar abrir (apenas iOS)
      let isPhantomInstalled = true; // Padrão para Android

      if (Platform.OS === 'ios') {
        isPhantomInstalled = await this.checkPhantomInstalled();

        if (!isPhantomInstalled) {
          this.clearConnectionData();
          console.log('📥 Phantom não instalado no iOS, abrindo download...');
          await this.openDownloadPage();
          return 'DOWNLOAD_NEEDED';
        }
      }

      // 5. Tentar abrir Phantom
      const opened = await this.tryOpenPhantom(connectUrl);

      if (!opened) {
        this.clearConnectionData();
        console.log('📥 Falha ao abrir Phantom, abrindo download...');
        await this.openDownloadPage();
        return 'DOWNLOAD_NEEDED';
      }

      // 6. Aguardar resposta
      console.log('⏳ Aguardando resposta da Phantom...');
      const session = await connectionPromise;

      // 7. Salvar e retornar
      await this.saveSession(session);
      this.currentSession = session;

      console.log('✅ Conectado com sucesso!');
      return session;

    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      this.clearConnectionData();

      // Se for erro de cancelamento/timeout, oferecer download
      if (this.shouldOfferDownload(error)) {
        console.log('📥 Oferecendo download devido ao erro...');
        await this.openDownloadPage();
        return 'DOWNLOAD_NEEDED';
      }

      throw error;
    }
  }

  private async testAppUrl(appUrl: string): Promise<void> {
    console.log('🌐 Testando APP_URL:', appUrl);

    try {
      const response = await fetch(appUrl, {
        method: 'HEAD',
        mode: 'no-cors' // Para evitar problemas de CORS
      });
      console.log('✅ APP_URL acessível');
      console.log('📊 Response type:', response.type);
    } catch (error) {
      console.log('❌ Erro ao acessar APP_URL:', error);

      // Tentar com GET normal:
      try {
        const response2 = await fetch(appUrl);
        console.log('✅ APP_URL acessível via GET:', response2.status);
      } catch (error2) {
        console.log('❌ APP_URL totalmente inacessível:', error2);
      }
    }
  }

  /**
   * MANTIDO: Verifica se Phantom está instalado - CORRIGIDO PARA ANDROID
   */
  private async checkPhantomInstalled(): Promise<boolean> {
    try {
      console.log('🔍 Verificando se Phantom está instalado...');

      if (Platform.OS === 'ios') {
        // iOS - verificar múltiplos schemes
        const schemes = ['phantom://', 'https://phantom.app'];

        for (const scheme of schemes) {
          try {
            const canOpen = await Linking.canOpenURL(scheme);
            console.log(`📱 iOS - Scheme ${scheme}:`, canOpen);
            if (canOpen) {
              return true;
            }
          } catch (error) {
            console.log(`❌ Erro ao verificar scheme ${scheme}:`, error);
          }
        }

        return false;
      } else {
        // Android - estratégia diferente: assumir instalado e tentar abrir diretamente
        console.log('🤖 Android - Assumindo instalação e tentando abertura direta');
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar instalação:', error);
      return Platform.OS === 'android';
    }
  }

  /**
   * MANTIDO: Cria promessa para conexão
   */
  private createConnectionPromise(dappKeyPair: nacl.BoxKeyPair): Promise<PhantomSession> {
    return new Promise<PhantomSession>((resolve, reject) => {
      console.log('⏳ CORREÇÃO: Criando promessa de conexão...');
      console.log('⏰ CORREÇÃO: Timeout configurado para: 300 segundos (5 min)');

      // 🔥 CORREÇÃO: Timeout maior para debug
      const timeout = setTimeout(() => {
        console.log('⏰ CORREÇÃO: TIMEOUT DE CONEXÃO ATINGIDO!');
        console.log('🕐 CORREÇÃO: Tempo esperado: 300 segundos');
        console.log('📱 CORREÇÃO: Deep links recebidos:', this.debugDeepLinkCount || 0);
        console.log('🔍 CORREÇÃO: Estado final:', {
          hasConnectionData: !!this.currentConnectionData,
          totalDeepLinks: this.debugDeepLinkCount
        });

        reject(new Error('Timeout: conexão não completada em 5 minutos'));
        this.clearConnectionData();
      }, 300000); // 5 minutos para debug

      // 🔥 CORREÇÃO: Logs a cada 30 segundos
      const intervalLogs = setInterval(() => {
        console.log('🔍 CORREÇÃO: Status intermediário:', {
          tempoEsperando: new Date().toLocaleTimeString(),
          deepLinksRecebidos: this.debugDeepLinkCount,
          ainda_esperando: !!this.currentConnectionData
        });
      }, 30000);

      this.currentConnectionData = {
        dappKeyPair,
        resolve: (session) => {
          console.log('✅ CORREÇÃO: CONEXÃO RESOLVIDA COM SUCESSO!');
          console.log('📝 CORREÇÃO: Sessão criada:', {
            publicKey: session.publicKey.toString().slice(0, 8) + '...',
            hasSession: !!session.session,
            totalDeepLinksRecebidos: this.debugDeepLinkCount
          });
          clearInterval(intervalLogs);
          resolve(session);
        },
        reject: (error) => {
          console.log('❌ CORREÇÃO: CONEXÃO REJEITADA!');
          console.log('🔍 CORREÇÃO: Erro:', error.message);
          console.log('📊 CORREÇÃO: Deep links recebidos até falha:', this.debugDeepLinkCount);
          clearInterval(intervalLogs);
          reject(error);
        },
        timeout
      };

      console.log('✅ CORREÇÃO: Promessa criada, aguardando resposta...');
    });
  }

  /**
   * MANTIDO: Verifica se deve oferecer download
   */
  private shouldOfferDownload(error: any): boolean {
    const errorMessage = error?.message || '';
    return errorMessage.includes('cancelou') ||
      errorMessage.includes('Timeout') ||
      errorMessage.includes('não encontrada');
  }

  /**
   * MANTIDO: Tenta abrir Phantom
   */
  private async tryOpenPhantom(connectUrl: string): Promise<boolean> {
    console.log('🚀 Tentando abrir Phantom...');
    console.log('🔗 URL completa:', connectUrl);
    console.log('📱 Plataforma:', Platform.OS);

    if (Platform.OS === 'ios') {
      return await this.tryOpenPhantomIOS(connectUrl);
    } else {
      return await this.tryOpenPhantomAndroid(connectUrl);
    }
  }

  /**
   * MANTIDO: Método específico para iOS
   */
  private async tryOpenPhantomIOS(connectUrl: string): Promise<boolean> {
    console.log('🍎 Iniciando processo iOS...');

    try {
      console.log('🌐 Tentativa 1 (iOS): Universal Link direto');
      await Linking.openURL(connectUrl);
      console.log('✅ Universal Link enviado com sucesso');
      await this.delay(1000);
      return true;
    } catch (error) {
      console.log('❌ Universal Link falhou:', error);
    }

    try {
      console.log('👻 Tentativa 2 (iOS): Deep link direto');
      const url = new URL(connectUrl);
      const phantomUrl = `phantom://ul/v1/connect?${url.searchParams.toString()}`;
      console.log('🔗 Deep link URL:', phantomUrl);
      await Linking.openURL(phantomUrl);
      console.log('✅ Deep link enviado com sucesso');
      return true;
    } catch (error) {
      console.log('❌ Deep link falhou:', error);
    }

    try {
      console.log('🌐 Tentativa 3 (iOS): WebBrowser como último recurso');
      const result = await WebBrowser.openBrowserAsync(connectUrl, {
        showTitle: false,
        toolbarColor: '#6b46c1',
        showInRecents: false,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        readerMode: false,
        dismissButtonStyle: 'close'
      });

      console.log('📱 WebBrowser resultado:', result);

      if (result.type === 'cancel') {
        console.log('❌ Usuário cancelou no WebBrowser');
        return false;
      }

      return true;
    } catch (error) {
      console.log('❌ WebBrowser falhou:', error);
    }

    console.log('❌ Todos os métodos iOS falharam');
    return false;
  }

  /**
   * MANTIDO: Método específico para Android
   */
  private async tryOpenPhantomAndroid(connectUrl: string): Promise<boolean> {
    console.log('🤖 CORREÇÃO: Iniciando processo Android simplificado...');
    console.log('📏 URL length:', connectUrl.length);

    // 🔥 ESTRATÉGIA 1: Universal Link PRIMEIRO (mais confiável)
    try {
      console.log('🌐 CORREÇÃO: Tentativa Universal Link direto');
      console.log('🔗 URL Universal:', connectUrl);

      await Linking.openURL(connectUrl);
      console.log('✅ CORREÇÃO: Universal Link enviado com sucesso');

      // 🔥 AGUARDAR 15 segundos para debug
      console.log('⏳ CORREÇÃO: Aguardando 15 segundos para resposta...');
      setTimeout(() => {
        console.log('🔍 CORREÇÃO: Status após 15s:', {
          connectionDataExists: !!this.currentConnectionData,
          deepLinksRecebidos: this.debugDeepLinkCount,
          phantomJaRetornou: this.debugDeepLinkCount > 0
        });
      }, 15000);

      return true;
    } catch (error) {
      console.log('❌ CORREÇÃO: Universal Link falhou:', error);
    }

    // 🔥 ESTRATÉGIA 2: Deep link como fallback
    try {
      console.log('👻 CORREÇÃO: Tentativa Deep link como fallback');
      const url = new URL(connectUrl);
      const phantomUrl = `phantom://ul/v1/connect?${url.searchParams.toString()}`;

      const canOpenDeepLink = await Linking.canOpenURL('phantom://');
      console.log('📱 CORREÇÃO: Pode abrir phantom://:', canOpenDeepLink);

      if (canOpenDeepLink) {
        await Linking.openURL(phantomUrl);
        console.log('✅ CORREÇÃO: Deep link enviado como fallback');
        return true;
      }
    } catch (error) {
      console.log('❌ CORREÇÃO: Deep link fallback falhou:', error);
    }

    console.log('❌ CORREÇÃO: Ambos os métodos falharam');
    return false;
  }

  /**
   * MANTIDO: Abre página de download
   */
  async openDownloadPage(): Promise<void> {
    try {
      const downloadUrl = this.getDownloadUrl();
      console.log('📥 Abrindo download:', downloadUrl);
      await WebBrowser.openBrowserAsync(downloadUrl);
    } catch (error) {
      console.error('❌ Erro ao abrir download:', error);
      throw error;
    }
  }

  /**
   * MANTIDO: Obtém URL de download por plataforma
   */
  private getDownloadUrl(): string {
    switch (Platform.OS) {
      case 'ios':
        return PHANTOM_CONFIG.DOWNLOAD_URLS.ios;
      case 'android':
        return PHANTOM_CONFIG.DOWNLOAD_URLS.android;
      default:
        return PHANTOM_CONFIG.DOWNLOAD_URLS.web;
    }
  }

  /**
   * MANTIDO: Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * MANTIDO: Gera bytes aleatórios seguros
   */
  private async generateSecureRandomBytes(length: number): Promise<Uint8Array> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(length);
      return new Uint8Array(randomBytes);
    } catch (error) {
      console.log('⚠️ Usando fallback para random bytes');
      const fallbackBytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        fallbackBytes[i] = Math.floor(Math.random() * 256);
      }
      return fallbackBytes;
    }
  }

  /**
   * MANTIDO: Constrói URL de conexão
   */
  private buildConnectUrl(params: {
    app_url: string;
    dapp_encryption_public_key: string;
    redirect_link: string;
    cluster?: string;
  }): string {
    const baseUrl = PHANTOM_CONFIG.CONNECT_URL;

    // 🔥 CORREÇÃO: Usar parâmetros mais simples
    const urlParams = new URLSearchParams({
      app_url: params.app_url,
      dapp_encryption_public_key: params.dapp_encryption_public_key,
      redirect_link: params.redirect_link,
      cluster: params.cluster || 'devnet'
    });

    const finalUrl = `${baseUrl}?${urlParams.toString()}`;

    console.log('🔧 CORREÇÃO: URL de conexão construída:');
    console.log('  📍 Base URL:', baseUrl);
    console.log('  🌐 App URL:', params.app_url);
    console.log('  🔑 Public Key:', params.dapp_encryption_public_key.slice(0, 10) + '...');
    console.log('  📱 Redirect:', params.redirect_link);
    console.log('  🌍 Cluster:', params.cluster || 'devnet');
    console.log('  🔗 URL Final:', finalUrl);

    // 🔥 CORREÇÃO: Testar se URL está válida
    try {
      new URL(finalUrl);
      console.log('✅ CORREÇÃO: URL é válida');
    } catch (error) {
      console.log('❌ CORREÇÃO: URL inválida:', error);
    }

    return finalUrl;
  }

  /**
   * MANTIDO: Salva sessão no armazenamento seguro
   */
  private async saveSession(session: PhantomSession): Promise<void> {
    try {
      const sessionData = {
        publicKey: session.publicKey.toString(),
        session: session.session,
        dappKeyPair: {
          publicKey: bs58.encode(session.dappKeyPair.publicKey),
          secretKey: bs58.encode(session.dappKeyPair.secretKey)
        },
        phantomEncryptionPublicKey: session.phantomEncryptionPublicKey
      };

      await SecureStore.setItemAsync(
        PHANTOM_CONFIG.SESSION_STORAGE_KEY,
        JSON.stringify(sessionData)
      );

      console.log('💾 Sessão salva com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      throw error;
    }
  }

  /**
   * MANTIDO: Carrega sessão salva
   */
  async loadSession(): Promise<PhantomSession | null> {
    try {
      const sessionData = await SecureStore.getItemAsync(PHANTOM_CONFIG.SESSION_STORAGE_KEY);
      if (!sessionData) {
        console.log('ℹ️ Nenhuma sessão salva encontrada');
        return null;
      }

      const parsed = JSON.parse(sessionData);
      const dappKeyPair = {
        publicKey: bs58.decode(parsed.dappKeyPair.publicKey),
        secretKey: bs58.decode(parsed.dappKeyPair.secretKey)
      };

      const phantomPublicKey = bs58.decode(parsed.phantomEncryptionPublicKey);
      const sharedSecret = nacl.box.before(phantomPublicKey, dappKeyPair.secretKey);

      const session: PhantomSession = {
        publicKey: new PublicKey(parsed.publicKey),
        session: parsed.session,
        dappKeyPair,
        sharedSecret,
        phantomEncryptionPublicKey: parsed.phantomEncryptionPublicKey
      };

      this.currentSession = session;
      console.log('📱 Sessão carregada:', session.publicKey.toString().slice(0, 8) + '...');
      return session;

    } catch (error) {
      console.error('❌ Erro ao carregar sessão:', error);
      await SecureStore.deleteItemAsync(PHANTOM_CONFIG.SESSION_STORAGE_KEY);
      return null;
    }
  }

  /**
   * MANTIDO: Desconecta da Phantom
   */
  async disconnect(): Promise<void> {
    try {
      this.clearConnectionData();
      this.clearTransactionData();
      this.currentSession = null;
      await SecureStore.deleteItemAsync(PHANTOM_CONFIG.SESSION_STORAGE_KEY);
      console.log('✅ Desconectado da Phantom');
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      this.currentSession = null;
      this.clearConnectionData();
      this.clearTransactionData();
      throw error;
    }
  }

  /**
   * MANTIDO: Verifica se está conectado
   */
  isConnected(): boolean {
    return this.currentSession !== null;
  }

  /**
   * MANTIDO: Obtém sessão atual
   */
  getCurrentSession(): PhantomSession | null {
    return this.currentSession;
  }

  /**
   * MANTIDO: Obtém chave pública atual
   */
  getPublicKey(): PublicKey | null {
    return this.currentSession?.publicKey || null;
  }

  /**
   * MANTIDO: Método de teste para verificar deep linking
   */
  async testDeepLink(): Promise<void> {
    const testUrl = Linking.createURL('phantom-connect', {
      scheme: APP_CONFIG.DEEP_LINK_SCHEME
    });

    console.log('🧪 URL de teste:', testUrl);
    console.log('🧪 Timestamp:', Date.now());

    try {
      await Linking.openURL(testUrl);
      console.log('✅ Deep link teste enviado');
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  }
}

export default PhantomService;