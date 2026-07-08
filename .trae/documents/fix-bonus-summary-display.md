# 加成汇总修正 + 显示实际效率值

## 改动

### 1. `src/types/result.ts` — ProductionResult 加 3 个字段

```typescript
finalMaterialEfficiency?: number; // 最终材料效率（如 1.15 = 115%）
finalTimeMultiplier?: number;     // 最终时间倍率（如 0.45 = 45% 基准）
finalSuccessRate?: number;        // 最终成功率（0.55 = 55%）
```

### 2. `src/engine/manufacturing.ts` — 计算并填入 finalME、finalTE

在 `const finalME = ...` 和 `const finalTime = ...` 之后，存入 result:

```typescript
const result: ProductionResult = { ... };
result.finalMaterialEfficiency = finalME;
result.finalTimeMultiplier = finalTime / bp.baseTime / config.runs; // 需在 runs 乘之前取
```

### 3. `src/engine/reverse.ts` — 计算并填入 finalTE、finalSR

```typescript
const result = { ... };
result.finalTimeMultiplier = finalTime / revData.baseTime;
result.finalSuccessRate = successRate; // 已有
```

### 4. `src/components/SkillsFacilitiesPanel/SkillsFacilitiesPanel.tsx` — computeBonusSummary 修正

- TE 三阶段改乘法叠加（与 resolver 一致）
- ME/成功率/费用倍率保持加法
- 时间效率"合计"改为：`(1+技能TE)×(1+设施TE)−1`

### 5. `src/components/ProductionPanel/ProductionSummary.tsx` — 显示实际值

在 summaryGrid 中追加显示最终材料效率、时间倍率（和成功率，仅逆向）：

```tsx
{state.result.finalMaterialEfficiency !== undefined && (
  <div className={styles.summaryItem}>
    <span className={styles.summaryLabel}>最终材料效率</span>
    <span className={styles.summaryValue}>
      {(state.result.finalMaterialEfficiency * 100).toFixed(0)}%
    </span>
  </div>
)}
{state.result.finalTimeMultiplier !== undefined && (
  <div className={styles.summaryItem}>
    <span className={styles.summaryLabel}>最终时间倍率</span>
    <span className={styles.summaryValue}>
      {(state.result.finalTimeMultiplier * 100).toFixed(0)}%
    </span>
  </div>
)}
```

## 验证

- `npx tsc --noEmit` 通过
- `npm run build` 成功
- 制造项目显示最终材料效率和时间倍率
- 逆向项目显示最终时间倍率和成功率
- 技能设施面板加成汇总 TE 为乘法值（554 → −55%）
