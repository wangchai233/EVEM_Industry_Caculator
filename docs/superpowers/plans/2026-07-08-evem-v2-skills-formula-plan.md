# EVEM 工业计算器 v2 — 技能设施与公式重做 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 引入玩家技能/工业设施加成系统，重做所有公式为分层管线，重做解码器，添加产品标签和三层折扣系统。

**Architecture:** 分层加成管线 SkillResolver → FacilityResolver → DecoderResolver → BonusLayers → Engine。每个加成层通过产品标签匹配，独立计算后合并。

**Tech Stack:** React 18+ TypeScript, Vite, KaTeX, CSS Modules, localStorage

## Global Constraints

- 完全离线，无网络依赖
- 解码器以「材料效率」「时间效率」中文显示，界面不可出现英文缩写
- 技能等级约束：进阶>0 需基础≥4；专家>0 需进阶≥5
- 批量预设：000/540/550/553/554/555
- 材料效率公式：1.5 + 技能 + 设施 + 解码器（加法）
- 时间公式：基础 × (1+技能) × (1+设施) × (1+解码器)（乘法）
- 成功率：基础 × (1+技能+设施+解码器)，上限 100%
- 现金费用：基础 × (1+技能) × 流程数
- 基底材料不受材料效率影响
- 折扣三层优先级：手动覆写 > 材料清单 > 全局

---

## File Structure

```
src/
├── types/
│   ├── skill.ts     [NEW] SkillDef, SkillTier, SkillLevelEffect, SkillLevels
│   ├── facility.ts  [NEW] FacilityDef, CustomFacilityBonus
│   ├── discount.ts  [NEW] DiscountRule
│   ├── bonus.ts     [NEW] BonusLayers
│   ├── item.ts      [MODIFY] extend with tags
│   ├── blueprint.ts [MODIFY] redesign Decoder
│   ├── config.ts    [MODIFY] update ManufacturingConfig, ReverseEngineeringConfig
│   └── index.ts     [MODIFY] add exports
├── data/
│   ├── skills.ts    [NEW] 护卫舰制造技术 + 加达里发明原理
│   ├── facilities.ts[NEW] built-in facilities (empty initially)
│   ├── tags.ts      [NEW] tag definitions and tree
│   ├── items.ts     [MODIFY] remove old decoders, add new items
│   ├── blueprints.ts[MODIFY] add 秃鹫级截击型, tags
│   ├── reverse.ts   [MODIFY] add 秃鹫级逆向, tags
│   └── index.ts     [MODIFY] update exports
├── engine/
│   ├── resolver.ts  [NEW] SkillFacilityResolver
│   ├── manufacturing.ts [MODIFY] accept BonusLayers
│   ├── reverse.ts   [MODIFY] accept BonusLayers
│   └── selling.ts   [MODIFY] integrate discounts
├── components/
│   ├── SkillsFacilitiesPanel/ [NEW] skills & facilities UI
│   ├── DiscountConfig/        [NEW] discount rules UI
│   ├── Tutorial/              [NEW] tutorial text
│   ├── ProductionPanel/       [MODIFY] various
│   └── SellingPanel/          [MODIFY] discount override
├── state/
│   ├── AppContext.tsx          [MODIFY] add skills/facilities/discounts state
│   ├── ProductionContext.tsx   [MODIFY] update config
│   └── SellingContext.tsx      [MODIFY] add discount override
└── App.tsx                     [MODIFY] add new panels
```

---

### Task 1: 新增类型定义

**Files:**
- Create: `src/types/skill.ts`, `src/types/facility.ts`, `src/types/discount.ts`, `src/types/bonus.ts`
- Modify: `src/types/item.ts`, `src/types/blueprint.ts`, `src/types/config.ts`, `src/types/index.ts`

**Interfaces:**
- Produces: SkillDef, FacilityDef, DiscountRule, BonusLayers, updated Decoder, updated ManufacturingConfig

- [ ] **Step 1: 写 `src/types/skill.ts`**

```typescript
export interface SkillLevelEffect {
  materialEfficiency?: number; // 材料效率加成（如 0.06 = +6%）
  timeEfficiency?: number;     // 时间效率加成（如 -0.05 = -5%，负数加速）
  successRate?: number;        // 成功率加成
  costMultiplier?: number;     // 现金费用加成
}

export interface SkillTier {
  effects: SkillLevelEffect[]; // [0]=1级, [4]=5级
}

export interface SkillDef {
  id: string;
  name: string;
  matchTags: string[];      // 匹配的产品标签 ID 列表
  base: SkillTier;           // 基础阶段
  advanced: SkillTier;       // 进阶阶段
  expert: SkillTier;         // 专家阶段
}

// 技能等级: [基础, 进阶, 专家]
export type SkillLevels = Record<string, [number, number, number]>;
```

- [ ] **Step 2: 写 `src/types/facility.ts`**

```typescript
export interface FacilityDef {
  id: string;
  name: string;
  matchTags: string[];
  materialEfficiency?: number;
  timeEfficiency?: number;
  successRate?: number;
  costMultiplier?: number;
}

export interface CustomFacilityBonus {
  materialEfficiency: number;
  timeEfficiency: number;
  successRate: number;
  costMultiplier: number;
}
```

- [ ] **Step 3: 写 `src/types/discount.ts`**

```typescript
export interface DiscountRule {
  id: string;
  type: 'category' | 'item';
  targetId: string;    // 分类名（如 'mineral'）或物品 ID
  name: string;        // 显示名
  rate: number;        // 折扣率 0.8 = 8折
  scope: 'buy' | 'sell';
}
```

- [ ] **Step 4: 写 `src/types/bonus.ts`**

```typescript
export interface BonusLayers {
  skills: {
    materialEfficiency: number;
    timeEfficiency: number;
    successRate: number;
    costMultiplier: number;
    breakdown: Array<{ skillName: string; effects: Record<string, number> }>;
  };
  facilities: {
    materialEfficiency: number;
    timeEfficiency: number;
    successRate: number;
    costMultiplier: number;
  };
  decoder: {
    materialEfficiency: number;
    timeEfficiency: number;
    runBonus: number;
    successRate: number;
  };
}

export const EMPTY_BONUS: BonusLayers = {
  skills: { materialEfficiency: 0, timeEfficiency: 0, successRate: 0, costMultiplier: 0, breakdown: [] },
  facilities: { materialEfficiency: 0, timeEfficiency: 0, successRate: 0, costMultiplier: 0 },
  decoder: { materialEfficiency: 0, timeEfficiency: 0, runBonus: 0, successRate: 0 },
};
```

- [ ] **Step 5: 修改 `src/types/item.ts`** — 添加 tags 字段到 Item

在结尾追加：
```typescript
// Product 接口扩展（用于产品类型的物品）
export interface ProductItem extends Item {
  tags: string[]; // 树形节点继承的标签 ID 列表
}
```

