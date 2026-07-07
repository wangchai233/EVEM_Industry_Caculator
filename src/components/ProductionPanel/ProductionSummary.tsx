import { useProduction } from '../../state/ProductionContext';
import { getBlueprintById } from '../../data';
import { formatNumber, formatTime } from '../../utils/format';
import { useApp } from '../../state/AppContext';
import { useSelling } from '../../state/SellingContext';
import styles from './ProductionPanel.module.css';

export function ProductionSummary() {
  const { state, dispatch } = useProduction();
  const selling = useSelling();
  const bp = getBlueprintById(state.manufacturing.blueprintId);

  const handleSendToSelling = () => {
    if (state.result) {
      selling.dispatch({
        type: 'SET_COST_DATA',
        payload: {
          totalCost: state.result.totalCost,
          costPerUnit: state.result.costPerUnit,
          productCount: state.result.productCount,
        },
      });
    }
  };

  return (
    <div className={styles.summary}>
      {state.projectType === 'manufacturing' && (
        <div className={styles.summaryRow}>
          <label>流程数</label>
          <input
            type="range"
            min={1}
            max={bp?.maxRuns ?? 10}
            value={state.manufacturing.runs}
            onChange={e => dispatch({
              type: 'SET_MANUFACTURING',
              payload: { runs: parseInt(e.target.value) },
            })}
          />
          <span>{state.manufacturing.runs}</span>
        </div>
      )}

      {state.result && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>总耗时</span>
            <span className={styles.summaryValue}>{formatTime(state.result.totalTime)}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>现金费用</span>
            <span className={styles.summaryValue}>{formatNumber(state.result.cashCost)} ISK</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>材料成本</span>
            <span className={styles.summaryValue}>
              {state.result.totalMaterialCost !== null
                ? `${formatNumber(state.result.totalMaterialCost)} ISK`
                : '待录入'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>总成本</span>
            <span className={`${styles.summaryValue} ${styles.highlight}`}>
              {state.result.totalCost !== null
                ? `${formatNumber(state.result.totalCost)} ISK`
                : '待录入'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>单件成本</span>
            <span className={styles.summaryValue}>
              {state.result.costPerUnit !== null
                ? `${formatNumber(state.result.costPerUnit)} ISK`
                : '待录入'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>产物数量</span>
            <span className={styles.summaryValue}>{formatNumber(state.result.productCount)}</span>
          </div>
        </div>
      )}

      <button className={styles.sendBtn} onClick={handleSendToSelling} disabled={!state.result}>
        发送到出售 →
      </button>
    </div>
  );
}
