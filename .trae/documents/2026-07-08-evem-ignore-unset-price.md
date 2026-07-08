# EVEM 忽略未填价格开关

## 概述

在材料清单附近添加"忽略未填价格"开关。开启时，所有未录入单价的材料视为 0 ISK，不再阻断总成本计算（不再显示"待录入"）。

---

## 当前状态分析

价格为 `null` 的传播链（以制造引擎为例）：

1. `getPrice(itemId)` → `null`
2. `unitPrice = null`（[manufacturing.ts:32](file:///d:/Trae_Projects/EVEM_Industry_Calc/src/engine/manufacturing.ts#L32)）
3. `subtotal = null` → `totalMaterialCost = null`（[manufacturing.ts:35](file:///d:/Trae_Projects/EVEM_Industry_Calc/src/engine/manufacturing.ts#L35)）
4. `totalCost = null` → ProductionSummary 显示"待录入"（[ProductionSummary.tsx:100](file:///d:/Trae_Projects/EVEM_Industry_Calc/src/components/ProductionPanel/ProductionSummary.tsx#L100)）

需要在 `getPrice` 和引擎之间插入一层包装：当开关打开时，`null` → `0`。

---

## 修改方案

### 单文件修改：`ProductionPanel.tsx`

所有改动集中在 [ProductionPanel.tsx](file:///d:/Trae_Projects/EVEM_Industry_Calc/src/components/ProductionPanel/ProductionPanel.tsx)。

**1. 新增状态**：
```ts
const [ignoreUnsetPrice, setIgnoreUnsetPrice] = useState(false);
```

**2. 创建价格包装函数**：
```ts
const getPriceWithIgnore = (itemId: string): number | null => {
  const price = getPrice(itemId);
  return price ?? (ignoreUnsetPrice ? 0 : null);
};
```

**3. 引擎调用使用包装函数**：
将 `calculateManufacturing(..., getPrice, ...)` 和 `calculateReverse(..., getPrice, ...)` 中的 `getPrice` 替换为 `getPriceWithIgnore`。

**4. `ignoreUnsetPrice` 加入 useEffect 依赖数组**。

**5. UI 开关**：在 `<MaterialList />` 之前添加：

```tsx
<div className={styles.section}>
  <div className={styles.toggleRow}>
    <span>忽略未填价格</span>
    <div
      className={`${styles.toggle} ${ignoreUnsetPrice ? styles.toggleOn : ''}`}
      onClick={() => setIgnoreUnsetPrice(!ignoreUnsetPrice)}
    >
      <div className={styles.toggleKnob} />
    </div>
  </div>
</div>
```

复用已有的 `.toggle`, `.toggleOn`, `.toggleKnob`, `.toggleRow` 样式（已在 ProductionPanel.module.css 中定义）。

---

## 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `src/components/ProductionPanel/ProductionPanel.tsx` | 新增 `ignoreUnsetPrice` 状态、`getPriceWithIgnore` 包装、开关 UI，引擎调用替换价格函数 |

---

## 验证步骤

1. `npx tsc --noEmit` — 类型检查通过
2. `npx vite build` — 构建通过
3. 手动测试：
   - 选中产品，不填任何单价 → 总成本显示"待录入"
   - 打开"忽略未填价格"开关 → 总成本仅计算已填价格的材料，未填的视为 0
   - 关闭开关 → 恢复"待录入"
