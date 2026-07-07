import { useSelling } from '../../state/SellingContext';
import styles from './SellingPanel.module.css';

export function ContractSellConfig() {
  const { state, dispatch } = useSelling();
  const config = state.config as { mode: 'contract'; sellPrice: number };

  return (
    <div className={styles.section}>
      <div className={styles.row}>
        <label className={styles.label}>单件售价 (ISK)</label>
        <input
          className={styles.input}
          type="number"
          min="0"
          value={config.sellPrice || ''}
          onChange={e => dispatch({
            type: 'SET_CONFIG',
            payload: { ...config, sellPrice: parseFloat(e.target.value) || 0 },
          })}
        />
      </div>
      <div className={styles.info}>
        <p>中介费: 4%（最低 1,000 ISK）</p>
        <p>定金: 2.5%（最低 10,000 ISK，成交后退还）</p>
      </div>
    </div>
  );
}
