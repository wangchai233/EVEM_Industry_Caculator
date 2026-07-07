### Task 4: 计算引擎

**Files:**
- Create: `src/engine/manufacturing.ts`, `src/engine/reverse.ts`, `src/engine/selling.ts`

**Interfaces:**
- Consumes: 类型定义 from Task 2, `getItemById` from `../data` (Task 3)
- Produces:
  - `calculateManufacturing(config, bp, decoder, getPrice)` → `ProductionResult`
  - `calculateReverse(config, revData, decoder, getPrice)` → ProductionResult + successRate + expectedCost
  - `calculateMarketSelling(config, costData)` → `SellingResult`
  - `calculateContractSelling(config, costData)` → `SellingResult`

NOTE: Task 3 hasn't run yet, so for now the engine imports from `../data` will cause build errors. CREATE the engine files with correct code, but understand that build will fail until Task 3 completes. Commit anyway.

- [ ] **Step 1: 写 `src/engine/manufacturing.ts`**

```typescript
import type { ManufacturingConfig, Blueprint, Decoder, ProductionResult, MaterialEntry } from '../types';
import { getItemById } from '../data';

type PriceGetter = (itemId: string) => number | null;

export function calculateManufacturing(
  config: ManufacturingConfig,
  bp: Blueprint,
  decoder: Decoder | undefined,
  getPrice: PriceGetter
): ProductionResult {
  const materials: ProductionResult['materials'] = [];
  let totalMaterialCost: number | null = 0;
  const effRuns = config.runs + (decoder?.runBonus ?? 0);

  const processMaterial = (entry: MaterialEntry, isBase: boolean) => {
    const item = getItemById(entry.itemId);
    const baseQty = entry.quantity;
    const adjustedQty = isBase ? baseQty : baseQty * config.materialEfficiency;
    const totalQty = adjustedQty * config.runs;
    const unitPrice = getPrice(entry.itemId);
    const subtotal = unitPrice !== null ? totalQty * unitPrice : null;

    if (subtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += subtotal;

    materials.push({
      itemId: entry.itemId,
      itemName: item?.name ?? entry.itemId,
      category: item?.category ?? 'mineral',
      baseQuantity: baseQty,
      adjustedQuantity: adjustedQty,
      totalQuantity: totalQty,
      unitPrice,
      subtotal,
      isBaseMaterial: isBase,
    });
  };

  processMaterial({ itemId: bp.id, quantity: 1 }, true);

  if (decoder && decoder.id !== 'decoder_none') {
    const decPrice = getPrice(decoder.id);
    const decQty = config.runs;
    const decSubtotal = decPrice !== null ? decPrice * decQty : null;
    if (decSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += decSubtotal;
    materials.push({
      itemId: decoder.id,
      itemName: decoder.name,
      category: 'decoder',
      baseQuantity: 1,
      adjustedQuantity: 1,
      totalQuantity: decQty,
      unitPrice: decPrice,
      subtotal: decSubtotal,
      isBaseMaterial: true,
    });
  }

  for (const entry of bp.materials) {
    processMaterial(entry, false);
  }

  const cashCost = bp.baseCost * config.runs;
  const totalTime = bp.baseTime * config.timeEfficiency * (decoder?.teBonus ?? 1.0);
  const productCount = bp.productQuantity * effRuns;

  const totalCost = totalMaterialCost !== null ? totalMaterialCost + cashCost : null;
  const costPerUnit = totalCost !== null ? totalCost / productCount : null;

  return {
    materials,
    totalMaterialCost,
    cashCost,
    totalTime,
    productCount,
    totalCost,
    costPerUnit,
  };
}
```

- [ ] **Step 2: 写 `src/engine/reverse.ts`**

