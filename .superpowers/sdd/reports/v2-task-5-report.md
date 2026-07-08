# v2 Task 5 报告：加成计算解析器 (SkillFacilityResolver)

**日期：** 2026-07-08
**状态：** ✅ 完成

## 变更概述

按照 Task 5 计划创建了 `src/engine/resolver.ts`，实现了分层加成管线中的核心解析器 `resolveBonuses()`。

### `src/engine/resolver.ts` — 新建

- 导出 `resolveBonuses()` 函数，签名：
  ```
  resolveBonuses(productTags, allSkills, skillLevels, activeFacility, customFacility, decoder) → BonusLayers
  ```
- 消费类型：`SkillDef[]`, `SkillLevels`, `FacilityDef`, `CustomFacilityBonus`（从 Task 1 定义的类型）
- 产出类型：`BonusLayers`（包含 skills/facilities/decoder 三层加成）

### 处理逻辑

1. **技能加成：** 遍历所有技能，通过 `matchTags` 与 `productTags` 做标签匹配；匹配的技能逐级（基础/进阶/专家）读取 `SkillLevelEffect`，累加材料效率、时间效率、成功率、现金费用；同时生成 `breakdown` 明细（含技能名和各级效果）。

2. **设施加成：** 若 `activeFacility` 的标签与产品匹配（或设施无标签限制），则应用其四项加成；自定义设施加成（`customFacility`）无条件叠加到设施层。

3. **解码器加成：** 直接将解码器的材料效率、时间效率、流程加成、成功率写入结果层。

## 验证结果

- **TypeScript 编译：** `npx tsc --noEmit` — 通过（exit code 0，零错误）
- **提交：** `236ae62` — `feat: add SkillFacilityResolver with tag matching`
- **影响文件：** 1 file created, 80 insertions(+)

## 注意事项

- `DecoderLike` 接口内联定义在 `resolver.ts` 中，与 `src/types/blueprint.ts` 的 `Decoder` 接口字段一致，确保调用方能传入 `Decoder` 类型。
- 该解析器为后续 Task 6/7 的制造和逆向引擎重构提供了核心 `BonusLayers` 数据源。
- 当前该文件尚未被其他模块引用（将在 Task 6/7/11 中集成），`tsc --noEmit` 已验证无类型错误。
