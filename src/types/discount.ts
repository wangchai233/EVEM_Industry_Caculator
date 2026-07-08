export interface DiscountRule {
  id: string;
  type: 'category' | 'item';
  targetId: string;    // 分类名（如 'mineral'）或物品 ID
  name: string;        // 显示名
  rate: number;        // 折扣率 0.8 = 8折
  scope: 'buy' | 'sell';
}
