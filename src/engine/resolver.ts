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
  projectType: 'mfg' | 'rev',
): BonusLayers {
  const result: BonusLayers = {
    skills: { materialEfficiency: 0, timeEfficiency: 0, successRate: 0, costMultiplier: 0, breakdown: [] },
    facilities: { materialEfficiency: 0, timeEfficiency: 0, successRate: 0, costMultiplier: 0 },
    decoder: { materialEfficiency: 0, timeEfficiency: 0, runBonus: 0, successRate: 0 },
  };

  // 技能加成
  for (const skill of allSkills) {
    // 技能范围隔离：mfg 技能只在制造生效，rev 只在逆向生效
    if (skill.skillType !== projectType && skill.skillType !== 'both') continue;

    const hasMatch = skill.matchTags.some(t => productTags.includes(t));
    if (!hasMatch) continue;

    const [base, adv, exp] = skillLevels[skill.id] ?? [0, 0, 0];
    const breakdown: Record<string, number> = {};

    // 时间效率：三阶段乘法叠加
    let teBase = 1, teAdv = 1, teExp = 1;
    let meTotal = 0;
    let srTotal = 0;
    let costTotal = 0;

    const accumEffects = (tier: typeof skill.base, level: number) => {
      if (level > 0 && level <= tier.effects.length) {
        const eff = tier.effects[level - 1];
        meTotal += eff.materialEfficiency ?? 0;
        srTotal += eff.successRate ?? 0;
        costTotal += eff.costMultiplier ?? 0;
      }
    };

    // 单独处理 TE（乘法）
    if (base > 0 && base <= skill.base.effects.length)
      teBase = 1 + (skill.base.effects[base - 1].timeEfficiency ?? 0);
    if (adv > 0 && adv <= skill.advanced.effects.length)
      teAdv = 1 + (skill.advanced.effects[adv - 1].timeEfficiency ?? 0);
    if (exp > 0 && exp <= skill.expert.effects.length)
      teExp = 1 + (skill.expert.effects[exp - 1].timeEfficiency ?? 0);

    const skillTE = teBase * teAdv * teExp - 1;
    result.skills.timeEfficiency += skillTE;

    accumEffects(skill.base, base);
    accumEffects(skill.advanced, adv);
    accumEffects(skill.expert, exp);

    result.skills.materialEfficiency += meTotal;
    result.skills.successRate += srTotal;
    result.skills.costMultiplier += costTotal;

    if (meTotal) breakdown['材料效率'] = meTotal;
    if (skillTE) breakdown['时间效率'] = skillTE;
    if (srTotal) breakdown['成功率'] = srTotal;
    if (costTotal) breakdown['现金费用'] = costTotal;
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
