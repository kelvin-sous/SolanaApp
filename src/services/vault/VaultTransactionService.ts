// src/services/vault/VaultTransactionService.ts

import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';
import PhantomService from '../phantom/PhantomService';
import SolanaService from '../solana/SolanaService';
import firestore from '@react-native-firebase/firestore';

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  needsApproval?: boolean;
}

export class VaultTransactionService {
  private static phantomService = PhantomService.getInstance();
  private static solanaService = SolanaService.getInstance('devnet'); // Mudar para 'mainnet-beta' em produção

  /**
   * Gerar wallet do caixa comunitário baseado no vaultId
   * TEMPORÁRIO: Usar keypair derivado do ID
   * PRODUÇÃO: Usar PDA (Program Derived Address) com smart contract
   */
  static generateVaultWallet(vaultId: string): PublicKey {
    try {
      console.log('Gerando wallet para vault:', vaultId);

      // Criar seed de 32 bytes baseado no vaultId
      const seed = Buffer.from(vaultId.padEnd(32, '0').slice(0, 32));
      const keypair = Keypair.fromSeed(seed);

      console.log('Wallet do caixa gerada:', keypair.publicKey.toString());
      return keypair.publicKey;
    } catch (error) {
      console.error('Erro ao gerar wallet do caixa:', error);
      throw error;
    }
  }

  /**
   * Buscar saldo do caixa na blockchain
   */
  static async getVaultBalance(vaultId: string): Promise<number> {
    try {
      const vaultWallet: Keypair = this.generateVaultWallet(vaultId);
      const balanceData = await this.solanaService.getBalance(vaultWallet);

      console.log(`Saldo do caixa ${vaultId}:`, balanceData.balance, 'SOL');
      return balanceData.balance;
    } catch (error) {
      console.error('Erro ao buscar saldo do caixa:', error);
      return 0;
    }
  }

  /**
   * DEPÓSITO: Transferir SOL do usuário para o caixa
   * Usa PhantomService para assinar e enviar
   */
  static async executeDeposit(
    vaultId: string,
    fromWallet: PublicKey,
    amount: number
  ): Promise<TransactionResult> {
    try {
      console.log('=== INICIANDO DEPÓSITO ===');
      console.log('Vault ID:', vaultId);
      console.log('De:', fromWallet.toString());
      console.log('Valor:', amount, 'SOL');

      // 1. Verificar se Phantom está conectado
      if (!this.phantomService.isConnected()) {
        throw new Error('Phantom não está conectada. Conecte primeiro.');
      }

      // 2. Verificar saldo do usuário
      const userBalance = await this.solanaService.getBalance(fromWallet);
      console.log('Saldo do usuário:', userBalance.balance, 'SOL');

      if (userBalance.balance < amount) {
        return {
          success: false,
          error: 'Saldo insuficiente para realizar o depósito'
        };
      }

      // 3. Gerar wallet do caixa
      const vaultWallet = this.generateVaultWallet(vaultId);
      console.log('Wallet do caixa:', vaultWallet.toString());

      // 4. Criar transação
      const transaction = await this.createDepositTransaction(
        fromWallet,
        vaultWallet,
        amount
      );

      // 5. Enviar para Phantom assinar e executar
      console.log('Enviando para Phantom...');
      const signature = await this.phantomService.executeTransaction(transaction);

      console.log('Depósito realizado com sucesso!');
      console.log('Signature:', signature);
      console.log('================================');

      // 6. Atualizar saldo no Firebase
      await this.updateVaultBalanceInFirebase(vaultId);

      // 7. Registrar transação no Firebase
      await this.recordTransaction(vaultId, {
        type: 'deposit',
        from: fromWallet.toString(),
        to: vaultWallet.toString(),
        amount,
        signature,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        signature
      };

    } catch (error: any) {
      console.error('Erro ao executar depósito:', error);
      return {
        success: false,
        error: error.message || 'Erro ao processar depósito'
      };
    }
  }

  /**
   * Criar transação de depósito
   */
  private static async createDepositTransaction(
    fromWallet: PublicKey,
    vaultWallet: PublicKey,
    amount: number
  ): Promise<Transaction> {
    try {
      console.log('Criando transação...');

      const connection = this.solanaService.getConnection();
      const transaction = new Transaction();

      // Adicionar instrução de transferência
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromWallet,
          toPubkey: vaultWallet,
          lamports: Math.floor(amount * LAMPORTS_PER_SOL),
        })
      );

      // Obter blockhash recente
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromWallet;

