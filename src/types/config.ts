export interface ManufacturingConfig {
  blueprintId: string;
  runs: number;
  timeEfficiency: number; // 保留用户手动输入的时间效率（作为解码器之前的基准）
  decoderId?: string;
  customRuns: boolean; // true 表示用户自定义了 runs，不遵循 maxRuns
}

export interface ReverseEngineeringConfig {
  reverseId: string;
  itemCount: number;
  parallelRuns: number; // 并行流程数
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
