import { useProduction } from '../../state/ProductionContext';
import { getReverseById } from '../../data';
import styles from './ProductionPanel.module.css';

export function ReverseExtras() {
  const { state, dispatch } = useProduction();
  const revData = getReverseById(state.reverse.reverseId);

  if (state.projectType !== 'reverse' || !revData) return null;

  const handleItemCount = (v: number) => {
    dispatch({ type: 'SET_REVERSE', payload: { itemCount: v } });
  };

  const result = state.result as any;
  const successRate = result?.successRate ?? 0;

  return (
    <div className={styles.section}>
      <div className={styles.summaryRow}>
        <label>基底材料数量</label>
        <input
          type="range"
          min={1}
          max={revData.maxItemCount}
          value={state.reverse.itemCount}
          onChange={e => handleItemCount(parseInt(e.target.value))}
        />
        <span>{state.reverse.itemCount}</span>
      </div>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>成功率</span>
          <span className={styles.summaryValue}>{(successRate * 100).toFixed(1)}%</span>
        </div>
        {result?.expectedCost !== null && result?.expectedCost !== undefined && (
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>期望成本</span>
            <span className={`${styles.summaryValue} ${styles.highlight}`}>
              {result.expectedCost.toLocaleString()} ISK
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
