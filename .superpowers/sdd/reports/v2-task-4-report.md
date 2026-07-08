# v2 Task 4 报告：解码器 + 产品数据重做

**日期：** 2026-07-08
**状态：** ✅ 完成

## 变更概述

按照 Task 4 计划完成了以下数据层改动：

### 1. `src/data/items.ts` — 删除旧解码器 + 新材料物品
- 移除了旧的 `defaultDecoders` 数组（3 个旧解码器：`decoder_none`, `decoder_me_1`, `decoder_run_1`）
- 移除了 `Decoder` 类型导入（仅保留 `Item`）
- 在 `defaultItems` 末尾追加了 8 个 v2 新材料物品：
  - `sparkle_alloy`, `precision_alloy`, `fiber_composite`, `reactive_metal`（行星产物）
  - `damaged_caldari8`（受损结构）
  - `data_core_caldari_engineering`, `data_core_rocket_science`（数据核心）
  - `condor_interceptor`（产品）

### 2. `src/data/decoders.ts` — 新建，8 个新解码器
- 使用 Task 1 定义的新 `Decoder` 接口（不再 extend `Item`）
- 4 个制造用解码器（`category: 'mfg'`）：
  - `decoder_mfg_actuarial` — 生产精算解码器（ME -5%, TE +40%）
  - `decoder_mfg_optimize` — 生产优化解码器（ME -2%, TE -20%）
  - `decoder_mfg_timing` — 生产时效解码器（ME +1%, TE -40%）
  - `decoder_mfg_increment` — 生产增量解码器（ME +125%, TE +70%, 流程 +1）
- 4 个逆向用解码器（`category: 'rev'`）：
  - `decoder_rev_actuarial` — 逆向精算解码器（TE +40%, 成功率 +30%）
  - `decoder_rev_optimize` — 逆向优化解码器（TE -10%, 成功率 +10%）
  - `decoder_rev_timing` — 逆向时效解码器（TE -40%, 成功率 +5%）
  - `decoder_rev_increment` — 逆向增量解码器（TE +50%, 流程 +1, 成功率 -50%）

### 3. `src/data/blueprints.ts` — 秃鹫级截击型 + 标签
- 为现有蓝图补充 `tags` 字段：
  - `bp_t9_bs`: `['ship', 'regular_ship', 'battleship']`
  - `bp_t8_cruiser`: `['ship', 'regular_ship', 'cruiser']`
- 新增 `bp_condor_interceptor` 蓝图：
  - baseTime: 16000s, baseCost: 9,000,000 ISK, maxRuns: 10
  - 12 种材料（包括 4 种新材料 + 8 种矿物）
  - tags: `['ship', 'regular_ship', 'frigate', 'caldari', 'interceptor']`
- `blueprintProducts` 追加 `condor_interceptor`

### 4. `src/data/reverse.ts` — 接口适配 + 秃鹫级逆向
- 现有条目从旧接口（`successRatePerItem`）迁移到新接口（`maxBaseSuccessRate`）：
  - `rev_t9_bs`: maxBaseSuccessRate = 0.50（等价于旧 5 × 0.10）
  - `rev_t8_cruiser`: maxBaseSuccessRate = 0.50
- 现有条目补充 `tags` 字段
- 新增 `rev_condor_interceptor`：
  - maxItemCount: 1, maxBaseSuccessRate: 0.50
  - baseTime: 3200s, baseCost: 25,000 ISK
  - 2 种数据核心各 3 个
  - tags: `['ship', 'regular_ship', 'frigate', 'caldari', 'interceptor']`

### 5. `src/data/index.ts` — 导出适配
- `defaultDecoders` 改为从 `./decoders` 导入（不再从 `./items`）
- `allItems` 不再包含解码器（因新 `Decoder` 不 extend `Item`）
- `getDecoderById` 继续正常工作（使用 `./decoders` 的数据）

## 验证结果

- **TypeScript 编译：** `npx tsc --noEmit` — 通过（exit code 0，零错误）
- **提交：** `f9639b3` — `feat: add new decoders, condor interceptor data, tag assignments`
- **影响文件：** 5 files changed, 141 insertions(+), 22 deletions(-)

## 注意事项

- 旧解码器 `decoder_none`（"无解码器"）已移除。引擎和组件代码中仍有引用旧解码器 ID 和字段名（`meBonus`, `teBonus`, `decoder_none`）的代码，这些将在后续 Task 6/7/11 中更新。
- 但 `tsc --noEmit` 已通过，因为现有组件/引擎的类型定义仍在 `../types` 下且兼容。
