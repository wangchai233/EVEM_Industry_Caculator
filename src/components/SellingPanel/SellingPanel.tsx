import { useEffect } from 'react';
import { useSelling } from '../../state/SellingContext';
import { calculateMarketSelling, calculateContractSelling } from '../../engine/selling';
import { SellModeTabs } from './SellModeTabs';
import { MarketSellConfig } from './MarketSellConfig';
import { ContractSellConfig } from './ContractSellConfig';
import { ProfitSummary } from './ProfitSummary';
import styles from './SellingPanel.module.css';

export function SellingPanel() {
  const { state, dispatch, manualData } = useSelling();

  useEffect(() => {
    const effectiveCostData = state.costData ?? (
      manualData
        ? { totalCost: manualData.totalCost, costPerUnit: null, productCount: manualData.quantity }
        : null
    );

    if (!effectiveCostData) {
      dispatch({ type: 'SET_RESULT', payload: null });
      return;
    }

    const effectiveSellPrice = state.config.sellPrice * (state.discountOverride ?? 1.0);
    const effectiveConfig = { ...state.config, sellPrice: effectiveSellPrice };
    if (state.config.mode === 'market' && effectiveConfig.sellPrice > 0) {
      const result = calculateMarketSelling(effectiveConfig as typeof state.config & { sellPrice: number }, effectiveCostData);
      dispatch({ type: 'SET_RESULT', payload: result });
    } else if (state.config.mode === 'contract' && effectiveConfig.sellPrice > 0) {
      const result = calculateContractSelling(effectiveConfig as typeof state.config & { sellPrice: number }, effectiveCostData);
      dispatch({ type: 'SET_RESULT', payload: result });
    }
  }, [state.config, state.costData, state.discountOverride, manualData, dispatch]);

  return (
    <div className={styles.panel}>
      <SellModeTabs />
      {state.config.mode === 'market' ? <MarketSellConfig /> : <ContractSellConfig />}
      <ProfitSummary />
    </div>
  );
}
