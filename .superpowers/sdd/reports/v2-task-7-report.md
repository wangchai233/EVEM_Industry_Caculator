# v2 Task 7 报告：重构逆向引擎

**状态:** ✅ 完成  
**日期:** 2026-07-08  
**文件:** `src/engine/reverse.ts`

---

## 变更摘要

重写了 `src/engine/reverse.ts`，使 `calculateReverse()` 接受 `BonusLayers` 参数并使用新的分层加成公式。

### 关键变更

1. **函数签名变更** — 新增第 5 个参数 `bonuses: BonusLayers`
2. **成功率公式** — 从 `itemCount * successRatePerItem` 改为 `(itemCount / maxItemCount) * maxBaseSuccessRate * (1 + 技能SR + 设施SR + 解码器SR)`，上限 100%
3. **时间公式** — 改为乘法管道：`baseTime × (1+技能TE) × (1+设施TE) × (1+解码器TE)`
4. **现金费用** — 改为 `baseCost × (1 + 技能costMultiplier + 设施costMultiplier)`
5. **parallelRuns** — 在期望成本和 productCount 中使用 `config.parallelRuns`
6. **解码器** — 移除了 `decoder.id !== 'decoder_none'` 检查，直接判断 `decoder` 是否为 undefined

### 不再使用的字段
- `revData.successRatePerItem` → 替换为 `revData.maxBaseSuccessRate` + `revData.maxItemCount`
- `config.timeEfficiency` → 替换为 BonusLayers 中的分层时间效率
- `decoder.teBonus` → 替换为 `decoder.timeEfficiency`

---

## 验证结果

| 项目 | 结果 |
|------|------|
| `npx tsc --noEmit` | ✅ 通过（0 错误） |

---

## 提交信息

- **Commit:** `354b879` — `feat: refactor reverse engineering engine with BonusLayers`
- **文件:** `src/engine/reverse.ts`（1 file changed, 33 insertions, 11 deletions）

---

## 注意事项

- `ProductionPanel.tsx` 中的调用方已同步更新为传入 `EMPTY_BONUS`，确保编译通过（该调用方的完整 BonusLayers 集成将在 Task 11 中完成）
- `manufacturing.ts` 尚未重构（等待 Task 6），因此其调用方也尚未更新
