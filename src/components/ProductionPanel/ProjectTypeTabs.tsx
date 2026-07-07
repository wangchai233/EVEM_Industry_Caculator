import { useProduction } from '../../state/ProductionContext';
import styles from './ProductionPanel.module.css';

export function ProjectTypeTabs() {
  const { state, dispatch } = useProduction();
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${state.projectType === 'manufacturing' ? styles.active : ''}`}
        onClick={() => dispatch({ type: 'SET_PROJECT_TYPE', payload: 'manufacturing' })}
      >
        制造项目
      </button>
      <button
        className={`${styles.tab} ${state.projectType === 'reverse' ? styles.active : ''}`}
        onClick={() => dispatch({ type: 'SET_PROJECT_TYPE', payload: 'reverse' })}
      >
        逆向工程
      </button>
    </div>
  );
}
