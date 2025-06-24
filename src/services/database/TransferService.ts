// ========================================
// src/services/database/TransferService.ts
// Serviço para gerenciar transferências no Supabase
// ========================================

import { supabase } from '../../config/supabase';

export interface Transfer {
  id?: string;
  transaction_signature: string;
  from_address: string;
  to_address: string;
  amount_sol: number;
  amount_usd?: number;
  fee_sol?: number;
  status: 'pending' | 'confirmed' | 'failed';
  transfer_type: 'send' | 'receive' | 'nfc';
  memo?: string;
  network: 'mainnet' | 'devnet' | 'testnet';
  created_at?: string;
  confirmed_at?: string;
  updated_at?: string;
}

export interface TransferFilter {
  address?: string; // Buscar por from_address OU to_address
  type?: 'send' | 'receive' | 'nfc';
  status?: 'pending' | 'confirmed' | 'failed';
  limit?: number;
  offset?: number;
}

export class TransferService {
  private static instance: TransferService;

  private constructor() {}

  public static getInstance(): TransferService {
    if (!TransferService.instance) {
      TransferService.instance = new TransferService();
    }
    return TransferService.instance;
  }

  // ✨ SALVAR NOVA TRANSFERÊNCIA
  public async saveTransfer(transfer: Omit<Transfer, 'id' | 'created_at' | 'updated_at'>): Promise<Transfer> {
    try {
      console.log('💾 [DB] Salvando transferência:', {
        signature: transfer.transaction_signature.slice(0, 8) + '...',
        from: transfer.from_address.slice(0, 8) + '...',
        to: transfer.to_address.slice(0, 8) + '...',
        amount: transfer.amount_sol,
        type: transfer.transfer_type
      });

      const { data, error } = await supabase
        .from('transfers')
        .insert(transfer)
        .select()
        .single();

      if (error) {
        console.error('❌ [DB] Erro ao salvar transferência:', error);
        throw new Error(`Erro no banco: ${error.message}`);
      }

      console.log('✅ [DB] Transferência salva com ID:', data.id);
      return data;

    } catch (error) {
      console.error('❌ [DB] Falha ao salvar transferência:', error);
      throw error;
    }
  }

  // ✨ BUSCAR TRANSFERÊNCIAS POR ENDEREÇO
  public async getTransfersByAddress(
    address: string, 
    filters: Omit<TransferFilter, 'address'> = {}
  ): Promise<Transfer[]> {
    try {
      console.log('🔍 [DB] Buscando transferências para:', address.slice(0, 8) + '...');

      let query = supabase
        .from('transfers')
        .select('*')
        .or(`from_address.eq.${address},to_address.eq.${address}`)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.type) {
        query = query.eq('transfer_type', filters.type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [DB] Erro ao buscar transferências:', error);
        throw new Error(`Erro no banco: ${error.message}`);
      }

      console.log(`✅ [DB] Encontradas ${data?.length || 0} transferências`);
      return data || [];

    } catch (error) {
      console.error('❌ [DB] Falha ao buscar transferências:', error);
      throw error;
    }
  }

  // ✨ ATUALIZAR STATUS DA TRANSFERÊNCIA
  public async updateTransferStatus(
    transactionSignature: string, 
    status: 'confirmed' | 'failed',
    confirmedAt?: Date
  ): Promise<Transfer> {
    try {
      console.log('🔄 [DB] Atualizando status:', {
        signature: transactionSignature.slice(0, 8) + '...',
        status,
        confirmedAt: confirmedAt?.toISOString()
      });

      const updateData: Partial<Transfer> = {
        status,
        ...(confirmedAt && { confirmed_at: confirmedAt.toISOString() })
      };

      const { data, error } = await supabase
        .from('transfers')
        .update(updateData)
        .eq('transaction_signature', transactionSignature)
        .select()
        .single();

      if (error) {
        console.error('❌ [DB] Erro ao atualizar status:', error);
        throw new Error(`Erro no banco: ${error.message}`);
      }

      console.log('✅ [DB] Status atualizado para:', status);
      return data;

    } catch (error) {
      console.error('❌ [DB] Falha ao atualizar status:', error);
      throw error;
    }
  }

  // ✨ BUSCAR TRANSFERÊNCIA POR SIGNATURE
  public async getTransferBySignature(signature: string): Promise<Transfer | null> {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('transaction_signature', signature)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrado
          return null;
        }
        console.error('❌ [DB] Erro ao buscar por signature:', error);
        throw new Error(`Erro no banco: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('❌ [DB] Falha ao buscar por signature:', error);
      throw error;
    }
  }

  // ✨ OBTER ESTATÍSTICAS DE TRANSFERÊNCIAS
  public async getTransferStats(address: string): Promise<{
    totalSent: number;
    totalReceived: number;
    totalTransactions: number;
    pendingCount: number;
  }> {
    try {
      console.log('📊 [DB] Calculando estatísticas para:', address.slice(0, 8) + '...');

      // Buscar todas as transferências do endereço
      const { data: allTransfers, error } = await supabase
        .from('transfers')
        .select('transfer_type, amount_sol, status')
        .or(`from_address.eq.${address},to_address.eq.${address}`);

      if (error) {
        throw new Error(`Erro no banco: ${error.message}`);
      }

      const stats = {
        totalSent: 0,
        totalReceived: 0,
        totalTransactions: allTransfers?.length || 0,
        pendingCount: 0
      };

      allTransfers?.forEach(transfer => {
        if (transfer.status === 'pending') {
          stats.pendingCount++;
        }

        if (transfer.status === 'confirmed') {
          if (transfer.transfer_type === 'send') {
            stats.totalSent += Number(transfer.amount_sol);
          } else if (transfer.transfer_type === 'receive') {
            stats.totalReceived += Number(transfer.amount_sol);
          }
        }
      });

      console.log('✅ [DB] Estatísticas calculadas:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [DB] Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  // ✨ DELETAR TRANSFERÊNCIA (APENAS PENDENTES)
  public async deleteTransfer(id: string): Promise<boolean> {
    try {
      console.log('🗑️ [DB] Deletando transferência:', id);

      const { error } = await supabase
        .from('transfers')
        .delete()
        .eq('id', id)
        .eq('status', 'pending'); // Só permite deletar pendentes

      if (error) {
        console.error('❌ [DB] Erro ao deletar:', error);
        throw new Error(`Erro no banco: ${error.message}`);
      }

      console.log('✅ [DB] Transferência deletada');
      return true;

    } catch (error) {
      console.error('❌ [DB] Falha ao deletar:', error);
      throw error;
    }
  }

  // ✨ BUSCAR TRANSFERÊNCIAS RECENTES (TODAS AS REDES)
  public async getRecentTransfers(limit: number = 50): Promise<Transfer[]> {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Erro no banco: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('❌ [DB] Erro ao buscar transferências recentes:', error);
      throw error;
    }
  }

  // ✨ VERIFICAR CONEXÃO COM BANCO
  public async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('count(*)')
        .limit(1);

      if (error) {
        console.error('❌ [DB] Erro de conexão:', error);
        return false;
      }

      console.log('✅ [DB] Conexão com Supabase OK');
      return true;

    } catch (error) {
      console.error('❌ [DB] Falha na conexão:', error);
      return false;
    }
  }
}

export default TransferService;