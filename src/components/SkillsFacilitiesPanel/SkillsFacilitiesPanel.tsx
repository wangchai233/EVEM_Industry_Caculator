import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { defaultSkills } from '../../data/skills';
import { defaultFacilities } from '../../data/facilities';
import { EMPTY_BONUS } from '../../types/bonus';
import type { SkillLevels, CustomFacilityBonus, BonusLayers } from '../../types';
import styles from './SkillsFacilitiesPanel.module.css';

const SKILL_PRESETS = [
  { label: '000 — 全零', value: '000' },
  { label: '540 — 基础5/进阶4', value: '540' },
  { label: '550 — 基础5/进阶5', value: '550' },
  { label: '553 — 基础5/进阶5/专家3', value: '553' },
  { label: '554 — 基础5/进阶5/专家4', value: '554' },
  { label: '555 — 全满', value: '555' },
];

const TIER_LABELS = ['基础', '进阶', '专家'] as const;

function formatPercent(v: number): string {
  const pct = (v * 100).toFixed(1);
  return v >= 0 ? `+${pct}%` : `${pct}%`;
}

function computeBonusSummary(
  skillLevels: SkillLevels,
  customFacility: CustomFacilityBonus,
): BonusLayers {
  const skills = {
    materialEfficiency: 0,
    timeEfficiency: 0,
    successRate: 0,
    costMultiplier: 0,
    breakdown: [] as Array<{ skillName: string; effects: Record<string, number> }>,
  };

  for (const def of defaultSkills) {
    const levels = skillLevels[def.id] ?? [0, 0, 0];
    const accum: Record<string, number> = {};

    // ME / SR / costMultiplier 加法叠加
    const addEffects = (tier: typeof def.base, level: number) => {
      if (level > 0 && level <= tier.effects.length) {
        const eff = tier.effects[level - 1];
        for (const [key, val] of Object.entries(eff)) {
          if (key === 'timeEfficiency') continue; // TE 单独乘法处理
          accum[key] = (accum[key] ?? 0) + val;
          (skills as any)[key] = ((skills as any)[key] ?? 0) + val;
        }
      }
    };

    // TE 三阶段乘法叠加
    let teBase = 1, teAdv = 1, teExp = 1;
    if (levels[0] > 0 && levels[0] <= def.base.effects.length)
      teBase = 1 + (def.base.effects[levels[0] - 1].timeEfficiency ?? 0);
    if (levels[1] > 0 && levels[1] <= def.advanced.effects.length)
      teAdv = 1 + (def.advanced.effects[levels[1] - 1].timeEfficiency ?? 0);
    if (levels[2] > 0 && levels[2] <= def.expert.effects.length)
      teExp = 1 + (def.expert.effects[levels[2] - 1].timeEfficiency ?? 0);

    const skillTE = teBase * teAdv * teExp - 1;
    if (skillTE !== 0) {
      skills.timeEfficiency += skillTE;
      accum['timeEfficiency'] = skillTE;
    }

    addEffects(def.base, levels[0]);
    addEffects(def.advanced, levels[1]);
    addEffects(def.expert, levels[2]);

    if (Object.keys(accum).length > 0) {
      skills.breakdown.push({ skillName: def.name, effects: accum });
    }
  }

  return {
    skills,
    facilities: { ...customFacility },
    decoder: { ...EMPTY_BONUS.decoder },
  };
}

