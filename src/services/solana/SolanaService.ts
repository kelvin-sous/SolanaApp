// ========================================
// src/services/solana/SolanaService.ts
// Serviço para interações com blockchain Solana + Phantom Transactions - CORRIGIDO
// ========================================

import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  clusterApiUrl, 
  Transaction,
  SystemProgram
} from '@solana/web3.js';
import * as Linking from 'expo-linking';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { CURRENT_NETWORK } from '../../constants/networks';
import { PhantomSession } from '../../types/phantom';
import { SOLANA_CONFIG, PRICE_CONFIG, APP_CONFIG } from '../../constants/config';

export interface SolanaBalance {
  balance: number;        // Saldo em SOL
  balanceLamports: number; // Saldo em lamports (unidade mínima)
  network: string;
}

export interface SolanaAccountInfo {
  publicKey: string;
  balance: SolanaBalance;
  exists: boolean;
}

export interface TransactionRequest {
  fromPublicKey: string;
  toPublicKey: string;
  amountSOL: number;
  amountUSD: number;
}

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  transactionData?: TransactionRequest;
}

export interface PriceData {
  solToUsd: number;
  usdToSol: number;
  lastUpdated: number;
}

// Interface para listeners de URL
interface UrlListener {
  remove: () => void;
}

class SolanaService {
  private static instance: SolanaService;
  private connection: Connection;
  private currentNetwork: string;
  private currentPriceData: PriceData | null = null;
  private urlListener: UrlListener | null = null;

  constructor() {
    this.currentNetwork = CURRENT_NETWORK;
    this.connection = new Connection(
      clusterApiUrl(this.currentNetwork as any),
      'confirmed'
    );
    
    console.log('🌐 SolanaService inicializado:', {
      network: this.currentNetwork,
      endpoint: clusterApiUrl(this.currentNetwork as any)
    });
  }

  public static getInstance(): SolanaService {
    if (!SolanaService.instance) {
      SolanaService.instance = new SolanaService();
    }
    return SolanaService.instance;
  }

