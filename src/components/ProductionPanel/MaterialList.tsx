import { useState } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { formatNumber } from '../../utils/format';
import styles from './ProductionPanel.module.css';

export function MaterialList() {
  const { state } = useProduction();
  const { setPrice, clearPrice, materialDiscounts, setMaterialDiscount, clearMaterialDiscount } = useApp();
  const [overwriteByCategory, setOverwriteByCategory] = useState<Record<string, boolean>>({});

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

  const toggleOverwrite = (cat: string) => {
    setOverwriteByCategory(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const fillPrice = (cat: string, items: typeof materials) => {
    const firstValue = items.find(m => m.unitPrice !== null)?.unitPrice;
    if (firstValue === undefined) return;
    const overwrite = overwriteByCategory[cat] ?? false;
    for (const m of items) {
      if (!overwrite && m.unitPrice !== null) continue;
      setPrice(m.itemId, firstValue);
    }
  };

  const fillDiscount = (cat: string, items: typeof materials) => {
    const firstItem = items.find(m => materialDiscounts[m.itemId] !== undefined);
    if (!firstItem) return;
    const rate = materialDiscounts[firstItem.itemId];
    if (rate === undefined) return;
    const overwrite = overwriteByCategory[cat] ?? false;
    for (const m of items) {
      const existing = materialDiscounts[m.itemId];
      if (!overwrite && existing !== undefined) continue;
      setMaterialDiscount(m.itemId, rate);
    }
  };

  const clearPrices = (items: typeof materials) => {
    for (const m of items) clearPrice(m.itemId);
  };

  const clearDiscounts = (items: typeof materials) => {
    for (const m of items) clearMaterialDiscount(m.itemId);
  };

  return (
    <div className={styles.section}>
      <label className={styles.label}>材料清单</label>
      {Object.entries(groupedByCategory).map(([cat, items]) => (
        <div key={cat} style={{ overflowX: 'auto' }}>
          <div className={styles.catHeader}>
            <h4 className={styles.catTitle}>{categoryNames[cat] || cat}</h4>
            <button className={styles.fillBtn} onClick={() => fillPrice(cat, items)}>
              填充单价
            </button>
            <button className={styles.fillBtn} onClick={() => fillDiscount(cat, items)}>
              填充折扣
            </button>
            <button className={styles.fillBtn} onClick={() => clearPrices(items)}>
              清空单价
            </button>
            <button className={styles.fillBtn} onClick={() => clearDiscounts(items)}>
              清空折扣
            </button>
            <div className={styles.toggleRow}>
              <span>覆盖已有</span>
              <div
                className={`${styles.toggle} ${overwriteByCategory[cat] ? styles.toggleOn : ''}`}
                onClick={() => toggleOverwrite(cat)}
              >
                <div className={styles.toggleKnob} />
              </div>
            </div>
          </div>
          <table className={styles.materialTable}>
            <thead>
              <tr>
                <th>材料</th>
                <th>基准</th>
                <th>修正</th>
                <th>总数</th>
                <th>单价</th>
                <th>折扣</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => {
                const rowDiscount = materialDiscounts[m.itemId];
                return (
                  <tr key={m.itemId} className={m.unitPrice === null ? styles.warning : ''}>
                    <td>
                      {m.itemName}
                      {m.isBaseMaterial && m.category !== 'decoder' && <span className={styles.tag}>基底</span>}
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
                    <td>
                      <input
                        className={styles.priceInput}
                        type="number"
                        min="1"
                        max="100"
                        placeholder="全局"
                        value={rowDiscount !== undefined ? Math.round(rowDiscount * 100) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          if (v === '') {
                            setMaterialDiscount(m.itemId, null);
                          } else {
                            const pct = parseInt(v);
                            if (!isNaN(pct) && pct > 0 && pct <= 100) {
                              setMaterialDiscount(m.itemId, pct / 100);
                            }
                          }
                        }}
                      />
                      <span style={{ fontSize: '10px' }}>%</span>
                    </td>
                    <td>{m.subtotal !== null ? formatNumber(m.subtotal) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
