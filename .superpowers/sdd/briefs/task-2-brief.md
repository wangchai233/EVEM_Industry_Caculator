### Task 2: 核心类型定义

**Files:**
- Create: `src/types/item.ts`, `src/types/blueprint.ts`, `src/types/config.ts`, `src/types/price.ts`, `src/types/result.ts`, `src/types/index.ts`

**Interfaces:**
- Consumes: 无外部依赖
- Produces: Item, MaterialEntry, ItemCategory, Blueprint, Decoder, ReverseEngineeringData, ManufacturingConfig, ReverseEngineeringConfig, SellingConfig, MarketSellConfig, ContractSellConfig, SellMode, PriceConfig, ProductionResult, SellingResult

- [ ] **Step 1: 写 `src/types/item.ts`**

```typescript
export type ItemCategory =
  | 'mineral'
  | 'planetary'
  | 'data_core'
  | 'decoder'
  | 'blueprint'
  | 'damaged_structure'
  | 'product'
  | 'isk';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  icon?: string;
}

export interface MaterialEntry {
  itemId: string;
  quantity: number; // 原始基准数量
}
```

- [ ] **Step 2: 写 `src/types/blueprint.ts`**

```typescript
import type { Item, MaterialEntry } from './item';

export interface Blueprint {
  id: string;
  name: string;
  productItemId: string;
  productName: string;
  productQuantity: number; // 单流程产出数量
  baseTime: number; // 秒
  baseCost: number; // ISK 现金费用（单流程）
  materials: MaterialEntry[]; // 原始基准材料（不含蓝图本身）
  maxRuns: number; // 最大流程数
}

export interface Decoder extends Item {
  category: 'decoder';
  meBonus: number;   // 材料效率乘算，默认 1.0（<1 表示减耗）
  teBonus: number;   // 时间效率乘算，默认 1.0（<1 表示加速）
  runBonus: number;  // 额外增加的流程数，默认 0
}

export interface ReverseEngineeringData {
  id: string;
  name: string;
  targetBlueprintId: string; // 成功后获得的蓝图 ID
  baseItemId: string; // 基底材料 ID
  baseItemName: string;
  maxItemCount: number; // 最大基底材料数量（上限）
  successRatePerItem: number; // 每单位材料的成功率（如 0.10 表示 10%）
  baseTime: number; // 秒
  baseCost: number; // ISK
  dataCores: MaterialEntry[]; // 所需数据核心
}
```

- [ ] **Step 3: 写 `src/types/config.ts`**

```typescript
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
```

- [ ] **Step 4: 写 `src/types/price.ts`**

```typescript
export interface PriceConfig {
  id: string;
  name: string;
  prices: Record<string, number>; // itemId → 单价
  updatedAt: string; // ISO string
}
```

- [ ] **Step 5: 写 `src/types/result.ts`**

```typescript
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
```

- [ ] **Step 6: 写 `src/types/index.ts`**

```typescript
export * from './item';
export * from './blueprint';
export * from './config';
export * from './price';
export * from './result';
```

- [ ] **Step 7: 验证** — `npm run build` 应无类型错误（需要 `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force;` 前缀）

- [ ] **Step 8: 提交**

```bash
git add src/types/
git commit -m "feat: add core type definitions"
```