      console.log('Transação criada');
      return transaction;

    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }
  }

  /**
   * SAQUE: Criar proposta (para votação) ou executar automático
   */
  static async createWithdrawProposal(
    vaultId: string,
    requesterWallet: PublicKey,
    amount: number
  ): Promise<TransactionResult> {
    try {
      console.log('=== CRIANDO PROPOSTA DE SAQUE ===');
      console.log('Vault ID:', vaultId);
      console.log('Solicitante:', requesterWallet.toString());
      console.log('Valor:', amount, 'SOL');

      // Verificar saldo do caixa
      const vaultBalance = await this.getVaultBalance(vaultId);
      console.log('Saldo do caixa:', vaultBalance, 'SOL');

      if (vaultBalance < amount) {
        return {
          success: false,
          error: 'Saldo insuficiente no caixa comunitário'
        };
      }

      console.log('Proposta criada (aguardando votação)');
      console.log('====================================');

      return {
        success: true,
        needsApproval: true
      };

    } catch (error: any) {
      console.error('Erro ao criar proposta de saque:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar proposta de saque'
      };
    }
  }

  /**
 * Executar saque aprovado por votação
 */
  static async executeApprovedWithdraw(
    vaultId: string,
    recipientPublicKey: PublicKey,
    amount: number
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      console.log('   Executando saque aprovado...');
      console.log('   Destinatário:', recipientPublicKey.toString());
      console.log('   Valor:', amount, 'SOL');

      // Gerar wallet do caixa
      const vaultWallet = this.generateVaultWallet(vaultId);
      console.log('   Caixa:', vaultWallet.publicKey.toString());

      // Verificar saldo do caixa
      const vaultBalance = await this.getVaultBalance(vaultId);
      console.log('   Saldo do caixa:', vaultBalance, 'SOL');

      if (amount > vaultBalance) {
        return {
          success: false,
          error: 'Saldo insuficiente no caixa'
        };
      }

      // Criar transação de transferência
      const solanaService = SolanaService.getInstance();
      const connection = solanaService.getConnection();

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: vaultWallet.publicKey,
          toPubkey: recipientPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Buscar blockhash recente
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = vaultWallet.publicKey;

      // Assinar transação com a chave do caixa
      transaction.sign(vaultWallet);

      // Enviar transação
      console.log('Enviando transação...');
      const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      console.log('⏳ Aguardando confirmação...');
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Saque realizado com sucesso!');
      console.log('   Signature:', signature);

      // Atualizar saldo no Firebase
      const newBalance = await this.getVaultBalance(vaultId);
      await this.updateVaultBalance(vaultId, newBalance);

      return {
        success: true,
        signature: signature
      };

    } catch (error) {
      console.error('Erro ao executar saque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * SAQUE AUTOMÁTICO (sem votação)
   * REQUER SMART CONTRACT EM PRODUÇÃO
   */
  static async executeAutoWithdraw(
    vaultId: string,
    toWallet: PublicKey,
    amount: number
  ): Promise<TransactionResult> {
    console.log('SAQUE AUTOMÁTICO REQUER SMART CONTRACT');
    console.log('Esta funcionalidade estará disponível em breve');

    return {
      success: false,
      error: 'Saques automáticos requerem smart contract multisig (em desenvolvimento)'
    };
  }

  /**
   * Atualizar saldo do caixa no Firebase após transação
   */
  private static async updateVaultBalanceInFirebase(vaultId: string): Promise<void> {
    try {
      const newBalance = await this.getVaultBalance(vaultId);

      await firestore()
        .collection('vaults')
        .doc(vaultId)
        .update({
          balance: newBalance,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });

      console.log('Saldo atualizado no Firebase:', newBalance, 'SOL');
    } catch (error) {
      console.error('Erro ao atualizar saldo no Firebase:', error);
    }
  }

  /**
   * Registrar transação no Firebase
   */
  private static async recordTransaction(vaultId: string, transaction: any): Promise<void> {
    try {
      const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await firestore()
        .collection('transactions')
        .doc(txId)
        .set({
          id: txId,
          vaultId,
          ...transaction,
          status: 'completed',
          createdAt: firestore.FieldValue.serverTimestamp()
        });

      console.log('Transação registrada no Firebase:', txId);
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
    }
  }

  /**
   * Verificar status de uma transação na blockchain
   */
  static async checkTransactionStatus(signature: string): Promise<boolean> {
    try {
      const connection = this.solanaService.getConnection();
      const status = await connection.getSignatureStatus(signature);

      return status.value?.confirmationStatus === 'confirmed' ||
        status.value?.confirmationStatus === 'finalized';
    } catch (error) {
      console.error('Erro ao verificar status da transação:', error);
      return false;
    }
  }

  /**
   * Buscar histórico de transações do caixa
   */
  static async getVaultTransactionHistory(vaultId: string): Promise<any[]> {
    try {
      const snapshot = await firestore()
        .collection('transactions')
        .where('vaultId', '==', vaultId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Encontradas ${transactions.length} transações`);
      return transactions;

    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }
}