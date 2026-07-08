import { useProduction } from '../../state/ProductionContext';
import styles from './ProductionPanel.module.css';

const TE_PRESETS = [1.00, 0.4781, 0.45];

export function EfficiencyConfig() {
  const { state, dispatch } = useProduction();

  const setTE = (v: number) => {
    if (state.projectType === 'manufacturing') {
      dispatch({ type: 'SET_MANUFACTURING', payload: { timeEfficiency: v } });
    } else {
      dispatch({ type: 'SET_REVERSE', payload: { timeEfficiency: v } });
    }
  };

  const config = state.projectType === 'manufacturing'
    ? state.manufacturing : state.reverse;

  return (
    <div className={styles.section}>
      <div className={styles.effRow}>
        <label className={styles.label}>时间效率</label>
        <select
          className={styles.select}
          value={config.timeEfficiency}
          onChange={e => setTE(Number(e.target.value))}
        >
          {TE_PRESETS.map(p => (
            <option key={p} value={p}>{(p * 100).toFixed(2)}%</option>
          ))}
        </select>
        <input
          className={styles.inputSmall}
          type="number"
          min="0.01"
          max="100"
          step="0.01"
          value={Math.round(config.timeEfficiency * 10000) / 100}
          onChange={e => setTE(Number(e.target.value) / 100)}
        />
        <span>%</span>
      </div>
    </div>
  );
}
