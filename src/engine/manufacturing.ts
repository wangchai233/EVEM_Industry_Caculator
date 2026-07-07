import type { ManufacturingConfig, Blueprint, Decoder, ProductionResult, MaterialEntry } from '../types';
import { getItemById } from '../data';

type PriceGetter = (itemId: string) => number | null;

export function calculateManufacturing(
  config: ManufacturingConfig,
  bp: Blueprint,
  decoder: Decoder | undefined,
  getPrice: PriceGetter
): ProductionResult {
  const materials: ProductionResult['materials'] = [];
  let totalMaterialCost: number | null = 0;
  const effRuns = config.runs + (decoder?.runBonus ?? 0);

  const processMaterial = (entry: MaterialEntry, isBase: boolean) => {
    const item = getItemById(entry.itemId);
    const baseQty = entry.quantity;
    const adjustedQty = isBase ? baseQty : baseQty * config.materialEfficiency;
    const totalQty = adjustedQty * config.runs;
    const unitPrice = getPrice(entry.itemId);
    const subtotal = unitPrice !== null ? totalQty * unitPrice : null;

    if (subtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += subtotal;

    materials.push({
      itemId: entry.itemId,
      itemName: item?.name ?? entry.itemId,
      category: item?.category ?? 'mineral',
      baseQuantity: baseQty,
      adjustedQuantity: adjustedQty,
      totalQuantity: totalQty,
      unitPrice,
      subtotal,
      isBaseMaterial: isBase,
    });
  };

  processMaterial({ itemId: bp.id, quantity: 1 }, true);

  if (decoder && decoder.id !== 'decoder_none') {
    const decPrice = getPrice(decoder.id);
    const decQty = config.runs;
    const decSubtotal = decPrice !== null ? decPrice * decQty : null;
    if (decSubtotal === null) totalMaterialCost = null;
    else if (totalMaterialCost !== null) totalMaterialCost += decSubtotal;
    materials.push({
      itemId: decoder.id,
      itemName: decoder.name,
      category: 'decoder',
      baseQuantity: 1,
      adjustedQuantity: 1,
      totalQuantity: decQty,
      unitPrice: decPrice,
      subtotal: decSubtotal,
      isBaseMaterial: true,
    });
  }

  for (const entry of bp.materials) {
    processMaterial(entry, false);
  }

  const cashCost = bp.baseCost * config.runs;
  const totalTime = bp.baseTime * config.timeEfficiency * (decoder?.teBonus ?? 1.0);
  const productCount = bp.productQuantity * effRuns;

  const totalCost = totalMaterialCost !== null ? totalMaterialCost + cashCost : null;
  const costPerUnit = totalCost !== null ? totalCost / productCount : null;

  return {
    materials,
    totalMaterialCost,
    cashCost,
    totalTime,
    productCount,
    totalCost,
    costPerUnit,
  };
}
