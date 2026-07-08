# v2 Task 6 报告：重构制造引擎

**状态**: ✅ 完成  
**日期**: 2026-07-08  
**提交**: `d63693c` — `feat: refactor manufacturing engine with BonusLayers pipeline`

---

## 变更概要

重写了 `src/engine/manufacturing.ts`，将制造引擎从旧的直接配置驱动改为 BonusLayers 分层管线。

### 文件变更

| 文件 | 操作 | 差异 |
|------|------|------|
| `src/engine/manufacturing.ts` | 重写 | +43 / -41 行 |

### 核心变更

1. **函数签名扩展**：
   - 新增 `bonuses: BonusLayers` 参数（默认 `EMPTY_BONUS`，保持向后兼容）
   - 新增可选 `getDiscount?: DiscountGetter` 参数（折扣率查询）

2. **公式重做**：
   - **材料效率**：`1.5 + skills.materialEfficiency + facilities.materialEfficiency + decoder.materialEfficiency`（加法）
   - **时间**：`baseTime × (1+skills.timeEfficiency) × (1+facilities.timeEfficiency) × (1+decoder.timeEfficiency)`（乘法）
   - **现金费用**：`baseCost × (1+skills.costMultiplier + facilities.costMultiplier) × runs`
   - **流程数**：`runs + decoder.runBonus`

3. **processMaterial 重构**：
   - 旧：接收 `MaterialEntry` 对象
   - 新：直接接收 `(itemId, baseQty, isBase)` 参数，与 Blueprint 的新 materials 类型 `{ itemId: string; quantity: number }[]` 对齐

4. **解码器处理简化**：
   - 旧：检查 `decoder && decoder.id !== 'decoder_none'`
   - 新：直接检查 `if (decoder)`，因为新 Decoder 类型不再有 `'decoder_none'`

5. **折扣集成**：
   - 材料价格计算支持可选的 `getDiscount` 回调，允许按物品查询折扣率

---

## 编译验证

```
npx tsc --noEmit  →  exit 0, 0 errors
```

---

## 注意事项

- `bonuses` 参数带默认值 `EMPTY_BONUS`，旧调用方无需修改即可编译通过
- 在 Task 8/11 中，ProductionPanel 将通过 `resolveBonuses()` 计算并传入真实 BonusLayers
- `ManufacturingConfig.materialEfficiency` 已被移除（Task 1），`timeEfficiency` 保留但新引擎不使用该字段
- 报告路径：`d:\Trae_Projects\EVEM_Industry_Calc\.superpowers\sdd\reports\v2-task-6-report.md`
