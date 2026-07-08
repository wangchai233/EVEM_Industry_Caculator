import type { Item } from './item';

export interface Blueprint {
  id: string;
  name: string;
  productItemId: string;
  productName: string;
  productQuantity: number;
  baseTime: number;
  baseCost: number;
  materials: { itemId: string; quantity: number }[];
  maxRuns: number;
  tags: string[]; // 产品标签
}

export type DecoderCategory = 'mfg' | 'rev';

export interface Decoder {
  id: string;
  name: string;
  category: DecoderCategory; // 'mfg' = 制造用, 'rev' = 逆向用
  materialEfficiency: number; // ME 加成
  timeEfficiency: number;     // TE 加成
  runBonus: number;           // 流程加成
  successRate: number;        // 成功率加成（仅逆向有效）
}

export interface ReverseEngineeringData {
  id: string;
  name: string;
  targetBlueprintId: string;
  baseItemId: string;
  baseItemName: string;
  maxItemCount: number;
  maxBaseSuccessRate: number; // 最大基础成功率（如 0.50 = 50%）
  baseTime: number;
  baseCost: number;
  dataCores: { itemId: string; quantity: number }[];
  tags: string[];
}
