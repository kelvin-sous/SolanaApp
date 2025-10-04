// ========================================
// src/services/phantom/CryptoService.ts
// Serviço de criptografia para Phantom
// ========================================

import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { EncryptedPayload, DecryptedConnectData } from '../../types/phantom';

export class CryptoService {
  /**
   * Gera um par de chaves para criptografia
   */
  static generateKeyPair(): nacl.BoxKeyPair {
    return nacl.box.keyPair();
  }

  /**
   * Gera nonce aleatório
   */
  static generateNonce(): Uint8Array {
    return nacl.randomBytes(24);
  }

  /**
   * Cria segredo compartilhado usando Diffie-Hellman
   */
  static createSharedSecret(
    theirPublicKey: Uint8Array,
    ourSecretKey: Uint8Array
  ): Uint8Array {
    return nacl.box.before(theirPublicKey, ourSecretKey);
  }

  /**
   * Criptografa dados usando segredo compartilhado
   */
  static encrypt(
    message: string,
    sharedSecret: Uint8Array,
    nonce?: Uint8Array
  ): EncryptedPayload {
    const messageBytes = new TextEncoder().encode(message);
    const nonceBytes = nonce || this.generateNonce();
    
    const encryptedData = nacl.box.after(messageBytes, nonceBytes, sharedSecret);
    
    if (!encryptedData) {
      throw new Error('Falha ao criptografar dados');
    }

    return {
      nonce: bs58.encode(nonceBytes),
      data: bs58.encode(encryptedData)
    };
  }

  /**
   * Descriptografa dados usando segredo compartilhado
   */
  static decrypt(
    encryptedPayload: EncryptedPayload,
    sharedSecret: Uint8Array
  ): string {
    try {
      const nonceBytes = bs58.decode(encryptedPayload.nonce);
      const encryptedData = bs58.decode(encryptedPayload.data);
      
      const decryptedData = nacl.box.open.after(encryptedData, nonceBytes, sharedSecret);
      
      if (!decryptedData) {
        throw new Error('Falha ao descriptografar dados - dados corrompidos ou chave inválida');
      }

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Erro na descriptografia:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao descriptografar: ${errorMessage}`);
    }
  }

  /**
   * Descriptografa resposta de conexão do Phantom
   */
  static decryptConnectResponse(
    phantomEncryptionPublicKey: string,
    nonce: string,
    data: string,
    dappKeyPair: nacl.BoxKeyPair
  ): DecryptedConnectData {
    try {
      console.log('Iniciando descriptografia da resposta...');
      
      // Decodificar chave pública do Phantom
      const phantomPublicKey = bs58.decode(phantomEncryptionPublicKey);
      console.log('Chave pública Phantom decodificada');
      
      // Criar segredo compartilhado
      const sharedSecret = this.createSharedSecret(phantomPublicKey, dappKeyPair.secretKey);
      console.log('Segredo compartilhado criado');
      
      // Descriptografar dados
      const encryptedPayload: EncryptedPayload = { nonce, data };
      const decryptedJson = this.decrypt(encryptedPayload, sharedSecret);
      console.log('Dados descriptografados');
      
      // Parsear JSON
      const connectData: DecryptedConnectData = JSON.parse(decryptedJson);
      console.log('JSON parseado:', { 
        hasPublicKey: !!connectData.public_key,
        hasSession: !!connectData.session 
      });
      
      return connectData;
    } catch (error) {
      console.error('Erro na descriptografia da resposta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao descriptografar resposta do Phantom: ${errorMessage}`);
    }
  }

  /**
   * Valida se a resposta do Phantom é válida
   */
  static validatePhantomResponse(response: any): boolean {
    return !!(
      response.phantom_encryption_public_key &&
      response.nonce &&
      response.data
    );
  }

  /**
   * Converte chave pública para base58
   */
  static encodePublicKey(publicKey: Uint8Array): string {
    return bs58.encode(publicKey);
  }

  /**
   * Decodifica chave pública de base58
   */
  static decodePublicKey(publicKeyBase58: string): Uint8Array {
    return bs58.decode(publicKeyBase58);
  }
}

export default CryptoService;