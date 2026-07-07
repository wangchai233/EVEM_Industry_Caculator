export interface ManufacturingConfig {
  blueprintId: string;
  runs: number; // 流程数
  materialEfficiency: number; // 材料效率（如 1.50 = 150%）
  timeEfficiency: number; // 时间效率（如 1.00 = 100%）
  decoderId?: string;
}

export interface ReverseEngineeringConfig {
  reverseId: string;
  itemCount: number; // 用户选择的基底材料数量
  timeEfficiency: number;
  decoderId?: string;
}

export type SellMode = 'market' | 'contract';

export interface MarketSellConfig {
  mode: 'market';
  sellPrice: number; // 单件售价
  immediateSell: boolean; // 是否立即出售
  salesTaxRate: number; // 销售税率（如 0.20 = 20%）
}

export interface ContractSellConfig {
  mode: 'contract';
  sellPrice: number;
}

export type SellingConfig = MarketSellConfig | ContractSellConfig;
