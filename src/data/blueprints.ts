import type { Blueprint } from '../types';

export const defaultBlueprints: Blueprint[] = [
  //舰船
  //常规
  //护卫
  //截击护卫
  //秃鹫截击
  {
    id: 'bp_condor_interceptor',
    name: '秃鹫级截击型蓝图',
    productItemId: 'condor_interceptor',
    productName: '秃鹫级截击型',
    productQuantity: 1,
    baseTime: 16000,
    baseCost: 9000000,
    maxRuns: 10,
    materials: [
      { itemId: 'gleaming_alloy', quantity: 6642 },
      { itemId: 'precious_alloy', quantity: 5898 },
      { itemId: 'plush_compound', quantity: 7526 },
      { itemId: 'noble_metals', quantity: 7526 },
      { itemId: 'reactive_metals', quantity: 1872 },
      { itemId: 'tritanium', quantity: 2467871 },
      { itemId: 'pyerite', quantity: 854016 },
      { itemId: 'mexallon', quantity: 233964 },
      { itemId: 'isogen', quantity: 38498 },
      { itemId: 'nocxium', quantity: 10814 },
      { itemId: 'zydrine', quantity: 4448 },
      { itemId: 'megacyte', quantity: 1812 },
    ],
    tags: ['ship', 'ship_regular', 'frigate', 'frigate_intercepter'],
  },

  //战列
  //基础战列
  //轰炸战列
  {
    id: 'bp_rokh_bomber',
    name: '鹏鲲级轰炸型蓝图',
    productItemId: 'rokh_bomber',
    productName: '鹏鲲级轰炸型',
    productQuantity: 1,
    baseTime: 172800,
    baseCost: 1000000000,
    maxRuns: 10,
    materials: [
      { itemId: 'noble_metals', quantity: 7500 },
      { itemId: 'non-cs_crystals', quantity: 7500 },
      { itemId: 'tritanium', quantity: 120000000 },
      { itemId: 'pyerite', quantity: 48000000 },
      { itemId: 'mexallon', quantity: 9600000 },
      { itemId: 'isogen', quantity: 4800000 },
      { itemId: 'nocxium', quantity: 9600000 },
      { itemId: 'zydrine', quantity: 480000 },
      { itemId: 'megacyte', quantity: 96000 },
      { itemId: 'morphite', quantity: 22500 },
      { itemId: 'ppd_fullerene_fibers', quantity: 36000 },
      { itemId: 'fulleroferrocene', quantity: 27000 },
      { itemId: 'fullerene_intercalated_graphite', quantity: 15000 },
      { itemId: 'rokh', quantity: 1.5 },
    ],
    tags: ['ship', 'ship_regular', 'battleship', 'battleship_bomber'],
  },
];

export const blueprintProducts: Array<{ id: string; name: string; category: 'product' }> = [
  //舰船
  //常规
  //护卫
  //截击护卫
  //秃鹫截击
  { id: 'condor_interceptor', name: '秃鹫级截击型', category: 'product' },
  //战列
  //基础战列
  { id: 'rokh', name: '鹏鲲级', category: 'product' },
  //轰炸战列
  { id: 'rokh_bomber', name: '鹏鲲级轰炸型', category: 'product' },
];
