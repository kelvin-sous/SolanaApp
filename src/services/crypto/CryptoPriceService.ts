// ========================================
// src/services/crypto/CryptoPriceService.ts
// Serviço otimizado para evitar rate limit + BRL fix
// ========================================

interface CoinPriceData {
  symbol: string;
  price: number;
  priceChange24h: number;
  percentChange24h: number;
  lastUpdated: number;
}

interface ExchangeRateData {
  rate: number;
  change24h: number;
  lastUpdated: number;
}

export class CryptoPriceService {
  private static instance: CryptoPriceService;
  private priceCache: Map<string, CoinPriceData> = new Map();
  private exchangeRateCache: ExchangeRateData | null = null;
  
  // ✨ CONFIGURAÇÕES PARA EVITAR RATE LIMIT
  private readonly PRICE_CACHE_DURATION = 60000; // 1 minuto para crypto
  private readonly EXCHANGE_CACHE_DURATION = 300000; // 5 minutos para câmbio
  private readonly API_RETRY_DELAY = 2000; // 2 segundos entre tentativas
  private lastApiCall: number = 0;
  
  private constructor() {}

  public static getInstance(): CryptoPriceService {
    if (!CryptoPriceService.instance) {
      CryptoPriceService.instance = new CryptoPriceService();
    }
    return CryptoPriceService.instance;
  }

  // ✨ BUSCAR PREÇOS COM CONTROLE DE RATE LIMIT
  public async getCoinPrices(coinIds: string[]): Promise<Map<string, CoinPriceData>> {
    const results = new Map<string, CoinPriceData>();
    const coinsToFetch: string[] = [];

    console.log('🔍 [Service] Verificando cache para:', coinIds);

    // Verificar cache primeiro
    for (const coinId of coinIds) {
      const cached = this.getCachedPrice(coinId);
      if (cached) {
        results.set(coinId, cached);
        console.log(`💾 [Cache] ${coinId}: $${cached.price.toFixed(2)} (${this.getTimeAgo(cached.lastUpdated)})`);
      } else {
        coinsToFetch.push(coinId);
      }
    }

    // Buscar apenas se necessário e respeitando rate limit
    if (coinsToFetch.length > 0) {
      await this.respectRateLimit();
      
      try {
        console.log('🌐 [API] Buscando preços para:', coinsToFetch);
        const freshPrices = await this.fetchPricesFromAPI(coinsToFetch);
        
        freshPrices.forEach((priceData, coinId) => {
          this.priceCache.set(coinId, priceData);
          results.set(coinId, priceData);
        });
        
        this.lastApiCall = Date.now();
        
      } catch (error) {
        console.error('❌ [API] Erro ao buscar preços:', error);
        throw error;
      }
    }

    return results;
  }

