import { defaultItems, defaultDecoders } from './items';
import { defaultBlueprints, blueprintProducts } from './blueprints';
import { defaultReverse } from './reverse';
import type { Item, Blueprint, Decoder, ReverseEngineeringData } from '../types';

const allItems: Item[] = [...defaultItems, ...defaultDecoders, ...blueprintProducts];

const itemMap = new Map(allItems.map(i => [i.id, i]));
const bpMap = new Map(defaultBlueprints.map(b => [b.id, b]));
const revMap = new Map(defaultReverse.map(r => [r.id, r]));
const decoderMap = new Map(defaultDecoders.map(d => [d.id, d]));

export function getItemById(id: string): Item | undefined {
  return itemMap.get(id);
}

export function getBlueprintById(id: string): Blueprint | undefined {
  return bpMap.get(id);
}

export function getReverseById(id: string): ReverseEngineeringData | undefined {
  return revMap.get(id);
}

export function getDecoderById(id: string): Decoder | undefined {
  return decoderMap.get(id);
}

export { defaultItems, defaultDecoders, defaultBlueprints, blueprintProducts, defaultReverse, allItems };
