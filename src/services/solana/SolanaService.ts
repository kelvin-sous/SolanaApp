// ========================================
// src/services/solana/SolanaService.ts
// Serviço para interações com blockchain Solana
// ========================================

import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { SOLANA_NETWORKS, RPC_ENDPOINTS, CURRENT_NETWORK } from '../../constants/networks';

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

class SolanaService {
  private static instance: SolanaService;
  private connection: Connection;
  private currentNetwork: string;

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
}

export default SolanaService;