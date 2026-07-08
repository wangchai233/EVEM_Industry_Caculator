export interface BonusLayers {
  skills: {
    materialEfficiency: number;
    timeEfficiency: number;
    successRate: number;
    costMultiplier: number;
    breakdown: Array<{ skillName: string; effects: Record<string, number> }>;
  };
  facilities: {
    materialEfficiency: number;
    timeEfficiency: number;
    successRate: number;
    costMultiplier: number;
  };
  decoder: {
    materialEfficiency: number;
    timeEfficiency: number;
    runBonus: number;
    successRate: number;
  };
}

export const EMPTY_BONUS: BonusLayers = {
  skills: { materialEfficiency: 0, timeEfficiency: 0, successRate: 0, costMultiplier: 0, breakdown: [] },
  facilities: { materialEfficiency: 0, timeEfficiency: 0, successRate: 0, costMultiplier: 0 },
  decoder: { materialEfficiency: 0, timeEfficiency: 0, runBonus: 0, successRate: 0 },
};