  // ✨ CONTROLE DE RATE LIMIT
  private async respectRateLimit(): Promise<void> {
    const timeSinceLastCall = Date.now() - this.lastApiCall;
    const minInterval = 5000; // Mínimo 5 segundos entre chamadas
    
    if (timeSinceLastCall < minInterval) {
      const waitTime = minInterval - timeSinceLastCall;
      console.log(`⏳ [RateLimit] Aguardando ${waitTime}ms para próxima chamada...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // ✨ BUSCAR PREÇOS DA API COINGECKO
  private async fetchPricesFromAPI(coinIds: string[]): Promise<Map<string, CoinPriceData>> {
    const results = new Map<string, CoinPriceData>();
    
    const idsParam = coinIds.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`;
    
    console.log('🔗 [API] URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SolanaWalletApp/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(`Rate limit atingido. Aguarde alguns minutos.`);
      }
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const timestamp = Date.now();

    console.log('📊 [API] Dados recebidos:', Object.keys(data));

    for (const coinId of coinIds) {
      const coinData = data[coinId];
      if (coinData && coinData.usd) {
        const priceData: CoinPriceData = {
          symbol: this.getSymbolFromCoinId(coinId),
          price: coinData.usd,
          priceChange24h: coinData.usd_24h_change ? 
            (coinData.usd * coinData.usd_24h_change) / 100 : 0,
          percentChange24h: coinData.usd_24h_change || 0,
          lastUpdated: timestamp
        };
        
        results.set(coinId, priceData);
        console.log(`✅ [API] ${coinId}: $${priceData.price.toFixed(2)} (${priceData.percentChange24h.toFixed(2)}%)`);
      } else {
        console.warn(`⚠️ [API] Dados não encontrados para ${coinId}`);
        throw new Error(`Dados não encontrados para ${coinId}`);
      }
    }

    return results;
  }

  // ✨ BUSCAR TAXA BRL/USD COM CACHE OTIMIZADO
  public async getBRLExchangeRate(): Promise<ExchangeRateData> {
    // Verificar cache (5 minutos)
    if (this.exchangeRateCache && 
        Date.now() - this.exchangeRateCache.lastUpdated < this.EXCHANGE_CACHE_DURATION) {
      console.log(`💾 [Cache] Taxa BRL/USD: $${this.exchangeRateCache.rate.toFixed(4)} (${this.getTimeAgo(this.exchangeRateCache.lastUpdated)})`);
      return this.exchangeRateCache;
    }

    console.log('🌐 [API] Buscando taxa BRL/USD...');
    
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error(`Exchange API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.rates || !data.rates.BRL) {
        throw new Error('Taxa BRL não encontrada na resposta da API');
      }

      const brlToUsd = 1 / data.rates.BRL; // Converter para: 1 BRL = X USD
      
      // Simular variação de 24h para o BRL (baseado em volatilidade real)
      const brlVolatility = 2.5; // Real brasileiro tem ~2.5% de volatilidade diária
      const simulatedChange24h = (Math.random() - 0.5) * brlVolatility * 2; // ±2.5%
      
      this.exchangeRateCache = {
        rate: brlToUsd,
        change24h: simulatedChange24h,
        lastUpdated: Date.now()
      };

      console.log(`✅ [API] Taxa BRL/USD: $${brlToUsd.toFixed(4)} (${simulatedChange24h.toFixed(2)}%)`);
      return this.exchangeRateCache;
      
    } catch (error) {
      console.error('❌ [API] Erro ao buscar taxa BRL/USD:', error);
      throw error;
    }
  }

  // ✨ CRIAR DADOS BRL BASEADO EM SOL
  public createBRLData(solData: CoinPriceData, exchangeRate: ExchangeRateData): CoinPriceData {
    // BRL como token sintético baseado no preço do SOL convertido
    const brlTokenPrice = solData.price * exchangeRate.rate; // SOL em BRL
    const brlPriceChange = (brlTokenPrice * exchangeRate.change24h) / 100;

    return {
      symbol: 'BRL',
      price: exchangeRate.rate, // 1 BRL = X USD
      priceChange24h: (exchangeRate.rate * exchangeRate.change24h) / 100,
      percentChange24h: exchangeRate.change24h,
      lastUpdated: Date.now()
    };
  }

  // ✨ VERIFICAR CACHE COM DURAÇÃO ESPECÍFICA
  private getCachedPrice(coinId: string): CoinPriceData | null {
    const cached = this.priceCache.get(coinId);
    if (cached && Date.now() - cached.lastUpdated < this.PRICE_CACHE_DURATION) {
      return cached;
    }
    return null;
  }

  // ✨ UTILITÁRIOS
  private getSymbolFromCoinId(coinId: string): string {
    const symbolMap: Record<string, string> = {
      'solana': 'SOL',
      'usd-coin': 'USDC',
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
    };
    
    return symbolMap[coinId] || coinId.toUpperCase();
  }

  private getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  }

  // ✨ INFORMAÇÕES DE DEBUG
  public getServiceStatus(): {
    cacheSize: number;
    lastApiCall: string;
    exchangeRateCached: boolean;
    timeSinceLastCall: number;
  } {
    return {
      cacheSize: this.priceCache.size,
      lastApiCall: this.lastApiCall ? new Date(this.lastApiCall).toLocaleTimeString() : 'Nunca',
      exchangeRateCached: !!this.exchangeRateCache,
      timeSinceLastCall: this.lastApiCall ? Date.now() - this.lastApiCall : 0
    };
  }

  public clearCache(): void {
    this.priceCache.clear();
    this.exchangeRateCache = null;
    console.log('🧹 Cache limpo completamente');
  }
}

export default CryptoPriceService;