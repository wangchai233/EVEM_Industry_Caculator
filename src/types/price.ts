export interface PriceConfig {
  id: string;
  name: string;
  prices: Record<string, number>; // itemId → 单价
  updatedAt: string; // ISO string
}