  /**
   * Consulta saldo de uma wallet
   */
  async getBalance(publicKey: PublicKey | string): Promise<SolanaBalance> {
    try {
      console.log('💰 Consultando saldo...');
      
      // Converter string para PublicKey se necessário
      const pubKey = typeof publicKey === 'string' 
        ? new PublicKey(publicKey) 
        : publicKey;

      console.log('🔍 Wallet:', pubKey.toString().slice(0, 8) + '...');
      
      // Consultar saldo na blockchain
      const balanceLamports = await this.connection.getBalance(pubKey);
      const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
      
      console.log('✅ Saldo obtido:', {
        lamports: balanceLamports,
        sol: balanceSOL,
        network: this.currentNetwork
      });

      return {
        balance: balanceSOL,
        balanceLamports,
        network: this.currentNetwork
      };
      
    } catch (error) {
      console.error('❌ Erro ao consultar saldo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao consultar saldo: ${errorMessage}`);
    }
  }

  /**
   * Obtém preço atual do SOL em USD (mockado para devnet)
   */
  async getSOLPrice(): Promise<PriceData> {
    try {
      // Para devnet, usar preço mockado das configurações
      if (this.currentNetwork === 'devnet') {
        const mockPrice = {
          solToUsd: PRICE_CONFIG.MOCK_PRICES.SOL_TO_USD,
          usdToSol: 1 / PRICE_CONFIG.MOCK_PRICES.SOL_TO_USD,
          lastUpdated: Date.now()
        };
        
        this.currentPriceData = mockPrice;
        console.log('💰 Preço SOL (devnet mock):', mockPrice.solToUsd, 'USD');
        return mockPrice;
      }

      // Para mainnet, implementar chamada para API real no futuro
      const fallbackPrice = {
        solToUsd: PRICE_CONFIG.MOCK_PRICES.SOL_TO_USD,
        usdToSol: 1 / PRICE_CONFIG.MOCK_PRICES.SOL_TO_USD,
        lastUpdated: Date.now()
      };

      this.currentPriceData = fallbackPrice;
      return fallbackPrice;
      
    } catch (error) {
      console.error('❌ Erro ao obter preço SOL:', error);
      
      // Usar preço em cache ou fallback
      if (this.currentPriceData) {
        return this.currentPriceData;
      }
      
      return {
        solToUsd: PRICE_CONFIG.MOCK_PRICES.SOL_TO_USD,
        usdToSol: 1 / PRICE_CONFIG.MOCK_PRICES.SOL_TO_USD,
        lastUpdated: Date.now()
      };
    }
  }

  /**
   * Converte USD para SOL
   */
  async convertUSDToSOL(usdAmount: number): Promise<number> {
    const priceData = await this.getSOLPrice();
    return usdAmount * priceData.usdToSol;
  }

  /**
   * Converte SOL para USD
   */
  async convertSOLToUSD(solAmount: number): Promise<number> {
    const priceData = await this.getSOLPrice();
    return solAmount * priceData.solToUsd;
  }

  /**
   * Cria uma transação de transferência
   */
  async createTransferTransaction(
    fromPublicKey: PublicKey,
    toPublicKey: PublicKey,
    amountSOL: number
  ): Promise<Transaction> {
    try {
      console.log('🔄 Criando transação de transferência...');
      console.log('  📤 De:', fromPublicKey.toString().slice(0, 8) + '...');
      console.log('  📥 Para:', toPublicKey.toString().slice(0, 8) + '...');
      console.log('  💰 Valor:', amountSOL, 'SOL');

      // Converter SOL para lamports
      const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);
      
      if (lamports <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      // Verificar saldo suficiente
      const senderBalance = await this.getBalance(fromPublicKey);
      if (senderBalance.balanceLamports < lamports) {
        throw new Error(`Saldo insuficiente. Disponível: ${senderBalance.balance} SOL`);
      }

      // Obter blockhash recente
      const { blockhash } = await this.connection.getLatestBlockhash();

      // Criar transação
      const transaction = new Transaction({
        feePayer: fromPublicKey,
        recentBlockhash: blockhash
      });

      // Adicionar instrução de transferência
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports
      });

      transaction.add(transferInstruction);

      console.log('✅ Transação criada:', {
        lamports,
        blockhash: blockhash.slice(0, 8) + '...',
        instructionsCount: transaction.instructions.length
      });

      return transaction;
      
    } catch (error) {
      console.error('❌ Erro ao criar transação:', error);
      throw error;
    }
  }

  /**
   * Assina e envia transação via Phantom (SignAndSendTransaction)
   */
  async signAndSendTransactionViaPhantom(
    transaction: Transaction,
    session: PhantomSession
  ): Promise<string> {
    try {
      console.log('👻 Enviando transação para Phantom...');

      // Serializar transação
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });

      const transactionBase58 = bs58.encode(serializedTransaction);
      console.log('📦 Transação serializada (tamanho):', transactionBase58.length, 'chars');

      // Preparar payload para Phantom
      const payload = {
        transaction: transactionBase58,
        session: session.session
      };

      // Criptografar payload
      const encryptedPayload = this.encryptPayload(payload, session);

      // Gerar URLs
      const redirectLink = Linking.createURL('phantom-transaction', {
        scheme: APP_CONFIG.DEEP_LINK_SCHEME
      });

      const phantomUrl = this.buildPhantomTransactionUrl({
        method: 'signAndSendTransaction',
        dapp_encryption_public_key: bs58.encode(session.dappKeyPair.publicKey),
        nonce: encryptedPayload.nonce,
        redirect_link: redirectLink,
        payload: encryptedPayload.data
      });

      console.log('🔗 Abrindo Phantom para assinatura...');
      console.log('📱 Redirect:', redirectLink);

      // Abrir Phantom
      await Linking.openURL(phantomUrl);

      // Aguardar retorno da Phantom
      return await this.waitForPhantomTransactionResult();
      
    } catch (error) {
      console.error('❌ Erro ao enviar transação via Phantom:', error);
      throw error;
    }
  }

  /**
   * Apenas assina transação via Phantom (SignTransaction)
   */
  async signTransactionViaPhantom(
    transaction: Transaction,
    session: PhantomSession
  ): Promise<Transaction> {
    try {
      console.log('👻 Enviando transação para assinatura...');

      // Serializar transação
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });

      const transactionBase58 = bs58.encode(serializedTransaction);

      // Preparar payload para Phantom
      const payload = {
        transaction: transactionBase58,
        session: session.session
      };

      // Criptografar payload
      const encryptedPayload = this.encryptPayload(payload, session);

      // Gerar URLs
      const redirectLink = Linking.createURL('phantom-sign', {
        scheme: APP_CONFIG.DEEP_LINK_SCHEME
      });

      const phantomUrl = this.buildPhantomTransactionUrl({
        method: 'signTransaction',
        dapp_encryption_public_key: bs58.encode(session.dappKeyPair.publicKey),
        nonce: encryptedPayload.nonce,
        redirect_link: redirectLink,
        payload: encryptedPayload.data
      });

      console.log('🔗 Abrindo Phantom para assinatura...');
      await Linking.openURL(phantomUrl);

      // Aguardar retorno da transação assinada
      const signedTransactionBase58 = await this.waitForPhantomSignResult();
      
      // Deserializar transação assinada
      const signedTransactionBytes = bs58.decode(signedTransactionBase58);
      const signedTransaction = Transaction.from(signedTransactionBytes);

      console.log('✅ Transação assinada recebida');
      return signedTransaction;
      
    } catch (error) {
      console.error('❌ Erro ao assinar transação via Phantom:', error);
      throw error;
    }
  }

  /**
   * Criptografa payload para Phantom
   */
  private encryptPayload(payload: any, session: PhantomSession): { nonce: string; data: string } {
    try {
      const payloadString = JSON.stringify(payload);
      const messageBytes = new TextEncoder().encode(payloadString);
      const nonce = nacl.randomBytes(24);

      const encryptedData = nacl.box.after(messageBytes, nonce, session.sharedSecret);
      
      if (!encryptedData) {
        throw new Error('Falha ao criptografar payload');
      }

      return {
        nonce: bs58.encode(nonce),
        data: bs58.encode(encryptedData)
      };
    } catch (error) {
      console.error('❌ Erro ao criptografar payload:', error);
      throw new Error('Falha na criptografia do payload');
    }
  }

  /**
   * Constrói URL para transação Phantom
   */
  private buildPhantomTransactionUrl(params: {
    method: 'signAndSendTransaction' | 'signTransaction';
    dapp_encryption_public_key: string;
    nonce: string;
    redirect_link: string;
    payload: string;
  }): string {
    const baseUrl = `https://phantom.app/ul/v1/${params.method}`;
    
    const urlParams = new URLSearchParams({
      dapp_encryption_public_key: params.dapp_encryption_public_key,
      nonce: params.nonce,
      redirect_link: params.redirect_link,
      payload: params.payload
    });

    return `${baseUrl}?${urlParams.toString()}`;
  }

  /**
   * Aguarda resultado da transação da Phantom
   */
  private async waitForPhantomTransactionResult(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeUrlListener();
        reject(new Error('Timeout: transação não completada'));
      }, 120000); // 2 minutos

      const handleUrl = (event: { url: string }) => {
        try {
          const parsedUrl = Linking.parse(event.url);
          
          if (parsedUrl.path?.includes('phantom-transaction')) {
            clearTimeout(timeout);
            this.removeUrlListener();

            const queryParams = parsedUrl.queryParams || {};
            
            if (queryParams.errorCode) {
              reject(new Error(`Phantom Error: ${queryParams.errorMessage || 'Erro desconhecido'}`));
              return;
            }

            if (queryParams.signature) {
              console.log('✅ Transação confirmada:', queryParams.signature);
              resolve(queryParams.signature as string);
            } else {
              reject(new Error('Signature não encontrada na resposta'));
            }
          }
        } catch (error) {
          clearTimeout(timeout);
          this.removeUrlListener();
          reject(error);
        }
      };

      this.urlListener = Linking.addEventListener('url', handleUrl);
    });
  }

  /**
   * Aguarda resultado da assinatura da Phantom
   */
  private async waitForPhantomSignResult(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeUrlListener();
        reject(new Error('Timeout: assinatura não completada'));
      }, 120000);

      const handleUrl = (event: { url: string }) => {
        try {
          const parsedUrl = Linking.parse(event.url);
          
          if (parsedUrl.path?.includes('phantom-sign')) {
            clearTimeout(timeout);
            this.removeUrlListener();

            const queryParams = parsedUrl.queryParams || {};
            
            if (queryParams.errorCode) {
              reject(new Error(`Phantom Error: ${queryParams.errorMessage || 'Erro desconhecido'}`));
              return;
            }

            if (queryParams.transaction) {
              console.log('✅ Transação assinada recebida');
              resolve(queryParams.transaction as string);
            } else {
              reject(new Error('Transação assinada não encontrada na resposta'));
            }
          }
        } catch (error) {
          clearTimeout(timeout);
          this.removeUrlListener();
          reject(error);
        }
      };

      this.urlListener = Linking.addEventListener('url', handleUrl);
    });
  }

  /**
   * Remove listener de URL
   */
  private removeUrlListener(): void {
    if (this.urlListener) {
      this.urlListener.remove();
      this.urlListener = null;
    }
  }

  /**
   * Executa transferência completa via NFC
   */
  async executeNFCTransfer(
    transactionRequest: TransactionRequest,
    session: PhantomSession
  ): Promise<TransactionResult> {
    try {
      console.log('🚀 Iniciando transferência NFC...');
      console.log('📊 Dados da transação:', transactionRequest);

      // Validar endereços
      const fromPubKey = new PublicKey(transactionRequest.fromPublicKey);
      const toPubKey = new PublicKey(transactionRequest.toPublicKey);

      // Verificar se não é auto-transferência
      if (fromPubKey.equals(toPubKey)) {
        throw new Error('Não é possível transferir para a mesma wallet');
      }

      // Verificar se o destinatário não é o System Program
      if (toPubKey.equals(SystemProgram.programId)) {
        throw new Error('Endereço de destino inválido');
      }

      // Criar transação
      const transaction = await this.createTransferTransaction(
        fromPubKey,
        toPubKey,
        transactionRequest.amountSOL
      );

      // Assinar e enviar via Phantom
      const signature = await this.signAndSendTransactionViaPhantom(transaction, session);

      console.log('✅ Transferência NFC concluída com sucesso!');
      console.log('🔗 Signature:', signature);

      return {
        success: true,
        signature,
        transactionData: transactionRequest
      };
      
    } catch (error) {
      console.error('❌ Erro na transferência NFC:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      return {
        success: false,
        error: errorMessage,
        transactionData: transactionRequest
      };
    }
  }

  /**
   * Verifica status de uma transação
   */
  async checkTransactionStatus(signature: string): Promise<{
    confirmed: boolean;
    finalized: boolean;
    error?: string;
  }> {
    try {
      const confirmation = await this.connection.getSignatureStatus(signature);
      
      return {
        confirmed: !!confirmation.value,
        finalized: confirmation.value?.confirmationStatus === 'finalized',
        error: confirmation.value?.err ? String(confirmation.value.err) : undefined
      };
    } catch (error) {
      console.error('❌ Erro ao verificar status da transação:', error);
      return {
        confirmed: false,
        finalized: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém informações completas da conta
   */
  async getAccountInfo(publicKey: PublicKey | string): Promise<SolanaAccountInfo> {
    try {
      const pubKey = typeof publicKey === 'string' 
        ? new PublicKey(publicKey) 
        : publicKey;

      // Consultar informações da conta
      const accountInfo = await this.connection.getAccountInfo(pubKey);
      const balance = await this.getBalance(pubKey);

      return {
        publicKey: pubKey.toString(),
        balance,
        exists: accountInfo !== null
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter informações da conta:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma conta existe na blockchain
   */
  async accountExists(publicKey: PublicKey | string): Promise<boolean> {
    try {
      const pubKey = typeof publicKey === 'string' 
        ? new PublicKey(publicKey) 
        : publicKey;

      const accountInfo = await this.connection.getAccountInfo(pubKey);
      return accountInfo !== null;
      
    } catch (error) {
      console.error('❌ Erro ao verificar conta:', error);
      return false;
    }
  }

  /**
   * Obtém informações da rede atual
   */
  async getNetworkInfo() {
    try {
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      
      return {
        network: this.currentNetwork,
        endpoint: clusterApiUrl(this.currentNetwork as any),
        version: version['solana-core'],
        currentSlot: slot
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter informações da rede:', error);
      throw error;
    }
  }

  /**
   * Converte lamports para SOL
   */
  static lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }

  /**
   * Converte SOL para lamports
   */
  static solToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  }

  /**
   * Formata saldo para exibição
   */
  static formatBalance(balance: number, decimals: number = 4): string {
    return balance.toFixed(decimals);
  }

  /**
   * Valida se um endereço é válido
   */
  static isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Troca de rede (para futuras funcionalidades)
   */
  switchNetwork(network: string) {
    this.currentNetwork = network;
    this.connection = new Connection(
      clusterApiUrl(network as any),
      'confirmed'
    );
    
    console.log('🔄 Rede alterada para:', network);
  }

  /**
   * Obtém conexão atual (para uso em outros serviços)
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Obtém rede atual
   */
  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  /**
   * Cleanup para remover listeners
   */
  cleanup(): void {
    this.removeUrlListener();
  }
}

export default SolanaService;