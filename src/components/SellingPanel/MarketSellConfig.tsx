import { useSelling } from '../../state/SellingContext';
import styles from './SellingPanel.module.css';

const TAX_PRESETS = [0.20, 0.164, 0.148, 0.128, 0.12];

export function MarketSellConfig() {
  const { state, dispatch } = useSelling();
  const config = state.config as { mode: 'market'; sellPrice: number; immediateSell: boolean; salesTaxRate: number };

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

      <div className={styles.row}>
        <label className={styles.label}>销售税率</label>
        <select
          className={styles.select}
          value={config.salesTaxRate}
          onChange={e => dispatch({
            type: 'SET_CONFIG',
            payload: { ...config, salesTaxRate: Number(e.target.value) },
          })}
        >
          {TAX_PRESETS.map(p => (
            <option key={p} value={p}>{(p * 100).toFixed(1)}%</option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={config.immediateSell}
            onChange={e => dispatch({
              type: 'SET_CONFIG',
              payload: { ...config, immediateSell: e.target.checked },
            })}
          />
          立即出售
        </label>
      </div>

      <div className={styles.info}>
        中介费: 1%（{config.immediateSell ? '立即出售不扣中介费' : '挂单扣中介费'}）
      </div>
    </div>
  );
}
