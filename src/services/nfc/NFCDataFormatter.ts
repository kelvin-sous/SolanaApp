// ========================================
// src/services/nfc/NFCDataFormatter.ts
// Formatação e serialização de dados para transmissão NFC
// ========================================

import { NFC_CONFIG } from '../../constants/config';
import { NFCTransactionData } from './NFCService';

// ========================================
// INTERFACES PARA FORMATAÇÃO
// ========================================

interface NFCDataPacket {
  version: string;
  type: 'SOLANA_TRANSFER';
  data: NFCTransactionData;
  checksum: string;
  timestamp: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  dataSize: number;
}

export class NFCDataFormatter {
  private readonly VERSION = '1.0.0';
  private readonly DATA_TYPE = 'SOLANA_TRANSFER';

  // ========================================
  // FORMATAÇÃO PARA TRANSMISSÃO
  // ========================================

  /**
   * Formata dados para transmissão via NFC
   */
  formatForTransmission(transactionData: NFCTransactionData): string {
    try {
      console.log('📦 Formatando dados para transmissão NFC...');
      
      // Criar pacote de dados
      const packet: NFCDataPacket = {
        version: this.VERSION,
        type: this.DATA_TYPE,
        data: this.sanitizeTransactionData(transactionData),
        checksum: '', // Será calculado abaixo
        timestamp: Date.now()
      };

      // Calcular checksum
      packet.checksum = this.calculateChecksum(packet.data);

      // Serializar para JSON
      const jsonString = JSON.stringify(packet);

      // Validar tamanho
      const validation = this.validateDataSize(jsonString);
      if (!validation.isValid) {
        throw new Error(`Dados muito grandes: ${validation.errors.join(', ')}`);
      }

      console.log('✅ Dados formatados para NFC:', {
        size: jsonString.length,
        checksum: packet.checksum.slice(0, 8) + '...'
      });

      return jsonString;

    } catch (error) {
      console.error('❌ Erro ao formatar dados para NFC:', error);
      throw new Error(`Falha na formatação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Parseia dados recebidos via NFC
   */
  parseFromTransmission(rawData: string): NFCTransactionData {
    try {
      console.log('📨 Parseando dados recebidos via NFC...');
      
      // Verificar se é JSON válido
      let packet: NFCDataPacket;
      try {
        packet = JSON.parse(rawData);
      } catch {
        throw new Error('Dados não são um JSON válido');
      }

      // Validar estrutura do pacote
      this.validatePacketStructure(packet);

      // Verificar versão
      if (packet.version !== this.VERSION) {
        console.log(`⚠️ Versão diferente: recebido ${packet.version}, esperado ${this.VERSION}`);
        // Por enquanto, continuar - futuras versões podem ser compatíveis
      }

      // Verificar tipo
      if (packet.type !== this.DATA_TYPE) {
        throw new Error(`Tipo de dados inválido: ${packet.type}`);
      }

      // Verificar checksum
      const calculatedChecksum = this.calculateChecksum(packet.data);
      if (calculatedChecksum !== packet.checksum) {
        throw new Error('Checksum inválido - dados podem estar corrompidos');
      }

      // Validar idade dos dados
      const age = Date.now() - packet.data.timestamp;
      if (age > NFC_CONFIG.VALIDATION.MAX_TRANSACTION_AGE) {
        throw new Error('Dados muito antigos');
      }

      console.log('✅ Dados NFC parseados com sucesso:', {
        amount: packet.data.amount,
        from: packet.data.senderPublicKey.slice(0, 8) + '...',
        to: packet.data.receiverPublicKey.slice(0, 8) + '...'
      });

      return packet.data;

    } catch (error) {
      console.error('❌ Erro ao parsear dados NFC:', error);
      throw new Error(`Falha no parse: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // ========================================
  // VALIDAÇÕES
  // ========================================

  /**
   * Valida estrutura do pacote de dados
   */
  private validatePacketStructure(packet: any): void {
    const requiredFields = ['version', 'type', 'data', 'checksum', 'timestamp'];
    
    for (const field of requiredFields) {
      if (!(field in packet)) {
        throw new Error(`Campo obrigatório ausente: ${field}`);
      }
    }

    // Validar campos dos dados de transação
    const data = packet.data;
    const requiredDataFields = NFC_CONFIG.VALIDATION.REQUIRED_FIELDS;
    
    for (const field of requiredDataFields) {
      if (!(field in data)) {
        throw new Error(`Campo de transação ausente: ${field}`);
      }
    }

    // Validar tipos
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Valor em USD inválido');
    }

    if (typeof data.amountSOL !== 'number' || data.amountSOL <= 0) {
      throw new Error('Valor em SOL inválido');
    }

    if (typeof data.senderPublicKey !== 'string' || !data.senderPublicKey) {
      throw new Error('Chave pública do remetente inválida');
    }

    if (typeof data.receiverPublicKey !== 'string' || !data.receiverPublicKey) {
      throw new Error('Chave pública do destinatário inválida');
    }

    if (typeof data.timestamp !== 'number' || data.timestamp <= 0) {
      throw new Error('Timestamp inválido');
    }

    if (typeof data.nonce !== 'string' || !data.nonce) {
      throw new Error('Nonce inválido');
    }
  }

  /**
   * Valida tamanho dos dados
   */
  private validateDataSize(data: string): ValidationResult {
    const dataSize = new Blob([data]).size;
    const errors: string[] = [];

    if (dataSize > NFC_CONFIG.MAX_DATA_SIZE) {
      errors.push(`Tamanho excede limite: ${dataSize} > ${NFC_CONFIG.MAX_DATA_SIZE} bytes`);
    }

    if (dataSize < 100) { // Mínimo razoável
      errors.push(`Dados muito pequenos: ${dataSize} bytes`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      dataSize
    };
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  /**
   * Limpa e sanitiza dados da transação
   */
  private sanitizeTransactionData(data: NFCTransactionData): NFCTransactionData {
    return {
      amount: Number(data.amount.toFixed(2)),
      amountSOL: Number(data.amountSOL.toFixed(9)),
      senderPublicKey: data.senderPublicKey.trim(),
      receiverPublicKey: data.receiverPublicKey.trim(),
      timestamp: data.timestamp,
      nonce: data.nonce.trim(),
      solPrice: Number(data.solPrice.toFixed(2)),
      network: data.network,
      memo: data.memo?.trim()
    };
  }

  /**
   * Calcula checksum dos dados
   */
  private calculateChecksum(data: NFCTransactionData): string {
    try {
      // Criar string determinística dos dados principais
      const dataString = [
        data.amount.toFixed(2),
        data.amountSOL.toFixed(9),
        data.senderPublicKey,
        data.receiverPublicKey,
        data.timestamp.toString(),
        data.nonce,
        data.solPrice.toFixed(2),
        data.network,
        data.memo || ''
      ].join('|');

      // Calcular hash simples (para um checksum mais robusto, use crypto)
      let hash = 0;
      for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Converter para 32bit integer
      }

      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('❌ Erro ao calcular checksum:', error);
      return '0';
    }
  }

  // ========================================
  // FORMATAÇÃO PARA EXIBIÇÃO
  // ========================================

  /**
   * Formata dados para exibição na interface
   */
  formatForDisplay(data: NFCTransactionData): {
    amount: string;
    amountSOL: string;
    sender: string;
    receiver: string;
    network: string;
    timestamp: string;
    memo?: string;
  } {
    return {
      amount: `$${data.amount.toFixed(2)} USD`,
      amountSOL: `${data.amountSOL.toFixed(6)} SOL`,
      sender: this.formatAddress(data.senderPublicKey),
      receiver: this.formatAddress(data.receiverPublicKey),
      network: data.network.toUpperCase(),
      timestamp: new Date(data.timestamp).toLocaleString('pt-BR'),
      memo: data.memo
    };
  }

  /**
   * Formata endereços para exibição
   */
  private formatAddress(address: string, startChars: number = 8, endChars: number = 8): string {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  // ========================================
  // COMPRESSÃO (FUTURO)
  // ========================================

  /**
   * Comprime dados se necessário (placeholder para implementação futura)
   */
  private compressData(data: string): string {
    // TODO: Implementar compressão se os dados ficarem muito grandes
    // Por enquanto, retorna os dados como estão
    return data;
  }

  /**
   * Descomprime dados (placeholder para implementação futura)
   */
  private decompressData(data: string): string {
    // TODO: Implementar descompressão
    // Por enquanto, retorna os dados como estão
    return data;
  }

  // ========================================
  // GETTERS E INFO
  // ========================================

  /**
   * Retorna informações sobre o formatador
   */
  getFormatterInfo(): {
    version: string;
    dataType: string;
    maxDataSize: number;
    supportedNetworks: string[];
  } {
    return {
      version: this.VERSION,
      dataType: this.DATA_TYPE,
      maxDataSize: NFC_CONFIG.MAX_DATA_SIZE,
      supportedNetworks: ['devnet', 'testnet', 'mainnet-beta']
    };
  }

  /**
   * Estima tamanho dos dados após formatação
   */
  estimateDataSize(transactionData: NFCTransactionData): {
    estimatedSize: number;
    isWithinLimit: boolean;
    compressionNeeded: boolean;
  } {
    try {
      // Criar pacote temporário para estimar tamanho
      const tempPacket: NFCDataPacket = {
        version: this.VERSION,
        type: this.DATA_TYPE,
        data: this.sanitizeTransactionData(transactionData),
        checksum: 'temp_checksum_placeholder',
        timestamp: Date.now()
      };

      const jsonString = JSON.stringify(tempPacket);
      const estimatedSize = new Blob([jsonString]).size;
      const isWithinLimit = estimatedSize <= NFC_CONFIG.MAX_DATA_SIZE;
      const compressionNeeded = estimatedSize > (NFC_CONFIG.MAX_DATA_SIZE * 0.8); // 80% do limite

      return {
        estimatedSize,
        isWithinLimit,
        compressionNeeded
      };
    } catch (error) {
      console.error('❌ Erro ao estimar tamanho:', error);
      return {
        estimatedSize: 0,
        isWithinLimit: false,
        compressionNeeded: true
      };
    }
  }
}