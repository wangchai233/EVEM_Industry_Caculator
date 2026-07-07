# EVEM 工业计算器 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个完全离线的 EVEM 工业利润计算网页应用，支持制造/逆向工程成本计算和市场/合同出售利润估算。

**Architecture:** React 18 + TypeScript + Vite 单页应用。通过 React Context + useReducer 管理状态，纯函数引擎处理计算逻辑，CSS Modules 做样式隔离。PC 端左右双面板布局，移动端上下自适应。

**Tech Stack:** React 18, TypeScript 5, Vite 5, KaTeX, CSS Modules, localStorage

## Global Constraints

- 完全离线，无任何网络依赖
- 所有金额使用千位分隔符
- 时间格式 hh:mm:ss（长耗时 MM:dd:hh:mm:ss）
- 公式使用 LaTeX 语法渲染
- PC 优先，移动端适配
- 材料效率范围 75%~150%
- 基底材料和解码器不受材料效率影响
- 解码器 runBonus 增加产物数量

---

## File Structure

```
src/
├── types/           # 所有类型定义
│   ├── item.ts      # Item, MaterialEntry, ItemCategory
│   ├── blueprint.ts # Blueprint, Decoder, ReverseEngineeringData
│   ├── config.ts    # ManufacturingConfig, ReverseEngineeringConfig, SellingConfig
│   ├── price.ts     # PriceConfig
│   ├── result.ts    # ProductionResult, SellingResult
│   └── index.ts     # re-export all
├── data/            # 内置默认数据
│   ├── items.ts     # 物品库
│   ├── blueprints.ts # 制造蓝图
│   ├── reverse.ts   # 逆向工程配置
│   └── index.ts     # 组装导出 + 便捷查询
├── engine/          # 纯函数计算引擎
│   ├── manufacturing.ts
│   ├── reverse.ts
│   └── selling.ts
├── state/           # React Context 状态管理
│   ├── AppContext.tsx
│   ├── ProductionContext.tsx
│   ├── SellingContext.tsx
│   └── useLocalStorage.ts
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── Header.module.css
│   ├── ProductionPanel/
│   │   ├── ProductionPanel.tsx
│   │   ├── ProductionPanel.module.css
│   │   ├── ProjectTypeTabs.tsx
│   │   ├── ProductSelector.tsx
│   │   ├── EfficiencyConfig.tsx
│   │   ├── DecoderSelector.tsx
│   │   ├── MaterialList.tsx
│   │   ├── ProductionSummary.tsx
│   │   └── ReverseExtras.tsx
│   ├── SellingPanel/
│   │   ├── SellingPanel.tsx
│   │   ├── SellingPanel.module.css
│   │   ├── SellModeTabs.tsx
│   │   ├── MarketSellConfig.tsx
│   │   ├── ContractSellConfig.tsx
│   │   └── ProfitSummary.tsx
│   ├── PriceConfigModal/
│   │   ├── PriceConfigModal.tsx
│   │   └── PriceConfigModal.module.css
│   ├── ImportExportBar/
│   │   ├── ImportExportBar.tsx
│   │   └── ImportExportBar.module.css
│   └── Formula/
│       └── Formula.tsx          # LaTeX 渲染组件
├── utils/
│   ├── format.ts    # formatNumber, formatTime
│   └── validation.ts
├── App.tsx
├── App.module.css
├── main.tsx
└── index.css        # 全局样式 & CSS 变量
```

---

### Task 1: 项目初始化

**Files:**
- Create: 项目根目录 `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`

**Interfaces:**
- Produces: 可启动的开发服务器，Vite + React + TypeScript 模板

- [ ] **Step 1: 使用 Vite 创建项目**

```bash
cd d:\Trae_Projects\EVEM_Industry_Calc
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: 安装额外依赖**

```bash
npm install katex
npm install -D @types/katex
```

- [ ] **Step 3: 验证项目能启动**

```bash
npm run dev
```

Expected: 开发服务器启动在 localhost，浏览器打开显示 Vite + React 默认页面。

- [ ] **Step 4: 清理默认文件，保留基本结构**

删除 `src/App.css`，清理 `src/App.tsx` 为简单组件。

```tsx
// src/App.tsx
function App() {
  return <div className="app">EVEM 工业计算器</div>;
}
export default App;
```

```css
/* src/index.css */
:root {
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-border: #30363d;
  --color-text: #c9d1d9;
  --color-text-secondary: #8b949e;
  --color-primary: #58a6ff;
  --color-warning: #d2991d;
  --color-danger: #f85149;
  --color-success: #3fb950;
  --font-mono: 'SF Mono', 'Consolas', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --radius: 6px;
  --gap: 12px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
}
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "chore: init Vite + React + TypeScript project"
```

---

### Task 2: 核心类型定义

**Files:**
- Create: `src/types/item.ts`, `src/types/blueprint.ts`, `src/types/config.ts`, `src/types/price.ts`, `src/types/result.ts`, `src/types/index.ts`

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
  baseItemId: string; // 基底材料 ID（受损结构等）
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

- [ ] **Step 7: 验证** — `npm run build` 应无类型错误

- [ ] **Step 8: 提交**

```bash
git add src/types/
git commit -m "feat: add core type definitions"
```

---

### Task 3: 内置默认数据

**Files:**
- Create: `src/data/items.ts`, `src/data/blueprints.ts`, `src/data/reverse.ts`, `src/data/index.ts`

**Interfaces:**
- Consumes: `src/types/` 中的 Item, Blueprint, Decoder, ReverseEngineeringData, MaterialEntry
- Produces: `defaultItems`, `defaultBlueprints`, `defaultReverse`, `defaultDecoders` 导出数组；`getItemById`, `getBlueprintById` 查询函数

- [ ] **Step 1: 写 `src/data/items.ts`** — 内置物品库（15-20个物品）

```typescript
import type { Item, Decoder } from '../types';

export const defaultItems: Item[] = [
  // 矿物
  { id: 'tritanium', name: '三钛合金', category: 'mineral' },
  { id: 'pyerite', name: '类晶体胶矿', category: 'mineral' },
  { id: 'mexallon', name: '类银超金属', category: 'mineral' },
  { id: 'isogen', name: '同位聚合体', category: 'mineral' },
  { id: 'nocxium', name: '超新星诺克石', category: 'mineral' },
  { id: 'zydrine', name: '晶状石英核岩', category: 'mineral' },
  { id: 'megacyte', name: '超噬矿', category: 'mineral' },
  // 行星材料
  { id: 'reactive_metals', name: '活性金属', category: 'planetary' },
  { id: 'noble_metals', name: '贵金属', category: 'planetary' },
  { id: 'precious_alloys', name: '珍稀合金', category: 'planetary' },
  // 数据核心
  { id: 'data_core_ship', name: '舰船数据核心', category: 'data_core' },
  { id: 'data_core_module', name: '装备数据核心', category: 'data_core' },
  // 基底材料
  { id: 'damaged_bs_structure', name: '受损战列舰结构', category: 'damaged_structure' },
  { id: 'damaged_cr_structure', name: '受损巡洋舰结构', category: 'damaged_structure' },
  // ISK
  { id: 'isk', name: 'ISK（星币）', category: 'isk' },
];

