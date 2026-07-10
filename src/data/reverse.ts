import type { ReverseEngineeringData } from '../types';

export const defaultReverse: ReverseEngineeringData[] = [
  // v2 秃鹫级截击型逆向工程
  {
    id: 'rev_condor_interceptor',
    name: '秃鹫级截击型蓝图',
    targetBlueprintId: 'bp_condor_interceptor',
    baseItemId: 'damaged_caldari_8',
    baseItemName: '加达里 8 级受损结构',
    maxItemCount: 1,
    maxBaseSuccessRate: 0.50,
    baseTime: 3200,
    baseCost: 25000,
    dataCores: [
      { itemId: 'data_core_caldari_engineering', quantity: 3 },
      { itemId: 'data_core_rocket_science', quantity: 3 },
    ],
    tags: ['ship', 'ship_regular', 'frigate', 'frigate_interceptor', 'caldari'],
  },
];