- [ ] **Step 6: 重写 `src/types/blueprint.ts`** — 改 Decoder

旧 Decoder 代码替换为：
```typescript
import type { Item } from './item';

export interface Blueprint {
  id: string;
  name: string;
  productItemId: string;
  productName: string;
  productQuantity: number;
  baseTime: number;
  baseCost: number;
  materials: { itemId: string; quantity: number }[];
  maxRuns: number;
  tags: string[]; // 产品标签
}

export type DecoderCategory = 'mfg' | 'rev';

export interface Decoder {
  id: string;
  name: string;
  category: DecoderCategory; // 'mfg' = 制造用, 'rev' = 逆向用
  materialEfficiency: number; // ME 加成
  timeEfficiency: number;     // TE 加成
  runBonus: number;           // 流程加成
  successRate: number;        // 成功率加成（仅逆向有效）
}

export interface ReverseEngineeringData {
  id: string;
  name: string;
  targetBlueprintId: string;
  baseItemId: string;
  baseItemName: string;
  maxItemCount: number;
  maxBaseSuccessRate: number; // 最大基础成功率（如 0.50 = 50%）
  baseTime: number;
  baseCost: number;
  dataCores: { itemId: string; quantity: number }[];
  tags: string[];
}
```

- [ ] **Step 7: 修改 `src/types/config.ts`** — 更新 ManufacturingConfig/ReverseEngineeringConfig

```typescript
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
```

保留 MarketSellConfig, ContractSellConfig, SellingConfig 不变。

- [ ] **Step 8: 更新 `src/types/index.ts`**

```typescript
export * from './item';
export * from './blueprint';
export * from './config';
export * from './price';
export * from './result';
export * from './skill';
export * from './facility';
export * from './discount';
export * from './bonus';
```

- [ ] **Step 9: 验证** — `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npx tsc --noEmit`

- [ ] **Step 10: 提交**

```bash
git add src/types/
git commit -m "feat: add v2 type definitions (skills, facilities, discounts, bonus layers)"
```

---

### Task 2: 内置技能数据

**Files:**
- Create: `src/data/skills.ts`
- Modify: `src/data/index.ts`

**Interfaces:**
- Consumes: SkillDef, SkillLevels from Task 1
- Produces: `defaultSkills: SkillDef[]`, `getSkillById(id)`, lookup functions

- [ ] **Step 1: 写 `src/data/skills.ts`**

```typescript
import type { SkillDef } from '../types';

export const defaultSkills: SkillDef[] = [
  {
    id: 'frigate_manufacturing',
    name: '护卫舰制造技术',
    matchTags: ['frigate'],
    base: {
      effects: [
        { materialEfficiency: 0.06, timeEfficiency: -0.05 },
        { materialEfficiency: 0.12, timeEfficiency: -0.10 },
        { materialEfficiency: 0.18, timeEfficiency: -0.15 },
        { materialEfficiency: 0.24, timeEfficiency: -0.20 },
        { materialEfficiency: 0.30, timeEfficiency: -0.25 },
      ],
    },
    advanced: {
      effects: [
        { materialEfficiency: 0.04, timeEfficiency: -0.05 },
        { materialEfficiency: 0.08, timeEfficiency: -0.10 },
        { materialEfficiency: 0.12, timeEfficiency: -0.15 },
        { materialEfficiency: 0.16, timeEfficiency: -0.20 },
        { materialEfficiency: 0.20, timeEfficiency: -0.25 },
      ],
    },
    expert: {
      effects: [
        { materialEfficiency: 0.01, timeEfficiency: -0.05 },
        { materialEfficiency: 0.02, timeEfficiency: -0.10 },
        { materialEfficiency: 0.03, timeEfficiency: -0.15 },
        { materialEfficiency: 0.04, timeEfficiency: -0.20 },
        { materialEfficiency: 0.05, timeEfficiency: -0.25 },
      ],
    },
  },
  {
    id: 'caldari_invention',
    name: '加达里发明原理',
    matchTags: ['caldari'],
    base: {
      effects: [
        { timeEfficiency: -0.05, successRate: 0 },
        { timeEfficiency: -0.10, successRate: 0.12 },
        { timeEfficiency: -0.15, successRate: 0.24 },
        { timeEfficiency: -0.20, successRate: 0.36 },
        { timeEfficiency: -0.25, successRate: 0.50 },
      ],
    },
    advanced: {
      effects: [
        { timeEfficiency: -0.05, successRate: 0 },
        { timeEfficiency: -0.10, successRate: 0 },
        { timeEfficiency: -0.15, successRate: 0.10 },
        { timeEfficiency: -0.20, successRate: 0.20 },
        { timeEfficiency: -0.25, successRate: 0.30 },
      ],
    },
    expert: {
      effects: [
        { timeEfficiency: -0.05, successRate: 0 },
        { timeEfficiency: -0.10, successRate: 0 },
        { timeEfficiency: -0.15, successRate: 0.06 },
        { timeEfficiency: -0.20, successRate: 0.12 },
        { timeEfficiency: -0.25, successRate: 0.20 },
      ],
    },
  },
];

export const defaultSkillLevels: Record<string, [number, number, number]> = {
  frigate_manufacturing: [0, 0, 0],
  caldari_invention: [0, 0, 0],
};

const skillMap = new Map(defaultSkills.map(s => [s.id, s]));

export function getSkillById(id: string): SkillDef | undefined {
  return skillMap.get(id);
}
```

- [ ] **Step 2: 更新 `src/data/index.ts`** — 添加导出

在现有导入下方追加：
```typescript
export { defaultSkills, defaultSkillLevels, getSkillById } from './skills';
```

- [ ] **Step 3: 验证** — `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npx tsc --noEmit`

- [ ] **Step 4: 提交**

```bash
git add src/data/skills.ts src/data/index.ts
git commit -m "feat: add built-in skill data (frigate manufacturing + caldari invention)"
```

---

### Task 3: 标签系统 + 设施数据（初始化）

**Files:**
- Create: `src/data/tags.ts`, `src/data/facilities.ts`
- Modify: `src/data/index.ts`

- [ ] **Step 1: 写 `src/data/tags.ts`**

