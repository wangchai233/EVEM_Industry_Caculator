import { useProduction } from '../../state/ProductionContext';
import styles from './ProductionPanel.module.css';

const ME_PRESETS = [1.50, 0.97, 0.96, 0.95];
const TE_PRESETS = [1.00, 0.4781, 0.45];

export function EfficiencyConfig() {
  const { state, dispatch } = useProduction();

  const config = state.projectType === 'manufacturing'
    ? state.manufacturing : { materialEfficiency: 1.5, timeEfficiency: state.reverse.timeEfficiency };

  const setME = (v: number) => {
    if (state.projectType === 'manufacturing') {
      dispatch({ type: 'SET_MANUFACTURING', payload: { materialEfficiency: v } });
    }
  };

  const setTE = (v: number) => {
    if (state.projectType === 'manufacturing') {
      dispatch({ type: 'SET_MANUFACTURING', payload: { timeEfficiency: v } });
    } else {
      dispatch({ type: 'SET_REVERSE', payload: { timeEfficiency: v } });
    }
  };

  return (
    <div className={styles.section}>
      {state.projectType === 'manufacturing' && (
        <>
          <div className={styles.effRow}>
            <label className={styles.label}>材料效率</label>
            <select
              className={styles.select}
              value={config.materialEfficiency}
              onChange={e => setME(Number(e.target.value))}
            >
              {ME_PRESETS.map(p => (
                <option key={p} value={p}>{(p * 100).toFixed(0)}%</option>
              ))}
            </select>
            <input
              className={styles.inputSmall}
              type="number"
              min="75"
              max="150"
              step="0.01"
              value={Math.round(config.materialEfficiency * 100)}
              onChange={e => setME(Number(e.target.value) / 100)}
            />
            <span>%</span>
          </div>
          {(config.materialEfficiency < 0.75 || config.materialEfficiency > 1.50) && (
            <span className={styles.error}>材料效率范围: 75%~150%</span>
          )}
        </>
      )}
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
