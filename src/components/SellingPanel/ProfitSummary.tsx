import { useSelling } from '../../state/SellingContext';
import { formatNumber } from '../../utils/format';
import styles from './SellingPanel.module.css';

export function ProfitSummary() {
  const { state, manualData, setManualData } = useSelling();

  // 手动模式下，没有 manualData 时显示初始输入区
  const isManual = !state.costData;

  if (!state.result && !isManual) {
    return <div className={styles.placeholder}>请先在左侧完成生产配置，点击"发送到出售"</div>;
  }

  const { result } = state;
  const effectiveCostData = state.costData ?? (
    manualData
      ? { totalCost: manualData.totalCost, costPerUnit: null, productCount: manualData.quantity }
      : null
  );

  const getManualQuantity = () => {
    if (manualData) return manualData.quantity;
    if (isManual) return 1; // 首次默认 1
    return 0;
  };

  const getManualTotalCost = () => {
    if (!manualData) return '';
    return manualData.totalCost !== null ? manualData.totalCost : '';
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value);
    if (!isNaN(qty) && qty > 0) {
      setManualData({ quantity: qty, totalCost: manualData?.totalCost ?? null });
    }
  };

  const handleTotalCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setManualData({
      quantity: manualData?.quantity ?? 1,
      totalCost: v === '' ? null : parseFloat(v),
    });
  };

  // 利润结果展示（手动模式和联动模式共用）
  const renderResult = () => {
    if (!result || !effectiveCostData) return null;
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>利润分析</h3>
        <div className={styles.grid}>
          <div className={styles.item}>
            <span className={styles.label}>总售价</span>
            <span className={styles.value}>{formatNumber(result.sellPrice * effectiveCostData.productCount)} ISK</span>
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
              {effectiveCostData.totalCost !== null ? `${formatNumber(effectiveCostData.totalCost)} ISK` : '未填'}
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
  };

  return (
    <>
      {isManual && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>手动输入</h3>
          <div className={styles.row}>
            <label className={styles.label}>数量</label>
            <input
              className={styles.input}
              type="number"
              min="1"
              value={getManualQuantity()}
              onChange={handleQuantityChange}
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>总成本 (选填)</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              placeholder="仅影响利润计算"
              value={getManualTotalCost()}
              onChange={handleTotalCostChange}
            />
          </div>
          <div className={styles.info}>输入数量和售价后自动计算税费</div>
        </div>
      )}
      {renderResult()}
      {isManual && !result && (
        <div className={styles.info}>请在上方输入售价和数量</div>
      )}
    </>
  );
}
