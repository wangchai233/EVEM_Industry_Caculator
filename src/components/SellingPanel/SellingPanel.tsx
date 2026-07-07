import { useEffect } from 'react';
import { useSelling } from '../../state/SellingContext';
import { calculateMarketSelling, calculateContractSelling } from '../../engine/selling';
import { SellModeTabs } from './SellModeTabs';
import { MarketSellConfig } from './MarketSellConfig';
import { ContractSellConfig } from './ContractSellConfig';
import { ProfitSummary } from './ProfitSummary';
import styles from './SellingPanel.module.css';

export function SellingPanel() {
  const { state, dispatch } = useSelling();

  useEffect(() => {
    if (!state.costData) {
      dispatch({ type: 'SET_RESULT', payload: null });
      return;
    }
    if (state.config.mode === 'market' && state.config.sellPrice > 0) {
      const result = calculateMarketSelling(state.config, state.costData);
      dispatch({ type: 'SET_RESULT', payload: result });
    } else if (state.config.mode === 'contract' && state.config.sellPrice > 0) {
      const result = calculateContractSelling(state.config, state.costData);
      dispatch({ type: 'SET_RESULT', payload: result });
    }
  }, [state.config, state.costData, dispatch]);

  return (
    <div className={styles.panel}>
      <SellModeTabs />
      {state.config.mode === 'market' ? <MarketSellConfig /> : <ContractSellConfig />}
      <ProfitSummary />
    </div>
  );
}
