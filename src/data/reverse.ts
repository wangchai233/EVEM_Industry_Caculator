import type { ReverseEngineeringData } from '../types';

export const defaultReverse: ReverseEngineeringData[] = [
  /*
  {
    id: 'rev_t9_bs',
    name: 'T9 战列舰蓝图',
    targetBlueprintId: 'bp_t9_bs',
    baseItemId: 'damaged_bs_structure',
    baseItemName: '受损战列舰结构',
    maxItemCount: 5,
    maxBaseSuccessRate: 0.50,
    baseTime: 3600,
    baseCost: 1000000,
    dataCores: [
      { itemId: 'data_core_ship', quantity: 10 },
    ],
    tags: ['ship', 'regular_ship', 'battleship'],
  },
  */
  /*
  {
    id: 'rev_t8_cruiser',
    name: 'T8 巡洋舰蓝图',
    targetBlueprintId: 'bp_t8_cruiser',
    baseItemId: 'damaged_cr_structure',
    baseItemName: '受损巡洋舰结构',
    maxItemCount: 5,
    maxBaseSuccessRate: 0.50,
    baseTime: 1800,
    baseCost: 500000,
    dataCores: [
      { itemId: 'data_core_ship', quantity: 5 },
    ],
    tags: ['ship', 'regular_ship', 'cruiser'],
  },
  */
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
    tags: ['ship', 'regular_ship', 'frigate', 'frigate_interceptor', 'caldari'],
  },
];
