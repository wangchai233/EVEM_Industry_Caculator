export interface ProductionResult {
  materials: Array<{
    itemId: string;
    itemName: string;
    category: string;
    baseQuantity: number;
    adjustedQuantity: number; // 效率修正后
    totalQuantity: number; // ×流程数
    unitPrice: number | null; // null 表示未设价格
    subtotal: number | null;
    isBaseMaterial: boolean; // 基底材料或解码器不受效率影响
  }>;
  totalMaterialCost: number | null; // null 表示有材料未设价格
  cashCost: number; // 现金费用 = baseCost × runs
  totalTime: number; // 秒
  productCount: number; // 总产物数量
  totalCost: number | null;
  costPerUnit: number | null;
}

export interface SellingResult {
  mode: 'market' | 'contract';
  sellPrice: number;
  revenue: number; // 税后收入
  brokerFee: number;
  salesTax: number;
  deposit: number; // 仅合同，定金
  totalProfit: number | null;
  profitMargin: number | null; // 利润率百分比
  profitPerUnit: number | null;
}
