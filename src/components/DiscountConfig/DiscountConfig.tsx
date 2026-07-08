import { useApp } from '../../state/AppContext';
import styles from './DiscountConfig.module.css';

export function DiscountConfig() {
  const { discountRules, addDiscountRule, removeDiscountRule } = useApp();

  const handleAdd = () => {
    const type = prompt('类型 (category/item):', 'category');
    if (!type || (type !== 'category' && type !== 'item')) return;
    const targetId = prompt('目标 (分类名 或 物品ID):', '') || '';
    if (!targetId) return;
    const name = prompt('显示名:', '') || targetId;
    const rateStr = prompt('折扣率 (0.8 = 8折):', '1.0');
    if (rateStr === null) return;
    const rate = parseFloat(rateStr);
    if (isNaN(rate)) return;
    const scope = prompt('适用范围 (buy/sell):', 'buy');
    if (!scope || (scope !== 'buy' && scope !== 'sell')) return;
    addDiscountRule({ type: type as 'category' | 'item', targetId, name, rate, scope: scope as 'buy' | 'sell' });
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>折扣配置</span>
        <button className={styles.addBtn} onClick={handleAdd}>+ 添加</button>
      </div>
      {discountRules.length === 0 ? (
        <div className={styles.empty}>暂无折扣规则，点击「+ 添加」创建</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>折扣</th>
              <th>范围</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {discountRules.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.type === 'category' ? '分类' : '物品'}</td>
                <td>{(r.rate * 100).toFixed(0)}%</td>
                <td>{r.scope === 'buy' ? '购买' : '出售'}</td>
                <td>
                  <button className={styles.delBtn} onClick={() => removeDiscountRule(r.id)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
