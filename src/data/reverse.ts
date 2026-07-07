import type { ReverseEngineeringData } from '../types';

export const defaultReverse: ReverseEngineeringData[] = [
  {
    id: 'rev_t9_bs',
    name: 'T9 战列舰逆向工程',
    targetBlueprintId: 'bp_t9_bs',
    baseItemId: 'damaged_bs_structure',
    baseItemName: '受损战列舰结构',
    maxItemCount: 5,
    successRatePerItem: 0.10,
    baseTime: 3600,
    baseCost: 1000000,
    dataCores: [
      { itemId: 'data_core_ship', quantity: 10 },
    ],
  },
  {
    id: 'rev_t8_cruiser',
    name: 'T8 巡洋舰逆向工程',
    targetBlueprintId: 'bp_t8_cruiser',
    baseItemId: 'damaged_cr_structure',
    baseItemName: '受损巡洋舰结构',
    maxItemCount: 5,
    successRatePerItem: 0.10,
    baseTime: 1800,
    baseCost: 500000,
    dataCores: [
      { itemId: 'data_core_ship', quantity: 5 },
    ],
  },
];
