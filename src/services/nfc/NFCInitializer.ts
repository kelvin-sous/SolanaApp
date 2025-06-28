// ========================================
// src/services/nfc/NFCInitializer.ts
// Inicializador do NFC para o app - CORRIGIDO
// ========================================

import NfcManager from 'react-native-nfc-manager';
import { Platform } from 'react-native';
import NFCService from './NFCService';

export class NFCInitializer {
  private static isInitialized = false;

  /**
   * Inicializa o NFC no app
   * Deve ser chamado no App.tsx ou index.js
   */
  static async initialize(): Promise<boolean> {
    try {
      if (NFCInitializer.isInitialized) {
        console.log('ℹ️ NFC já inicializado');
        return true;
      }

      console.log('🔄 Inicializando NFC no app...');

      // Verificar se é suportado
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        console.log('❌ NFC não suportado neste dispositivo');
        return false;
      }

      // Inicializar NFC Manager
      await NfcManager.start();
      console.log('✅ NFC Manager inicializado');

      // Inicializar nosso serviço
      const nfcService = NFCService.getInstance();
      console.log('✅ NFCService inicializado');

      NFCInitializer.isInitialized = true;
      return true;

    } catch (error) {
      console.error('❌ Erro ao inicializar NFC:', error);
      return false;
    }
  }

  /**
   * Limpa recursos do NFC
   * Deve ser chamado quando o app é fechado
   */
  static async cleanup(): Promise<void> {
    try {
      if (!NFCInitializer.isInitialized) {
        return;
      }

      console.log('🧹 Limpando recursos NFC...');

      // Limpar nosso serviço
      const nfcService = NFCService.getInstance();
      await nfcService.destroy();

      // ✅ CORRIGIDO: Parar NFC Manager sem usar .stop()
      try {
        // Cancelar qualquer operação ativa
        await NfcManager.cancelTechnologyRequest();
        console.log('✅ Operações NFC canceladas');
      } catch (cancelError) {
        // Ignorar erros de cancelamento se não houver operação ativa
        console.log('ℹ️ Nenhuma operação NFC ativa para cancelar');
      }

      NFCInitializer.isInitialized = false;
      console.log('✅ Recursos NFC limpos');

    } catch (error) {
      console.error('❌ Erro ao limpar NFC:', error);
    }
  }

  /**
   * Verifica se NFC está disponível e habilitado
   */
  static async checkAvailability(): Promise<{
    supported: boolean;
    enabled: boolean;
    error?: string;
  }> {
    try {
      const supported = await NfcManager.isSupported();
      if (!supported) {
        return {
          supported: false,
          enabled: false,
          error: 'NFC não suportado neste dispositivo'
        };
      }

      const enabled = await NfcManager.isEnabled();
      return {
        supported: true,
        enabled,
        error: !enabled ? 'NFC não está habilitado nas configurações' : undefined
      };

    } catch (error) {
      return {
        supported: false,
        enabled: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * ✅ NOVO: Método para reinicializar NFC se necessário
   */
  static async reinitialize(): Promise<boolean> {
    try {
      console.log('🔄 Reinicializando NFC...');
      
      // Limpar primeiro
      await NFCInitializer.cleanup();
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Inicializar novamente
      return await NFCInitializer.initialize();
      
    } catch (error) {
      console.error('❌ Erro ao reinicializar NFC:', error);
      return false;
    }
  }

  /**
   * ✅ NOVO: Getter para verificar se está inicializado
   */
  static get initialized(): boolean {
    return NFCInitializer.isInitialized;
  }
}