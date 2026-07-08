import { useApp } from '../../state/AppContext';
import styles from './ProductionPanel.module.css';

export function EfficiencyConfig() {
  const { globalOverrides, setGlobalOverrides } = useApp();

  const set = (patch: Partial<typeof globalOverrides>) => {
    setGlobalOverrides(prev => ({ ...prev, ...patch }));
  };

  return (
    <div className={styles.section}>
      <label className={styles.label}>
        <input
          type="checkbox"
          checked={!globalOverrides.enabled}
          onChange={e => set({ enabled: !e.target.checked })}
          style={{ marginRight: 6 }}
        />
        使用技能和设施加成
      </label>

      {globalOverrides.enabled && (
        <>
          <div className={styles.effRow}>
            <label className={styles.label}>材料效率</label>
            <input
              className={styles.inputSmall}
              type="number"
              min="75"
              max="300"
              step="1"
              value={Math.round(globalOverrides.materialEfficiency * 100)}
              onChange={e => set({ materialEfficiency: (parseFloat(e.target.value) || 150) / 100 })}
            />
            <span>%</span>
          </div>
          <div className={styles.effRow}>
            <label className={styles.label}>时间效率</label>
            <input
              className={styles.inputSmall}
              type="number"
              min="1"
              max="200"
              step="1"
              value={Math.round(globalOverrides.timeEfficiency * 100)}
              onChange={e => set({ timeEfficiency: (parseFloat(e.target.value) || 100) / 100 })}
            />
            <span>%</span>
          </div>
          <div className={styles.effRow}>
            <label className={styles.label}>成功率</label>
            <input
              className={styles.inputSmall}
              type="number"
              min="-100"
              max="100"
              step="1"
              value={Math.round(globalOverrides.successRate * 100)}
              onChange={e => set({ successRate: (parseFloat(e.target.value) || 0) / 100 })}
            />
            <span>%</span>
          </div>
        </>
      )}
    </div>
  );
}
