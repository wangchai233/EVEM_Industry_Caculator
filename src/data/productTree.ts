import type { ProductTreeNode } from '../types/productTree';

export const defaultTree: ProductTreeNode[] = [
  /*
  示例格式：
  {
    id: '', name: '', parentId: null,
    productIds: [], reverseIds: [],
    tags: [], isCustom: false,
  }
  */
  {
    id: 'root_ship', name: '舰船', parentId: null,
    productIds: [], reverseIds: [],
    tags: ['ship'], isCustom: false,
  },
  {
    id: 'cat_ship_regular', name: '常规舰船', parentId: 'root_ship',
    productIds: [], reverseIds: [],
    tags: ['ship_regular'], isCustom: false,
  },
  {
    id: 'cat_frigate', name: '护卫舰', parentId: 'cat_ship_regular',
    productIds: [], reverseIds: [],
    tags: ['frigate'], isCustom: false,
  },
  {
    id: 'cat_frigate_intercepter', name: '截击护卫舰', parentId: 'cat_frigate',
    productIds: ['bp_condor_interceptor'], reverseIds: ['rev_condor_interceptor'],
    tags: ['frigate_intercepter'], isCustom: false,
  },
  {
    id: 'cat_destroyer', name: '驱逐舰', parentId: 'cat_ship_regular',
    productIds: [], reverseIds: [],
    tags: ['destroyer'], isCustom: false,
  },
  {
    id: 'cat_cruiser', name: '巡洋舰', parentId: 'cat_ship_regular',
    productIds: [], reverseIds: [],
    tags: ['cruiser'], isCustom: false,
  },
  {
    id: 'cat_battlecruiser', name: '战列巡洋舰', parentId: 'cat_ship_regular',
    productIds: [], reverseIds: [],
    tags: ['battlecruiser'], isCustom: false,
  },
  {
    id: 'cat_battleship', name: '战列舰', parentId: 'cat_ship_regular',
    productIds: [], reverseIds: [],
    tags: ['battleship'], isCustom: false,
  },
  {
    id: 'cat_battleship_basic', name: '基础战列舰', parentId: 'cat_battleship',
    productIds: ['bp_rokh'], reverseIds: ['rev_rokh'],
    tags: ['battleship_basic'], isCustom: false,
  },
  {
    id: 'cat_battleship_bomber', name: '轰炸战列舰', parentId: 'cat_battleship',
    productIds: ['bp_rokh_bomber'], reverseIds: ['rev_rokh_bomber'],
    tags: ['battleship_bomber'], isCustom: false,
  },
  {
    id: 'root_custom', name: '自定义产品', parentId: null,
    productIds: [], reverseIds: [],
    tags: [], isCustom: false,
  },
];

// 将自定义节点追加到树中
export function mergeCustomTree(
  builtin: ProductTreeNode[],
  custom: ProductTreeNode[],
): ProductTreeNode[] {
  return [...builtin.filter(n => !n.isCustom), ...custom];
}