```typescript
export interface TagNode {
  id: string;
  name: string;
  parentTags: string[]; // 该节点自动继承的父级标签
}

export const tagTree: TagNode[] = [
  { id: 'ship', name: '舰船', parentTags: [] },
  { id: 'regular_ship', name: '常规舰船', parentTags: ['ship'] },
  { id: 'frigate', name: '护卫舰', parentTags: ['ship', 'regular_ship'] },
  { id: 'destroyer', name: '驱逐舰', parentTags: ['ship', 'regular_ship'] },
  { id: 'cruiser', name: '巡洋舰', parentTags: ['ship', 'regular_ship'] },
  { id: 'battlecruiser', name: '战列巡洋舰', parentTags: ['ship', 'regular_ship'] },
  { id: 'battleship', name: '战列舰', parentTags: ['ship', 'regular_ship'] },
  { id: 'caldari', name: '加达里', parentTags: [] },
  { id: 'gallente', name: '盖伦特', parentTags: [] },
  { id: 'amarr', name: '艾玛', parentTags: [] },
  { id: 'minmatar', name: '米玛塔尔', parentTags: [] },
  { id: 'interceptor', name: '截击型', parentTags: [] },
];

// 计算节点的完整标签列表（含继承）
export function resolveTags(nodeId: string): string[] {
  const node = tagTree.find(n => n.id === nodeId);
  if (!node) return [nodeId];
  const tags = new Set<string>();
  for (const p of node.parentTags) {
    tags.add(p);
    for (const t of resolveTags(p)) tags.add(t);
  }
  tags.add(nodeId);
  return [...tags];
}
```

- [ ] **Step 2: 写 `src/data/facilities.ts`**

```typescript
import type { FacilityDef } from '../types';

export const defaultFacilities: FacilityDef[] = [];
// 初期空列表，后续补录。示例条目格式：
// { id: 'assembly_3', name: '组装车间模块 III', matchTags: ['regular_ship'],
//   materialEfficiency: -0.05 }

export function getFacilityById(id: string): FacilityDef | undefined {
  return defaultFacilities.find(f => f.id === id);
}
```

- [ ] **Step 3: 更新 `src/data/index.ts`** 添加导出

```typescript
export { tagTree, resolveTags } from './tags';
export { defaultFacilities, getFacilityById } from './facilities';
```

- [ ] **Step 4: 验证** — `npx tsc --noEmit`

- [ ] **Step 5: 提交**

```bash
git add src/data/tags.ts src/data/facilities.ts src/data/index.ts
git commit -m "feat: add tag tree system and empty facilities data"
```

---

### Task 4: 内置解码器和产品数据重做

**Files:**
- Modify: `src/data/items.ts`, `src/data/blueprints.ts`, `src/data/reverse.ts`

- [ ] **Step 1: 修改 `src/data/items.ts`** — 删除旧解码器，添加新测试物品

删除 `defaultDecoders` 数组全部 3 个旧的，替换为空的。在 `defaultItems` 末尾追加新材料物品：
```typescript
// 追加到 defaultItems:
  { id: 'sparkle_alloy', name: '闪光合金', category: 'planetary' },
  { id: 'precision_alloy', name: '精密合金', category: 'planetary' },
  { id: 'fiber_composite', name: '纤维复合物', category: 'planetary' },
  { id: 'reactive_metal', name: '反应金属', category: 'planetary' },
  { id: 'damaged_caldari8', name: '加达里 8 级受损结构', category: 'damaged_structure' },
  { id: 'data_core_caldari_engineering', name: '数据核心 - 加达里星舰工程', category: 'data_core' },
  { id: 'data_core_rocket_science', name: '数据核心 - 火箭科学', category: 'data_core' },
  { id: 'condor_interceptor', name: '秃鹫级截击型', category: 'product' },
```

删除文件底部的 `defaultDecoders` 导出，改为导出空数组：
```typescript
export const defaultDecoders: Decoder[] = [];
```

（解码器数据将在下一步单独创建）

- [ ] **Step 2: 创建 `src/data/decoders.ts`**

```typescript
import type { Decoder } from '../types';

export const defaultDecoders: Decoder[] = [
  // ======== 制造用解码器 ========
  {
    id: 'decoder_mfg_actuarial',
    name: '生产精算解码器',
    category: 'mfg',
    materialEfficiency: -0.05,
    timeEfficiency: 0.40,
    runBonus: 0,
    successRate: 0,
  },
  {
    id: 'decoder_mfg_optimize',
    name: '生产优化解码器',
    category: 'mfg',
    materialEfficiency: -0.02,
    timeEfficiency: -0.20,
    runBonus: 0,
    successRate: 0,
  },
  {
    id: 'decoder_mfg_timing',
    name: '生产时效解码器',
    category: 'mfg',
    materialEfficiency: 0.01,
    timeEfficiency: -0.40,
    runBonus: 0,
    successRate: 0,
  },
  {
    id: 'decoder_mfg_increment',
    name: '生产增量解码器',
    category: 'mfg',
    materialEfficiency: 1.25,
    timeEfficiency: 0.70,
    runBonus: 1,
    successRate: 0,
  },
  // ======== 逆向用解码器 ========
  {
    id: 'decoder_rev_actuarial',
    name: '逆向精算解码器',
    category: 'rev',
    materialEfficiency: 0,
    timeEfficiency: 0.40,
    runBonus: 0,
    successRate: 0.30,
  },
  {
    id: 'decoder_rev_optimize',
    name: '逆向优化解码器',
    category: 'rev',
    materialEfficiency: 0,
    timeEfficiency: -0.10,
    runBonus: 0,
    successRate: 0.10,
  },
  {
    id: 'decoder_rev_timing',
    name: '逆向时效解码器',
    category: 'rev',
    materialEfficiency: 0,
    timeEfficiency: -0.40,
    runBonus: 0,
    successRate: 0.05,
  },
  {
    id: 'decoder_rev_increment',
    name: '逆向增量解码器',
    category: 'rev',
    materialEfficiency: 0,
    timeEfficiency: 0.50,
    runBonus: 1,
    successRate: -0.50,
  },
];
```

- [ ] **Step 3: 修改 `src/data/items.ts`** — 更新导入

把 `import type { Item, Decoder }` 改为 `import type { Item }`（解码器类型改为单独文件管理），删除文件中的 `defaultDecoders` 定义。

- [ ] **Step 4: 更新 `src/data/blueprints.ts`** — 添加秃鹫级 + 标签

在 `defaultBlueprints` 追加：
```typescript
  {
    id: 'bp_condor_interceptor',
    name: '秃鹫级截击型蓝图',
    productItemId: 'condor_interceptor',
    productName: '秃鹫级截击型',
    productQuantity: 1,
    baseTime: 16000, // 04:26:40 = 16000秒
    baseCost: 9000000,
    maxRuns: 10,
    materials: [
      { itemId: 'sparkle_alloy', quantity: 6642 },
      { itemId: 'precision_alloy', quantity: 5898 },
      { itemId: 'fiber_composite', quantity: 7526 },
      { itemId: 'noble_metals', quantity: 7526 },
      { itemId: 'reactive_metal', quantity: 1872 },
      { itemId: 'tritanium', quantity: 2467871 },
      { itemId: 'pyerite', quantity: 854016 },
      { itemId: 'mexallon', quantity: 233964 },
      { itemId: 'isogen', quantity: 38498 },
      { itemId: 'nocxium', quantity: 10814 },
      { itemId: 'zydrine', quantity: 4448 },
      { itemId: 'megacyte', quantity: 1812 },
    ],
    tags: ['ship', 'regular_ship', 'frigate', 'caldari', 'interceptor'],
  },
```

