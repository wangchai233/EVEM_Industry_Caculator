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
