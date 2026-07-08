# 修复技能加成方向与叠加逻辑

## 摘要
三项公式修正：材料效率方向翻转、时间效率乘法叠加、技能范围隔离（制造/逆向分离）。

## 改动文件

### 1. `src/types/skill.ts` — 类型扩展

`SkillDef` 加字段：`skillType: 'mfg' | 'rev' | 'both'`

### 2. `src/data/skills.ts` — 数据标注

两项技能加 `skillType`：护卫舰制造技术 → `'mfg'`，加达里发明原理 → `'rev'`

### 3. `src/engine/resolver.ts` — 核心重算

- 签名加 `projectType: 'mfg' | 'rev'` 参数
- 技能过滤：`skill.skillType !== projectType && skill.skillType !== 'both'` → skip
- TE 改乘法：同技能三阶段 `(1+base_TE)×(1+adv_TE)×(1+exp_TE)−1`
- ME 保持加法（等待后续验证是否也需要乘法）

### 4. `src/engine/manufacturing.ts` — ME 公式修正

```
finalME = 1.5 - bonuses.skills.materialEfficiency - bonuses.facilities.materialEfficiency + bonuses.decoder.materialEfficiency
```

### 5. `src/engine/reverse.ts` — 同上

### 6. `src/components/ProductionPanel/ProductionPanel.tsx` — 调用适配

- 调用 `resolveBonuses` 时传入 `state.projectType === 'manufacturing' ? 'mfg' : 'rev'`
- 全局覆盖 mode 同步修正：`1.5 - globalOverrides.materialEfficiency` 改为 `globalOverrides.materialEfficiency` 直接作为最终 ME
  - 即覆写时：`bonuses.skills.materialEfficiency = 1.5 - globalOverrides.materialEfficiency`（使引擎公式算出 `1.5 − (1.5 − override) = override`）
  - TE：`bonuses.skills.timeEfficiency = globalOverrides.timeEfficiency - 1.0`
  - SR：`bonuses.skills.successRate = globalOverrides.successRate`（不变）

## 验证

1. `npx tsc --noEmit` 通过
2. 护卫舰制造技术 554 时，制造护卫舰的时间效率加成 = −55%
3. 加达里发明原理不影响制造时间，护卫舰制造技术不影响逆向时间
4. 材料效率技能 554 时，制造材料的 ME 低于 150%（更省材料）
