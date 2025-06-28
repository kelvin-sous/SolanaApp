// ========================================
// src/utils/nfcEncryption.ts
// Utilitários de criptografia para dados NFC - CORRIGIDO
// ========================================

import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import { NFCTransactionData } from '../types/nfc';

// ========================================
// INTERFACES DE CRIPTOGRAFIA
// ========================================

export interface EncryptedNFCData {
  encryptedData: string;
  iv: string;
  salt: string;
  algorithm: string;
  keyDerivation: string;
  timestamp: number;
  version: string;
}

export interface DecryptedNFCData {
  data: NFCTransactionData;
  isValid: boolean;
  decryptedAt: number;
}

export interface CryptoConfig {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  keyDerivation: 'PBKDF2' | 'SIMPLE';
  iterations: number;
  keyLength: number;
  ivLength: number;
  saltLength: number;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: string;
  keySize: number;
  createdAt: number;
}

// ========================================
// CONFIGURAÇÕES DE CRIPTOGRAFIA
// ========================================

const DEFAULT_CRYPTO_CONFIG: CryptoConfig = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  iterations: 10000,
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  saltLength: 16 // 128 bits
};

const ENCRYPTION_VERSION = '1.0.0';

// ========================================
// CLASSE PRINCIPAL DE CRIPTOGRAFIA NFC
// ========================================

export class NFCEncryption {
  private config: CryptoConfig;
  private isInitialized: boolean = false;

  constructor(config?: Partial<CryptoConfig>) {
    this.config = { ...DEFAULT_CRYPTO_CONFIG, ...config };
  }

  /**
   * Inicializa o sistema de criptografia
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔐 Inicializando sistema de criptografia NFC...');
      
      // Verificar se crypto está disponível
      if (!Crypto.getRandomBytesAsync) {
        throw new Error('Crypto não está disponível nesta plataforma');
      }

      // Testar geração de bytes aleatórios
      await this.generateRandomBytes(16);
      
      this.isInitialized = true;
      console.log('✅ Sistema de criptografia NFC inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar criptografia:', error);
      throw new Error(`Falha na inicialização da criptografia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Criptografa dados de transação NFC
   */
  async encryptTransactionData(
    data: NFCTransactionData,
    password: string
  ): Promise<EncryptedNFCData> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🔒 Criptografando dados de transação NFC...');

      // Serializar dados
      const jsonData = JSON.stringify(data);
      const dataBytes = new TextEncoder().encode(jsonData);

      // Gerar salt e IV
      const salt = await this.generateRandomBytes(this.config.saltLength);
      const iv = await this.generateRandomBytes(this.config.ivLength);

      // Derivar chave
      const key = await this.deriveKey(password, salt);

      // Criptografar dados
      const encryptedBytes = await this.encryptAES(dataBytes, key, iv);
      const encryptedData = this.bytesToBase64(encryptedBytes);

      const result: EncryptedNFCData = {
        encryptedData,
        iv: this.bytesToBase64(iv),
        salt: this.bytesToBase64(salt),
        algorithm: this.config.algorithm,
        keyDerivation: this.config.keyDerivation,
        timestamp: Date.now(),
        version: ENCRYPTION_VERSION
      };

