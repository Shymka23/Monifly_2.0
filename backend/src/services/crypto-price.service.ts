import axios from "axios";
import { logger } from "../utils/logger";

interface CryptoPriceData {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export class CryptoPriceService {
  private static baseUrl =
    process.env.CRYPTO_API_URL || "https://api.coingecko.com/api/v3";
  private static cache: Map<
    string,
    { data: CryptoPriceData; timestamp: number }
  > = new Map();
  private static cacheDuration = 5 * 60 * 1000; // 5 minutes

  // Get price for single crypto
  static async getPrice(symbol: string): Promise<CryptoPriceData | null> {
    try {
      // Check cache
      const cached = this.cache.get(symbol.toLowerCase());
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }

      // Map common symbols to CoinGecko IDs
      const coinId = this.getCoinGeckoId(symbol);

      const response = await axios.get(
        `${this.baseUrl}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
      );

      const data: CryptoPriceData = {
        symbol: symbol.toUpperCase(),
        name: response.data.name,
        currentPrice: response.data.market_data.current_price.usd,
        priceChange24h: response.data.market_data.price_change_24h,
        priceChangePercentage24h:
          response.data.market_data.price_change_percentage_24h,
        marketCap: response.data.market_data.market_cap.usd,
        volume24h: response.data.market_data.total_volume.usd,
        high24h: response.data.market_data.high_24h.usd,
        low24h: response.data.market_data.low_24h.usd,
      };

      // Cache result
      this.cache.set(symbol.toLowerCase(), { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      logger.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  }

  // Get prices for multiple cryptos
  static async getPrices(
    symbols: string[]
  ): Promise<Record<string, CryptoPriceData>> {
    const prices: Record<string, CryptoPriceData> = {};

    await Promise.all(
      symbols.map(async symbol => {
        const price = await this.getPrice(symbol);
        if (price) {
          prices[symbol.toUpperCase()] = price;
        }
      })
    );

    return prices;
  }

  // Get top cryptos by market cap
  static async getTopCryptos(limit = 10): Promise<CryptoPriceData[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
      );

      return response.data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        currentPrice: coin.current_price,
        priceChange24h: coin.price_change_24h,
        priceChangePercentage24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
      }));
    } catch (error) {
      logger.error("Failed to fetch top cryptos:", error);
      return [];
    }
  }

  // Map symbol to CoinGecko ID
  private static getCoinGeckoId(symbol: string): string {
    const mapping: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      BNB: "binancecoin",
      XRP: "ripple",
      ADA: "cardano",
      DOGE: "dogecoin",
      SOL: "solana",
      DOT: "polkadot",
      MATIC: "matic-network",
      LTC: "litecoin",
      AVAX: "avalanche-2",
      LINK: "chainlink",
      UNI: "uniswap",
      ATOM: "cosmos",
      XLM: "stellar",
      ALGO: "algorand",
      VET: "vechain",
      FIL: "filecoin",
      TRX: "tron",
      ETC: "ethereum-classic",
    };

    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  // Clear cache
  static clearCache(): void {
    this.cache.clear();
  }
}
