import type { MarketSellConfig, ContractSellConfig, SellingResult } from '../types';

interface CostInput {
  totalCost: number | null;
  costPerUnit: number | null;
  productCount: number;
}

export function calculateMarketSelling(config: MarketSellConfig, cost: CostInput): SellingResult {
  const brokerFeeRate = 0.01;
  let revenue: number;
  let brokerFee: number;
  let salesTax: number;

  if (config.immediateSell) {
    brokerFee = 0;
    salesTax = config.sellPrice * config.salesTaxRate * cost.productCount;
    revenue = config.sellPrice * cost.productCount - salesTax;
  } else {
    brokerFee = config.sellPrice * brokerFeeRate * cost.productCount;
    salesTax = config.sellPrice * config.salesTaxRate * cost.productCount;
    revenue = config.sellPrice * cost.productCount - brokerFee - salesTax;
  }

  const totalProfit = cost.totalCost !== null ? revenue - cost.totalCost : null;
  const profitMargin = totalProfit !== null && cost.totalCost !== null && cost.totalCost > 0
    ? (totalProfit / cost.totalCost) * 100 : null;
  const profitPerUnit = totalProfit !== null ? totalProfit / cost.productCount : null;

  return {
    mode: 'market',
    sellPrice: config.sellPrice,
    revenue,
    brokerFee,
    salesTax,
    deposit: 0,
    totalProfit,
    profitMargin,
    profitPerUnit,
  };
}

export function calculateContractSelling(config: ContractSellConfig, cost: CostInput): SellingResult {
  const brokerFeeRate = 0.04;
  const depositRate = 0.025;
  const totalSellPrice = config.sellPrice * cost.productCount;

  const brokerFee = Math.max(totalSellPrice * brokerFeeRate, 1000);
  const deposit = Math.max(totalSellPrice * depositRate, 10000);
  const revenue = totalSellPrice - brokerFee;

  const totalProfit = cost.totalCost !== null ? revenue - cost.totalCost : null;
  const profitMargin = totalProfit !== null && cost.totalCost !== null && cost.totalCost > 0
    ? (totalProfit / cost.totalCost) * 100 : null;
  const profitPerUnit = totalProfit !== null ? totalProfit / cost.productCount : null;

  return {
    mode: 'contract',
    sellPrice: config.sellPrice,
    revenue,
    brokerFee,
    salesTax: 0,
    deposit,
    totalProfit,
    profitMargin,
    profitPerUnit,
  };
}
