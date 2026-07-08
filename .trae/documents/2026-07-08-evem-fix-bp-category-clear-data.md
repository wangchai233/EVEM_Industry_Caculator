# EVEM 修复蓝图分类 & 材料清单清空功能

## 概述

三个小修复/增强：
1. 制造项目中将蓝图材料从"矿物"分类修正为"蓝图"
2. 材料清单增加"清空"按钮（清空单价/折扣）
3. 填充开关移到按钮后面

---

## 当前状态分析

### 蓝图分类错误

**文件**: `src/engine/manufacturing.ts` L47-48

```ts
// 蓝图（基底）
processMaterial(bp.id, 1, true);
```

`processMaterial` 内部调用 `getItemById(itemId)` 查找物品。蓝图 ID（如 `bp_t9_bs`）不在物品列表中 → `getItemById` 返回 `undefined` → `item?.category ?? 'mineral'` 兜底为 `'mineral'`。

根因：`defaultItems`（矿物、行星材料等）和 `blueprintProducts`（成品物品）都不包含蓝图本身的 ID。蓝图 ID 用作文本标识而非物品 ID，导致查不到。

### 缺少价格清空机制

**文件**: `src/state/AppContext.tsx` L129-133

`setPrice(itemId, price: number)` 只能设置价格，没有清除价格（从 `prices` 对象中删除 key）的方法。MaterialList 无法实现"清空单价"。

---

## 修改方案

### 1. 修复蓝图分类

**文件**: `src/engine/manufacturing.ts`

将蓝图行从 `processMaterial` 调用改为直接 push，硬编码 `category: 'blueprint'`：

```ts
// 改前：
processMaterial(bp.id, 1, true);

// 改后：
materials.push({
  itemId: bp.id, itemName: bp.name, category: 'blueprint',
  baseQuantity: 1, adjustedQuantity: 1, totalQuantity: config.runs,
  unitPrice: getPrice(bp.id), subtotal: /* 同解码器逻辑 */,
  isBaseMaterial: true,
});
```

同时处理总成本计算（blueprint 价格未设置时 totalMaterialCost 设为 null）。

### 2. 新增 `clearPrice` 上下文方法

**文件**: `src/state/AppContext.tsx`

在 `AppProvider` 中新增：

```ts
const clearPrice = useCallback((itemId: string) => {
  setConfigs(prev => prev.map(c => {
    if (c.id !== activeId) return c;
    const newPrices = { ...c.prices };
    delete newPrices[itemId];
    return { ...c, prices: newPrices, updatedAt: new Date().toISOString() };
  }));
}, [activeId, setConfigs]);
```

并在 Context value 中暴露 `clearPrice`。

在 `AppContextType` 接口中添加：
```ts
clearPrice: (itemId: string) => void;
```

### 3. 材料清单批量操作增强

**文件**: `src/components/ProductionPanel/MaterialList.tsx`

**新增清空函数**：
```ts
const clearPrices = (items: typeof materials) => {
  for (const m of items) clearPrice(m.itemId);
};

const clearDiscounts = (items: typeof materials) => {
  for (const m of items) clearMaterialDiscount(m.itemId);
};
```

**按钮布局调整**（覆盖开关移到末尾）：

改前：
```
矿物  [覆盖已有 ▢]  [填充单价]  [填充折扣]
```

改后：
```
矿物  [填充单价]  [填充折扣]  [清空单价]  [清空折扣]  [覆盖已有 ▢]
```

**从 `useApp` 新增导入**：`clearPrice`, `clearMaterialDiscount`

---

## 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `src/engine/manufacturing.ts` | 蓝图行硬编码 `category: 'blueprint'`，替换 `processMaterial(bp.id, ...)` 为直接 push |
| `src/state/AppContext.tsx` | 新增 `clearPrice` 方法 + 接口声明 + Context value 暴露 |
| `src/components/ProductionPanel/MaterialList.tsx` | 新增清空按钮、开关移到末尾、导入 `clearPrice` |

---

## 验证步骤

1. `npx tsc --noEmit` — 类型检查通过
2. `npx vite build` — 构建通过
3. 手动测试：
   - 选中 T9 战列舰 → 材料清单中蓝图显示在"蓝图"分类下
   - 填好几个矿物单价 → 点击"清空单价" → 该分类所有单价清空
   - 填好几个折扣 → 点击"清空折扣" → 该分类所有折扣清空
   - 确认覆盖开关在按钮后面