在 `blueprintProducts` 追加：
```typescript
{ id: 'condor_interceptor', name: '秃鹫级截击型', category: 'product' },
```

- [ ] **Step 5: 修改 `src/data/reverse.ts`** — 添加秃鹫级逆向 + 标签

追加：
```typescript
  {
    id: 'rev_condor_interceptor',
    name: '秃鹫级截击型逆向工程',
    targetBlueprintId: 'bp_condor_interceptor',
    baseItemId: 'damaged_caldari8',
    baseItemName: '加达里 8 级受损结构',
    maxItemCount: 1,
    maxBaseSuccessRate: 0.50,
    baseTime: 3200, // 00:53:20 = 3200秒
    baseCost: 25000,
    dataCores: [
      { itemId: 'data_core_caldari_engineering', quantity: 3 },
      { itemId: 'data_core_rocket_science', quantity: 3 },
    ],
    tags: ['ship', 'regular_ship', 'frigate', 'caldari', 'interceptor'],
  },
```

- [ ] **Step 6: 更新 `src/data/index.ts`** — 添加解码器导出

```typescript
export { defaultDecoders } from './decoders';
import { defaultDecoders } from './decoders';
```

在 `allItems` 构建中把解码器也加入（或保持 `allItems` 从 `items.ts` 的 defaultDecoders 导入）。由于解码器移到了 `decoders.ts`，需要改导入：
```typescript
import { defaultDecoders } from './decoders';
```
并删除 `items.ts` 中残留的 `defaultDecoders` 导出。

- [ ] **Step 7: 验证** — `npx tsc --noEmit`

- [ ] **Step 8: 提交**

```bash
git add src/data/
git commit -m "feat: add new decoders, condor interceptor data, tag assignments"
```

---

### Task 5: 加成计算解析器 (SkillFacilityResolver)

**Files:**
- Create: `src/engine/resolver.ts`

**Interfaces:**
- Consumes: SkillDef[], SkillLevels, FacilityDef, CustomFacilityBonus, Decoder, productTags
- Produces: `resolveBonuses(productTags, skills, levels, facility, customFacility, decoder)` → `BonusLayers`

- [ ] **Step 1: 写 `src/engine/resolver.ts`**

```typescript
import type { BonusLayers } from '../types/bonus';
import type { SkillDef } from '../types/skill';
import type { FacilityDef, CustomFacilityBonus } from '../types/facility';

interface DecoderLike {
  materialEfficiency: number;
  timeEfficiency: number;
  runBonus: number;
  successRate: number;
}

export function resolveBonuses(
  productTags: string[],
  allSkills: SkillDef[],
  skillLevels: Record<string, [number, number, number]>,
  activeFacility: FacilityDef | undefined,
  customFacility: CustomFacilityBonus,
  decoder: DecoderLike | undefined,
): BonusLayers {
  const result: BonusLayers = {
    skills: { materialEfficiency: 0, timeEfficiency: 0, successRate: 0, costMultiplier: 0, breakdown: [] },
    facilities: { materialEfficiency: 0, timeEfficiency: 0, successRate: 0, costMultiplier: 0 },
    decoder: { materialEfficiency: 0, timeEfficiency: 0, runBonus: 0, successRate: 0 },
  };

  // 技能加成
  for (const skill of allSkills) {
    const hasMatch = skill.matchTags.some(t => productTags.includes(t));
    if (!hasMatch) continue;

    const [base, adv, exp] = skillLevels[skill.id] ?? [0, 0, 0];
    const breakdown: Record<string, number> = {};

    const applyEffects = (tier: typeof skill.base, level: number, prefix: string) => {
      if (level > 0 && level <= tier.effects.length) {
        const eff = tier.effects[level - 1];
        if (eff.materialEfficiency) { result.skills.materialEfficiency += eff.materialEfficiency; breakdown[`${prefix}材料效率`] = eff.materialEfficiency; }
        if (eff.timeEfficiency) { result.skills.timeEfficiency += eff.timeEfficiency; breakdown[`${prefix}时间效率`] = eff.timeEfficiency; }
        if (eff.successRate) { result.skills.successRate += eff.successRate; breakdown[`${prefix}成功率`] = eff.successRate; }
        if (eff.costMultiplier) { result.skills.costMultiplier += eff.costMultiplier; breakdown[`${prefix}现金费用`] = eff.costMultiplier; }
      }
    };

    applyEffects(skill.base, base, '基础');
    applyEffects(skill.advanced, adv, '进阶');
    applyEffects(skill.expert, exp, '专家');

    if (Object.keys(breakdown).length > 0) {
      result.skills.breakdown.push({ skillName: skill.name, effects: breakdown });
    }
  }

  // 设施加成
  if (activeFacility) {
    const hasMatch = activeFacility.matchTags.length === 0 ||
      activeFacility.matchTags.some(t => productTags.includes(t));
    if (hasMatch) {
      result.facilities.materialEfficiency = activeFacility.materialEfficiency ?? 0;
      result.facilities.timeEfficiency = activeFacility.timeEfficiency ?? 0;
      result.facilities.successRate = activeFacility.successRate ?? 0;
      result.facilities.costMultiplier = activeFacility.costMultiplier ?? 0;
    }
  }

  // 自定义设施加成（对所有产品生效）
  result.facilities.materialEfficiency += customFacility.materialEfficiency;
  result.facilities.timeEfficiency += customFacility.timeEfficiency;
  result.facilities.successRate += customFacility.successRate;
  result.facilities.costMultiplier += customFacility.costMultiplier;

  // 解码器加成
  if (decoder) {
    result.decoder.materialEfficiency = decoder.materialEfficiency;
    result.decoder.timeEfficiency = decoder.timeEfficiency;
    result.decoder.runBonus = decoder.runBonus;
    result.decoder.successRate = decoder.successRate;
  }

  return result;
}
```

- [ ] **Step 2: 验证** — `npx tsc --noEmit`

- [ ] **Step 3: 提交**

```bash
git add src/engine/resolver.ts
git commit -m "feat: add SkillFacilityResolver with tag matching"
```

---

### Task 6: 重构制造引擎

**Files:**
- Modify: `src/engine/manufacturing.ts`

- [ ] **Step 1: 重写 `src/engine/manufacturing.ts`**