export const defaultDecoders: Decoder[] = [
  {
    id: 'decoder_none', name: '无解码器', category: 'decoder',
    meBonus: 1.0, teBonus: 1.0, runBonus: 0,
  },
  {
    id: 'decoder_me_1', name: '材料优化解码器 I',
    category: 'decoder',
    meBonus: 0.98, teBonus: 1.0, runBonus: 0,
  },
  {
    id: 'decoder_run_1', name: '增产解码器 I',
    category: 'decoder',
    meBonus: 1.0, teBonus: 1.0, runBonus: 1,
  },
];
```

- [ ] **Step 2: 写 `src/data/blueprints.ts`** — 2-3 个制造蓝图

```typescript
import type { Blueprint } from '../types';

export const defaultBlueprints: Blueprint[] = [
  {
    id: 'bp_t9_bs',
    name: 'T9 战列舰蓝图',
    productItemId: 't9_battleship',
    productName: 'T9 战列舰',
    productQuantity: 1,
    baseTime: 86400, // 24小时 = 86400秒（示例值）
    baseCost: 50000000, // 50M ISK
    maxRuns: 10,
    materials: [
      { itemId: 'tritanium', quantity: 5000000 },
      { itemId: 'pyerite', quantity: 2000000 },
      { itemId: 'mexallon', quantity: 500000 },
      { itemId: 'isogen', quantity: 100000 },
      { itemId: 'nocxium', quantity: 20000 },
      { itemId: 'zydrine', quantity: 5000 },
      { itemId: 'megacyte', quantity: 1000 },
      { itemId: 'reactive_metals', quantity: 500 },
      { itemId: 'noble_metals', quantity: 300 },
      { itemId: 'precious_alloys', quantity: 200 },
    ],
  },
  {
    id: 'bp_t8_cruiser',
    name: 'T8 巡洋舰蓝图',
    productItemId: 't8_cruiser',
    productName: 'T8 巡洋舰',
    productQuantity: 1,
    baseTime: 43200,
    baseCost: 10000000,
    maxRuns: 10,
    materials: [
      { itemId: 'tritanium', quantity: 2000000 },
      { itemId: 'pyerite', quantity: 800000 },
      { itemId: 'mexallon', quantity: 200000 },
      { itemId: 'isogen', quantity: 40000 },
      { itemId: 'nocxium', quantity: 8000 },
      { itemId: 'reactive_metals', quantity: 200 },
      { itemId: 'noble_metals', quantity: 120 },
    ],
  },
];

// 蓝图对应的产品物品（供出售面板使用）
export const blueprintProducts: Array<{ id: string; name: string; category: 'product' }> = [
  { id: 't9_battleship', name: 'T9 战列舰', category: 'product' },
  { id: 't8_cruiser', name: 'T8 巡洋舰', category: 'product' },
];
```

- [ ] **Step 3: 写 `src/data/reverse.ts`** — 1-2 个逆向工程配置

```typescript
import type { ReverseEngineeringData } from '../types';

export const defaultReverse: ReverseEngineeringData[] = [
  {
    id: 'rev_t9_bs',
    name: 'T9 战列舰逆向工程',
    targetBlueprintId: 'bp_t9_bs',
    baseItemId: 'damaged_bs_structure',
    baseItemName: '受损战列舰结构',
    maxItemCount: 5,
    successRatePerItem: 0.10, // 每单位 10%
    baseTime: 3600,
    baseCost: 1000000,
    dataCores: [
      { itemId: 'data_core_ship', quantity: 10 },
    ],
  },
  {
    id: 'rev_t8_cruiser',
    name: 'T8 巡洋舰逆向工程',
    targetBlueprintId: 'bp_t8_cruiser',
    baseItemId: 'damaged_cr_structure',
    baseItemName: '受损巡洋舰结构',
    maxItemCount: 5,
    successRatePerItem: 0.10,
    baseTime: 1800,
    baseCost: 500000,
    dataCores: [
      { itemId: 'data_core_ship', quantity: 5 },
    ],
  },
];
```

- [ ] **Step 4: 写 `src/data/index.ts`** — 查询工具和组装导出

```typescript
import { defaultItems, defaultDecoders } from './items';
import { defaultBlueprints, blueprintProducts } from './blueprints';
import { defaultReverse } from './reverse';
import type { Item, Blueprint, Decoder, ReverseEngineeringData } from '../types';

// 合并所有物品（含蓝图对应的产品）
const allItems: Item[] = [...defaultItems, ...defaultDecoders, ...blueprintProducts];

const itemMap = new Map(allItems.map(i => [i.id, i]));
const bpMap = new Map(defaultBlueprints.map(b => [b.id, b]));
const revMap = new Map(defaultReverse.map(r => [r.id, r]));
const decoderMap = new Map(defaultDecoders.map(d => [d.id, d]));

export function getItemById(id: string): Item | undefined {
  return itemMap.get(id);
}

export function getBlueprintById(id: string): Blueprint | undefined {
  return bpMap.get(id);
}

export function getReverseById(id: string): ReverseEngineeringData | undefined {
  return revMap.get(id);
}

export function getDecoderById(id: string): Decoder | undefined {
  return decoderMap.get(id);
}

