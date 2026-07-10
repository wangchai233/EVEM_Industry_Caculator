import type { SkillDef } from '../types';

export const defaultSkills: SkillDef[] = [
  //工业技术
  //生产
  {
    id: 'frigate_manufacturing',
    name: '护卫舰制造技术',
    category: '工业技术',
    skillType: 'mfg',
    matchTags: ['frigate'],
    base: {
      effects: [
        { materialEfficiency: 0.06, timeEfficiency: -0.05 },
        { materialEfficiency: 0.12, timeEfficiency: -0.10 },
        { materialEfficiency: 0.18, timeEfficiency: -0.15 },
        { materialEfficiency: 0.24, timeEfficiency: -0.20 },
        { materialEfficiency: 0.30, timeEfficiency: -0.25 },
      ],
    },
    advanced: {
      effects: [
        { materialEfficiency: 0.04, timeEfficiency: -0.05 },
        { materialEfficiency: 0.08, timeEfficiency: -0.10 },
        { materialEfficiency: 0.12, timeEfficiency: -0.15 },
        { materialEfficiency: 0.16, timeEfficiency: -0.20 },
        { materialEfficiency: 0.20, timeEfficiency: -0.25 },
      ],
    },
    expert: {
      effects: [
        { materialEfficiency: 0.01, timeEfficiency: -0.05 },
        { materialEfficiency: 0.02, timeEfficiency: -0.10 },
        { materialEfficiency: 0.03, timeEfficiency: -0.15 },
        { materialEfficiency: 0.04, timeEfficiency: -0.20 },
        { materialEfficiency: 0.05, timeEfficiency: -0.25 },
      ],
    },
  },
  {
    id: 'battleship_manufacturing',
    name: '战列舰制造技术',
    category: '工业技术',
    skillType: 'mfg',
    matchTags: ['battleship'],
    base: {
      effects: [
        { materialEfficiency: 0.06, timeEfficiency: -0.05 },
        { materialEfficiency: 0.12, timeEfficiency: -0.10 },
        { materialEfficiency: 0.18, timeEfficiency: -0.15 },
        { materialEfficiency: 0.24, timeEfficiency: -0.20 },
        { materialEfficiency: 0.30, timeEfficiency: -0.25 },
      ],
    },
    advanced: {
      effects: [
        { materialEfficiency: 0.04, timeEfficiency: -0.05 },
        { materialEfficiency: 0.08, timeEfficiency: -0.10 },
        { materialEfficiency: 0.12, timeEfficiency: -0.15 },
        { materialEfficiency: 0.16, timeEfficiency: -0.20 },
        { materialEfficiency: 0.20, timeEfficiency: -0.25 },
      ],
    },
    expert: {
      effects: [
        { materialEfficiency: 0.01, timeEfficiency: -0.05 },
        { materialEfficiency: 0.02, timeEfficiency: -0.10 },
        { materialEfficiency: 0.03, timeEfficiency: -0.15 },
        { materialEfficiency: 0.04, timeEfficiency: -0.20 },
        { materialEfficiency: 0.05, timeEfficiency: -0.25 },
      ],
    },
  },

  //应用科学
  //发明原理
  {
    id: 'caldari_invention',
    name: '加达里发明原理',
    category: '应用科学',
    skillType: 'rev',
    matchTags: ['caldari'],
    base: {
      effects: [
        { timeEfficiency: -0.05, successRate: 0 },
        { timeEfficiency: -0.10, successRate: 0.12 },
        { timeEfficiency: -0.15, successRate: 0.24 },
        { timeEfficiency: -0.20, successRate: 0.36 },
        { timeEfficiency: -0.25, successRate: 0.50 },
      ],
    },
    advanced: {
      effects: [
        { timeEfficiency: -0.05, successRate: 0 },
        { timeEfficiency: -0.10, successRate: 0 },
        { timeEfficiency: -0.15, successRate: 0.10 },
        { timeEfficiency: -0.20, successRate: 0.20 },
        { timeEfficiency: -0.25, successRate: 0.30 },
      ],
    },
    expert: {
      effects: [
        { timeEfficiency: -0.05, successRate: 0 },
        { timeEfficiency: -0.10, successRate: 0 },
        { timeEfficiency: -0.15, successRate: 0.06 },
        { timeEfficiency: -0.20, successRate: 0.12 },
        { timeEfficiency: -0.25, successRate: 0.20 },
      ],
    },
  },
];

export const defaultSkillLevels: Record<string, [number, number, number]> = {
  frigate_manufacturing: [0, 0, 0],
  caldari_invention: [0, 0, 0],
};

const skillMap = new Map(defaultSkills.map(s => [s.id, s]));

export function getSkillById(id: string): SkillDef | undefined {
  return skillMap.get(id);
}
