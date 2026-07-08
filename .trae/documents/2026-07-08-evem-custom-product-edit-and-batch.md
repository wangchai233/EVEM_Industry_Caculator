# EVEM 自定义产品编辑 & 材料批量操作

## 概述

两个独立功能模块：
1. **自定义产品编辑**：创建后编辑、基底材料分类、自定义 Tag（自动创建树节点）
2. **材料清单批量设置**：按分类批量填充单价和折扣，带覆盖开关

---

## 当前状态分析

### 现有文件关键路径
- `src/types/item.ts` — `MaterialEntry` 接口，目前只有 `itemId` + `quantity`
- `src/types/blueprint.ts` — `Blueprint.materials: MaterialEntry[]`，`ReverseEngineeringData.dataCores: MaterialEntry[]`
- `src/types/result.ts` — `ProductionResult.materials` 已有 `isBaseMaterial: boolean`
- `src/components/ProductionPanel/ProductEditor.tsx` — 仅支持新建，无编辑模式
- `src/components/ProductionPanel/ProductTreeSelector.tsx` — 无编辑/删除入口
- `src/state/AppContext.tsx` — 已有 `updateCustomBlueprint`、`deleteCustomBlueprint`、`updateCustomReverse`、`deleteCustomReverse`，但未被调用
- `src/engine/manufacturing.ts` — L64-66 材料传 `isBase: false` 硬编码
- `src/engine/reverse.ts` — L46-63 dataCores 传 `isBaseMaterial: true` 硬编码
- `src/data/tags.ts` — 内置 tag 列表，`resolveTags` 计算继承标签
- `src/data/productTree.ts` — `mergeCustomTree` 追加自定义节点
- `src/components/ProductionPanel/MaterialList.tsx` — 无批量操作

### 引擎现状
`processMaterial(itemId, baseQty, isBase)` 已支持 `isBase` 参数：
- `isBase=true`：`adjustedQty = baseQty`（不受 ME 影响）
- `isBase=false`：`adjustedQty = baseQty × finalME`

当前硬编码：制造材料全部 `isBase=false`，逆向 dataCores 全部 `isBase=true`。

---

## A. 数据模型变更

### A1. `MaterialEntry` 增加 `isBase` 字段

**文件**: `src/types/item.ts`

```ts
export interface MaterialEntry {
  itemId: string;
  quantity: number;
  isBase?: boolean; // 是否为基底材料（不受材料效率影响）
}
```

### A2. `ProductTreeNode` 无变更

自定义 tag 创建时，直接使用现有 `ProductTreeNode` 接口，`parentId` 设为 `'root_custom'`。

---

## B. 产品编辑器重构

### B1. 新增编辑模式（编辑入口）

**文件**: `src/components/ProductionPanel/ProductTreeSelector.tsx`

在自定义产品的叶子行（`bp.isCustom === true`）右侧添加两个小图标：
- ⚙️ — 点击触发 `onEditProduct(bp.id, isMfg ? 'mfg' : 'rev')`
- ✕ — 点击弹出确认后调用 `deleteCustomBlueprint(bp.id)` / `deleteCustomReverse(bp.id)`

新增 Props：
```ts
interface Props {
  onOpenEditor?: () => void;
  onEditProduct?: (id: string, mode: 'mfg' | 'rev') => void;
}
```

删除后同步清除选中状态（如果删除的是当前选中项，dispatch 清空 blueprintId/reverseId）。

CSS：叶子行使用 flex 布局，名称占 `flex: 1`，图标固定在右侧。

### B2. 编辑器支持编辑/新建双模式

**文件**: `src/components/ProductionPanel/ProductEditor.tsx`

修改 Props：
```ts
interface Props {
  mode: 'mfg' | 'rev';
  initial?: Blueprint | ReverseEngineeringData; // 编辑模式传已有数据
  onClose: () => void;
}
```

`handleSave` 分支逻辑：
- `initial` 存在 → `updateCustomBlueprint(initial.id, patch)` / `updateCustomReverse(initial.id, patch)`
- `initial` 不存在 → `addCustomBlueprint(bp)` / `addCustomReverse(rev)`

