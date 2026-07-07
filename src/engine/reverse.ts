import type { ReverseEngineeringConfig, ReverseEngineeringData, Decoder, ProductionResult } from '../types';
import { getItemById } from '../data';

type PriceGetter = (itemId: string) => number | null;

export function calculateReverse(
  config: ReverseEngineeringConfig,
  revData: ReverseEngineeringData,
  decoder: Decoder | undefined,
  getPrice: PriceGetter
): ProductionResult & { successRate: number; expectedCost: number | null } {
  const materials: ProductionResult['materials'] = [];
  let totalMaterialCost: number | null = 0;

  const baseItem = getItemById(revData.baseItemId);
  const basePrice = getPrice(revData.baseItemId);
  const baseSubtotal = basePrice !== null ? basePrice * config.itemCount : null;
  if (baseSubtotal === null) totalMaterialCost = null;
  else if (totalMaterialCost !== null) totalMaterialCost += baseSubtotal;
  materials.push({
    itemId: revData.baseItemId,
    itemName: baseItem?.name ?? revData.baseItemId,
    category: 'damaged_structure',
    baseQuantity: config.itemCount,
    adjustedQuantity: config.itemCount,
    totalQuantity: config.itemCount,
    unitPrice: basePrice,
    subtotal: baseSubtotal,
    isBaseMaterial: true,
  });

  for (const dc of revData.dataCores) {
    const dcItem = getItemById(dc.itemId);
    const dcPrice = getPrice(dc.itemId);
    const dcSubtotal = dcPrice !== null ? dcPrice * dc.quantity : null;
    if (dcSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += dcSubtotal;
    materials.push({
      itemId: dc.itemId,
      itemName: dcItem?.name ?? dc.itemId,
      category: 'data_core',
      baseQuantity: dc.quantity,
      adjustedQuantity: dc.quantity,
      totalQuantity: dc.quantity,
      unitPrice: dcPrice,
      subtotal: dcSubtotal,
      isBaseMaterial: true,
    });
  }

  if (decoder && decoder.id !== 'decoder_none') {
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

  const cashCost = revData.baseCost;
  const successRate = Math.min(config.itemCount * revData.successRatePerItem, 1.0);
  const totalTime = revData.baseTime * config.timeEfficiency * (decoder?.teBonus ?? 1.0);

  const singleCost = totalMaterialCost !== null ? totalMaterialCost + cashCost : null;
  const expectedCost = singleCost !== null ? singleCost / successRate : null;

  return {
    materials,
    totalMaterialCost,
    cashCost,
    totalTime,
    productCount: 1,
    totalCost: expectedCost,
    costPerUnit: expectedCost,
    successRate,
    expectedCost,
  };
}
