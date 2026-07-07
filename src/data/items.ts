import type { Item, Decoder } from '../types';

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
];

export const defaultDecoders: Decoder[] = [
  {
    id: 'decoder_none', name: '无解码器', category: 'decoder',
    meBonus: 1.0, teBonus: 1.0, runBonus: 0,
  },
  {
    id: 'decoder_me_1', name: '材料优化解码器 I',
    category: 'decoder',
    meBonus: 0.98, teBonus: 1.0, runBonus: 0,
  },
  {
    id: 'decoder_run_1', name: '增产解码器 I',
    category: 'decoder',
    meBonus: 1.0, teBonus: 1.0, runBonus: 1,
  },
];
