// ========================================
// src/services/crypto/RealtimePriceService.ts
// Serviço 100% SILENCIOSO - Apenas logs de erro
// ========================================

interface CoinPriceData {
  symbol: string;
  price: number;
  priceChange24h: number;
  percentChange24h: number;
  lastUpdated: number;
  source: 'websocket' | 'api' | 'cache';
}

interface PriceSubscriber {
  id: string;
  callback: (prices: Map<string, CoinPriceData>) => void;
  coinIds: string[];
}

export class RealtimePriceService {
  private static instance: RealtimePriceService;
  private prices: Map<string, CoinPriceData> = new Map();
  private subscribers: Map<string, PriceSubscriber> = new Map();
  
  // WebSocket connections
  private binanceWS: WebSocket | null = null;
  
  // Connection states
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  
  // Supported coins mapping
  private readonly coinMapping = {
    'solana': { binance: 'solusdt', symbol: 'SOL' },
    'usd-coin': { binance: 'usdcusdt', symbol: 'USDC' },
    'bitcoin': { binance: 'btcusdt', symbol: 'BTC' },
    'ethereum': { binance: 'ethusdt', symbol: 'ETH' },
    'brl-token': { binance: 'usdtbrl', symbol: 'BRL' }
  };

  private constructor() {
    this.initializeConnections();
  }

  public static getInstance(): RealtimePriceService {
    if (!RealtimePriceService.instance) {
      RealtimePriceService.instance = new RealtimePriceService();
    }
    return RealtimePriceService.instance;
  }

  // ✨ INICIALIZAR CONEXÕES (SILENCIOSO)
  private async initializeConnections(): Promise<void> {
    try {
      await this.connectToBinance();
      this.isConnected = true;
    } catch (error) {
      console.error('❌ [Realtime] Erro ao conectar:', error);
      this.scheduleReconnect();
    }
  }

  // ✨ CONECTAR BINANCE WEBSOCKET (SILENCIOSO)
  private async connectToBinance(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const symbols = ['solusdt', 'usdcusdt', 'btcusdt', 'ethusdt', 'usdtbrl'];
        const streams = symbols.map(s => `${s}@ticker`).join('/');
        const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
        
        this.binanceWS = new WebSocket(wsUrl);
        
        this.binanceWS.onopen = () => {
          console.log('✅ [WebSocket] Conectado (Terminal limpo ativado)');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.binanceWS.onmessage = (event) => {
          this.handleBinanceMessage(event.data);
        };
        
        this.binanceWS.onerror = (error) => {
          console.error('❌ [WebSocket] Erro:', error);
          reject(error);
        };
        
        this.binanceWS.onclose = () => {
          console.log('🔌 [WebSocket] Desconectado');
          this.isConnected = false;
          this.scheduleReconnect();
        };
        
        // Timeout para conexão
        setTimeout(() => {
          if (this.binanceWS?.readyState !== WebSocket.OPEN) {
            reject(new Error('Timeout na conexão'));
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // ✨ PROCESSAR MENSAGENS (100% SILENCIOSO)
  private handleBinanceMessage(data: string): void {
    try {
      const ticker = JSON.parse(data);
      
      const coinEntry = Object.entries(this.coinMapping).find(
        ([_, mapping]) => mapping.binance === ticker.s?.toLowerCase()
      );
      
      if (!coinEntry) return;
      
      const [coinId, mapping] = coinEntry;
      const price = parseFloat(ticker.c || 0);
      const change24h = parseFloat(ticker.P || 0);
      const priceChange24h = parseFloat(ticker.p || 0);
      
      if (price > 0) {
        let finalPrice = price;
        let finalChange = change24h;
        let finalPriceChange = priceChange24h;
        
        // Processar BRL: converter USDTBRL para BRL/USD
        if (coinId === 'brl-token') {
          finalPrice = 1 / price;
          finalPriceChange = -priceChange24h / (price * price);
          finalChange = -change24h;
        }
        
        const priceData: CoinPriceData = {
          symbol: mapping.symbol,
          price: finalPrice,
          priceChange24h: finalPriceChange,
          percentChange24h: finalChange,
          lastUpdated: Date.now(),
          source: 'websocket'
        };
        
        this.prices.set(coinId, priceData);
        // ✨ SILENCIOSO: Sem logs de preços
        
        this.notifySubscribers();
      }
      
    } catch (error) {
      console.error('❌ [WebSocket] Erro ao processar:', error);
    }
  }

  // ✨ INSCREVER (SILENCIOSO)
  public subscribe(
    id: string, 
    coinIds: string[], 
    callback: (prices: Map<string, CoinPriceData>) => void
  ): () => void {
    
    this.subscribers.set(id, {
      id,
      coinIds,
      callback
    });
    
    // Enviar preços atuais imediatamente
    const currentPrices = this.getFilteredPrices(coinIds);
    if (currentPrices.size > 0) {
      callback(currentPrices);
    }
    
    // Retornar função de unsubscribe
    return () => {
      this.subscribers.delete(id);
    };
  }

  // ✨ NOTIFICAR SUBSCRIBERS (SILENCIOSO)
  private notifySubscribers(): void {
    this.subscribers.forEach((subscriber) => {
      const filteredPrices = this.getFilteredPrices(subscriber.coinIds);
      if (filteredPrices.size > 0) {
        subscriber.callback(filteredPrices);
      }
    });
  }

  // ✨ FILTRAR PREÇOS
  private getFilteredPrices(coinIds: string[]): Map<string, CoinPriceData> {
    const filtered = new Map<string, CoinPriceData>();
    
    coinIds.forEach(coinId => {
      const priceData = this.prices.get(coinId);
      if (priceData) {
        filtered.set(coinId, priceData);
      }
    });
    
    // Sempre incluir BRL se existir
    const brlData = this.prices.get('brl-token');
    if (brlData) {
      filtered.set('brl-token', brlData);
    }
    
    return filtered;
  }

  // ✨ RECONECTAR
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [WebSocket] Máximo de tentativas atingido');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 [WebSocket] Reconectando em ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.initializeConnections();
    }, delay);
  }

  // ✨ STATUS DO SERVIÇO
  public getStatus(): {
    isConnected: boolean;
    pricesCount: number;
    subscribersCount: number;
    lastUpdate: string;
    sources: string[];
  } {
    const sources = Array.from(this.prices.values()).map(p => p.source);
    const uniqueSources = [...new Set(sources)];
    
    const lastUpdate = Math.max(...Array.from(this.prices.values()).map(p => p.lastUpdated));
    
    return {
      isConnected: this.isConnected,
      pricesCount: this.prices.size,
      subscribersCount: this.subscribers.size,
      lastUpdate: lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Nunca',
      sources: uniqueSources
    };
  }

  // ✨ OBTER PREÇOS ATUAIS
  public getCurrentPrices(): Map<string, CoinPriceData> {
    return new Map(this.prices);
  }

  // ✨ FECHAR CONEXÕES
  public disconnect(): void {
    if (this.binanceWS) {
      this.binanceWS.close();
      this.binanceWS = null;
    }
    
    this.subscribers.clear();
    this.isConnected = false;
  }
}

export default RealtimePriceService;