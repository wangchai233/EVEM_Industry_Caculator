# v2 Build Type Errors 修复报告

**日期**: 2026-07-08  
**状态**: ✅ 全部修复完成  
**提交**: `6a68205` - "fix: resolve v2 build type errors"

---

## 修复概述

共修复 6 个文件中的 12 个 TypeScript 编译错误。

## 详细修复

### 1. `src/components/ProductionPanel/EfficiencyConfig.tsx`（5 错误）
- **问题**: `ManufacturingConfig` 在 v2 中不再包含 `materialEfficiency` 字段，但组件仍引用该字段
- **根因**: v1 中用户直接设置 ME，v2 中 ME 由 BonusLayers 自动计算
- **修复**: 完全移除材料效率部分（`ME_PRESETS`、`setME` 函数、ME 的 select/input UI），仅保留时间效率部分
- **附带**: 将 fallback 对象从 `{ materialEfficiency: 1.5, timeEfficiency: state.reverse.timeEfficiency }` 简化直接引用 `state.reverse`

### 2. `src/components/ProductionPanel/ProductionPanel.tsx`（2 错误）
- **问题1**: `EMPTY_BONUS` 导入未使用（`calculateManufacturing` 已显式传入 `bonuses`）
- **修复**: 移除 `import { EMPTY_BONUS } from '../../types/bonus'`
- **问题2**: `getDiscount` 签名不匹配——AppContext 提供 `(itemId, scope, category?) => number | null`，但 `calculateManufacturing` 期望 `DiscountGetter`（即 `(itemId) => number | null`）
- **修复**: 创建 wrapper：`(itemId: string) => getDiscount(itemId, 'buy')`

### 3. `src/components/ProductionPanel/ProductionSummary.tsx`（2 错误）
- **问题**: `state.result.successRate` 和 `state.result.expectedCost` 可能为 `undefined`
- **修复**: 分别添加 `?? 0`

### 4. `src/engine/manufacturing.ts`（1 错误）
- **问题**: `discount` 可能为 `undefined`，`rawPrice * discount` 类型不安全
- **修复**: `rawPrice * (discount ?? 1)` —— 无折扣时默认为 1（原价）

### 5. `src/state/AppContext.tsx`（1 错误）
- **问题**: `EMPTY_BONUS` 导入未使用
- **修复**: 移除该导入行

### 6. `src/types/blueprint.ts`（1 错误）
- **问题**: `import type { Item } from './item'` 导入未使用
- **修复**: 移除该导入行

## 验证结果

```
$ npx tsc --noEmit  →  exit 0（零错误）
$ npm run build    →  ✅ 构建成功
  - 69 modules transformed
  - dist/assets/index-AcxldPAT.js  239.90 kB (gzip: 73.25 kB)
  - dist/assets/index-B96Gvm7O.css 12.06 kB (gzip: 2.54 kB)
  - Built in 869ms
```

## 提交信息

- **Commit**: `6a68205`
- **Branch**: `main`
- **Message**: `fix: resolve v2 build type errors`
