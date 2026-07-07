import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { formatNumber } from '../../utils/format';
import styles from './ProductionPanel.module.css';

export function MaterialList() {
  const { state } = useProduction();
  const { getPrice, setPrice } = useApp();

  if (!state.result) return null;

  const { materials } = state.result;

  const groupedByCategory = materials.reduce<Record<string, typeof materials>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  const categoryNames: Record<string, string> = {
    mineral: '矿物',
    planetary: '行星材料',
    data_core: '数据核心',
    decoder: '解码器',
    damaged_structure: '基底材料',
    blueprint: '蓝图',
  };

  return (
    <div className={styles.section}>
      <label className={styles.label}>材料清单</label>
      {Object.entries(groupedByCategory).map(([cat, items]) => (
        <div key={cat}>
          <h4 className={styles.catTitle}>{categoryNames[cat] || cat}</h4>
          <table className={styles.materialTable}>
            <thead>
              <tr>
                <th>材料</th>
                <th>基准</th>
                <th>修正</th>
                <th>总数</th>
                <th>单价</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m.itemId} className={m.unitPrice === null ? styles.warning : ''}>
                  <td>
                    {m.itemName}
                    {m.isBaseMaterial && <span className={styles.tag}>基底</span>}
                  </td>
                  <td>{formatNumber(m.baseQuantity)}</td>
                  <td>{formatNumber(m.adjustedQuantity)}</td>
                  <td>{formatNumber(m.totalQuantity)}</td>
                  <td>
                    <input
                      className={styles.priceInput}
                      type="number"
                      min="0"
                      placeholder="未设置"
                      value={m.unitPrice ?? ''}
                      onChange={e => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setPrice(m.itemId, v);
                      }}
                    />
                  </td>
                  <td>{m.subtotal !== null ? formatNumber(m.subtotal) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