```typescript
import type { ManufacturingConfig, Blueprint, ProductionResult } from '../types';
import type { BonusLayers, EMPTY_BONUS } from '../types/bonus';
import type { Decoder } from '../types/blueprint';
import { getItemById } from '../data';

type PriceGetter = (itemId: string) => number | null;
type DiscountGetter = (itemId: string) => number | null; // 返回折扣率（如 0.8 = 8折）

export function calculateManufacturing(
  config: ManufacturingConfig,
  bp: Blueprint,
  decoder: Decoder | undefined,
  getPrice: PriceGetter,
  bonuses: BonusLayers,
  getDiscount?: DiscountGetter,
): ProductionResult {
  const materials: ProductionResult['materials'] = [];
  let totalMaterialCost: number | null = 0;

  // 材料效率 = 1.5 + 技能 + 设施 + 解码器
  const finalME = 1.5 + bonuses.skills.materialEfficiency + bonuses.facilities.materialEfficiency + bonuses.decoder.materialEfficiency;

  const effRuns = config.runs + (decoder?.runBonus ?? 0);

  const processMaterial = (itemId: string, baseQty: number, isBase: boolean) => {
    const item = getItemById(itemId);
    const adjustedQty = isBase ? baseQty : baseQty * finalME;
    const totalQty = adjustedQty * config.runs;
    const rawPrice = getPrice(itemId);
    const discount = getDiscount?.(itemId);
    const unitPrice = rawPrice !== null && discount !== null ? rawPrice * discount : rawPrice;
    const subtotal = unitPrice !== null ? totalQty * unitPrice : null;

    if (subtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += subtotal;

    materials.push({
      itemId, itemName: item?.name ?? itemId,
      category: item?.category ?? 'mineral',
      baseQuantity: baseQty, adjustedQuantity: adjustedQty,
      totalQuantity: totalQty, unitPrice, subtotal,
      isBaseMaterial: isBase,
    });
  };

  // 蓝图（基底）
  processMaterial(bp.id, 1, true);

  // 解码器（基底）
  if (decoder) {
    const decPrice = getPrice(decoder.id);
    const decSubtotal = decPrice !== null ? decPrice * config.runs : null;
    if (decSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += decSubtotal;
    materials.push({
      itemId: decoder.id, itemName: decoder.name, category: 'decoder',
      baseQuantity: 1, adjustedQuantity: 1, totalQuantity: config.runs,
      unitPrice: decPrice, subtotal: decSubtotal, isBaseMaterial: true,
    });
  }

  // 普通材料
  for (const m of bp.materials) {
    processMaterial(m.itemId, m.quantity, false);
  }

  // 时间 = 基础 × (1+技能) × (1+设施) × (1+解码器)，乘法
  const finalTime = bp.baseTime
    * (1 + bonuses.skills.timeEfficiency)
    * (1 + bonuses.facilities.timeEfficiency)
    * (1 + bonuses.decoder.timeEfficiency);

  // 现金费用 = 基础 × (1+技能) × 流程数
  const baseCash = bp.baseCost * (1 + bonuses.skills.costMultiplier + bonuses.facilities.costMultiplier);
  const cashCost = baseCash * config.runs;

  const productCount = bp.productQuantity * effRuns;
  const totalCost = totalMaterialCost !== null ? totalMaterialCost + cashCost : null;
  const costPerUnit = totalCost !== null ? totalCost / productCount : null;

  return { materials, totalMaterialCost, cashCost, totalTime: finalTime, productCount, totalCost, costPerUnit };
}
```

- [ ] **Step 2: 验证** — `npx tsc --noEmit`

- [ ] **Step 3: 提交**

```bash
git add src/engine/manufacturing.ts
git commit -m "feat: refactor manufacturing engine with BonusLayers pipeline"
```

---

### Task 7: 重构逆向引擎

**Files:**
- Modify: `src/engine/reverse.ts`

- [ ] **Step 1: 重写 `src/engine/reverse.ts`**

```typescript
import type { ReverseEngineeringConfig, ReverseEngineeringData, ProductionResult } from '../types';
import type { BonusLayers } from '../types/bonus';
import type { Decoder } from '../types/blueprint';
import { getItemById } from '../data';

type PriceGetter = (itemId: string) => number | null;

export function calculateReverse(
  config: ReverseEngineeringConfig,
  revData: ReverseEngineeringData,
  decoder: Decoder | undefined,
  getPrice: PriceGetter,
  bonuses: BonusLayers,
): ProductionResult & { successRate: number; expectedCost: number | null } {
  const materials: ProductionResult['materials'] = [];
  let totalMaterialCost: number | null = 0;

  // 基础成功率
  const baseSuccessRate = config.itemCount > 0
    ? (config.itemCount / revData.maxItemCount) * revData.maxBaseSuccessRate
    : 0;

  // 最终成功率 = 基础 × (1 + 技能 + 设施 + 解码器)
  const rawSuccess = baseSuccessRate
    * (1 + bonuses.skills.successRate + bonuses.facilities.successRate + bonuses.decoder.successRate);
  const successRate = Math.min(rawSuccess, 1.0);

  // 基底材料
  const basePrice = getPrice(revData.baseItemId);
  const baseSubtotal = basePrice !== null ? basePrice * config.itemCount : null;
  if (baseSubtotal === null) totalMaterialCost = null;
  else if (totalMaterialCost !== null) totalMaterialCost += baseSubtotal;
  materials.push({
    itemId: revData.baseItemId,
    itemName: revData.baseItemName,
    category: 'damaged_structure',
    baseQuantity: config.itemCount, adjustedQuantity: config.itemCount,
    totalQuantity: config.itemCount, unitPrice: basePrice, subtotal: baseSubtotal,
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
      itemId: dc.itemId, itemName: dcItem?.name ?? dc.itemId, category: 'data_core',
      baseQuantity: dc.quantity, adjustedQuantity: dc.quantity, totalQuantity: dc.quantity,
      unitPrice: dcPrice, subtotal: dcSubtotal, isBaseMaterial: true,
    });
  }

  // 解码器
  if (decoder) {
    const decPrice = getPrice(decoder.id);
    const decSubtotal = decPrice !== null ? decPrice : null;
    if (decSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += decSubtotal;
    materials.push({
      itemId: decoder.id, itemName: decoder.name, category: 'decoder',
      baseQuantity: 1, adjustedQuantity: 1, totalQuantity: 1,
      unitPrice: decPrice, subtotal: decSubtotal, isBaseMaterial: true,
    });
  }

  // 时间（同制造公式）
  const finalTime = revData.baseTime
    * (1 + bonuses.skills.timeEfficiency)
    * (1 + bonuses.facilities.timeEfficiency)
    * (1 + bonuses.decoder.timeEfficiency);

  // 现金费用
  const baseCash = revData.baseCost * (1 + bonuses.skills.costMultiplier + bonuses.facilities.costMultiplier);
  const cashCost = baseCash;

  const singleCost = totalMaterialCost !== null ? totalMaterialCost + cashCost : null;
  // 期望成本考虑并行流程数
  const expectedCost = singleCost !== null ? (singleCost / successRate) * config.parallelRuns : null;

  return {
    materials, totalMaterialCost, cashCost, totalTime: finalTime,
    productCount: config.parallelRuns,
    totalCost: expectedCost, costPerUnit: expectedCost,
    successRate, expectedCost,
  };
}
```

