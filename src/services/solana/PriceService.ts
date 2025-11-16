// src/services/solana/PriceService.ts

interface SolanaPrice {
  usd: number;
  usd_24h_change: number;
}

export class PriceService {
  private static readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  
  /**
   * Buscar preço atual da Solana em USD
   */
  static async getSolanaPrice(): Promise<SolanaPrice | null> {
    try {
      console.log('Buscando preço da Solana...');
      
      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar preço da Solana');
      }
      
      const data = await response.json();
      
      const price: SolanaPrice = {
        usd: data.solana.usd,
        usd_24h_change: data.solana.usd_24h_change
      };
      
      console.log(`Preço da Solana: $${price.usd} (${price.usd_24h_change > 0 ? '+' : ''}${price.usd_24h_change.toFixed(2)}%)`);
      
      return price;
    } catch (error) {
      console.error('Erro ao buscar preço da Solana:', error);
      return null;
    }
  }
  
  /**
   * Converter SOL para USD
   */
  static convertSolToUsd(solAmount: number, solPrice: number): number {
    return solAmount * solPrice;
  }
}