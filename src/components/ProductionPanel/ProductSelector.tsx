import { useState } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { defaultBlueprints, defaultReverse } from '../../data';
import styles from './ProductionPanel.module.css';

export function ProductSelector() {
  const { state, dispatch } = useProduction();
  const [search, setSearch] = useState('');

  const items = state.projectType === 'manufacturing' ? defaultBlueprints : defaultReverse;
  const selectedId = state.projectType === 'manufacturing'
    ? state.manufacturing.blueprintId
    : state.reverse.reverseId;

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    if (state.projectType === 'manufacturing') {
      dispatch({ type: 'SET_MANUFACTURING', payload: { blueprintId: id } });
    } else {
      dispatch({ type: 'SET_REVERSE', payload: { reverseId: id } });
    }
  };

  return (
    <div className={styles.section}>
      <label className={styles.label}>选择产品</label>
      <input
        className={styles.input}
        placeholder="搜索产品..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className={styles.selectList}>
        {filtered.length > 0 ? (
          filtered.map(item => (
            <div
              key={item.id}
              className={`${styles.selectItem} ${selectedId === item.id ? styles.selected : ''}`}
              onClick={() => handleSelect(item.id)}
            >
              {item.name}
            </div>
          ))
        ) : (
          <div className={styles.selectItem} style={{ color: 'var(--color-text-secondary)' }}>无匹配结果</div>
        )}
      </div>
      <div className={styles.info}>
        从 {items.length} 个产品中搜索到 {filtered.length} 个结果
      </div>
    </div>
  );
}
