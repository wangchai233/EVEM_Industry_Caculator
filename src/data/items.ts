import type { Item } from '../types';

export const defaultItems: Item[] = [
  { id: 'tritanium', name: '三钛合金', category: 'mineral' },
  { id: 'pyerite', name: '类晶体胶矿', category: 'mineral' },
  { id: 'mexallon', name: '类银超金属', category: 'mineral' },
  { id: 'isogen', name: '同位聚合体', category: 'mineral' },
  { id: 'nocxium', name: '超新星诺克石', category: 'mineral' },
  { id: 'zydrine', name: '晶状石英核岩', category: 'mineral' },
  { id: 'megacyte', name: '超噬矿', category: 'mineral' },
  { id: 'reactive_metals', name: '活性金属', category: 'planetary' },
  { id: 'noble_metals', name: '贵金属', category: 'planetary' },
  { id: 'precious_alloys', name: '珍稀合金', category: 'planetary' },
  { id: 'data_core_ship', name: '舰船数据核心', category: 'data_core' },
  { id: 'data_core_module', name: '装备数据核心', category: 'data_core' },
  { id: 'damaged_bs_structure', name: '受损战列舰结构', category: 'damaged_structure' },
  { id: 'damaged_cr_structure', name: '受损巡洋舰结构', category: 'damaged_structure' },
  { id: 'isk', name: 'ISK（星币）', category: 'isk' },
  // v2 新材料物品
  { id: 'sparkle_alloy', name: '闪光合金', category: 'planetary' },
  { id: 'precision_alloy', name: '精密合金', category: 'planetary' },
  { id: 'fiber_composite', name: '纤维复合物', category: 'planetary' },
  { id: 'reactive_metal', name: '反应金属', category: 'planetary' },
  { id: 'damaged_caldari8', name: '加达里 8 级受损结构', category: 'damaged_structure' },
  { id: 'data_core_caldari_engineering', name: '数据核心 - 加达里星舰工程', category: 'data_core' },
  { id: 'data_core_rocket_science', name: '数据核心 - 火箭科学', category: 'data_core' },
  { id: 'condor_interceptor', name: '秃鹫级截击型', category: 'product' },
];