标题文字：`initial ? '编辑制造产品' : '新建制造产品'`

### B3. 基底材料分类

在编辑器材料区域，每个材料组内的每项材料右侧加一个复选框 `☐ 基底`。

存储：勾选时设置 `item.isBase = true`，保存到 `Blueprint.materials[i].isBase` 或 `ReverseEngineeringData.dataCores[i].isBase`。

默认行为：
- 制造项目：新增材料默认不勾选（`isBase` 未定义 = false）
- 逆向项目：已有 dataCores 默认不勾选（逆向的"基底"由 baseItem 字段单独表示）

### B4. 自定义 Tag 选择器

编辑器增加 Tag 区域（在材料区域上方）：

**布局**：多选下拉 + "新建 Tag" 按钮
- 多选下拉：列出 `tagTree` 中所有 tag 节点（id + name）
- 已选中的显示为可删除的标签 chip
- "新建 Tag" 按钮：弹出小型输入框

**新建 Tag 流程**：
1. 用户输入 tag 名称（如"无人机"）
2. 自动生成 id：`tag_custom_${Date.now().toString(36)}`
3. 创建 `ProductTreeNode`：
   ```ts
   {
     id: newTagId,
     name: tagName,
     parentId: 'root_custom',
     productIds: isMfg ? [productId] : [],
     reverseIds: isMfg ? [] : [productId],
     tags: [],
     isCustom: true,
   }
   ```
4. 调用 `setCustomTreeNodes(prev => [...prev, newNode])`
5. 将新 tag 加入当前选中列表

**注意**：编辑已有产品时，需要恢复之前选中的 tag（从 `bp.tags`/`revData.tags` 中读取）。新建 tag 不加入全局 `tagTree`（`tagTree` 是静态内置数据），但会在选择器下拉中合并显示 `tagTree + customTreeNodes` 的 tag。

**保存时**：`bp.tags = selectedTagIds`（替换默认的 `['custom']`）。

### B5. ProductionPanel 集成

**文件**: `src/components/ProductionPanel/ProductionPanel.tsx`

新增状态：
```ts
const [editTarget, setEditTarget] = useState<{ id: string; mode: 'mfg' | 'rev' } | null>(null);
```

`handleEditProduct`：根据 id 从 `customBlueprints` 或 `customReverse` 中找到完整对象，设置 `editTarget`。

计算 `initial` 对象：
```ts
const initialData = editTarget
  ? editTarget.mode === 'mfg'
    ? customBlueprints.find(b => b.id === editTarget.id)
    : customReverse.find(r => r.id === editTarget.id)
  : undefined;
```

ProductEditor 调用时：
```tsx
{editorOpen && (
  <ProductEditor
    mode={state.projectType === 'manufacturing' ? 'mfg' : 'rev'}
    initial={initialData}
    onClose={() => { setEditorOpen(false); setEditTarget(null); }}
  />
)}
```

---

## C. 引擎适配

### C1. 制造引擎

**文件**: `src/engine/manufacturing.ts` L64-66

```ts
// 改前：
for (const m of bp.materials) {
  processMaterial(m.itemId, m.quantity, false);
}

// 改后：
for (const m of bp.materials) {
  processMaterial(m.itemId, m.quantity, m.isBase ?? false);
}
```

### C2. 逆向引擎

**文件**: `src/engine/reverse.ts` L46-63

```ts
// 改前：全部 isBaseMaterial: true
// 改后：使用 dc.isBase
materials.push({
  ...
  isBaseMaterial: dc.isBase ?? true, // 向后兼容：旧数据无 isBase 默认 true
});
```

---

## D. 材料清单批量操作

### D1. 分类标题行增加批量控件

**文件**: `src/components/ProductionPanel/MaterialList.tsx`

在每个分类组标题（`<h4>{categoryNames[cat]}</h4>`）下方增加一行操作栏：

```
矿物  [覆盖已有 ▢]  [填充单价]  [填充折扣]
```

