export type ItemCategory =
  | 'mineral'//矿物
  | 'lunarite'//卫星矿
  | 'fullerite'//气云
  | 'intermediate_product'//中间产物
  | 'planetary'//行星产物
  | 'refined_material'//提炼材料
  | 'data'//数据
  | 'decoder'//解码器
  | 'blueprint'//蓝图
  | 'ship_debris'//舰船碎片（受损结构）
  | 'nanocore_material'//纳米核心材料
  | 'unit'//组件
  | 'implant_material'//植入体材料
  | 'implant'//植入体
  | 'product'
  | 'ship'//舰船
  | 'ammo'//弹药
  | 'currency';//货币

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  icon?: string;
}

export interface MaterialEntry {
  itemId: string;
  quantity: number; // 原始基准数量
  isBase?: boolean; // 是否为基底材料（不受材料效率影响）
}

// Product 接口扩展（用于产品类型的物品）
export interface ProductItem extends Item {
  tags: string[]; // 树形节点继承的标签 ID 列表
}