export { defaultItems, defaultDecoders, defaultBlueprints, blueprintProducts, defaultReverse, allItems };
```

- [ ] **Step 5: 验证** — `npx tsc --noEmit`

- [ ] **Step 6: 提交**

```bash
git add src/data/
git commit -m "feat: add built-in demo data (3-5 products)"
```

---

### Task 4: 计算引擎

**Files:**
- Create: `src/engine/manufacturing.ts`, `src/engine/reverse.ts`, `src/engine/selling.ts`

**Interfaces:**
- Consumes: 类型定义、查询函数
- Produces:
  - `calculateManufacturing(config, bp, decoder, getPrice)` → `ProductionResult`
  - `calculateReverse(config, revData, decoder, getPrice)` → `ProductionResult`
  - `calculateMarketSelling(config, costData)` → `SellingResult`
  - `calculateContractSelling(config, costData)` → `SellingResult`

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

  // 处理每种材料
  const processMaterial = (entry: MaterialEntry, isBase: boolean) => {
    const item = getItemById(entry.itemId);
    const baseQty = entry.quantity;
    // 基底材料不受材料效率影响，解码器也不受
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

  // 蓝图作为基底材料（自身消耗）
  processMaterial({ itemId: bp.id, quantity: 1 }, true);

  // 解码器作为基底材料
  if (decoder && decoder.id !== 'decoder_none') {
    // 解码器自身也是材料，消耗 1 个/流程
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

  // 普通制造材料
  for (const entry of bp.materials) {
    processMaterial(entry, false);
  }

  const cashCost = bp.baseCost * config.runs;
  // 材料效率应用于时间：使用 decoder 的 teBonus
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

  // 基底材料
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

  // 数据核心
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

  // 解码器
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
    totalCost: expectedCost, // 期望成本作为总成本
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
    // 立即出售：只扣销售税，不扣中介费
    brokerFee = 0;
    salesTax = config.sellPrice * config.salesTaxRate * cost.productCount;
    // 注意：实际游戏中有"匹配"条件，在 UI 层提示
    revenue = config.sellPrice * cost.productCount - salesTax;
  } else {
    // 挂单：扣中介费 + 销售税
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
  // 定金成交后退还，不扣减收入
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

- [ ] **Step 4: 验证**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: 提交**

```bash
git add src/engine/
git commit -m "feat: add calculation engine (manufacturing, reverse, selling)"
```

---

### Task 5: 格式化工具函数

**Files:**
- Create: `src/utils/format.ts`, `src/utils/validation.ts`

**Interfaces:**
- Consumes: 无外部依赖
- Produces:
  - `formatNumber(n: number): string` — 千位分隔符
  - `formatTime(seconds: number): string` — hh:mm:ss
  - `validateEfficiency(v: number, min: number, max: number): string | null` — 返回错误信息或 null

- [ ] **Step 1: 写 `src/utils/format.ts`**

```typescript
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return n.toString();
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const s = Math.floor(totalSeconds);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (days > 0) {
    return `${String(days).padStart(2, '0')}:${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
```

- [ ] **Step 2: 写 `src/utils/validation.ts`**

```typescript
export function validateEfficiency(value: number, min: number, max: number): string | null {
  if (value < min) return `不能低于 ${min * 100}%`;
  if (value > max) return `不能超过 ${max * 100}%`;
  return null;
}

export function validatePositive(value: number, label: string): string | null {
  if (value <= 0) return `${label}必须大于 0`;
  return null;
}

export function validateRuns(value: number, max: number): string | null {
  if (value < 1) return '流程数最少为 1';
  if (value > max) return `流程数最多为 ${max}`;
  return null;
}
```

- [ ] **Step 3: 验证** — `npx tsc --noEmit`

- [ ] **Step 4: 提交**

```bash
git add src/utils/
git commit -m "feat: add number/time formatting and validation utils"
```

---

### Task 6: 状态管理

**Files:**
- Create: `src/state/useLocalStorage.ts`, `src/state/AppContext.tsx`, `src/state/ProductionContext.tsx`, `src/state/SellingContext.tsx`

**Interfaces:**
- Consumes: type definitions, data index
- Produces:
  - `useLocalStorage<T>(key, initial)` → `[T, setter]`
  - `AppProvider` — 包裹全局状态
  - `ProductionProvider` — 包裹生产面板状态
  - `SellingProvider` — 包裹出售面板状态

- [ ] **Step 1: 写 `src/state/useLocalStorage.ts`**

```typescript
import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const next = value instanceof Function ? value(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // localStorage 满
      }
      return next;
    });
  }, [key]);

  return [storedValue, setValue];
}
```

- [ ] **Step 2: 写 `src/state/AppContext.tsx`**

```typescript
import React, { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { PriceConfig } from '../types';
import { defaultItems, allItems, defaultBlueprints, defaultReverse, defaultDecoders } from '../data';

interface AppState {
  priceConfigs: PriceConfig[];
  activeConfigId: string;
  customItems: typeof defaultItems;
  customBlueprints: typeof defaultBlueprints;
  customReverse: typeof defaultReverse;
  customDecoders: typeof defaultDecoders;
}

interface AppContextType extends AppState {
  getPrice: (itemId: string) => number | null;
  setPrice: (itemId: string, price: number) => void;
  createPriceConfig: (name: string) => void;
  deletePriceConfig: (id: string) => void;
  renamePriceConfig: (id: string, name: string) => void;
  switchConfig: (id: string) => void;
  getAllData: () => object;
  importData: (data: object) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const defaultConfig: PriceConfig = {
  id: 'default',
  name: '默认价格',
  prices: {},
  updatedAt: new Date().toISOString(),
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useLocalStorage<PriceConfig[]>('evem_price_configs', [defaultConfig]);
  const [activeId, setActiveId] = useLocalStorage<string>('evem_active_config', 'default');

  const activeConfig = configs.find(c => c.id === activeId) ?? configs[0];

  const getPrice = useCallback((itemId: string): number | null => {
    if (itemId === 'isk') return 1; // ISK 本身价值 1
    const price = activeConfig?.prices[itemId];
    return price !== undefined ? price : null;
  }, [activeConfig]);

  const setPrice = useCallback((itemId: string, price: number) => {
    setConfigs(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      return { ...c, prices: { ...c.prices, [itemId]: price }, updatedAt: new Date().toISOString() };
    }));
  }, [activeId, setConfigs]);

  const createPriceConfig = useCallback((name: string) => {
    const newConfig: PriceConfig = {
      id: Date.now().toString(36),
      name,
      prices: {},
      updatedAt: new Date().toISOString(),
    };
    setConfigs(prev => [...prev, newConfig]);
    setActiveId(newConfig.id);
  }, [setConfigs, setActiveId]);

  const deletePriceConfig = useCallback((id: string) => {
    setConfigs(prev => {
      const next = prev.filter(c => c.id !== id);
      return next.length === 0 ? [defaultConfig] : next;
    });
    if (id === activeId) setActiveId('default');
  }, [activeId, setConfigs, setActiveId]);

  const renamePriceConfig = useCallback((id: string, name: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }, [setConfigs]);

  const switchConfig = useCallback((id: string) => setActiveId(id), [setActiveId]);

  const getAllData = useCallback(() => ({
    version: 1,
    items: allItems,
    blueprints: defaultBlueprints,
    reverse: defaultReverse,
    decoders: defaultDecoders,
    priceConfigs: configs,
  }), [configs]);

  const importData = useCallback((data: any) => {
    if (data?.priceConfigs) setConfigs(data.priceConfigs);
    if (data?.activeConfigId) setActiveId(data.activeConfigId);
  }, [setConfigs, setActiveId]);

  return (
    <AppContext.Provider value={{
      priceConfigs: configs, activeConfigId: activeId,
      customItems: defaultItems, customBlueprints: defaultBlueprints,
      customReverse: defaultReverse, customDecoders: defaultDecoders,
      getPrice, setPrice, createPriceConfig, deletePriceConfig,
      renamePriceConfig, switchConfig, getAllData, importData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
```

- [ ] **Step 3: 写 `src/state/ProductionContext.tsx`**

```typescript
import React, { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { ManufacturingConfig, ReverseEngineeringConfig, ProductionResult } from '../types';

type ProjectType = 'manufacturing' | 'reverse';

interface ProductionState {
  projectType: ProjectType;
  manufacturing: ManufacturingConfig;
  reverse: ReverseEngineeringConfig;
  result: (ProductionResult & { successRate?: number; expectedCost?: number | null }) | null;
}

type Action =
  | { type: 'SET_PROJECT_TYPE'; payload: ProjectType }
  | { type: 'SET_MANUFACTURING'; payload: Partial<ManufacturingConfig> }
  | { type: 'SET_REVERSE'; payload: Partial<ReverseEngineeringConfig> }
  | { type: 'SET_RESULT'; payload: ProductionState['result'] };

const initialState: ProductionState = {
  projectType: 'manufacturing',
  manufacturing: {
    blueprintId: '',
    runs: 1,
    materialEfficiency: 1.5,
    timeEfficiency: 1.0,
  },
  reverse: {
    reverseId: '',
    itemCount: 1,
    timeEfficiency: 1.0,
  },
  result: null,
};

function reducer(state: ProductionState, action: Action): ProductionState {
  switch (action.type) {
    case 'SET_PROJECT_TYPE':
      return { ...state, projectType: action.payload, result: null };
    case 'SET_MANUFACTURING':
      return { ...state, manufacturing: { ...state.manufacturing, ...action.payload } };
    case 'SET_REVERSE':
      return { ...state, reverse: { ...state.reverse, ...action.payload } };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    default:
      return state;
  }
}

const ProductionContext = createContext<{
  state: ProductionState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function ProductionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <ProductionContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const ctx = useContext(ProductionContext);
  if (!ctx) throw new Error('useProduction must be used within ProductionProvider');
  return ctx;
}
```

- [ ] **Step 4: 写 `src/state/SellingContext.tsx`**

```typescript
import React, { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { SellingConfig, SellingResult } from '../types';

interface SellingState {
  config: SellingConfig;
  result: SellingResult | null;
  costData: { totalCost: number | null; costPerUnit: number | null; productCount: number } | null;
}

type Action =
  | { type: 'SET_CONFIG'; payload: SellingConfig }
  | { type: 'SET_RESULT'; payload: SellingResult | null }
  | { type: 'SET_COST_DATA'; payload: SellingState['costData'] };

const initialState: SellingState = {
  config: { mode: 'market', sellPrice: 0, immediateSell: false, salesTaxRate: 0.20 },
  result: null,
  costData: null,
};

function reducer(state: SellingState, action: Action): SellingState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'SET_COST_DATA':
      return { ...state, costData: action.payload };
    default:
      return state;
  }
}

const SellingContext = createContext<{
  state: SellingState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function SellingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <SellingContext.Provider value={{ state, dispatch }}>
      {children}
    </SellingContext.Provider>
  );
}

export function useSelling() {
  const ctx = useContext(SellingContext);
  if (!ctx) throw new Error('useSelling must be used within SellingProvider');
  return ctx;
}
```

- [ ] **Step 5: 验证** — `npx tsc --noEmit`

- [ ] **Step 6: 提交**

```bash
git add src/state/
git commit -m "feat: add state management (AppContext, ProductionContext, SellingContext)"
```

---

### Task 7: LaTeX 公式组件 & 通用组件

**Files:**
- Create: `src/components/Formula/Formula.tsx`

**Interfaces:**
- Produces: `<Formula latex={string} />` — 渲染 KaTeX 公式

- [ ] **Step 1: 写 `src/components/Formula/Formula.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaProps {
  latex: string;
  displayMode?: boolean;
}

export function Formula({ latex, displayMode = false }: FormulaProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, {
        displayMode,
        throwOnError: false,
      });
    }
  }, [latex, displayMode]);

  return <span ref={ref} />;
}
```

- [ ] **Step 2: 验证** — `npx tsc --noEmit`

- [ ] **Step 3: 提交**

```bash
git add src/components/Formula/
git commit -m "feat: add KaTeX formula rendering component"
```

---

### Task 8: 布局框架 + Header + 导入导出栏

**Files:**
- Create: `src/App.tsx`（更新）, `src/App.module.css`
- Create: `src/components/Header/Header.tsx`, `src/components/Header/Header.module.css`
- Create: `src/components/ImportExportBar/ImportExportBar.tsx`, `src/components/ImportExportBar/ImportExportBar.module.css`

- [ ] **Step 1: 写 `src/components/Header/Header.tsx`**

```tsx
import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import styles from './Header.module.css';

export function Header() {
  const { priceConfigs, activeConfigId, switchConfig, createPriceConfig, renamePriceConfig, deletePriceConfig } = useApp();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const activeConfig = priceConfigs.find(c => c.id === activeConfigId);

  const handleCreate = () => {
    if (newName.trim()) {
      createPriceConfig(newName.trim());
      setNewName('');
      setShowConfigModal(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renamePriceConfig(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>EVEM 工业计算器</h1>
      <div className={styles.configArea}>
        <label>价格方案：</label>
        <select
          value={activeConfigId}
          onChange={e => switchConfig(e.target.value)}
          className={styles.select}
        >
          {priceConfigs.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          className={styles.btn}
          onClick={() => setShowConfigModal(!showConfigModal)}
        >
          管理
        </button>
      </div>

      {showConfigModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>价格方案管理</h3>
            <div className={styles.configList}>
              {priceConfigs.map(c => (
                <div key={c.id} className={styles.configItem}>
                  {editingId === c.id ? (
                    <>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={() => handleRename(c.id)}
                        onKeyDown={e => e.key === 'Enter' && handleRename(c.id)}
                        autoFocus
                      />
                    </>
                  ) : (
                    <span className={c.id === activeConfigId ? styles.active : ''}>
                      {c.name}
                    </span>
                  )}
                  <div className={styles.configActions}>
                    <button onClick={() => { setEditingId(c.id); setEditName(c.name); }}>重命名</button>
                    {c.id !== 'default' && (
                      <button onClick={() => deletePriceConfig(c.id)}>删除</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.newConfig}>
              <input
                placeholder="新方案名称"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <button onClick={handleCreate}>创建</button>
            </div>
            <button onClick={() => setShowConfigModal(false)}>关闭</button>
          </div>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: 写 `src/components/Header/Header.module.css`**

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
  gap: 8px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

.configArea {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 4px 8px;
  font-size: 13px;
}

.btn {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 4px 12px;
  cursor: pointer;
  font-size: 13px;
}
.btn:hover { background: var(--color-bg); }

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modalContent {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 20px;
  min-width: 360px;
  max-width: 90vw;
}

.modalContent h3 { margin-bottom: 12px; }

.configList { margin-bottom: 12px; }

.configItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.active { color: var(--color-primary); font-weight: 600; }

.configActions { display: flex; gap: 4px; }

.configActions button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 12px;
}
.configActions button:hover { color: var(--color-text); }

.newConfig {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.newConfig input {
  flex: 1;
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 4px 8px;
  font-size: 13px;
}
```

- [ ] **Step 3: 写 `src/components/ImportExportBar/ImportExportBar.tsx`**

```tsx
import { useRef } from 'react';
import { useApp } from '../../state/AppContext';
import styles from './ImportExportBar.module.css';

export function ImportExportBar() {
  const { getAllData, importData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evem-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.version !== undefined) {
          importData(data);
          alert('数据导入成功！');
        } else {
          alert('无效的数据文件格式。');
        }
      } catch {
        alert('JSON 解析失败，请检查文件格式。');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (confirm('确定要重置为默认数据吗？所有自定义价格配置将丢失。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={styles.bar}>
      <button className={styles.btn} onClick={handleExport}>导出数据</button>
      <button className={styles.btn} onClick={() => fileInputRef.current?.click()}>导入数据</button>
      <button className={styles.btnDanger} onClick={handleReset}>重置</button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
    </div>
  );
}
```

- [ ] **Step 4: 写 `src/components/ImportExportBar/ImportExportBar.module.css`**

```css
.bar {
  display: flex;
  gap: 8px;
  padding: 8px 20px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  justify-content: center;
}

.btn {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 6px 16px;
  cursor: pointer;
  font-size: 13px;
}
.btn:hover { background: var(--color-bg); }

.btnDanger {
  composes: btn;
  color: var(--color-danger);
  border-color: var(--color-danger);
}
```

- [ ] **Step 5: 更新 `src/App.tsx`**

```tsx
import { AppProvider } from './state/AppContext';
import { ProductionProvider } from './state/ProductionContext';
import { SellingProvider } from './state/SellingContext';
import { Header } from './components/Header/Header';
import { ImportExportBar } from './components/ImportExportBar/ImportExportBar';
import styles from './App.module.css';

function App() {
  return (
    <AppProvider>
      <ProductionProvider>
        <SellingProvider>
          <div className={styles.app}>
            <Header />
            <main className={styles.main}>
              <div className={styles.panel}>生产面板（待实现）</div>
              <div className={styles.panel}>出售面板（待实现）</div>
            </main>
            <ImportExportBar />
          </div>
        </SellingProvider>
      </ProductionProvider>
    </AppProvider>
  );
}

export default App;
```

- [ ] **Step 6: 写 `src/App.module.css`**

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  display: flex;
  gap: var(--gap);
  padding: var(--gap);
  overflow: auto;
}

