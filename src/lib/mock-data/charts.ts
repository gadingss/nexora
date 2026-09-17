import { ChartDataPoint } from "@/lib/types";

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateChartData(count: number, basePrice: number, volatility: number, seedBase: number): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let price = basePrice;
  for (let i = 0; i < count; i++) {
    const r = seededRandom(seedBase + i * 9973);
    const change = (r - 0.45) * volatility;
    price = price + change;
    const hour = i % 24;
    data.push({
      time: `${String(hour).padStart(2, "0")}:00`,
      value: Math.round(price * 100) / 100,
    });
  }
  return data;
}

export const BTC_CHART_1D = generateChartData(24, 102000, 500, 1);
export const ETH_CHART_1D = generateChartData(24, 3800, 40, 2);
export const SOL_CHART_1D = generateChartData(24, 175, 3, 3);
export const AAVE_CHART_1D = generateChartData(24, 230, 4, 4);
export const UNI_CHART_1D = generateChartData(24, 11.5, 0.3, 5);

export const TOKEN_CHARTS: Record<string, ChartDataPoint[]> = {
  BTC: BTC_CHART_1D,
  ETH: ETH_CHART_1D,
  SOL: SOL_CHART_1D,
  AAVE: AAVE_CHART_1D,
  UNI: UNI_CHART_1D,
};

export const MARKET_CHART_DATA = BTC_CHART_1D;