- [ ] **Step 2: 验证** — `npx tsc --noEmit`

- [ ] **Step 3: 提交**

```bash
git add src/engine/reverse.ts
git commit -m "feat: refactor reverse engineering engine with BonusLayers"
```

---

### Task 8: 更新状态管理

**Files:**
- Modify: `src/state/AppContext.tsx`, `src/state/ProductionContext.tsx`, `src/state/SellingContext.tsx`

- [ ] **Step 1: 更新 `src/state/AppContext.tsx`** — 添加技能/设施/折扣状态

在 imports 后追加新的 storage keys，并在 AppProvider 中添加状态：

```typescript
// 新 imports:
import type { SkillLevels, CustomFacilityBonus, DiscountRule } from '../types';
import { defaultSkills, defaultSkillLevels } from '../data/skills';
import { EMPTY_BONUS } from '../types/bonus';

// 在 AppProvider 内添加:
const [skillLevels, setSkillLevels] = useLocalStorage<SkillLevels>('evem_skill_levels', defaultSkillLevels);
const [activeFacilityId, setActiveFacilityId] = useLocalStorage<string>('evem_active_facility', '');
const [customFacility, setCustomFacility] = useLocalStorage<CustomFacilityBonus>('evem_custom_facility', {
  materialEfficiency: 0, timeEfficiency: 0, successRate: 0, costMultiplier: 0,
});
const [discountRules, setDiscountRules] = useLocalStorage<DiscountRule[]>('evem_discount_rules', []);

// 批量设置技能等级
const batchSetSkillLevels = useCallback((preset: string) => {
  const b = parseInt(preset[0] || '0');
  const a = parseInt(preset[1] || '0');
  const e = parseInt(preset[2] || '0');
  const newLevels: SkillLevels = {};
  defaultSkills.forEach(s => { newLevels[s.id] = [b, a, e]; });
  setSkillLevels(newLevels);
}, [setSkillLevels]);

// 添加/删除折扣规则
const addDiscountRule = useCallback((rule: Omit<DiscountRule, 'id'>) => {
  const newRule = { ...rule, id: Date.now().toString(36) };
  setDiscountRules(prev => [...prev, newRule]);
}, [setDiscountRules]);
const removeDiscountRule = useCallback((id: string) => {
  setDiscountRules(prev => prev.filter(r => r.id !== id));
}, [setDiscountRules]);

// 获取折扣
const getDiscount = useCallback((itemId: string, scope: 'buy' | 'sell', category?: string): number | null => {
  // 按优先级查找
  for (const rule of discountRules) {
    if (rule.scope !== scope) continue;
    if (rule.type === 'item' && rule.targetId === itemId) return rule.rate;
    if (rule.type === 'category' && rule.targetId === category) return rule.rate;
  }
  return null;
}, [discountRules]);
```

在 Provider value 中追加上述新状态和方法。

- [ ] **Step 2: 更新 `src/state/ProductionContext.tsx`** — 适配新 ManufacturingConfig/ReverseEngineeringConfig

修改 `initialState` 为新的配置结构：
```typescript
const initialState: ProductionState = {
  projectType: 'manufacturing',
  manufacturing: {
    blueprintId: '', runs: 1, timeEfficiency: 1.0,
    decoderId: undefined, customRuns: false,
  },
  reverse: {
    reverseId: '', itemCount: 1, parallelRuns: 1,
    timeEfficiency: 1.0, decoderId: undefined,
  },
  result: null,
};
```

- [ ] **Step 3: 更新 `src/state/SellingContext.tsx`** — 添加折扣覆写

在 `SellingState` 中添加：
```typescript
discountOverride: number | null; // null = 使用全局折扣
```

- [ ] **Step 4: 验证** — `npx tsc --noEmit`

- [ ] **Step 5: 提交**

```bash
git add src/state/
git commit -m "feat: update state management with skills, facilities, discount rules"
```

---

### Task 9: 技能和设施面板 UI

**Files:**
- Create: `src/components/SkillsFacilitiesPanel/SkillsFacilitiesPanel.tsx`, `SkillsFacilitiesPanel.module.css`

- [ ] **Step 1: 写 `SkillsFacilitiesPanel.tsx`**

