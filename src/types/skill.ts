export interface SkillLevelEffect {
  materialEfficiency?: number; // 材料效率加成（如 0.06 = +6%）
  timeEfficiency?: number;     // 时间效率加成（如 -0.05 = -5%，负数加速）
  successRate?: number;        // 成功率加成
  costMultiplier?: number;     // 现金费用加成
}

export interface SkillTier {
  effects: SkillLevelEffect[]; // [0]=1级, [4]=5级
}

export interface SkillDef {
  id: string;
  name: string;
  matchTags: string[];      // 匹配的产品标签 ID 列表
  base: SkillTier;           // 基础阶段
  advanced: SkillTier;       // 进阶阶段
  expert: SkillTier;         // 专家阶段
}

// 技能等级: [基础, 进阶, 专家]
export type SkillLevels = Record<string, [number, number, number]>;
