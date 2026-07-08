# EVEM 出售板块独立化 — 自定义售价/扣税计算器

## 概述

让出售板块脱离工业板块依赖，通过手动输入数量（和可选成本），单独作为扣税计算器使用。手动输入的数据持久化到 localStorage。

---

## 当前状态分析

### 数据流

```
ProductionPanel → "发送到出售" → SET_COST_DATA → SellingContext.costData
                                                        ↓
                                              SellingPanel 检查 costData
                                                   ↓ null
                                            返回 null（不计算）
```

[SellingPanel.tsx:14-17](file:///d:/Trae_Projects/EVEM_Industry_Calc/src/components/SellingPanel/SellingPanel.tsx#L14-L17)：
```ts
if (!state.costData) {
  dispatch({ type: 'SET_RESULT', payload: null });
  return;
}
```

[ProfitSummary.tsx:8-10](file:///d:/Trae_Projects/EVEM_Industry_Calc/src/components/SellingPanel/ProfitSummary.tsx#L8-L10)：
```ts
if (!state.costData || !state.result) {
  return <div>请先在左侧完成生产配置，点击"发送到出售"</div>;
}
```

### 引擎依赖

[selling.ts](file:///d:/Trae_Projects/EVEM_Industry_Calc/src/engine/selling.ts) 接收 `cost: CostInput { totalCost, costPerUnit, productCount }`：
- `productCount` — 计算税费必需（售价 × 数量 × 税率）
- `totalCost` — 利润计算用，为 null 时利润显示"待录入"
- 纯税费（中介费、销售税、定金）不依赖 cost

---

## 修改方案

### 1. SellingContext 增加手动数据

**文件**: `src/state/SellingContext.tsx`

新增 `manualData` 字段，通过 `useLocalStorage` 持久化：

```ts
import { useLocalStorage } from './useLocalStorage';

// State 新增
manualData: { quantity: number; totalCost: number | null } | null;

// Action 新增
| { type: 'SET_MANUAL_DATA'; payload: { quantity: number; totalCost: number | null } | null };
```

在 `SellingProvider` 中用 `useLocalStorage` 管理：
```ts
const [manualData, setManualData] = useLocalStorage<{
  quantity: number; totalCost: number | null;
} | null>('evem_selling_manual', null);
```

注意：由于当前使用 `useReducer`，需要将 `manualData` 作为额外状态传入 context value，不在 reducer 中管理（避免与 useLocalStorage 的 setter 冲突）。

Context value 新增 `manualData` 和 `setManualData`。

### 2. SellingPanel 独立计算逻辑

**文件**: `src/components/SellingPanel/SellingPanel.tsx`

当 `costData` 为 null 时，从 `manualData` 构造 cost 输入：

```ts
useEffect(() => {
  const effectiveCostData = state.costData ?? (
    manualData ? { totalCost: manualData.totalCost, costPerUnit: null, productCount: manualData.quantity } : null
  );
  
  if (!effectiveCostData) {
    dispatch({ type: 'SET_RESULT', payload: null });
    return;
  }
  
  const effectiveSellPrice = state.config.sellPrice * (state.discountOverride ?? 1.0);
  const effectiveConfig = { ...state.config, sellPrice: effectiveSellPrice };
  
  if (state.config.mode === 'market' && effectiveConfig.sellPrice > 0) {
    const result = calculateMarketSelling(effectiveConfig, effectiveCostData);
    dispatch({ type: 'SET_RESULT', payload: result });
  } else if (state.config.mode === 'contract' && effectiveConfig.sellPrice > 0) {
    const result = calculateContractSelling(effectiveConfig, effectiveCostData);
    dispatch({ type: 'SET_RESULT', payload: result });
  }
}, [state.config, state.costData, state.discountOverride, manualData, dispatch]);
```

### 3. ProfitSummary 手动输入 + 结果展示

**文件**: `src/components/SellingPanel/ProfitSummary.tsx`

分为两种状态：

**A. 无 costData（手动模式）**：显示手动输入区域 + 结果
```tsx
<div className={styles.section}>
  <h3 className={styles.sectionTitle}>手动输入</h3>
  <div className={styles.row}>
    <label>数量</label>
    <input type="number" min="1" value={manualData?.quantity ?? ''}
      onChange={e => setManualData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} />
  </div>
  <div className={styles.row}>
    <label>总成本 (选填)</label>
    <input type="number" min="0" placeholder="仅影响利润计算"
      value={manualData?.totalCost ?? ''}
      onChange={e => {
        const v = e.target.value;
        setManualData(prev => ({ ...prev, totalCost: v === '' ? null : parseFloat(v) }));
      }} />
  </div>
  <div className={styles.info}>填写数量和售价后自动计算税费</div>
</div>
```

**B. 有 costData（工业联动模式）**：保持现有逻辑不变。

两种模式下，结果展示区域复用同一段 JSX。

默认初始值：`manualData` 初始为 null → 首次使用显示空输入框，用户填入 quantity=1 后自动触发计算。

---

## 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `src/state/SellingContext.tsx` | 新增 `manualData` + `useLocalStorage` 持久化 + context 暴露 |
| `src/state/SellingContext.ts` → 新增导出类型 | `ManualSellData` 类型 |
| `src/components/SellingPanel/SellingPanel.tsx` | 计算逻辑兼容 manualData |
| `src/components/SellingPanel/ProfitSummary.tsx` | 无 costData 时显示手动输入区，有值时保持现有逻辑 |

---

## 验证步骤

1. `npx tsc --noEmit` — 类型检查通过
2. `npx vite build` — 构建通过
3. 手动测试：
   - 不点"发送到出售"，在出售面板输入数量=100、售价=1000000、税率=20% → 应显示税后收入=98000000
   - 填入总成本=50000000 → 应显示利润=48000000
   - 清空总成本 → 利润显示"待录入"
   - 刷新页面 → 数量/成本保留
   - 工业板块点"发送到出售" → 手动输入区隐藏，使用工业数据
