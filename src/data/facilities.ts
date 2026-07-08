import type { FacilityDef } from '../types';

export const defaultFacilities: FacilityDef[] = [];
// 初期空列表，后续补录。示例条目格式：
// { id: 'assembly_3', name: '组装车间模块 III', matchTags: ['regular_ship'],
//   materialEfficiency: -0.05 }

export function getFacilityById(id: string): FacilityDef | undefined {
  return defaultFacilities.find(f => f.id === id);
}