```tsx
import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { defaultSkills } from '../../data/skills';
import styles from './SkillsFacilitiesPanel.module.css';

const PRESETS = ['000', '540', '550', '553', '554', '555'];

export function SkillsFacilitiesPanel() {
  const { skillLevels, batchSetSkillLevels, customFacility, setCustomFacility } = useApp();
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <div className={styles.collapsed}>
        <button className={styles.toggle} onClick={() => setExpanded(true)}>
          ▶ 技能和设施
        </button>
      </div>
    );
  }

  // 计算汇总
  let totalME = 0, totalTE = 0, totalSR = 0, totalCost = 0;
  defaultSkills.forEach(skill => {
    const [b, a, e] = skillLevels[skill.id] ?? [0, 0, 0];
    const sumEffects = (tier: typeof skill.base, level: number) => {
      if (level > 0) {
        const eff = tier.effects[level - 1];
        totalME += eff.materialEfficiency ?? 0;
        totalTE += eff.timeEfficiency ?? 0;
        totalSR += eff.successRate ?? 0;
        totalCost += eff.costMultiplier ?? 0;
      }
    };
    sumEffects(skill.base, b);
    sumEffects(skill.advanced, a);
    sumEffects(skill.expert, e);
  });

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button className={styles.toggle} onClick={() => setExpanded(false)}>▼ 技能和设施</button>
        <div className={styles.presetArea}>
          一键设置: <select onChange={e => batchSetSkillLevels(e.target.value)}>
            {PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <h4>玩家技能</h4>
      {defaultSkills.map(skill => {
        const [b, a, e] = skillLevels[skill.id] ?? [0, 0, 0];
        const threeDigit = `${b}${a}${e}`;
        return (
          <div key={skill.id} className={styles.skillItem}>
            <span className={styles.skillName}>{skill.name}</span>
            <span className={styles.threeDigit}>{threeDigit}</span>
            <div className={styles.tiers}>
              {(['base', 'advanced', 'expert'] as const).map((tier, ti) => {
                const level = [b, a, e][ti];
                const maxLevel = 5;
                // 约束校验
                const disabled = (tier === 'advanced' && b < 4) || (tier === 'expert' && a < 5);
                return (
                  <div key={tier} className={styles.tierRow}>
                    <span className={styles.tierLabel}>{['基础', '进阶', '专家'][ti]}</span>
                    <input
                      type="range" min={0} max={5} value={level}
                      disabled={disabled}
                      onChange={e => {
                        const v = parseInt(e.target.value);
                        const levels: [number, number, number] = [b, a, e];
                        levels[ti] = v;
                        // 级联清零
                        if (ti === 0 && v < 4) levels[1] = 0;
                        if (ti <= 1 && levels[1] < 5) levels[2] = 0;
                        const { setSkillLevels } = useApp();
                        // 需要用正确的方式更新 — 由于 useApp 在函数组件内使用，这里改为通过 AppContext 的 setter
                      }}
                    />
                    <span>{level}/{maxLevel}</span>
                    {level > 0 && skill[tier].effects[level - 1] && (
                      <span className={styles.effects}>
                        {skill[tier].effects[level - 1].materialEfficiency !== undefined &&
                          `材料效率 ${(skill[tier].effects[level - 1].materialEfficiency! * 100).toFixed(0)}%`}
                        {skill[tier].effects[level - 1].timeEfficiency !== undefined &&
                          ` 时间 ${(skill[tier].effects[level - 1].timeEfficiency! * 100).toFixed(0)}%`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className={styles.summary}>
        <h4>加成汇总</h4>
        <div>材料效率: +{(totalME * 100).toFixed(0)}%</div>
        <div>时间效率: {(totalTE * 100).toFixed(0)}%</div>
        <div>成功率: +{(totalSR * 100).toFixed(0)}%</div>
        <div>现金费用: +{(totalCost * 100).toFixed(0)}%</div>
      </div>

      <h4>工业设施</h4>
      <div className={styles.facilitySection}>
        <button onClick={() => {
          // 打开自定义设施加成弹窗
          const me = parseFloat(prompt('材料效率加成 %:', String(customFacility.materialEfficiency * 100)) || '0') / 100;
          const te = parseFloat(prompt('时间效率加成 %:', String(customFacility.timeEfficiency * 100)) || '0') / 100;
          const sr = parseFloat(prompt('成功率加成 %:', String(customFacility.successRate * 100)) || '0') / 100;
          const cm = parseFloat(prompt('现金费用加成 %:', String(customFacility.costMultiplier * 100)) || '0') / 100;
          setCustomFacility({ materialEfficiency: me, timeEfficiency: te, successRate: sr, costMultiplier: cm });
        }}>自定义设施加成</button>
        {customFacility.materialEfficiency !== 0 && <span>材料效率: {(customFacility.materialEfficiency * 100).toFixed(0)}%</span>}
        {customFacility.timeEfficiency !== 0 && <span> 时间: {(customFacility.timeEfficiency * 100).toFixed(0)}%</span>}
      </div>
    </div>
  );
}
```

注意：上述代码中的滑块 onChange 使用了不太理想的方式。实际实现需要创建一个 `setSkillLevel` 函数用 context dispatch 更新单个技能等级。这通过 AppContext 中新增的 `updateSkillLevel(skillId, tier, level)` 方法实现。

- [ ] **Step 2: 写 `SkillsFacilitiesPanel.module.css`** — 暗色主题样式（折叠/展开、技能列表、汇总）

```css
.collapsed { padding: 8px 20px; background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
.panel { padding: 12px 20px; background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
.toggle { background: none; border: none; color: var(--color-primary); cursor: pointer; font-size: 14px; font-weight: 600; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.presetArea { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.presetArea select { background: var(--color-bg); color: var(--color-text); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 2px 6px; }
.skillItem { margin-bottom: 8px; padding: 8px; background: var(--color-bg); border-radius: var(--radius); }
.skillName { font-weight: 600; margin-right: 8px; }
.threeDigit { font-family: var(--font-mono); font-size: 16px; color: var(--color-primary); }
.tiers { margin-top: 4px; }
.tierRow { display: flex; align-items: center; gap: 8px; font-size: 12px; margin: 2px 0; }
.tierLabel { width: 32px; color: var(--color-text-secondary); }
.effects { color: var(--color-success); margin-left: 8px; font-size: 11px; }
.summary { margin: 12px 0; padding: 8px; background: var(--color-bg); border-radius: var(--radius); font-size: 13px; }
.summary h4 { color: var(--color-primary); margin-bottom: 4px; }
.facilitySection { display: flex; gap: 12px; align-items: center; font-size: 13px; }
.facilitySection button { background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 4px 12px; cursor: pointer; font-size: 13px; }
```

- [ ] **Step 3: 在 AppContext 中添加 `updateSkillLevel` 方法**

```typescript
const updateSkillLevel = useCallback((skillId: string, tier: 0 | 1 | 2, level: number) => {
  setSkillLevels(prev => {
    const current = [...(prev[skillId] ?? [0, 0, 0])] as [number, number, number];
    current[tier] = Math.max(0, Math.min(5, level));
    // 级联约束
    if (tier >= 0 && current[0] < 4) current[1] = 0;
    if (tier <= 1 && current[1] < 5) current[2] = 0;
    return { ...prev, [skillId]: current };
  });
}, [setSkillLevels]);
```

- [ ] **Step 4: 更新 `src/App.tsx`** — 插入 SkillsFacilitiesPanel

在 Header 之后，main 之前添加：
```tsx
<SkillsFacilitiesPanel />
```

- [ ] **Step 5: 验证** — `npx tsc --noEmit ; npm run dev`

- [ ] **Step 6: 提交**

```bash
git add src/components/SkillsFacilitiesPanel/ src/state/AppContext.tsx src/App.tsx
git commit -m "feat: add Skills & Facilities panel UI with skill level controls"
```

---

### Task 10: 折扣配置 UI + 教程

**Files:**
- Create: `src/components/DiscountConfig/` (复用原有价格配置弹窗模式)
- Create: `src/components/Tutorial/Tutorial.tsx`, `Tutorial.module.css`

- [ ] **Step 1: 写 `DiscountConfig.tsx`** — 折扣规则列表 + 添加

```tsx
import { useApp } from '../../state/AppContext';
import styles from './DiscountConfig.module.css';

export function DiscountConfig() {
  const { discountRules, addDiscountRule, removeDiscountRule } = useApp();

  const handleAdd = () => {
    const type = prompt('类型 (category/item):', 'category') as 'category' | 'item';
    const targetId = prompt('目标 (分类名 或 物品ID):', '') || '';
    const name = prompt('显示名:', '') || targetId;
    const rate = parseFloat(prompt('折扣率 (0.8 = 8折):', '1.0') || '1.0');
    const scope = prompt('适用范围 (buy/sell):', 'buy') as 'buy' | 'sell';
    if (targetId && !isNaN(rate)) {
      addDiscountRule({ type, targetId, name, rate, scope });
    }
  };

  return (
    <div className={styles.section}>
      <h4>折扣配置 <button onClick={handleAdd}>+ 添加</button></h4>
      <table className={styles.table}>
        <thead><tr><th>名称</th><th>类型</th><th>折扣</th><th>范围</th><th></th></tr></thead>
        <tbody>
          {discountRules.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.type === 'category' ? '分类' : '物品'}</td>
              <td>{(r.rate * 100).toFixed(0)}%</td>
              <td>{r.scope === 'buy' ? '购买' : '出售'}</td>
              <td><button onClick={() => removeDiscountRule(r.id)}>×</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: 写 `Tutorial.tsx`**

```tsx
import { useState } from 'react';
import styles from './Tutorial.module.css';

