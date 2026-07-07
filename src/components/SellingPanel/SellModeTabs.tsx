import { useSelling } from '../../state/SellingContext';
import styles from './SellingPanel.module.css';

export function SellModeTabs() {
  const { state, dispatch } = useSelling();

  const setMode = (mode: 'market' | 'contract') => {
    if (mode === 'market') {
      dispatch({ type: 'SET_CONFIG', payload: { mode: 'market', sellPrice: 0, immediateSell: false, salesTaxRate: 0.20 } });
    } else {
      dispatch({ type: 'SET_CONFIG', payload: { mode: 'contract', sellPrice: 0 } });
    }
  };

  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${state.config.mode === 'market' ? styles.active : ''}`}
        onClick={() => setMode('market')}
      >
        市场出售
      </button>
      <button
        className={`${styles.tab} ${state.config.mode === 'contract' ? styles.active : ''}`}
        onClick={() => setMode('contract')}
      >
        合同出售
      </button>
    </div>
  );
}
