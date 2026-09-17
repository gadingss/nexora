import { MarketAsset, MarketStats, ChartDataPoint } from "@/lib/types";
import { unstable_cache } from "next/cache";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

const supportedAssets = {
  BTC: "bitcoin",
  ETH: "ethereum", 
  SOL: "solana",
  AAVE: "aave",
  UNI: "uniswap",
} as const;

type SupportedAssetKeys = keyof typeof supportedAssets;

interface CoinGeckoMarketResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank?: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_1h?: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_30d?: number;
}



interface CoinGeckoMarketChartResponse {
  prices: [number, number][];
}

export interface MarketServiceError {
  message: string;
  status: "error" | "rate_limit" | "not_found";
}

interface CoinGeckoDetailResponse {
  id: string;
  symbol: string;
  name: string;
  image?: { large?: string };
  market_cap_rank?: number;
  market_data?: {
    current_price?: { usd?: number };
    price_change_percentage_1h_in_currency?: { usd?: number };
    price_change_percentage_24h?: number;
    total_volume?: { usd?: number };
    market_cap?: { usd?: number };
  };
}

class MarketService {
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY;
  }

  async fetchMarketData(symbols: string[]): Promise<MarketAsset[]> {
    if (symbols.length === 0) {
      return [];
    }

    try {
      const ids = symbols.map(symbol => supportedAssets[symbol as SupportedAssetKeys]).filter(Boolean);
      const url = `${COINGECKO_BASE_URL}/coins/markets?ids=${ids.join(',')}&vs_currency=usd&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["x-cg-pro-api-key"] = this.apiKey;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        next: { revalidate: 30 },
      });

      if (response.status === 429) {
        throw { message: "Rate limit exceeded", status: "rate_limit" } as MarketServiceError;
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw { message: "Market data not found", status: "not_found" } as MarketServiceError;
        }
        throw { message: `Failed to fetch market data: ${response.status}`, status: "error" } as MarketServiceError;
      }

      const data: CoinGeckoMarketResponse[] = await response.json();
      return data.map(this.normalizeMarketAsset);

    } catch (error) {
      if (error instanceof Error) {
        console.error("MarketService error:", error);
        throw error;
      }
      console.error("MarketService unknown error:", error);
      throw { message: "Unknown error fetching market data", status: "error" } as MarketServiceError;
    }
  }

  async fetchTokenDetail(symbol: string): Promise<MarketAsset | null> {
    try {
      const id = supportedAssets[symbol as SupportedAssetKeys];
      if (!id) {
        throw { message: `Unsupported asset: ${symbol}`, status: "not_found" } as MarketServiceError;
      }

      const url = `${COINGECKO_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&sparkline=false`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["x-cg-pro-api-key"] = this.apiKey;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        next: { revalidate: 30 },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw { message: `Failed to fetch token detail: ${response.status}`, status: "error" } as MarketServiceError;
      }

      const data = await response.json();
      return this.normalizeTokenDetail(data);

    } catch (error) {
      console.error("Token detail error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw { message: "Unknown error fetching token detail", status: "error" } as MarketServiceError;
    }
  }

  private normalizeTokenDetail = (data: CoinGeckoDetailResponse): MarketAsset => {
    const md = data.market_data || {};
    return {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      image: data.image?.large,
      price: md.current_price?.usd ?? 0,
      change1h: md.price_change_percentage_1h_in_currency?.usd,
      change24h: md.price_change_percentage_24h ?? 0,
      changePercent24h: md.price_change_percentage_24h ?? 0,
      volume: md.total_volume?.usd ?? 0,
      marketCap: md.market_cap?.usd ?? 0,
      chain: this.inferChainFromId(data.id),
      rank: data.market_cap_rank,
      liquidity: undefined,
    };
  };

  async fetchMarketHistory(symbol: string, days: number = 1): Promise<ChartDataPoint[]> {
    try {
      const id = supportedAssets[symbol as SupportedAssetKeys];
      if (!id) {
        throw { message: `Unsupported asset: ${symbol}`, status: "not_found" } as MarketServiceError;
      }

      const url = `${COINGECKO_BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? "hourly" : "daily"}`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["x-cg-pro-api-key"] = this.apiKey;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        throw { message: `Failed to fetch market history: ${response.status}`, status: "error" } as MarketServiceError;
      }

      const data: CoinGeckoMarketChartResponse = await response.json();

      return data.prices.map(([timestamp, value]) => {
        const date = new Date(timestamp);
        let timeLabel = "";
        if (days <= 1) {
          timeLabel = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        } else if (days === 7) {
          timeLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else {
          timeLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }

        return { time: timeLabel, value: Math.round(value * 100) / 100 };
      });

    } catch (error) {
      console.error("Market history error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw { message: "Unknown error fetching market history", status: "error" } as MarketServiceError;
    }
  }

  private normalizeMarketAsset = (data: CoinGeckoMarketResponse): MarketAsset => {
    return {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      image: data.image,
      price: data.current_price,
      change1h: data.price_change_percentage_1h,
      change24h: data.price_change_percentage_24h,
      changePercent24h: data.price_change_percentage_24h,
      volume: data.total_volume,
      marketCap: data.market_cap,
      chain: this.inferChainFromId(data.id),
      rank: data.market_cap_rank,
      liquidity: undefined,
    };
  };

  private inferChainFromId = (id: string): string => {
    const chainMap: Record<string, string> = {
      bitcoin: "Bitcoin",
      ethereum: "Ethereum",
      solana: "Solana",
      aave: "Ethereum",
      uniswap: "Ethereum",
    };
    return chainMap[id] || "Unknown";
  };

  async fetchMarketStats(assets: MarketAsset[]): Promise<MarketStats> {
    const totalMarketCap = assets.reduce((sum, asset) => sum + (asset.marketCap || 0), 0);
    const totalVolume24h = assets.reduce((sum, asset) => sum + (asset.volume || 0), 0);

    const btcAsset = assets.find(a => a.symbol === "BTC");
    const btcDominance = btcAsset ? ((btcAsset.marketCap || 0) / (totalMarketCap || 1)) * 100 : 0;

    const totalMarketCapChange = assets.reduce((sum, asset) => sum + (asset.change24h || 0), 0) / assets.length || 0;
    const volume24hChange = 8.12;
    const btcDominanceChange = -0.42;
    const activeChains = assets.filter(a => a.chain !== "Unknown").length;
    const activeChainsChange = assets.filter(a => a.chain !== "Unknown").length;

    return {
      totalMarketCap,
      totalMarketCapChange,
      volume24h: totalVolume24h,
      volume24hChange,
      btcDominance,
      btcDominanceChange,
      activeChains,
      activeChainsChange,
    };
  }

  async fetchSupportedAssets(): Promise<string[]> {
    return Object.keys(supportedAssets);
  }
}

export const marketService = new MarketService();

export async function fetchMarketDataAction(symbols: string[]): Promise<MarketAsset[]> {
  return unstable_cache(
    async () => {
      return await marketService.fetchMarketData(symbols);
    },
    ["market-data", symbols.join(",")],
    {
      revalidate: 30,
      tags: ["market-data"],
    }
  )();
}

export async function fetchTokenDetailAction(symbol: string): Promise<MarketAsset | null> {
  return unstable_cache(
    async () => {
      return await marketService.fetchTokenDetail(symbol);
    },
    [`token-detail-${symbol}`],
    {
      revalidate: 30,
      tags: [`token-detail-${symbol}`],
    }
  )();
}

export async function fetchMarketHistoryAction(symbol: string, days: number = 1): Promise<ChartDataPoint[]> {
  return unstable_cache(
    async () => {
      return await marketService.fetchMarketHistory(symbol, days);
    },
    [`market-history-${symbol}-${days}`],
    {
      revalidate: 300,
      tags: [`market-history-${symbol}-${days}`],
    }
  )();
}