```typescript
import type { ReverseEngineeringConfig, ReverseEngineeringData, Decoder, ProductionResult } from '../types';
import { getItemById } from '../data';

type PriceGetter = (itemId: string) => number | null;

export function calculateReverse(
  config: ReverseEngineeringConfig,
  revData: ReverseEngineeringData,
  decoder: Decoder | undefined,
  getPrice: PriceGetter
): ProductionResult & { successRate: number; expectedCost: number | null } {
  const materials: ProductionResult['materials'] = [];
  let totalMaterialCost: number | null = 0;

  const baseItem = getItemById(revData.baseItemId);
  const basePrice = getPrice(revData.baseItemId);
  const baseSubtotal = basePrice !== null ? basePrice * config.itemCount : null;
  if (baseSubtotal === null) totalMaterialCost = null;
  else if (totalMaterialCost !== null) totalMaterialCost += baseSubtotal;
  materials.push({
    itemId: revData.baseItemId,
    itemName: baseItem?.name ?? revData.baseItemId,
    category: 'damaged_structure',
    baseQuantity: config.itemCount,
    adjustedQuantity: config.itemCount,
    totalQuantity: config.itemCount,
    unitPrice: basePrice,
    subtotal: baseSubtotal,
    isBaseMaterial: true,
  });

  for (const dc of revData.dataCores) {
    const dcItem = getItemById(dc.itemId);
    const dcPrice = getPrice(dc.itemId);
    const dcSubtotal = dcPrice !== null ? dcPrice * dc.quantity : null;
    if (dcSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += dcSubtotal;
    materials.push({
      itemId: dc.itemId,
      itemName: dcItem?.name ?? dc.itemId,
      category: 'data_core',
      baseQuantity: dc.quantity,
      adjustedQuantity: dc.quantity,
      totalQuantity: dc.quantity,
      unitPrice: dcPrice,
      subtotal: dcSubtotal,
      isBaseMaterial: true,
    });
  }

  if (decoder && decoder.id !== 'decoder_none') {
    const decPrice = getPrice(decoder.id);
    const decSubtotal = decPrice !== null ? decPrice : null;
    if (decSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += decSubtotal;
    materials.push({
      itemId: decoder.id,
      itemName: decoder.name,
      category: 'decoder',
      baseQuantity: 1,
      adjustedQuantity: 1,
      totalQuantity: 1,
      unitPrice: decPrice,
      subtotal: decSubtotal,
      isBaseMaterial: true,
    });
  }

  const cashCost = revData.baseCost;
  const successRate = Math.min(config.itemCount * revData.successRatePerItem, 1.0);
  const totalTime = revData.baseTime * config.timeEfficiency * (decoder?.teBonus ?? 1.0);

  const singleCost = totalMaterialCost !== null ? totalMaterialCost + cashCost : null;
  const expectedCost = singleCost !== null ? singleCost / successRate : null;

  return {
    materials,
    totalMaterialCost,
    cashCost,
    totalTime,
    productCount: 1,
    totalCost: expectedCost,
    costPerUnit: expectedCost,
    successRate,
    expectedCost,
  };
}
```

- [ ] **Step 3: 写 `src/engine/selling.ts`**

```typescript
import type { MarketSellConfig, ContractSellConfig, SellingResult } from '../types';

interface CostInput {
  totalCost: number | null;
  costPerUnit: number | null;
  productCount: number;
}

export function calculateMarketSelling(config: MarketSellConfig, cost: CostInput): SellingResult {
  const brokerFeeRate = 0.01;
  let revenue: number;
  let brokerFee: number;
  let salesTax: number;

  if (config.immediateSell) {
    brokerFee = 0;
    salesTax = config.sellPrice * config.salesTaxRate * cost.productCount;
    revenue = config.sellPrice * cost.productCount - salesTax;
  } else {
    brokerFee = config.sellPrice * brokerFeeRate * cost.productCount;
    salesTax = config.sellPrice * config.salesTaxRate * cost.productCount;
    revenue = config.sellPrice * cost.productCount - brokerFee - salesTax;
  }

  const totalProfit = cost.totalCost !== null ? revenue - cost.totalCost : null;
  const profitMargin = totalProfit !== null && cost.totalCost !== null && cost.totalCost > 0
    ? (totalProfit / cost.totalCost) * 100 : null;
  const profitPerUnit = totalProfit !== null ? totalProfit / cost.productCount : null;

  return {
    mode: 'market',
    sellPrice: config.sellPrice,
    revenue,
    brokerFee,
    salesTax,
    deposit: 0,
    totalProfit,
    profitMargin,
    profitPerUnit,
  };
}

export function calculateContractSelling(config: ContractSellConfig, cost: CostInput): SellingResult {
  const brokerFeeRate = 0.04;
  const depositRate = 0.025;
  const totalSellPrice = config.sellPrice * cost.productCount;

  const brokerFee = Math.max(totalSellPrice * brokerFeeRate, 1000);
  const deposit = Math.max(totalSellPrice * depositRate, 10000);
  const revenue = totalSellPrice - brokerFee;

  const totalProfit = cost.totalCost !== null ? revenue - cost.totalCost : null;
  const profitMargin = totalProfit !== null && cost.totalCost !== null && cost.totalCost > 0
    ? (totalProfit / cost.totalCost) * 100 : null;
  const profitPerUnit = totalProfit !== null ? totalProfit / cost.productCount : null;

  return {
    mode: 'contract',
    sellPrice: config.sellPrice,
    revenue,
    brokerFee,
    salesTax: 0,
    deposit,
    totalProfit,
    profitMargin,
    profitPerUnit,
  };
}
```

- [ ] **Step 4: 验证** — `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npx tsc --noEmit` (NOTE: will have import errors from data module until Task 3 runs, but the engine code structure can be verified)

- [ ] **Step 5: 提交**

```bash
git add src/engine/
git commit -m "feat: add calculation engine (manufacturing, reverse, selling)"
```
