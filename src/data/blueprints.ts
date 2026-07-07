import type { Blueprint } from '../types';

export const defaultBlueprints: Blueprint[] = [
  {
    id: 'bp_t9_bs',
    name: 'T9 战列舰蓝图',
    productItemId: 't9_battleship',
    productName: 'T9 战列舰',
    productQuantity: 1,
    baseTime: 86400,
    baseCost: 50000000,
    maxRuns: 10,
    materials: [
      { itemId: 'tritanium', quantity: 5000000 },
      { itemId: 'pyerite', quantity: 2000000 },
      { itemId: 'mexallon', quantity: 500000 },
      { itemId: 'isogen', quantity: 100000 },
      { itemId: 'nocxium', quantity: 20000 },
      { itemId: 'zydrine', quantity: 5000 },
      { itemId: 'megacyte', quantity: 1000 },
      { itemId: 'reactive_metals', quantity: 500 },
      { itemId: 'noble_metals', quantity: 300 },
      { itemId: 'precious_alloys', quantity: 200 },
    ],
  },
  {
    id: 'bp_t8_cruiser',
    name: 'T8 巡洋舰蓝图',
    productItemId: 't8_cruiser',
    productName: 'T8 巡洋舰',
    productQuantity: 1,
    baseTime: 43200,
    baseCost: 10000000,
    maxRuns: 10,
    materials: [
      { itemId: 'tritanium', quantity: 2000000 },
      { itemId: 'pyerite', quantity: 800000 },
      { itemId: 'mexallon', quantity: 200000 },
      { itemId: 'isogen', quantity: 40000 },
      { itemId: 'nocxium', quantity: 8000 },
      { itemId: 'reactive_metals', quantity: 200 },
      { itemId: 'noble_metals', quantity: 120 },
    ],
  },
];

export const blueprintProducts: Array<{ id: string; name: string; category: 'product' }> = [
  { id: 't9_battleship', name: 'T9 战列舰', category: 'product' },
  { id: 't8_cruiser', name: 'T8 巡洋舰', category: 'product' },
];
