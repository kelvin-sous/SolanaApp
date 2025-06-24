// ========================================
// src/config/supabase.ts
// Configuração do cliente Supabase
// ========================================

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// ✨ CONFIGURAÇÃO DAS VARIÁVEIS DE AMBIENTE
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://seu-projeto.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'sua-anon-key-aqui';

// ✨ VERIFICAR SE AS VARIÁVEIS ESTÃO CONFIGURADAS
if (!supabaseUrl || supabaseUrl === 'https://seu-projeto.supabase.co') {
  console.warn('⚠️ [Supabase] URL não configurada. Configure EXPO_PUBLIC_SUPABASE_URL no .env');
}

if (!supabaseAnonKey || supabaseAnonKey === 'sua-anon-key-aqui') {
  console.warn('⚠️ [Supabase] Chave não configurada. Configure EXPO_PUBLIC_SUPABASE_ANON_KEY no .env');
}

// ✨ CRIAR CLIENTE SUPABASE
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Para apps móveis, usar AsyncStorage
    storage: undefined, // Expo SecureStore pode ser usado aqui
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    // Configurações de tempo real (opcional)
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ✨ LOG DE INICIALIZAÇÃO
console.log('🗄️ [Supabase] Cliente inicializado:', {
  url: supabaseUrl.replace(/\/\/.*\./, '//*****.'),
  hasKey: !!supabaseAnonKey
});

// ✨ INTERFACE PARA TRANSFERÊNCIAS
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

// ✨ TIPOS PARA FILTROS
export interface TransferFilter {
  address?: string;
  type?: 'send' | 'receive' | 'nfc';
  status?: 'pending' | 'confirmed' | 'failed';
  limit?: number;
  offset?: number;
}

// ✨ CONSTANTES DO BANCO
export const DB_TABLES = {
  TRANSFERS: 'transfers'
} as const;

export const TRANSFER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
} as const;

export const TRANSFER_TYPES = {
  SEND: 'send',
  RECEIVE: 'receive',
  NFC: 'nfc'
} as const;

export const NETWORKS = {
  MAINNET: 'mainnet',
  DEVNET: 'devnet',
  TESTNET: 'testnet'
} as const;

export default supabase;