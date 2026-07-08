import type { ManufacturingConfig, Blueprint, ProductionResult } from '../types';
import type { BonusLayers } from '../types/bonus';
import type { Decoder } from '../types/blueprint';
import { EMPTY_BONUS } from '../types/bonus';
import { getItemById } from '../data';

type PriceGetter = (itemId: string) => number | null;
type DiscountGetter = (itemId: string) => number | null; // 返回折扣率（如 0.8 = 8折）

export function calculateManufacturing(
  config: ManufacturingConfig,
  bp: Blueprint,
  decoder: Decoder | undefined,
  getPrice: PriceGetter,
  bonuses: BonusLayers = EMPTY_BONUS,
  getDiscount?: DiscountGetter,
): ProductionResult {
  const materials: ProductionResult['materials'] = [];
  let totalMaterialCost: number | null = 0;

  // 材料效率 = 1.5 − 技能 − 设施 + 解码器（技能"加材料效率"= 降低ME，更省材料）
  const finalME = 1.5 - bonuses.skills.materialEfficiency - bonuses.facilities.materialEfficiency + bonuses.decoder.materialEfficiency;

  const effRuns = config.runs + (decoder?.runBonus ?? 0);

  const processMaterial = (itemId: string, baseQty: number, isBase: boolean) => {
    const item = getItemById(itemId);
    const adjustedQty = isBase ? baseQty : baseQty * finalME;
    const totalQty = adjustedQty * config.runs;
    const rawPrice = getPrice(itemId);
    const discount = getDiscount?.(itemId);
    const unitPrice = rawPrice !== null ? rawPrice * (discount ?? 1) : rawPrice;
    const subtotal = unitPrice !== null ? totalQty * unitPrice : null;

    if (subtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += subtotal;

    materials.push({
      itemId, itemName: item?.name ?? itemId,
      category: item?.category ?? 'mineral',
      baseQuantity: baseQty, adjustedQuantity: adjustedQty,
      totalQuantity: totalQty, unitPrice, subtotal,
      isBaseMaterial: isBase,
    });
  };

  // 蓝图（基底）
  const bpPrice = getPrice(bp.id);
  const bpSubtotal = bpPrice !== null ? bpPrice * config.runs : null;
  if (bpSubtotal === null) totalMaterialCost = null;
  else if (totalMaterialCost !== null) totalMaterialCost += bpSubtotal;
  materials.push({
    itemId: bp.id, itemName: bp.name, category: 'blueprint',
    baseQuantity: 1, adjustedQuantity: 1, totalQuantity: config.runs,
    unitPrice: bpPrice, subtotal: bpSubtotal, isBaseMaterial: true,
  });

  // 解码器（基底）
  if (decoder) {
    const decPrice = getPrice(decoder.id);
    const decSubtotal = decPrice !== null ? decPrice * config.runs : null;
    if (decSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += decSubtotal;
    materials.push({
      itemId: decoder.id, itemName: decoder.name, category: 'decoder',
      baseQuantity: 1, adjustedQuantity: 1, totalQuantity: config.runs,
      unitPrice: decPrice, subtotal: decSubtotal, isBaseMaterial: true,
    });
  }

  // 普通材料
  for (const m of bp.materials) {
    processMaterial(m.itemId, m.quantity, m.isBase ?? false);
  }

  // 时间 = 基础 × (1+技能) × (1+设施) × (1+解码器)，乘法
  const finalTime = bp.baseTime
    * (1 + bonuses.skills.timeEfficiency)
    * (1 + bonuses.facilities.timeEfficiency)
    * (1 + bonuses.decoder.timeEfficiency);

  // 现金费用 = 基础 × (1+技能) × 流程数
  const baseCash = bp.baseCost * (1 + bonuses.skills.costMultiplier + bonuses.facilities.costMultiplier);
  const cashCost = baseCash * config.runs;

  const productCount = bp.productQuantity * effRuns;
  const totalCost = totalMaterialCost !== null ? totalMaterialCost + cashCost : null;
  const costPerUnit = totalCost !== null ? totalCost / productCount : null;

  return {
    materials, totalMaterialCost, cashCost, totalTime: finalTime, productCount, totalCost, costPerUnit,
    finalMaterialEfficiency: finalME,
    finalTimeMultiplier: finalTime / bp.baseTime,
  };
}
