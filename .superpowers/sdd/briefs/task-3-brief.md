### Task 3: 内置默认数据

**Files:**
- Create: `src/data/items.ts`, `src/data/blueprints.ts`, `src/data/reverse.ts`, `src/data/index.ts`

**Interfaces:**
- Consumes: `src/types/` 中的 Item, Blueprint, Decoder, ReverseEngineeringData, MaterialEntry
- Produces: `defaultItems`, `defaultBlueprints`, `defaultReverse`, `defaultDecoders` 导出数组；`getItemById`, `getBlueprintById`, `getReverseById`, `getDecoderById` 查询函数

- [ ] **Step 1: 写 `src/data/items.ts`** — 内置物品库

```typescript
import type { Item, Decoder } from '../types';

export const defaultItems: Item[] = [
  { id: 'tritanium', name: '三钛合金', category: 'mineral' },
  { id: 'pyerite', name: '类晶体胶矿', category: 'mineral' },
  { id: 'mexallon', name: '类银超金属', category: 'mineral' },
  { id: 'isogen', name: '同位聚合体', category: 'mineral' },
  { id: 'nocxium', name: '超新星诺克石', category: 'mineral' },
  { id: 'zydrine', name: '晶状石英核岩', category: 'mineral' },
  { id: 'megacyte', name: '超噬矿', category: 'mineral' },
  { id: 'reactive_metals', name: '活性金属', category: 'planetary' },
  { id: 'noble_metals', name: '贵金属', category: 'planetary' },
  { id: 'precious_alloys', name: '珍稀合金', category: 'planetary' },
  { id: 'data_core_ship', name: '舰船数据核心', category: 'data_core' },
  { id: 'data_core_module', name: '装备数据核心', category: 'data_core' },
  { id: 'damaged_bs_structure', name: '受损战列舰结构', category: 'damaged_structure' },
  { id: 'damaged_cr_structure', name: '受损巡洋舰结构', category: 'damaged_structure' },
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

- [ ] **Step 2: 写 `src/data/blueprints.ts`** — 2 个制造蓝图

```typescript
import type { Blueprint } from '../types';

export const defaultBlueprints: Blueprint[] = [
  {
    id: 'bp_t9_bs',
    name: 'T9 战列舰蓝图',
    productItemId: 't9_battleship',
    productName: 'T9 战列舰',
    productQuantity: 1,
    baseTime: 86400,
    baseCost: 50000000,
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

export const blueprintProducts: Array<{ id: string; name: string; category: 'product' }> = [
  { id: 't9_battleship', name: 'T9 战列舰', category: 'product' },
  { id: 't8_cruiser', name: 'T8 巡洋舰', category: 'product' },
];
```

- [ ] **Step 3: 写 `src/data/reverse.ts`** — 逆向工程配置

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
    successRatePerItem: 0.10,
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

- [ ] **Step 4: 写 `src/data/index.ts`**

```typescript
import { defaultItems, defaultDecoders } from './items';
import { defaultBlueprints, blueprintProducts } from './blueprints';
import { defaultReverse } from './reverse';
import type { Item, Blueprint, Decoder, ReverseEngineeringData } from '../types';

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

- [ ] **Step 5: 验证** — `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npx tsc --noEmit`

- [ ] **Step 6: 提交**

```bash
git add src/data/
git commit -m "feat: add built-in demo data (3-5 products)"
```