export function Tutorial() {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.wrapper}>
      <button className={styles.toggle} onClick={() => setShow(!show)}>
        {show ? '▼ 隐藏帮助' : '▶ 使用帮助'}
      </button>
      {show && (
        <div className={styles.content}>
          <p>本工具帮助你在《星战前夜：无烬星河》中计算工业项目的投入产出比。</p>
          <p><strong>使用步骤：</strong></p>
          <ol>
            <li>在顶部「技能和设施」中设置你的角色技能等级</li>
            <li>在左侧选择制造或逆向工程项目</li>
            <li>选择产品和对应的解码器</li>
            <li>在材料清单中填入各种材料的单价</li>
            <li>在「折扣配置」中设置全局折扣规则（如矿物 7 折）</li>
            <li>点击「发送到出售」，在右侧输入售价查看利润</li>
          </ol>
          <p><strong>计算公式说明：</strong></p>
          <ul>
            <li>材料效率 = 150% + 技能加成 + 设施加成 + 解码器加成</li>
            <li>时间消耗 = 基础时间 × (1+技能) × (1+设施) × (1+解码器)</li>
            <li>成功率 = 基础成功率 × (1+技能+设施+解码器)，上限 100%</li>
            <li>折扣优先级：手动覆写 > 材料清单 > 全局规则</li>
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 验证** — `npx tsc --noEmit`

- [ ] **Step 4: 提交**

```bash
git add src/components/DiscountConfig/ src/components/Tutorial/
git commit -m "feat: add discount config UI and tutorial component"
```

---

### Task 11: 更新现有生产/出售面板组件

**Files:**
- Modify: `src/components/ProductionPanel/DecoderSelector.tsx`, `ProductionSummary.tsx`, `MaterialList.tsx`, `ProductionPanel.tsx`
- Modify: `src/components/SellingPanel/MarketSellConfig.tsx`, `ContractSellConfig.tsx`

- [ ] **Step 1: 更新 `DecoderSelector.tsx`** — 按制造/逆分家

```tsx
import { useProduction } from '../../state/ProductionContext';
import { defaultDecoders } from '../../data/decoders';
import styles from './ProductionPanel.module.css';

export function DecoderSelector() {
  const { state, dispatch } = useProduction();

  const isMfg = state.projectType === 'manufacturing';
  const availableDecoders = defaultDecoders.filter(d => d.category === (isMfg ? 'mfg' : 'rev'));
  // 加"无解码器"选项
  const allOptions = [{ id: '', name: '无解码器', category: isMfg ? 'mfg' : 'rev', materialEfficiency: 0, timeEfficiency: 0, runBonus: 0, successRate: 0 }, ...availableDecoders];
  const decoderId = isMfg ? state.manufacturing.decoderId : state.reverse.decoderId;
  const selected = allOptions.find(d => d.id === decoderId);

  const setDecoder = (id: string) => {
    const payload = id ? { decoderId: id } : { decoderId: undefined };
    if (isMfg) dispatch({ type: 'SET_MANUFACTURING', payload });
    else dispatch({ type: 'SET_REVERSE', payload });
  };

  return (
    <div className={styles.section}>
      <label className={styles.label}>解码器</label>
      <select className={styles.select} value={decoderId ?? ''} onChange={e => setDecoder(e.target.value)}>
        {allOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      {selected && selected.id && (
        <div className={styles.decoderPreview}>
          {selected.materialEfficiency !== 0 && <span>材料效率: {(selected.materialEfficiency * 100).toFixed(0)}%</span>}
          <span>时间效率: {(selected.timeEfficiency * 100).toFixed(0)}%</span>
          {selected.runBonus > 0 && <span>流程: +{selected.runBonus}</span>}
          {selected.successRate !== 0 && <span>成功率: {(selected.successRate * 100).toFixed(0)}%</span>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 更新 `ProductionSummary.tsx`** — 自定义流程数 + 槽位

在流程数滑块旁边添加自定义输入框：
```tsx
<input type="number" min={1} value={state.manufacturing.runs}
  onChange={e => dispatch({ type: 'SET_MANUFACTURING', payload: { runs: parseInt(e.target.value) || 1, customRuns: true } })}
/>
```
逆向模式显示并行流程数输入。

- [ ] **Step 3: 更新 `MaterialList.tsx`** — 添加折扣覆写列

在表格中追加「折扣」列：
```tsx
<th>折扣</th>
...
<td>
  <input className={styles.priceInput} type="number" min="1" max="100"
    placeholder="全局"
    value={rowDiscount ?? ''}
    onChange={e => { /* set per-item discount override */ }}
  />%
</td>
```

- [ ] **Step 4: 更新 `ProductionPanel.tsx`** — 集成 BonusLayers 到引擎调用

在 useEffect 中添加 resolver 调用：
```typescript
const { skillLevels, getPrice } = useApp();
const bonuses = resolveBonuses(productTags, defaultSkills, skillLevels, undefined, customFacility, decoder);
const result = calculateManufacturing(config, bp, decoder, getPrice, bonuses, getDiscount);
```

- [ ] **Step 5: 更新出售面板** — 添加折扣覆写输入

在 MarketSellConfig/ContractSellConfig 中添加「出售折扣」输入框。

- [ ] **Step 6: 验证** — `npx tsc --noEmit`

- [ ] **Step 7: 提交**

```bash
git add src/components/ProductionPanel/ src/components/SellingPanel/
git commit -m "feat: update production/selling panels for v2 formulas, discounts, custom runs"
```

---

### Task 12: 集成测试 + 构建验证

- [ ] **Step 1: 全面编译检查**

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npx tsc --noEmit
```

- [ ] **Step 2: 生产构建**

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npm run build
```

Expected: 构建成功，产出 `dist/`

- [ ] **Step 3: 用测试数据校验**

以秃鹫级截击型为例：
- 制造：材料效率 = 1.5（无技能加成时）= 150%，时间 = 16000 × 1.0 = 04:26:40
- 逆向：基底数 1，最大成功率 50%
- 设置护卫舰制造技术 555 后验证公式

- [ ] **Step 4: 提交最终版本**

```bash
git add -A
git commit -m "chore: integration testing and build verification for v2"
```