.panel {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
  min-width: 0;
}

@media (max-width: 767px) {
  .main {
    flex-direction: column;
  }
}
```

- [ ] **Step 7: 验证** — `npm run dev` 确保页面无错误渲染

- [ ] **Step 8: 提交**

```bash
git add src/components/Header/ src/components/ImportExportBar/ src/App.tsx src/App.module.css
git commit -m "feat: add layout framework, header, and import/export bar"
```

---

### Task 9: 生产面板组件

**Files:**
- Create: `src/components/ProductionPanel/ProductionPanel.tsx`, `ProductionPanel.module.css`, `ProjectTypeTabs.tsx`, `ProductSelector.tsx`, `EfficiencyConfig.tsx`, `DecoderSelector.tsx`, `MaterialList.tsx`, `ProductionSummary.tsx`, `ReverseExtras.tsx`

**Interfaces:**
- Consumes: `useProduction()`, `useApp()`, `useSelling()`, engine functions

- [ ] **Step 1: 写 `ProjectTypeTabs.tsx`**

```tsx
import { useProduction } from '../../state/ProductionContext';
import styles from './ProductionPanel.module.css';

export function ProjectTypeTabs() {
  const { state, dispatch } = useProduction();
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${state.projectType === 'manufacturing' ? styles.active : ''}`}
        onClick={() => dispatch({ type: 'SET_PROJECT_TYPE', payload: 'manufacturing' })}
      >
        制造项目
      </button>
      <button
        className={`${styles.tab} ${state.projectType === 'reverse' ? styles.active : ''}`}
        onClick={() => dispatch({ type: 'SET_PROJECT_TYPE', payload: 'reverse' })}
      >
        逆向工程
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 写 `ProductSelector.tsx`**

```tsx
import { useState } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { defaultBlueprints, defaultReverse } from '../../data';
import styles from './ProductionPanel.module.css';

export function ProductSelector() {
  const { state, dispatch } = useProduction();
  const [search, setSearch] = useState('');

  const items = state.projectType === 'manufacturing' ? defaultBlueprints : defaultReverse;
  const selectedId = state.projectType === 'manufacturing'
    ? state.manufacturing.blueprintId
    : state.reverse.reverseId;

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    if (state.projectType === 'manufacturing') {
      dispatch({ type: 'SET_MANUFACTURING', payload: { blueprintId: id } });
    } else {
      dispatch({ type: 'SET_REVERSE', payload: { reverseId: id } });
    }
  };

  return (
    <div className={styles.section}>
      <label className={styles.label}>选择产品</label>
      <input
        className={styles.input}
        placeholder="搜索产品..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className={styles.selectList}>
        {filtered.map(item => (
          <div
            key={item.id}
            className={`${styles.selectItem} ${selectedId === item.id ? styles.selected : ''}`}
            onClick={() => handleSelect(item.id)}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 写 `EfficiencyConfig.tsx`**

```tsx
import { useProduction } from '../../state/ProductionContext';
import styles from './ProductionPanel.module.css';

const ME_PRESETS = [1.50, 0.97, 0.96, 0.95];
const TE_PRESETS = [1.00, 0.4781, 0.45];

export function EfficiencyConfig() {
  const { state, dispatch } = useProduction();

  const config = state.projectType === 'manufacturing'
    ? state.manufacturing : { materialEfficiency: 1.5, timeEfficiency: state.reverse.timeEfficiency };

  const setME = (v: number) => {
    if (state.projectType === 'manufacturing') {
      dispatch({ type: 'SET_MANUFACTURING', payload: { materialEfficiency: v } });
    }
  };

  const setTE = (v: number) => {
    if (state.projectType === 'manufacturing') {
      dispatch({ type: 'SET_MANUFACTURING', payload: { timeEfficiency: v } });
    } else {
      dispatch({ type: 'SET_REVERSE', payload: { timeEfficiency: v } });
    }
  };

  return (
    <div className={styles.section}>
      {state.projectType === 'manufacturing' && (
        <div className={styles.effRow}>
          <label className={styles.label}>材料效率</label>
          <select
            className={styles.select}
            value={config.materialEfficiency}
            onChange={e => setME(Number(e.target.value))}
          >
            {ME_PRESETS.map(p => (
              <option key={p} value={p}>{(p * 100).toFixed(0)}%</option>
            ))}
          </select>
          <input
            className={styles.inputSmall}
            type="number"
            min="75"
            max="150"
            step="0.01"
            value={Math.round(config.materialEfficiency * 100)}
            onChange={e => setME(Number(e.target.value) / 100)}
          />
          <span>%</span>
        </div>
      )}
      <div className={styles.effRow}>
        <label className={styles.label}>时间效率</label>
        <select
          className={styles.select}
          value={config.timeEfficiency}
          onChange={e => setTE(Number(e.target.value))}
        >
          {TE_PRESETS.map(p => (
            <option key={p} value={p}>{(p * 100).toFixed(2)}%</option>
          ))}
        </select>
        <input
          className={styles.inputSmall}
          type="number"
          min="0.01"
          max="100"
          step="0.01"
          value={Math.round(config.timeEfficiency * 10000) / 100}
          onChange={e => setTE(Number(e.target.value) / 100)}
        />
        <span>%</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 写 `DecoderSelector.tsx`**

```tsx
import { useProduction } from '../../state/ProductionContext';
import { defaultDecoders } from '../../data';
import styles from './ProductionPanel.module.css';

export function DecoderSelector() {
  const { state, dispatch } = useProduction();

  const decoderId = state.projectType === 'manufacturing'
    ? state.manufacturing.decoderId
    : state.reverse.decoderId;

  const setDecoder = (id?: string) => {
    if (state.projectType === 'manufacturing') {
      dispatch({ type: 'SET_MANUFACTURING', payload: { decoderId: id } });
    } else {
      dispatch({ type: 'SET_REVERSE', payload: { decoderId: id } });
    }
  };

  const selected = defaultDecoders.find(d => d.id === decoderId);

  return (
    <div className={styles.section}>
      <label className={styles.label}>解码器</label>
      <select
        className={styles.select}
        value={decoderId ?? 'decoder_none'}
        onChange={e => setDecoder(e.target.value === 'decoder_none' ? undefined : e.target.value)}
      >
        {defaultDecoders.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      {selected && selected.id !== 'decoder_none' && (
        <div className={styles.decoderPreview}>
          <span>ME: ×{selected.meBonus}</span>
          <span>TE: ×{selected.teBonus}</span>
          {selected.runBonus > 0 && <span>流程: +{selected.runBonus}</span>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: 写 `MaterialList.tsx`**

```tsx
import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { formatNumber } from '../../utils/format';
import styles from './ProductionPanel.module.css';

export function MaterialList() {
  const { state } = useProduction();
  const { getPrice, setPrice } = useApp();

  if (!state.result) return null;

  const { materials } = state.result;

  const groupedByCategory = materials.reduce<Record<string, typeof materials>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  const categoryNames: Record<string, string> = {
    mineral: '矿物',
    planetary: '行星材料',
    data_core: '数据核心',
    decoder: '解码器',
    damaged_structure: '基底材料',
    blueprint: '蓝图',
  };

  return (
    <div className={styles.section}>
      <label className={styles.label}>材料清单</label>
      {Object.entries(groupedByCategory).map(([cat, items]) => (
        <div key={cat}>
          <h4 className={styles.catTitle}>{categoryNames[cat] || cat}</h4>
          <table className={styles.materialTable}>
            <thead>
              <tr>
                <th>材料</th>
                <th>基准</th>
                <th>修正</th>
                <th>总数</th>
                <th>单价</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m.itemId} className={m.unitPrice === null ? styles.warning : ''}>
                  <td>
                    {m.itemName}
                    {m.isBaseMaterial && <span className={styles.tag}>基底</span>}
                  </td>
                  <td>{formatNumber(m.baseQuantity)}</td>
                  <td>{formatNumber(m.adjustedQuantity)}</td>
                  <td>{formatNumber(m.totalQuantity)}</td>
                  <td>
                    <input
                      className={styles.priceInput}
                      type="number"
                      min="0"
                      placeholder="未设置"
                      value={m.unitPrice ?? ''}
                      onChange={e => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setPrice(m.itemId, v);
                      }}
                    />
                  </td>
                  <td>{m.subtotal !== null ? formatNumber(m.subtotal) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: 写 `ProductionSummary.tsx`**

```tsx
import { useProduction } from '../../state/ProductionContext';
import { getBlueprintById } from '../../data';
import { formatNumber, formatTime } from '../../utils/format';
import { useApp } from '../../state/AppContext';
import { useSelling } from '../../state/SellingContext';
import styles from './ProductionPanel.module.css';

export function ProductionSummary() {
  const { state, dispatch } = useProduction();
  const selling = useSelling();
  const bp = getBlueprintById(state.manufacturing.blueprintId);

  const handleSendToSelling = () => {
    if (state.result) {
      selling.dispatch({
        type: 'SET_COST_DATA',
        payload: {
          totalCost: state.result.totalCost,
          costPerUnit: state.result.costPerUnit,
          productCount: state.result.productCount,
        },
      });
    }
  };

  return (
    <div className={styles.summary}>
      {state.projectType === 'manufacturing' && (
        <div className={styles.summaryRow}>
          <label>流程数</label>
          <input
            type="range"
            min={1}
            max={bp?.maxRuns ?? 10}
            value={state.manufacturing.runs}
            onChange={e => dispatch({
              type: 'SET_MANUFACTURING',
              payload: { runs: parseInt(e.target.value) },
            })}
          />
          <span>{state.manufacturing.runs}</span>
        </div>
      )}

      {state.result && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>总耗时</span>
            <span className={styles.summaryValue}>{formatTime(state.result.totalTime)}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>现金费用</span>
            <span className={styles.summaryValue}>{formatNumber(state.result.cashCost)} ISK</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>材料成本</span>
            <span className={styles.summaryValue}>
              {state.result.totalMaterialCost !== null
                ? `${formatNumber(state.result.totalMaterialCost)} ISK`
                : '待录入'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>总成本</span>
            <span className={`${styles.summaryValue} ${styles.highlight}`}>
              {state.result.totalCost !== null
                ? `${formatNumber(state.result.totalCost)} ISK`
                : '待录入'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>单件成本</span>
            <span className={styles.summaryValue}>
              {state.result.costPerUnit !== null
                ? `${formatNumber(state.result.costPerUnit)} ISK`
                : '待录入'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>产物数量</span>
            <span className={styles.summaryValue}>{formatNumber(state.result.productCount)}</span>
          </div>
        </div>
      )}

      <button className={styles.sendBtn} onClick={handleSendToSelling} disabled={!state.result}>
        发送到出售 →
      </button>
    </div>
  );
}
```

- [ ] **Step 7: 写 `ReverseExtras.tsx`**

```tsx
import { useProduction } from '../../state/ProductionContext';
import { getReverseById } from '../../data';
import styles from './ProductionPanel.module.css';

export function ReverseExtras() {
  const { state, dispatch } = useProduction();
  const revData = getReverseById(state.reverse.reverseId);

  if (state.projectType !== 'reverse' || !revData) return null;

  const handleItemCount = (v: number) => {
    dispatch({ type: 'SET_REVERSE', payload: { itemCount: v } });
  };

  const result = state.result as any;
  const successRate = result?.successRate ?? 0;

  return (
    <div className={styles.section}>
      <div className={styles.summaryRow}>
        <label>基底材料数量</label>
        <input
          type="range"
          min={1}
          max={revData.maxItemCount}
          value={state.reverse.itemCount}
          onChange={e => handleItemCount(parseInt(e.target.value))}
        />
        <span>{state.reverse.itemCount}</span>
      </div>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>成功率</span>
          <span className={styles.summaryValue}>{(successRate * 100).toFixed(1)}%</span>
        </div>
        {result?.expectedCost !== null && result?.expectedCost !== undefined && (
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>期望成本</span>
            <span className={`${styles.summaryValue} ${styles.highlight}`}>
              {result.expectedCost.toLocaleString()} ISK
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: 写 `ProductionPanel.tsx`** — 组装所有子组件

```tsx
import { useEffect } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { getBlueprintById, getReverseById, getDecoderById } from '../../data';
import { calculateManufacturing } from '../../engine/manufacturing';
import { calculateReverse } from '../../engine/reverse';
import { ProjectTypeTabs } from './ProjectTypeTabs';
import { ProductSelector } from './ProductSelector';
import { EfficiencyConfig } from './EfficiencyConfig';
import { DecoderSelector } from './DecoderSelector';
import { MaterialList } from './MaterialList';
import { ProductionSummary } from './ProductionSummary';
import { ReverseExtras } from './ReverseExtras';
import styles from './ProductionPanel.module.css';

export function ProductionPanel() {
  const { state, dispatch } = useProduction();
  const { getPrice } = useApp();

  useEffect(() => {
    if (state.projectType === 'manufacturing') {
      const bp = getBlueprintById(state.manufacturing.blueprintId);
      if (!bp) { dispatch({ type: 'SET_RESULT', payload: null }); return; }
      const decoder = getDecoderById(state.manufacturing.decoderId ?? 'decoder_none');
      const result = calculateManufacturing(state.manufacturing, bp, decoder, getPrice);
      dispatch({ type: 'SET_RESULT', payload: result });
    } else {
      const rev = getReverseById(state.reverse.reverseId);
      if (!rev) { dispatch({ type: 'SET_RESULT', payload: null }); return; }
      const decoder = getDecoderById(state.reverse.decoderId ?? 'decoder_none');
      const result = calculateReverse(state.reverse, rev, decoder, getPrice);
      dispatch({ type: 'SET_RESULT', payload: result });
    }
  }, [state.manufacturing, state.reverse, state.projectType, getPrice, dispatch]);

  return (
    <div className={styles.panel}>
      <ProjectTypeTabs />
      <ProductSelector />
      <EfficiencyConfig />
      <DecoderSelector />
      {state.projectType === 'reverse' && <ReverseExtras />}
      <MaterialList />
      <ProductionSummary />
    </div>
  );
}
```

- [ ] **Step 9: 写 `ProductionPanel.module.css`**

```css
.panel { display: flex; flex-direction: column; gap: 16px; }
.section { display: flex; flex-direction: column; gap: 6px; }
.label { font-size: 13px; color: var(--color-text-secondary); font-weight: 600; }
.input {
  background: var(--color-bg); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 6px 10px; font-size: 13px; width: 100%;
}
.inputSmall { composes: input; width: 80px; }
.select {
  background: var(--color-bg); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 4px 8px; font-size: 13px;
}

.tabs { display: flex; gap: 0; }
.tab {
  flex: 1; padding: 8px;
  background: var(--color-bg); color: var(--color-text-secondary);
  border: 1px solid var(--color-border); cursor: pointer;
  font-size: 14px; text-align: center;
}
.tab:first-child { border-radius: var(--radius) 0 0 var(--radius); }
.tab:last-child { border-radius: 0 var(--radius) var(--radius) 0; }
.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

.selectList { max-height: 200px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius); }
.selectItem { padding: 8px 12px; cursor: pointer; font-size: 13px; }
.selectItem:hover { background: var(--color-bg); }
.selected { background: var(--color-primary); color: #fff; }

.effRow { display: flex; align-items: center; gap: 8px; }

.decoderPreview { display: flex; gap: 12px; font-size: 12px; color: var(--color-text-secondary); }

.materialTable { width: 100%; border-collapse: collapse; font-size: 12px; }
.materialTable th, .materialTable td { padding: 6px 8px; text-align: right; border-bottom: 1px solid var(--color-border); }
.materialTable th:first-child, .materialTable td:first-child { text-align: left; }
.materialTable th { color: var(--color-text-secondary); font-weight: 600; }
.warning td { background: rgba(210, 153, 29, 0.1); }
.tag { font-size: 10px; background: var(--color-border); color: var(--color-text-secondary); padding: 1px 4px; border-radius: 3px; margin-left: 4px; }
.catTitle { font-size: 13px; color: var(--color-primary); margin: 8px 0 4px; }
.priceInput {
  background: var(--color-bg); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: 4px;
  padding: 2px 6px; font-size: 12px; width: 100px; text-align: right;
}

.summary { border-top: 1px solid var(--color-border); padding-top: 12px; }
.summaryRow { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.summaryGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.summaryItem { display: flex; flex-direction: column; }
.summaryLabel { font-size: 11px; color: var(--color-text-secondary); }
.summaryValue { font-size: 14px; font-weight: 600; }
.highlight { color: var(--color-primary); font-size: 16px; }
.sendBtn {
  margin-top: 12px; width: 100%; padding: 10px;
  background: var(--color-primary); color: #fff;
  border: none; border-radius: var(--radius);
  font-size: 14px; font-weight: 600; cursor: pointer;
}
.sendBtn:disabled { opacity: 0.5; cursor: not-allowed; }
.sendBtn:hover:not(:disabled) { opacity: 0.9; }
```

- [ ] **Step 10: 验证** — `npx tsc --noEmit`

- [ ] **Step 11: 提交**

```bash
git add src/components/ProductionPanel/
git commit -m "feat: add production panel with manufacturing and reverse engineering"
```

---

### Task 10: 出售面板组件

**Files:**
- Create: `src/components/SellingPanel/SellingPanel.tsx`, `SellingPanel.module.css`, `SellModeTabs.tsx`, `MarketSellConfig.tsx`, `ContractSellConfig.tsx`, `ProfitSummary.tsx`

- [ ] **Step 1: 写 `SellModeTabs.tsx`**

```tsx
import { useSelling } from '../../state/SellingContext';
import styles from './SellingPanel.module.css';

export function SellModeTabs() {
  const { state, dispatch } = useSelling();

  const setMode = (mode: 'market' | 'contract') => {
    if (mode === 'market') {
      dispatch({ type: 'SET_CONFIG', payload: { mode: 'market', sellPrice: 0, immediateSell: false, salesTaxRate: 0.20 } });
    } else {
      dispatch({ type: 'SET_CONFIG', payload: { mode: 'contract', sellPrice: 0 } });
    }
  };

  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${state.config.mode === 'market' ? styles.active : ''}`}
        onClick={() => setMode('market')}
      >
        市场出售
      </button>
      <button
        className={`${styles.tab} ${state.config.mode === 'contract' ? styles.active : ''}`}
        onClick={() => setMode('contract')}
      >
        合同出售
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 写 `MarketSellConfig.tsx`**

```tsx
import { useSelling } from '../../state/SellingContext';
import styles from './SellingPanel.module.css';

const TAX_PRESETS = [0.20, 0.164, 0.148, 0.128, 0.12];

export function MarketSellConfig() {
  const { state, dispatch } = useSelling();
  const config = state.config as { mode: 'market'; sellPrice: number; immediateSell: boolean; salesTaxRate: number };

  return (
    <div className={styles.section}>
      <div className={styles.row}>
        <label className={styles.label}>单件售价 (ISK)</label>
        <input
          className={styles.input}
          type="number"
          min="0"
          value={config.sellPrice || ''}
          onChange={e => dispatch({
            type: 'SET_CONFIG',
            payload: { ...config, sellPrice: parseFloat(e.target.value) || 0 },
          })}
        />
      </div>

      <div className={styles.row}>
        <label className={styles.label}>销售税率</label>
        <select
          className={styles.select}
          value={config.salesTaxRate}
          onChange={e => dispatch({
            type: 'SET_CONFIG',
            payload: { ...config, salesTaxRate: Number(e.target.value) },
          })}
        >
          {TAX_PRESETS.map(p => (
            <option key={p} value={p}>{(p * 100).toFixed(1)}%</option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={config.immediateSell}
            onChange={e => dispatch({
              type: 'SET_CONFIG',
              payload: { ...config, immediateSell: e.target.checked },
            })}
          />
          立即出售
        </label>
      </div>

      <div className={styles.info}>
        中介费: 1%（{config.immediateSell ? '立即出售不扣中介费' : '挂单扣中介费'}）
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 写 `ContractSellConfig.tsx`**

```tsx
import { useSelling } from '../../state/SellingContext';
import styles from './SellingPanel.module.css';

export function ContractSellConfig() {
  const { state, dispatch } = useSelling();
  const config = state.config as { mode: 'contract'; sellPrice: number };

  return (
    <div className={styles.section}>
      <div className={styles.row}>
        <label className={styles.label}>单件售价 (ISK)</label>
        <input
          className={styles.input}
          type="number"
          min="0"
          value={config.sellPrice || ''}
          onChange={e => dispatch({
            type: 'SET_CONFIG',
            payload: { ...config, sellPrice: parseFloat(e.target.value) || 0 },
          })}
        />
      </div>
      <div className={styles.info}>
        <p>中介费: 4%（最低 1,000 ISK）</p>
        <p>定金: 2.5%（最低 10,000 ISK，成交后退还）</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 写 `ProfitSummary.tsx`**

```tsx
import { useSelling } from '../../state/SellingContext';
import { formatNumber } from '../../utils/format';
import styles from './SellingPanel.module.css';

export function ProfitSummary() {
  const { state } = useSelling();

  if (!state.costData || !state.result) {
    return <div className={styles.placeholder}>请先在左侧完成生产配置，点击"发送到出售"</div>;
  }

  const { result, costData } = state;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>利润分析</h3>
      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.label}>总售价</span>
          <span className={styles.value}>{formatNumber(result.sellPrice * costData.productCount)} ISK</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>中介费</span>
          <span className={styles.value}>{formatNumber(result.brokerFee)} ISK</span>
        </div>
        {result.salesTax > 0 && (
          <div className={styles.item}>
            <span className={styles.label}>销售税</span>
            <span className={styles.value}>{formatNumber(result.salesTax)} ISK</span>
          </div>
        )}
        {result.deposit > 0 && (
          <div className={styles.item}>
            <span className={styles.label}>定金（可退）</span>
            <span className={styles.value}>{formatNumber(result.deposit)} ISK</span>
          </div>
        )}
        <div className={styles.item}>
          <span className={styles.label}>税后收入</span>
          <span className={styles.value}>{formatNumber(result.revenue)} ISK</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>总成本</span>
          <span className={styles.value}>
            {costData.totalCost !== null ? `${formatNumber(costData.totalCost)} ISK` : '待录入'}
          </span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>总利润</span>
          <span className={`${styles.value} ${(result.totalProfit ?? 0) >= 0 ? styles.profit : styles.loss}`}>
            {result.totalProfit !== null ? `${formatNumber(result.totalProfit)} ISK` : '待录入'}
          </span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>利润率</span>
          <span className={`${styles.value} ${(result.profitMargin ?? 0) >= 0 ? styles.profit : styles.loss}`}>
            {result.profitMargin !== null ? `${result.profitMargin.toFixed(2)}%` : '待录入'}
          </span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>单件利润</span>
          <span className={styles.value}>
            {result.profitPerUnit !== null ? `${formatNumber(result.profitPerUnit)} ISK` : '待录入'}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 写 `SellingPanel.tsx`** — 组装

```tsx
import { useEffect } from 'react';
import { useSelling } from '../../state/SellingContext';
import { calculateMarketSelling, calculateContractSelling } from '../../engine/selling';
import { SellModeTabs } from './SellModeTabs';
import { MarketSellConfig } from './MarketSellConfig';
import { ContractSellConfig } from './ContractSellConfig';
import { ProfitSummary } from './ProfitSummary';
import styles from './SellingPanel.module.css';

export function SellingPanel() {
  const { state, dispatch } = useSelling();

  useEffect(() => {
    if (!state.costData) {
      dispatch({ type: 'SET_RESULT', payload: null });
      return;
    }
    if (state.config.mode === 'market' && state.config.sellPrice > 0) {
      const result = calculateMarketSelling(state.config, state.costData);
      dispatch({ type: 'SET_RESULT', payload: result });
    } else if (state.config.mode === 'contract' && state.config.sellPrice > 0) {
      const result = calculateContractSelling(state.config, state.costData);
      dispatch({ type: 'SET_RESULT', payload: result });
    }
  }, [state.config, state.costData, dispatch]);

  return (
    <div className={styles.panel}>
      <SellModeTabs />
      {state.config.mode === 'market' ? <MarketSellConfig /> : <ContractSellConfig />}
      <ProfitSummary />
    </div>
  );
}
```

- [ ] **Step 6: 写 `SellingPanel.module.css`**

```css
.panel { display: flex; flex-direction: column; gap: 16px; }
.section { display: flex; flex-direction: column; gap: 8px; }
.sectionTitle { font-size: 15px; color: var(--color-primary); }
.label { font-size: 13px; color: var(--color-text-secondary); font-weight: 600; }
.input {
  background: var(--color-bg); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 6px 10px; font-size: 13px; width: 100%;
}
.select {
  background: var(--color-bg); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 4px 8px; font-size: 13px;
}
.row { display: flex; flex-direction: column; gap: 4px; }
.checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
.info { font-size: 12px; color: var(--color-text-secondary); line-height: 1.6; }

.tabs { display: flex; gap: 0; }
.tab {
  flex: 1; padding: 8px;
  background: var(--color-bg); color: var(--color-text-secondary);
  border: 1px solid var(--color-border); cursor: pointer;
  font-size: 14px; text-align: center;
}
.tab:first-child { border-radius: var(--radius) 0 0 var(--radius); }
.tab:last-child { border-radius: 0 var(--radius) var(--radius) 0; }
.active { background: var(--color-success); color: #fff; border-color: var(--color-success); }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.item { display: flex; flex-direction: column; }
.value { font-size: 14px; font-weight: 600; margin-top: 2px; }
.profit { color: var(--color-success); }
.loss { color: var(--color-danger); }
.placeholder { text-align: center; color: var(--color-text-secondary); padding: 40px 0; font-size: 14px; }
```

- [ ] **Step 7: 更新 `src/App.tsx`** 集成生产面板和出售面板

```tsx
import { AppProvider } from './state/AppContext';
import { ProductionProvider } from './state/ProductionContext';
import { SellingProvider } from './state/SellingContext';
import { Header } from './components/Header/Header';
import { ProductionPanel } from './components/ProductionPanel/ProductionPanel';
import { SellingPanel } from './components/SellingPanel/SellingPanel';
import { ImportExportBar } from './components/ImportExportBar/ImportExportBar';
import styles from './App.module.css';

function App() {
  return (
    <AppProvider>
      <ProductionProvider>
        <SellingProvider>
          <div className={styles.app}>
            <Header />
            <main className={styles.main}>
              <div className={styles.panel}>
                <ProductionPanel />
              </div>
              <div className={styles.panel}>
                <SellingPanel />
              </div>
            </main>
            <ImportExportBar />
          </div>
        </SellingProvider>
      </ProductionProvider>
    </AppProvider>
  );
}

export default App;
```

- [ ] **Step 8: 验证** — `npm run dev` 完整功能测试

- [ ] **Step 9: 提交**

```bash
git add src/components/SellingPanel/ src/App.tsx
git commit -m "feat: add selling panel with market and contract modes"
```

---

### Task 11: 移动端响应式适配

**Files:**
- Modify: `src/App.module.css`, `src/components/ProductionPanel/ProductionPanel.module.css`

- [ ] **Step 1: 在 `src/App.module.css` 添加移动端样式**

```css
/* 追加到已有文件 */
@media (max-width: 767px) {
  .main {
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }
  .panel {
    padding: 12px;
  }
}
```

- [ ] **Step 2: 在 `ProductionPanel.module.css` 追加移动端材料清单卡片式布局**

```css
@media (max-width: 767px) {
  .materialTable { font-size: 11px; }
  .materialTable th:nth-child(2),
  .materialTable td:nth-child(2),
  .materialTable th:nth-child(3),
  .materialTable td:nth-child(3) {
    display: none; /* 移动端隐藏基准和修正列 */
  }
  .priceInput { width: 70px; }
  .summaryGrid { grid-template-columns: 1fr; }
  .grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: 在 `Header.module.css` 追加移动端**

```css
@media (max-width: 767px) {
  .header { flex-direction: column; align-items: flex-start; }
  .title { font-size: 16px; }
}
```

- [ ] **Step 4: 验证** — 调整浏览器窗口到移动端宽度，确认布局正确

- [ ] **Step 5: 提交**

```bash
git add src/App.module.css src/components/ProductionPanel/ProductionPanel.module.css src/components/Header/Header.module.css
git commit -m "feat: add mobile responsive layout"
```

---

### Task 12: 边界处理与打磨

**Files:**
- Modify: `src/state/useLocalStorage.ts`（添加容量检测）
- Modify: 相关组件（添加校验错误提示）

- [ ] **Step 1: 在 `useLocalStorage.ts` 中处理 localStorage 满的情况**

```typescript
// 修改 setValue 中的 catch 块
} catch (e) {
  console.warn('localStorage 存储失败，可能已满', e);
  // 可以在这里触发全局提示
}
```

- [ ] **Step 2: 在 `EfficiencyConfig.tsx` 添加输入校验提示**

在手动输入框下方添加错误提示 span：
```tsx
{state.projectType === 'manufacturing' && (
  config.materialEfficiency < 0.75 || config.materialEfficiency > 1.50 ? (
    <span className={styles.error}>材料效率范围: 75%~150%</span>
  ) : null
)}
```

- [ ] **Step 3: 验证** — `npm run build` 确保生产构建成功

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "fix: add edge case handling and validation feedback"
```

---

### Task 13: 最终验证与构建

- [ ] **Step 1: 运行完整构建**

```bash
npm run build
```

Expected: 构建成功，产出 `dist/` 目录。

- [ ] **Step 2: 预览构建产物**

```bash
npm run preview
```

Expected: 能在浏览器中正常打开，所有功能工作。

- [ ] **Step 3: 提交最终版本**

```bash
git add -A
git commit -m "chore: final build and verification"
```