**状态管理**：每分类维护独立的覆盖开关状态。
```ts
const [overwriteByCategory, setOverwriteByCategory] = useState<Record<string, boolean>>({});
```

覆盖开关：使用 CSS 模拟 toggle（类似 iOS switch），默认 OFF。

### D2. 填充逻辑

**填充单价**：
```ts
const fillPrice = (cat: string, items: typeof materials) => {
  const firstValue = items.find(m => m.unitPrice !== null)?.unitPrice;
  if (firstValue === undefined) return;
  const overwrite = overwriteByCategory[cat] ?? false;
  for (const m of items) {
    if (!overwrite && m.unitPrice !== null) continue;
    setPrice(m.itemId, firstValue);
  }
};
```

**填充折扣**：
```ts
const fillDiscount = (cat: string, items: typeof materials) => {
  const firstValue = items.find(m => {
    const d = materialDiscounts[m.itemId];
    return d !== undefined;
  });
  const rate = firstValue ? materialDiscounts[firstValue.itemId] : undefined;
  if (rate === undefined) return;
  const overwrite = overwriteByCategory[cat] ?? false;
  for (const m of items) {
    const existing = materialDiscounts[m.itemId];
    if (!overwrite && existing !== undefined) continue;
    setMaterialDiscount(m.itemId, rate);
  }
};
```

### D3. CSS 新增样式

**文件**: `src/components/ProductionPanel/ProductionPanel.module.css`

```css
.catHeader { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.catHeader h4 { margin: 0; }
.fillBtn {
  font-size: 11px; padding: 2px 8px; cursor: pointer;
  background: var(--color-bg); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: var(--radius);
}
.fillBtn:hover { background: var(--color-surface); }
.toggleRow { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-text-secondary); }
.toggle {
  width: 28px; height: 14px; border-radius: 7px; cursor: pointer;
  background: var(--color-border); position: relative; transition: background 0.2s;
}
.toggleOn { background: var(--color-primary); }
.toggleKnob {
  width: 12px; height: 12px; border-radius: 50%; background: #fff;
  position: absolute; top: 1px; left: 1px; transition: left 0.2s;
}
.toggleOn .toggleKnob { left: 15px; }
```

---

## E. 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `src/types/item.ts` | `MaterialEntry` 加 `isBase?: boolean` |
| `src/components/ProductionPanel/ProductTreeSelector.tsx` | 自定义产品行加编辑/删除图标，新增 `onEditProduct` prop |
| `src/components/ProductionPanel/ProductTreeSelector.module.css` | 叶子行 flex 布局、图标样式 |
| `src/components/ProductionPanel/ProductEditor.tsx` | 支持编辑模式、基底材料复选框、Tag 选择器+新建 |
| `src/components/ProductionPanel/ProductEditor.module.css` | Tag 选择器、chip 样式、checkbox 样式 |
| `src/components/ProductionPanel/ProductionPanel.tsx` | 集成编辑/删除逻辑，传递 `editTarget` |
| `src/engine/manufacturing.ts` | L64-66 使用 `m.isBase` |
| `src/engine/reverse.ts` | L46-63 使用 `dc.isBase` |
| `src/components/ProductionPanel/MaterialList.tsx` | 批量填充单价/折扣 + 覆盖开关 |
| `src/components/ProductionPanel/ProductionPanel.module.css` | 批量操作相关样式 |

---

## F. 验证步骤

1. `npx tsc --noEmit` — 类型检查通过
2. `npx vite build` — 构建通过
3. 手动测试：
   - 新建自定义产品 → 保存 → 在树中看到 ⚙️✕ 图标
   - 点击 ⚙️ → 编辑器打开，字段预填 → 修改后保存 → 数据更新
   - 点击 ✕ → 确认删除 → 产品从树中消失
   - 新建 tag "无人机" → 树中"自定义产品"下出现"无人机"节点
   - 材料清单中填好一个矿物单价 → 点击填充单价 → 其他矿物填入相同价格
   - 勾选"覆盖已有" → 再次填充 → 已有价格的也被覆盖
