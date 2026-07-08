export interface FacilityDef {
  id: string;
  name: string;
  matchTags: string[];
  materialEfficiency?: number;
  timeEfficiency?: number;
  successRate?: number;
  costMultiplier?: number;
}

export interface CustomFacilityBonus {
  materialEfficiency: number;
  timeEfficiency: number;
  successRate: number;
  costMultiplier: number;
}
