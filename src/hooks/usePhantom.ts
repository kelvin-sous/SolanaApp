// ========================================
// src/hooks/usePhantom.ts
// Hook para gerenciar conexão com Phantom
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import PhantomService from '../services/phantom/PhantomService';
import { PhantomSession } from '../types/phantom';

export interface UsePhantomReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  publicKey: PublicKey | null;
  session: PhantomSession | null;
  connect: () => Promise<'CONNECTED' | 'DOWNLOAD_NEEDED'>;
  disconnect: () => Promise<void>;
  testDeepLink: () => Promise<void>;
}

export const usePhantom = (): UsePhantomReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [session, setSession] = useState<PhantomSession | null>(null);

  const phantomService = PhantomService.getInstance();

  // Carrega sessão salva ao inicializar
  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      setIsLoading(true);
      const savedSession = await phantomService.loadSession();

      if (savedSession) {
        setSession(savedSession);
        setPublicKey(savedSession.publicKey);
        setIsConnected(true);
        console.log('✅ Sessão restaurada');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar sessão:', err);
      setError('Erro ao carregar sessão salva');
    } finally {
      setIsLoading(false);
    }
  };

  const connect = useCallback(async (): Promise<'CONNECTED' | 'DOWNLOAD_NEEDED'> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await phantomService.connectOrDownload();

      if (result === 'DOWNLOAD_NEEDED') {
        return 'DOWNLOAD_NEEDED';
      }

      // Conexão bem-sucedida
      setSession(result);
      setPublicKey(result.publicKey);
      setIsConnected(true);

      console.log('✅ Conectado com sucesso:', result.publicKey.toString());
      return 'CONNECTED';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro na conexão:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [phantomService]);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await phantomService.disconnect();

      setSession(null);
      setPublicKey(null);
      setIsConnected(false);
      setError(null);

      console.log('✅ Desconectado com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desconectar';
      console.error('❌ Erro ao desconectar:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [phantomService]);

  const testDeepLink = useCallback(async (): Promise<void> => {
    try {
      console.log('🧪 Testando deep link...');
      await phantomService.testDeepLink();
    } catch (err) {
      console.error('❌ Erro no teste:', err);
    }
  }, [phantomService]);

  return {
    isConnected,
    isLoading,
    error,
    publicKey,
    session,
    connect,
    disconnect,
    testDeepLink
  };
};
