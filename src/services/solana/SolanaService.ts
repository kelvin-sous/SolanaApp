// ========================================
// src/services/solana/SolanaService.ts
// Serviço Solana completo com todos os métodos necessários
// ========================================

import { 
  Connection, 
  PublicKey, 
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Commitment
} from '@solana/web3.js';
import { SolanaBalance, SolanaNetwork } from '../../types/wallet';

// ✨ INTERFACES PARA TRANSAÇÕES NFC
export interface SolanaTransactionRequest {
  fromPublicKey: string;
  toPublicKey: string;
  amount: number;
  amountSOL?: number; // ✅ Adicionado para NFCService
  memo?: string;
  timestamp: number;
}

export interface SolanaTransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  timestamp: number;
}

// ✨ INTERFACE PARA DADOS DE PREÇO
interface SOLPriceData {
  usd: number;
  solToUsd: number; // ✅ Adicionado para compatibilidade
  lastUpdated: number;
}

export default class SolanaService {
  private static instance: SolanaService;
  private connection: Connection;
  private network: SolanaNetwork;
  private solPriceCache: SOLPriceData | null = null;

  private constructor(network: SolanaNetwork = 'devnet') {
    this.network = network;
    this.connection = new Connection(
      clusterApiUrl(network),
      'confirmed' as Commitment
    );
  }

  public static getInstance(network: SolanaNetwork = 'devnet'): SolanaService {
    if (!SolanaService.instance) {
      SolanaService.instance = new SolanaService(network);
    }
    return SolanaService.instance;
  }

  // ✨ MÉTODO PRINCIPAL PARA BUSCAR SALDO
  public async getBalance(publicKey: PublicKey): Promise<SolanaBalance> {
    try {
      console.log('🔄 SolanaService: Buscando saldo para:', publicKey.toString().slice(0, 8) + '...');
      
      const lamports = await this.connection.getBalance(publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      
      console.log('💰 SolanaService: Saldo encontrado -', solBalance, 'SOL (', lamports, 'lamports)');
      
      const balanceData: SolanaBalance = {
        balance: solBalance,
        lamports: lamports,
        decimals: 9,
        uiAmount: solBalance,
        uiAmountString: solBalance.toFixed(9)
      };
      
      return balanceData;
      
    } catch (error) {
      console.error('❌ SolanaService: Erro ao buscar saldo:', error);
      throw new Error(`Erro ao buscar saldo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // ✨ VALIDAR ENDEREÇO SOLANA
  public static isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  // ✨ FORMATAÇÃO DE SALDO
  public static formatBalance(balance: number, decimals: number = 4): string {
    return balance.toFixed(decimals);
  }

  // ✨ OBTER PREÇO DO SOL EM USD
  public async getSOLPrice(): Promise<SOLPriceData> {
    try {
      // Cache do preço por 5 minutos
      if (this.solPriceCache && Date.now() - this.solPriceCache.lastUpdated < 300000) {
        return this.solPriceCache;
      }

      console.log('🔄 Buscando preço atual do SOL...');
      
      // API gratuita para obter preço do SOL
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar preço do SOL');
      }
      
      const data = await response.json();
      const price = data.solana?.usd || 0;
      
      this.solPriceCache = {
        usd: price,
        solToUsd: price, // ✅ Mesmo valor para compatibilidade
        lastUpdated: Date.now()
      };
      
      console.log('💰 Preço atual do SOL:', price, 'USD');
      return this.solPriceCache;
      
    } catch (error) {
      console.error('❌ Erro ao buscar preço do SOL:', error);
      
      // Retornar preço padrão em caso de erro
      const fallbackPrice = { 
        usd: 100, 
        solToUsd: 100, // ✅ Adicionado
        lastUpdated: Date.now() 
      };
      return fallbackPrice;
    }
  }

  // ✨ CONVERTER USD PARA SOL
  public async convertUSDToSOL(usdAmount: number): Promise<number> {
    try {
      const priceData = await this.getSOLPrice();
      const solAmount = usdAmount / priceData.usd;
      
      console.log(`💱 Conversão: $${usdAmount} USD = ${solAmount.toFixed(6)} SOL`);
      return solAmount;
      
    } catch (error) {
      console.error('❌ Erro na conversão USD para SOL:', error);
      throw new Error('Não foi possível converter USD para SOL');
    }
  }

  // ✨ CONVERTER SOL PARA USD
  public async convertSOLToUSD(solAmount: number): Promise<number> {
    try {
      const priceData = await this.getSOLPrice();
      const usdAmount = solAmount * priceData.usd;
      
      console.log(`💱 Conversão: ${solAmount} SOL = $${usdAmount.toFixed(2)} USD`);
      return usdAmount;
      
    } catch (error) {
      console.error('❌ Erro na conversão SOL para USD:', error);
      throw new Error('Não foi possível converter SOL para USD');
    }
  }

  // ✨ EXECUTAR TRANSFERÊNCIA NFC
  public async executeNFCTransfer(
    transactionRequest: SolanaTransactionRequest, 
    session: any
  ): Promise<SolanaTransactionResult> {
    try {
      console.log('🔄 Executando transferência NFC...', transactionRequest);
      
      const fromPubKey = new PublicKey(transactionRequest.fromPublicKey);
      const toPubKey = new PublicKey(transactionRequest.toPublicKey);
      const lamports = Math.floor(transactionRequest.amount * LAMPORTS_PER_SOL);
      
      // Criar transação
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubKey,
          toPubkey: toPubKey,
          lamports: lamports,
        })
      );

      // Obter blockhash recente
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubKey;

      // Assinar e enviar transação usando Phantom
      const signedTransaction = await session.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirmar transação
      await this.connection.confirmTransaction(signature);
      
      console.log('✅ Transferência NFC realizada com sucesso:', signature);
      
      return {
        success: true,
        signature: signature,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('❌ Erro na transferência NFC:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: Date.now()
      };
    }
  }

  // ✨ VERIFICAR SE CONTA EXISTE
  public async accountExists(publicKey: PublicKey): Promise<boolean> {
    try {
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      return accountInfo !== null;
    } catch (error) {
      console.error('❌ Erro ao verificar conta:', error);
      return false;
    }
  }

  // ✨ BUSCAR HISTÓRICO DE TRANSAÇÕES
  public async getTransactionHistory(publicKey: PublicKey, limit: number = 10) {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );
      
      console.log(`📜 Encontradas ${signatures.length} transações`);
      return signatures;
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      throw error;
    }
  }

  // ✨ GETTERS E SETTERS
  public getConnection(): Connection {
    return this.connection;
  }

  public getNetwork(): SolanaNetwork {
    return this.network;
  }

  public switchNetwork(network: SolanaNetwork): void {
    this.network = network;
    this.connection = new Connection(
      clusterApiUrl(network),
      'confirmed' as Commitment
    );
    console.log('🔄 Rede alterada para:', network);
  }

  // ✨ UTILITÁRIOS
  public lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }

  public solToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  }

  public formatSol(balance: number, decimals: number = 4): string {
    return balance.toFixed(decimals);
  }

  // ✨ OBTER SLOT ATUAL
  public async getCurrentSlot(): Promise<number> {
    try {
      const slot = await this.connection.getSlot();
      return slot;
    } catch (error) {
      console.error('❌ Erro ao buscar slot atual:', error);
      throw error;
    }
  }
}

export type { SolanaBalance };