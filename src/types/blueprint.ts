import type { Item, MaterialEntry } from './item';

export interface Blueprint {
  id: string;
  name: string;
  productItemId: string;
  productName: string;
  productQuantity: number; // 单流程产出数量
  baseTime: number; // 秒
  baseCost: number; // ISK 现金费用（单流程）
  materials: MaterialEntry[]; // 原始基准材料（不含蓝图本身）
  maxRuns: number; // 最大流程数
}

export interface Decoder extends Item {
  category: 'decoder';
  meBonus: number;   // 材料效率乘算，默认 1.0（<1 表示减耗）
  teBonus: number;   // 时间效率乘算，默认 1.0（<1 表示加速）
  runBonus: number;  // 额外增加的流程数，默认 0
}

export interface ReverseEngineeringData {
  id: string;
  name: string;
  targetBlueprintId: string; // 成功后获得的蓝图 ID
  baseItemId: string; // 基底材料 ID
  baseItemName: string;
  maxItemCount: number; // 最大基底材料数量（上限）
  successRatePerItem: number; // 每单位材料的成功率（如 0.10 表示 10%）
  baseTime: number; // 秒
  baseCost: number; // ISK
  dataCores: MaterialEntry[]; // 所需数据核心
}
