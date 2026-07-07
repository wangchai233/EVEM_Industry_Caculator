export type ItemCategory =
  | 'mineral'
  | 'planetary'
  | 'data_core'
  | 'decoder'
  | 'blueprint'
  | 'damaged_structure'
  | 'product'
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
}
