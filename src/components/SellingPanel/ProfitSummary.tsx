import { useSelling } from '../../state/SellingContext';
import { formatNumber } from '../../utils/format';
import styles from './SellingPanel.module.css';

export function ProfitSummary() {
  const { state } = useSelling();

  if (!state.costData || !state.result) {
    return <div className={styles.placeholder}>请先在左侧完成生产配置，点击"发送到出售"</div>;
  }

  const { result, costData } = state;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>利润分析</h3>
      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.label}>总售价</span>
          <span className={styles.value}>{formatNumber(result.sellPrice * costData.productCount)} ISK</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>中介费</span>
          <span className={styles.value}>{formatNumber(result.brokerFee)} ISK</span>
        </div>
        {result.salesTax > 0 && (
          <div className={styles.item}>
            <span className={styles.label}>销售税</span>
            <span className={styles.value}>{formatNumber(result.salesTax)} ISK</span>
          </div>
        )}
        {result.deposit > 0 && (
          <div className={styles.item}>
            <span className={styles.label}>定金（可退）</span>
            <span className={styles.value}>{formatNumber(result.deposit)} ISK</span>
          </div>
        )}
        <div className={styles.item}>
          <span className={styles.label}>税后收入</span>
          <span className={styles.value}>{formatNumber(result.revenue)} ISK</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>总成本</span>
          <span className={styles.value}>
            {costData.totalCost !== null ? `${formatNumber(costData.totalCost)} ISK` : '待录入'}
          </span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>总利润</span>
          <span className={`${styles.value} ${(result.totalProfit ?? 0) >= 0 ? styles.profit : styles.loss}`}>
            {result.totalProfit !== null ? `${formatNumber(result.totalProfit)} ISK` : '待录入'}
          </span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>利润率</span>
          <span className={`${styles.value} ${(result.profitMargin ?? 0) >= 0 ? styles.profit : styles.loss}`}>
            {result.profitMargin !== null ? `${result.profitMargin.toFixed(2)}%` : '待录入'}
          </span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>单件利润</span>
          <span className={styles.value}>
            {result.profitPerUnit !== null ? `${formatNumber(result.profitPerUnit)} ISK` : '待录入'}
          </span>
        </div>
      </div>
    </div>
  );
}
