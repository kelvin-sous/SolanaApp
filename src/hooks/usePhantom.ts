// ========================================
// src/hooks/usePhantom.ts
// Refatorado com tipos centralizados
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import PhantomService from '../services/phantom/PhantomService';
import { PhantomSession, PhantomConnectionResult } from '../types/phantom';

export interface UsePhantomReturn {
  // Estado
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: PublicKey | null;
  session: PhantomSession | null;
  
  // Ações
  connectOrDownload: () => Promise<PhantomConnectionResult>;
  disconnect: () => Promise<void>;
  
  // Feedback
  error: string | null;
  clearError: () => void;
}

export const usePhantom = (): UsePhantomReturn => {
  // Estados
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [session, setSession] = useState<PhantomSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const phantomService = PhantomService.getInstance();

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Atualizar estado com sessão
  const updateSessionState = useCallback((phantomSession: PhantomSession | null) => {
    if (phantomSession) {
      setSession(phantomSession);
      setPublicKey(phantomSession.publicKey);
      setIsConnected(true);
    } else {
      setSession(null);
      setPublicKey(null);
      setIsConnected(false);
    }
  }, []);

  // Carregar sessão salva na inicialização
  useEffect(() => {
    const loadSavedSession = async () => {
      try {
        console.log('🔄 Verificando sessão salva...');
        const savedSession = await phantomService.loadSession();
        
        if (savedSession) {
          updateSessionState(savedSession);
          console.log('✅ Sessão salva carregada:', savedSession.publicKey.toString());
        } else {
          console.log('ℹ️ Nenhuma sessão salva encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar sessão salva:', error);
        setError('Erro ao carregar sessão salva');
      }
    };

    loadSavedSession();
  }, [phantomService, updateSessionState]);

  // Conectar ou redirecionar para download
  const connectOrDownload = useCallback(async (): Promise<PhantomConnectionResult> => {
    if (isConnecting || isConnected) {
      console.log('ℹ️ Já conectando ou conectado');
      return 'CONNECTED';
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('🚀 Iniciando connectOrDownload...');
      
      const result = await phantomService.connectOrDownload();
      
      if (result === 'DOWNLOAD_NEEDED') {
        console.log('📥 Download necessário');
        return 'DOWNLOAD_NEEDED';
      } else {
        // Sucesso na conexão
        updateSessionState(result);
        console.log('✅ Conectado com sucesso!');
        return 'CONNECTED';
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro na conexão:', err);
      
      // Limpar estado em caso de erro
      updateSessionState(null);
      return 'ERROR';
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, phantomService, updateSessionState]);

  // Desconectar da Phantom
  const disconnect = useCallback(async () => {
    try {
      console.log('🔌 Desconectando da Phantom...');
      
      await phantomService.disconnect();
      updateSessionState(null);
      
      console.log('✅ Desconectado com sucesso!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao desconectar';
      setError(errorMessage);
      console.error('❌ Erro na desconexão:', err);
      
      // Limpar estado mesmo com erro
      updateSessionState(null);
    }
  }, [phantomService, updateSessionState]);

  return {
    // Estado
    isConnected,
    isConnecting,
    publicKey,
    session,
    
    // Ações
    connectOrDownload,
    disconnect,
    
    // Feedback
    error,
    clearError
  };
};

// Export default também para flexibilidade
export default usePhantom;