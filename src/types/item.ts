export type ItemCategory =
  | 'mineral'
  | 'planetary'
  | 'data_core'
  | 'decoder'
  | 'blueprint'
  | 'damaged_structure'
  | 'product'
  | 'ship'
  | 'isk';

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
