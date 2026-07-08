### Task 1: 新增类型定义

**Files:**
- Create: `src/types/skill.ts`, `src/types/facility.ts`, `src/types/discount.ts`, `src/types/bonus.ts`
- Modify: `src/types/item.ts`, `src/types/blueprint.ts`, `src/types/config.ts`, `src/types/index.ts`

**Interfaces:**
- Produces: SkillDef, SkillTier, SkillLevelEffect, SkillLevels, FacilityDef, CustomFacilityBonus, DiscountRule, BonusLayers, EMPTY_BONUS, 重定义 Decoder, 更新 ManufacturingConfig/ReverseEngineeringConfig

Read the plan file for exact code at: d:\Trae_Projects\EVEM_Industry_Calc\docs\superpowers\plans\2026-07-08-evem-v2-skills-formula-plan.md
Search for "### Task 1" to get ALL code.

IMPORTANT: npm commands need `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force;` prefix.
Work from: d:\Trae_Projects\EVEM_Industry_Calc
Verify: `npx tsc --noEmit`
Commit: `git add src/types/ ; git commit -m "feat: add v2 type definitions (skills, facilities, discounts, bonus layers)"`

Report to: d:\Trae_Projects\EVEM_Industry_Calc\.superpowers\sdd\reports\v2-task-1-report.md