export function SkillsFacilitiesPanel() {
  const {
    skillLevels,
    updateSkillLevel,
    batchSetSkillLevels,
    activeFacilityId,
    setActiveFacilityId,
    customFacility,
    setCustomFacility,
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);

  const bonus = computeBonusSummary(skillLevels, customFacility);

  return (
    <div className={styles.panel}>
      <button
        className={styles.toggle}
        onClick={() => setCollapsed(!collapsed)}
        type="button"
      >
        <span className={styles.toggleIcon}>{collapsed ? '▶' : '▼'}</span>
        <span>技能 &amp; 设施</span>
      </button>

      {!collapsed && (
        <div className={styles.body}>
          {/* ── 批量预设 ── */}
          <div className={styles.section}>
            <label className={styles.label}>批量预设</label>
            <select
              className={styles.select}
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  batchSetSkillLevels(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">选择预设...</option>
              {SKILL_PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* ── 技能等级滑块 ── */}
          <div className={styles.section}>
            <label className={styles.label}>技能等级</label>
            {defaultSkills.map(skill => {
              const levels = skillLevels[skill.id] ?? [0, 0, 0];
              const digits = `${levels[0]}${levels[1]}${levels[2]}`;
              return (
                <div key={skill.id} className={styles.skillRow}>
                  <div className={styles.skillHeader}>
                    <span className={styles.skillName}>{skill.name}</span>
                    <span className={styles.skillDigits}>{digits}</span>
                  </div>
                  {[0, 1, 2].map(tier => (
                    <div key={tier} className={styles.sliderRow}>
                      <span className={styles.tierLabel}>{TIER_LABELS[tier]}</span>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={1}
                        value={levels[tier]}
                        onChange={(e) => updateSkillLevel(skill.id, tier as 0 | 1 | 2, +e.target.value)}
                        className={styles.slider}
                      />
                      <span className={styles.sliderValue}>{levels[tier]}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* ── 设施配置 ── */}
          <div className={styles.section}>
            <label className={styles.label}>设施</label>
            <select
              className={styles.select}
              value={activeFacilityId}
              onChange={(e) => setActiveFacilityId(e.target.value)}
            >
              <option value="">不使用设施（自定义加成）</option>
              {defaultFacilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* ── 自定义设施加成 ── */}
          <div className={styles.section}>
            <label className={styles.label}>
              自定义设施加成
              <span className={styles.hint}>（仅在选择"不使用设施"时生效）</span>
            </label>
            <div className={styles.bonusGrid}>
              {([
                ['materialEfficiency', '材料效率'],
                ['timeEfficiency', '时间效率'],
                ['successRate', '成功率'],
                ['costMultiplier', '费用倍率'],
              ] as Array<[keyof CustomFacilityBonus, string]>).map(([key, label]) => (
                <div key={key} className={styles.bonusItem}>
                  <span className={styles.bonusLabel}>{label}</span>
                  <input
                    type="number"
                    className={styles.numberInput}
                    step={0.01}
                    value={customFacility[key]}
                    onChange={(e) =>
                      setCustomFacility((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── 加成汇总 ── */}
          <div className={styles.section}>
            <label className={styles.label}>加成汇总</label>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>材料效率</span>
                <span className={styles.summarySkill}>
                  技能 {formatPercent(bonus.skills.materialEfficiency)}
                </span>
                <span className={styles.summaryFacility}>
                  设施 {formatPercent(bonus.facilities.materialEfficiency)}
                </span>
                <span className={styles.summaryTotal}>
                  合计 {formatPercent(bonus.skills.materialEfficiency + bonus.facilities.materialEfficiency)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>时间效率</span>
                <span className={styles.summarySkill}>
                  技能 {formatPercent(bonus.skills.timeEfficiency)}
                </span>
                <span className={styles.summaryFacility}>
                  设施 {formatPercent(bonus.facilities.timeEfficiency)}
                </span>
                <span className={styles.summaryTotal}>
                  合计 {formatPercent((1 + bonus.skills.timeEfficiency) * (1 + bonus.facilities.timeEfficiency) - 1)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>成功率</span>
                <span className={styles.summarySkill}>
                  技能 {formatPercent(bonus.skills.successRate)}
                </span>
                <span className={styles.summaryFacility}>
                  设施 {formatPercent(bonus.facilities.successRate)}
                </span>
                <span className={styles.summaryTotal}>
                  合计 {formatPercent(bonus.skills.successRate + bonus.facilities.successRate)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>费用倍率</span>
                <span className={styles.summarySkill}>
                  技能 {formatPercent(bonus.skills.costMultiplier)}
                </span>
                <span className={styles.summaryFacility}>
                  设施 {formatPercent(bonus.facilities.costMultiplier)}
                </span>
                <span className={styles.summaryTotal}>
                  合计 {formatPercent(bonus.skills.costMultiplier + bonus.facilities.costMultiplier)}
                </span>
              </div>
            </div>

            {bonus.skills.breakdown.length > 0 && (
              <details className={styles.breakdownDetails}>
                <summary className={styles.breakdownToggle}>技能明细</summary>
                {bonus.skills.breakdown.map((item, i) => (
                  <div key={i} className={styles.breakdownItem}>
                    <span className={styles.breakdownName}>{item.skillName}</span>
                    {Object.entries(item.effects).map(([k, v]) => (
                      <span key={k} className={styles.breakdownEffect}>{k}: {formatPercent(v)}</span>
                    ))}
                  </div>
                ))}
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
