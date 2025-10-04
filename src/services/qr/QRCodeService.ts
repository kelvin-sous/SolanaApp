// ========================================
// src/services/qr/QRCodeService.ts
// Versão simplificada para resolver erros de TypeScript
// ========================================

export interface QRCodeData {
  type: 'SOLANA_PAY' | 'WALLET_ADDRESS' | 'CUSTOM_TRANSACTION';
  recipient: string;
  amount?: number;
  amountUSD?: number;
  label?: string;
  message?: string;
  timestamp: number;
  network: string;
}

export interface QRCodeGenerationParams {
  publicKey: string;
  amount?: number;
  amountUSD?: number;
  label?: string;
  message?: string;
}

export interface QRCodeScanResult {
  isValid: boolean;
  data?: QRCodeData;
  error?: string;
  validationErrors?: string[];
}

export interface TransactionPreview {
  from: string;
  to: string;
  amountSOL: number;
  amountUSD: number;
  estimatedFee: number;
  estimatedTotal: number;
  pricePerSOL: number;
  isValid: boolean;
  errors: string[];
}

class QRCodeService {
  private static instance: QRCodeService;

  constructor() {
    // Construtor vazio por enquanto
  }

  public static getInstance(): QRCodeService {
    if (!QRCodeService.instance) {
      QRCodeService.instance = new QRCodeService();
    }
    return QRCodeService.instance;
  }

  /**
   * Gera QR Code simples apenas com endereço
   */
  generateSimpleAddressQR(publicKey: string): string {
    const qrData: QRCodeData = {
      type: 'WALLET_ADDRESS',
      recipient: publicKey,
      timestamp: Date.now(),
      network: 'devnet'
    };

    return JSON.stringify(qrData);
  }

  /**
   * Gera dados para QR Code de recebimento
   */
  async generateReceiveQRData(params: QRCodeGenerationParams): Promise<string> {
    try {
      console.log('Gerando QR Code para recebimento...');

      const qrData: QRCodeData = {
        type: 'WALLET_ADDRESS',
        recipient: params.publicKey,
        amount: params.amount,
        amountUSD: params.amountUSD,
        label: params.label || 'Transferência SOL',
        message: params.message,
        timestamp: Date.now(),
        network: 'devnet'
      };

      const qrString = JSON.stringify(qrData);
      console.log('QR Code gerado');
      return qrString;
      
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      throw error;
    }
  }

  /**
   * Processa dados escaneados de QR Code
   */
  async processScannedQRCode(qrString: string): Promise<QRCodeScanResult> {
    try {
      console.log('Processando QR Code escaneado...');

      let qrData: QRCodeData;
      try {
        qrData = JSON.parse(qrString);
      } catch {
        return {
          isValid: false,
          error: 'QR Code não contém dados válidos'
        };
      }

      return {
        isValid: true,
        data: qrData
      };
      
    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria preview da transação antes de executar
   */
  async createTransactionPreview(
    fromPublicKey: string,
    qrData: QRCodeData
  ): Promise<TransactionPreview> {
    const amountSOL = qrData.amount || 0;
    const amountUSD = qrData.amountUSD || 0;
    const estimatedFee = 0.000005;

    return {
      from: fromPublicKey,
      to: qrData.recipient,
      amountSOL,
      amountUSD,
      estimatedFee,
      estimatedTotal: amountSOL + estimatedFee,
      pricePerSOL: 100,
      isValid: true,
      errors: []
    };
  }

  /**
   * Executa transação (mock por enquanto)
   */
  async executeTransaction(
    preview: TransactionPreview,
    session: any
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    console.log('Mock: Executando transação...');
    
    // Simular sucesso
    return {
      success: true,
      signature: 'mock_signature_' + Date.now()
    };
  }

  /**
   * Formata dados para exibição
   */
  formatQRCodeData(qrData: QRCodeData): {
    recipient: string;
    amount: string;
    network: string;
    label?: string;
    message?: string;
  } {
    return {
      recipient: this.formatAddress(qrData.recipient),
      amount: qrData.amount 
        ? `${qrData.amount.toFixed(6)} SOL`
        : qrData.amountUSD 
        ? `$${qrData.amountUSD.toFixed(2)}`
        : 'Valor a definir',
      network: qrData.network.toUpperCase(),
      label: qrData.label,
      message: qrData.message
    };
  }

  /**
   * Verifica se uma string é um QR Code válido
   */
  isValidQRCode(qrString: string): boolean {
    try {
      const parsed = JSON.parse(qrString);
      return !!(parsed.type && parsed.recipient);
    } catch {
      return false;
    }
  }

  /**
   * Utilitário para formatar endereços
   */
  private formatAddress(address: string, startChars: number = 8, endChars: number = 8): string {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }
}

export default QRCodeService;