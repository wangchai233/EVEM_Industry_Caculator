import type { Item } from '../types';

export const defaultItems: Item[] = [
  //模板：
  //{ id: '', name: '', category: '' },
  //矿物
  { id: 'tritanium', name: '三钛合金', category: 'mineral' },
  { id: 'pyerite', name: '类晶体胶矿', category: 'mineral' },
  { id: 'mexallon', name: '类银超金属', category: 'mineral' },
  { id: 'isogen', name: '同位聚合体', category: 'mineral' },
  { id: 'nocxium', name: '超新星诺克石', category: 'mineral' },
  { id: 'zydrine', name: '晶状石英核岩', category: 'mineral' },
  { id: 'megacyte', name: '超噬矿', category: 'mineral' },
  { id: 'morphite', name: '莫尔石', category: 'mineral' },
  { id: 'compressed_tritanium', name: '压缩三钛合金', category: 'mineral' },
  { id: 'compressed_pyerite', name: '压缩类晶体胶矿', category: 'mineral' },

  //原矿
  //卫星矿石
  { id: 'gray_lunarite_ore', name: '灰色月岩矿', category: 'lunarite' },
  /*
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
  { id: '', name: '', category: '' },
   */
  //气云
  { id: 'fullerite_c50', name: '富勒体-碳50', category: 'fullerite' },
  { id: 'fullerite_c60', name: '富勒体-碳60', category: 'fullerite' },
  { id: 'fullerite_c70', name: '富勒体-碳70', category: 'fullerite' },
  { id: 'compressed_fullerite_c50', name: '压缩富勒体-碳50', category: 'fullerite' },
  { id: 'compressed_fullerite_c60', name: '压缩富勒体-碳60', category: 'fullerite' },
  { id: 'compressed_fullerite_c70', name: '压缩富勒体-碳70', category: 'fullerite' },

  //中间产物
  { id: 'hexite', name: '六元复合物', category: 'intermediate_product' },
  { id: 'fullerides', name: '富勒化合物', category: 'intermediate_product' },
  { id: 'phenolic_composites', name: '酚合成物', category: 'intermediate_product' },
  { id: 'sylramic_fibers', name: '多晶碳化硅纤维', category: 'intermediate_product' },
  { id: 'reinforced_carbon_fiber', name: '强化碳纤维', category: 'intermediate_product' },//无英文对照
  { id: 'ferrogel', name: '铁磁胶体', category: 'intermediate_product' },
  { id: 'titanium_carbide', name: '碳化钛', category: 'intermediate_product' },
  { id: 'ctystalline_carbonide', name: '碳化晶体', category: 'intermediate_product' },
  { id: 'nanotransistors', name: '纳米晶体管', category: 'intermediate_product' },
  { id: 'ppd_fullerene_fibers', name: 'PPD富勒烯纤维', category: 'intermediate_product' },
  { id: 'fulleroferrocene', name: '富勒二茂铁', category: 'intermediate_product' },
  { id: 'fullerene_intercalated_graphite', name: '富勒烯层间石墨', category: 'intermediate_product' },

  //货币
  { id: 'isk', name: 'ISK', category: 'currency' },
  { id: 'plex', name: 'PLEX', category: 'currency' },
  { id: 'aur', name: 'AUR',category: 'currency' },

  //行星材料
  //行星产物
  { id: 'sheen_compound', name: '光泽合金', category: 'planetary' },
  { id: 'lustering_alloy', name: '光彩合金', category: 'planetary' },
  { id: 'gleaming_alloy', name: '闪光合金', category: 'planetary' },
  { id: 'condensed_alloy', name: '浓缩合金', category: 'planetary' },
  { id: 'precious_alloy', name: '精密合金', category: 'planetary' },
  { id: 'motley_conpound', name: '杂色复合物', category: 'planetary' },
  { id: 'plush_compound', name: '纤维复合物', category: 'planetary' },
  { id: 'lucent_compound', name: '透光复合物', category: 'planetary' },
  { id: 'opulent_compound', name: '多样复合物', category: 'planetary' },
  { id: 'glossy_compound', name: '光滑复合物', category: 'planetary' },
  { id: 'crystal_compound', name: '晶体复合物', category: 'planetary' },
  { id: 'dark_compound', name: '黑暗复合物', category: 'planetary' },
  { id: 'reactive_gas', name: '活性气体', category: 'planetary' },
  { id: 'noble_gas', name: '稀有气体', category: 'planetary' },
  { id: 'base_metals', name: '基础金属', category: 'planetary' },
  { id: 'heavy_metals', name: '重金属', category: 'planetary' },
  { id: 'noble_metals', name: '贵金属', category: 'planetary' },
  { id: 'reactive_metals', name: '反应金属', category: 'planetary' },
  { id: 'toxic_metals', name: '有毒金属', category: 'planetary' },
  { id: 'industrial_fibers', name: '工业纤维', category: 'planetary' },
  { id: 'supertensile_plastics', name: '超张力塑料', category: 'planetary' },
  { id: 'polyaramids', name: '聚芳酰胺', category: 'planetary' },
  { id: 'coolant', name: '冷却剂', category: 'planetary' },
  { id: 'condensates', name: '凝缩液', category: 'planetary' },
  { id: 'construction_blocks', name: '建筑模块', category: 'planetary' },
  { id: 'nanites', name: '纳米体', category: 'planetary' },
  { id: 'silicon_structural_castings', name: '硅结构铸材', category: 'planetary' },//无英文对照
  { id: 'smartfab_units', name: '灵巧单元建筑模块', category: 'planetary' },
  { id: 'noble_metals', name: '稀有金属', category: 'planetary' },
  { id: 'non-cs_crystals', name: '非立方晶体', category: 'planetary' },
  { id: 'polytextiles', name: '合成纺织品', category: 'planetary' },
  //燃料
  { id: 'heavy_water', name: '重水', category: 'planetary' },
  { id: 'suspended_plasma', name: '悬浮等离子', category: 'planetary' },
  { id: 'liquid_ozone', name: '液化臭氧', category: 'planetary' },
  { id: 'ionic_solutions', name: '离子溶液', category: 'planetary' },
  { id: 'isotope_fuel', name: '同位素燃料', category: 'planetary' },//无英文对照
  { id: 'plasmoids', name: '等离子体团', category: 'planetary' },
  { id: 'enriched_uranium', name: '浓缩核能燃料', category: 'planetary' },

  //舰船碎片
  { id: 'damaged_caldari_8', name: '加达里 8 级受损结构', category: 'ship_debris' },

  //数据核心
  { id: 'data_core_caldari_engineering', name: '数据核心 - 加达里星舰工程', category: 'data' },
  { id: 'data_core_rocket_science', name: '数据核心 - 火箭科学', category: 'data' },

  //舰船
  { id: 'condor_interceptor', name: '秃鹫级截击型', category: 'product' },
];
