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
    id: 'cat_regular_ship', name: '常规舰船', parentId: 'root_ship',
    productIds: [], reverseIds: [],
    tags: ['regular_ship'], isCustom: false,
  },
  {
    id: 'cat_frigate', name: '护卫舰', parentId: 'cat_regular_ship',
    productIds: [], reverseIds: [],
    tags: ['frigate'], isCustom: false,
  },
  {
    id: 'cat_intercepter_frigate', name: '截击护卫舰', parentId: 'cat_frigate',
    productIds: ['bp_condor_interceptor'], reverseIds: ['rev_condor_interceptor'],
    tags: ['frigate_intercepter'], isCustom: false,
  },
  {
    id: 'cat_destroyer', name: '驱逐舰', parentId: 'cat_regular_ship',
    productIds: [], reverseIds: [],
    tags: ['destroyer'], isCustom: false,
  },
  {
    id: 'cat_cruiser', name: '巡洋舰', parentId: 'cat_regular_ship',
    productIds: ['bp_t8_cruiser'], reverseIds: [],
    tags: ['cruiser'], isCustom: false,
  },
  {
    id: 'cat_battlecruiser', name: '战列巡洋舰', parentId: 'cat_regular_ship',
    productIds: [], reverseIds: [],
    tags: ['battlecruiser'], isCustom: false,
  },
  {
    id: 'cat_battleship', name: '战列舰', parentId: 'cat_regular_ship',
    productIds: [], reverseIds: [],
    tags: ['battleship'], isCustom: false,
  },
  {
    id: 'cat_base_battleship', name: '基础战列舰', parentId: 'cat_battleship',
    productIds: ['bp_t9_bs'], reverseIds: [],
    tags: [], isCustom: false,
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
