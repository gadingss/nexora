export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change1h?: number;
  change24h: number;
  changePercent24h: number;
  volume: number;
  marketCap: number;
  chain: string;
  rank?: number;
  liquidity?: number;
}

export interface MarketStats {
  totalMarketCap: number;
  totalMarketCapChange: number;
  volume24h: number;
  volume24hChange: number;
  btcDominance: number;
  btcDominanceChange: number;
  activeChains: number;
  activeChainsChange: number;
}

export interface WalletActivity {
  address: string;
  type: "BUY" | "SELL";
  token: string;
  value: number;
  label: string;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export interface TokenDetail extends MarketAsset {
  description?: string;
  onChainActivity?: {
    activeWallets: number;
    transactions: number;
    whaleTransactions: number;
  };
  holders?: number;
  chartData: ChartDataPoint[];
}
