# 删除无效的"加成汇总"

## 改动

### `src/components/SkillsFacilitiesPanel/SkillsFacilitiesPanel.tsx`

删除 `{/* ── 加成汇总 ── */}` 区块（含材料效率/时间效率/成功率/费用倍率四行合计），保留其后的 `{/* 技能明细 */}` 部分。

具体：删除从 `{/* ── 加成汇总 ── */}` 到 `</div>`（`summaryGrid` 闭合）之间的所有代码，将"技能明细"提升为独立的 `<div className={styles.section}>`。

同时 `computeBonusSummary` 保留（技能明细仍需要它），`bonus` 变量保留。

## 验证

- `npx tsc --noEmit` 通过
- 页面加载无 error