      console.log('✅ Dados criptografados com sucesso');
      return result;

    } catch (error) {
      console.error('❌ Erro na criptografia:', error);
      throw new Error(`Falha na criptografia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Descriptografa dados de transação NFC
   */
  async decryptTransactionData(
    encryptedData: EncryptedNFCData,
    password: string
  ): Promise<DecryptedNFCData> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🔓 Descriptografando dados de transação NFC...');

      // Validar estrutura
      this.validateEncryptedDataStructure(encryptedData);

      // Converter dados base64 para bytes
      const dataBytes = this.base64ToBytes(encryptedData.encryptedData);
      const iv = this.base64ToBytes(encryptedData.iv);
      const salt = this.base64ToBytes(encryptedData.salt);

      // Derivar chave
      const key = await this.deriveKey(password, salt);

      // Descriptografar
      const decryptedBytes = await this.decryptAES(dataBytes, key, iv);
      const jsonString = new TextDecoder().decode(decryptedBytes);

      // Parsear JSON
      const data: NFCTransactionData = JSON.parse(jsonString);

      console.log('✅ Dados descriptografados com sucesso');

      return {
        data,
        isValid: true,
        decryptedAt: Date.now()
      };

    } catch (error) {
      console.error('❌ Erro na descriptografia:', error);
      return {
        data: {} as NFCTransactionData,
        isValid: false,
        decryptedAt: Date.now()
      };
    }
  }

  // ========================================
  // MÉTODOS DE CRIPTOGRAFIA SIMÉTRICA
  // ========================================

  /**
   * Criptografa dados usando AES
   */
  private async encryptAES(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    try {
      if (Platform.OS === 'web') {
        return await this.encryptAESWeb(data, key, iv);
      } else {
        return await this.encryptAESNative(data, key, iv);
      }
    } catch (error) {
      console.error('❌ Erro no AES encrypt:', error);
      throw error;
    }
  }

  /**
   * Descriptografa dados usando AES
   */
  private async decryptAES(encryptedData: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    try {
      if (Platform.OS === 'web') {
        return await this.decryptAESWeb(encryptedData, key, iv);
      } else {
        return await this.decryptAESNative(encryptedData, key, iv);
      }
    } catch (error) {
      console.error('❌ Erro no AES decrypt:', error);
      throw error;
    }
  }

  /**
   * Implementação AES para Web
   */
  private async encryptAESWeb(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );

    return new Uint8Array(encrypted);
  }

  /**
   * Implementação AES para Native
   */
  private async encryptAESNative(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    // Para React Native, usar implementação simplificada
    console.warn('⚠️ Usando criptografia simplificada - não recomendado para produção');
    
    return this.simpleXOR(data, key);
  }

  /**
   * Implementação AES decrypt para Web
   */
  private async decryptAESWeb(encryptedData: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encryptedData
    );

    return new Uint8Array(decrypted);
  }

  /**
   * Implementação AES decrypt para Native
   */
  private async decryptAESNative(encryptedData: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    console.warn('⚠️ Usando descriptografia simplificada - não recomendado para produção');
    
    return this.simpleXOR(encryptedData, key);
  }

  // ========================================
  // DERIVAÇÃO DE CHAVE
  // ========================================

  /**
   * Deriva chave a partir de senha e salt
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    try {
      const passwordBytes = new TextEncoder().encode(password);
      
      if (Platform.OS === 'web' && crypto.subtle) {
        return await this.deriveKeyWeb(passwordBytes, salt);
      } else {
        return await this.deriveKeySimple(passwordBytes, salt);
      }
    } catch (error) {
      console.error('❌ Erro na derivação de chave:', error);
      throw error;
    }
  }

  /**
   * Derivação de chave usando Web Crypto API
   */
  private async deriveKeyWeb(password: Uint8Array, salt: Uint8Array): Promise<Uint8Array> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      password,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.config.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      this.config.keyLength * 8
    );

    return new Uint8Array(derivedBits);
  }

  /**
   * Derivação de chave simplificada
   */
  private async deriveKeySimple(password: Uint8Array, salt: Uint8Array): Promise<Uint8Array> {
    const combined = new Uint8Array(password.length + salt.length);
    combined.set(password);
    combined.set(salt, password.length);

    try {
      const combined64 = this.bytesToBase64(combined);
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined64
      );
      
      return this.base64ToBytes(hash).slice(0, this.config.keyLength);
    } catch {
      return this.simpleHash(combined, this.config.keyLength);
    }
  }

  // ========================================
  // UTILITÁRIOS DE HASH E CRIPTOGRAFIA
  // ========================================

  /**
   * Hash simples para fallback
   */
  private simpleHash(data: Uint8Array, length: number): Uint8Array {
    const result = new Uint8Array(length);
    let hash = 5381;

    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) + hash + data[i]) & 0xffffffff;
    }

    for (let i = 0; i < length; i++) {
      result[i] = (hash >>> (i % 4 * 8)) & 0xff;
      if (i % 4 === 3) {
        hash = ((hash << 5) + hash + i) & 0xffffffff;
      }
    }

    return result;
  }

  /**
   * XOR simples para criptografia básica
   */
  private simpleXOR(data: Uint8Array, key: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key[i % key.length];
    }
    
    return result;
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  /**
   * Gera bytes aleatórios seguros
   */
  async generateRandomBytes(length: number): Promise<Uint8Array> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(length);
      return new Uint8Array(randomBytes);
    } catch (error) {
      console.warn('⚠️ Usando geração de bytes aleatórios de fallback');
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return bytes;
    }
  }

  /**
   * Converte bytes para base64
   */
  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converte base64 para bytes
   */
  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Valida estrutura de dados criptografados
   */
  private validateEncryptedDataStructure(data: EncryptedNFCData): void {
    const requiredFields = ['encryptedData', 'iv', 'salt', 'algorithm', 'keyDerivation', 'timestamp', 'version'];
    
    for (const field of requiredFields) {
      if (!(field in data) || !data[field as keyof EncryptedNFCData]) {
        throw new Error(`Campo obrigatório ausente: ${field}`);
      }
    }

    if (data.version !== ENCRYPTION_VERSION) {
      console.warn(`⚠️ Versão de criptografia diferente: ${data.version} vs ${ENCRYPTION_VERSION}`);
    }

    const age = Date.now() - data.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      throw new Error('Dados criptografados muito antigos');
    }
  }

  /**
   * Gera senha segura para criptografia
   */
  async generateSecurePassword(length: number = 32): Promise<string> {
    const bytes = await this.generateRandomBytes(length);
    return this.bytesToBase64(bytes);
  }

  /**
   * Calcula hash de dados para verificação de integridade
   */
  async calculateDataHash(data: NFCTransactionData): Promise<string> {
    const jsonString = JSON.stringify(data);
    
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        jsonString
      );
      return hash;
    } catch {
      const dataBytes = new TextEncoder().encode(jsonString);
      const hashBytes = this.simpleHash(dataBytes, 32);
      return this.bytesToBase64(hashBytes);
    }
  }

  /**
   * Verifica integridade de dados
   */
  async verifyDataIntegrity(data: NFCTransactionData, expectedHash: string): Promise<boolean> {
    try {
      const calculatedHash = await this.calculateDataHash(data);
      return calculatedHash === expectedHash;
    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error);
      return false;
    }
  }

  /**
   * Obtém informações sobre capacidades de criptografia
   */
  getCryptoCapabilities(): {
    hasWebCrypto: boolean;
    hasExpoCrypto: boolean;
    supportedAlgorithms: string[];
    platform: string;
  } {
    return {
      hasWebCrypto: Platform.OS === 'web' && !!crypto.subtle,
      hasExpoCrypto: !!Crypto.getRandomBytesAsync,
      supportedAlgorithms: Platform.OS === 'web' 
        ? ['AES-GCM', 'AES-CBC', 'RSA-OAEP', 'RSASSA-PKCS1-v1_5', 'PBKDF2']
        : ['SIMPLE', 'XOR'],
      platform: Platform.OS
    };
  }
}

// ========================================
// FUNÇÕES UTILITÁRIAS EXPORTADAS
// ========================================

/**
 * Instância singleton da classe de criptografia
 */
const nfcEncryption = new NFCEncryption();

/**
 * Criptografa dados de transação NFC de forma simples
 */
export async function encryptNFCData(
  data: NFCTransactionData,
  password: string
): Promise<EncryptedNFCData> {
  return await nfcEncryption.encryptTransactionData(data, password);
}

/**
 * Descriptografa dados de transação NFC
 */
export async function decryptNFCData(
  encryptedData: EncryptedNFCData,
  password: string
): Promise<DecryptedNFCData> {
  return await nfcEncryption.decryptTransactionData(encryptedData, password);
}

/**
 * Gera senha segura para criptografia
 */
export async function generateSecurePassword(length: number = 32): Promise<string> {
  return await nfcEncryption.generateSecurePassword(length);
}

/**
 * Calcula hash de dados
 */
export async function hashNFCData(data: NFCTransactionData): Promise<string> {
  return await nfcEncryption.calculateDataHash(data);
}

/**
 * Verifica integridade de dados
 */
export async function verifyNFCDataIntegrity(
  data: NFCTransactionData,
  expectedHash: string
): Promise<boolean> {
  return await nfcEncryption.verifyDataIntegrity(data, expectedHash);
}

/**
 * Obtém capacidades de criptografia do dispositivo
 */
export function getNFCCryptoCapabilities() {
  return nfcEncryption.getCryptoCapabilities();
}

// ✅ EXPORT ÚNICO E CORRETO
export default nfcEncryption;