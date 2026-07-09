import type { ReverseEngineeringConfig, ReverseEngineeringData, ProductionResult } from '../types';
import type { BonusLayers } from '../types/bonus';
import type { Decoder } from '../types/blueprint';
import { getItemById } from '../data';

type PriceGetter = (itemId: string) => number | null;

const roundByCategory = (qty: number, category: string): number => {
  if (category === 'ship') return Math.ceil(qty);
  return Math.round(qty);
};

export function calculateReverse(
  config: ReverseEngineeringConfig,
  revData: ReverseEngineeringData,
  decoder: Decoder | undefined,
  getPrice: PriceGetter,
  bonuses: BonusLayers,
  roundQuantities = true,
): ProductionResult & { successRate: number; expectedCost: number | null } {
  const materials: ProductionResult['materials'] = [];
  let totalMaterialCost: number | null = 0;

  // 基础成功率
  const baseSuccessRate = config.itemCount > 0
    ? (config.itemCount / revData.maxItemCount) * revData.maxBaseSuccessRate
    : 0;

  // 最终成功率 = 基础 × (1 + 技能 + 设施 + 解码器)
  const rawSuccess = baseSuccessRate
    * (1 + bonuses.skills.successRate + bonuses.facilities.successRate + bonuses.decoder.successRate);
  const successRate = Math.min(rawSuccess, 1.0);

  // 基底材料
  const basePrice = getPrice(revData.baseItemId);
  const baseSubtotal = basePrice !== null ? basePrice * config.itemCount : null;
  if (baseSubtotal === null) totalMaterialCost = null;
  else if (totalMaterialCost !== null) totalMaterialCost += baseSubtotal;
  materials.push({
    itemId: revData.baseItemId,
    itemName: revData.baseItemName,
    category: 'damaged_structure',
    baseQuantity: config.itemCount,
    adjustedQuantity: config.itemCount,
    totalQuantity: config.itemCount,
    unitPrice: basePrice,
    subtotal: baseSubtotal,
    isBaseMaterial: true,
  });

  // 数据核心
  for (const dc of revData.dataCores) {
    const dcItem = getItemById(dc.itemId);
    const dcPrice = getPrice(dc.itemId);
    const rawQty = dc.quantity;
    const qty = roundQuantities ? roundByCategory(rawQty, 'data_core') : rawQty;
    const dcSubtotal = dcPrice !== null ? dcPrice * qty : null;
    if (dcSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += dcSubtotal;
    materials.push({
      itemId: dc.itemId,
      itemName: dcItem?.name ?? dc.itemId,
      category: 'data_core',
      baseQuantity: dc.quantity,
      adjustedQuantity: qty,
      totalQuantity: qty,
      unitPrice: dcPrice,
      subtotal: dcSubtotal,
      isBaseMaterial: true,
    });
  }

  // 解码器
  if (decoder) {
    const decPrice = getPrice(decoder.id);
    const decSubtotal = decPrice !== null ? decPrice : null;
    if (decSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += decSubtotal;
    materials.push({
      itemId: decoder.id,
      itemName: decoder.name,
      category: 'decoder',
      baseQuantity: 1,
      adjustedQuantity: 1,
      totalQuantity: 1,
      unitPrice: decPrice,
      subtotal: decSubtotal,
      isBaseMaterial: true,
    });
  }

  // 时间（同制造公式）
  const finalTime = revData.baseTime
    * (1 + bonuses.skills.timeEfficiency)
    * (1 + bonuses.facilities.timeEfficiency)
    * (1 + bonuses.decoder.timeEfficiency);

  // 现金费用
  const baseCash = revData.baseCost * (1 + bonuses.skills.costMultiplier + bonuses.facilities.costMultiplier);
  const cashCost = baseCash;

  const singleCost = totalMaterialCost !== null ? totalMaterialCost + cashCost : null;
  // 期望成本考虑并行流程数
  const expectedCost = singleCost !== null ? (singleCost / successRate) * config.parallelRuns : null;

  return {
    materials,
    totalMaterialCost,
    cashCost,
    totalTime: finalTime,
    productCount: config.parallelRuns,
    totalCost: expectedCost,
    costPerUnit: expectedCost,
    successRate,
    expectedCost,
    finalTimeMultiplier: finalTime / revData.baseTime,
    finalSuccessRate: successRate,
  };
}
