# EVEM v2 B 期 — 产品树与自定义产品 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 将产品选择器改造为多级折叠树，支持任意层级浏览；新增自定义产品/逆向配置的创建、编辑、保存功能。

**Architecture:** 产品树通过 `ProductTreeNode` 递归渲染，叶子节点映射到 `Blueprint` 或 `ReverseEngineeringData`。自定义产品存 localStorage，与内置产品通过 `isCustom` 字段区分。

**Tech Stack:** React 18+ TypeScript, Vite, CSS Modules, localStorage

## Global Constraints

- 完全离线，无网络依赖
- 产品树默认折叠
- 自定义产品以 ⚙️ 标识区分
- 材料类别可任意增删
- 自定义数据 localStorage 持久化 + JSON 导出
- 所有代码严格 TypeScript，`strict` 模式

---

## File Structure

```
src/
├── types/
│   ├── productTree.ts     [NEW] ProductTreeNode
│   └── blueprint.ts       [MODIFY] isCustom, flexible material categories
├── data/
│   ├── productTree.ts     [NEW] built-in tree nodes
│   ├── blueprints.ts      [MODIFY] add tree path references
│   ├── reverse.ts         [MODIFY] add tree path references
│   └── index.ts           [MODIFY] exports
├── components/ProductionPanel/
│   ├── ProductTreeSelector.tsx [NEW] tree UI component
│   ├── ProductEditor.tsx       [NEW] custom product editor
│   └── ProductionPanel.tsx     [MODIFY] wire tree + editor
├── state/
│   └── AppContext.tsx          [MODIFY] custom data CRUD
```

---

### Task 1: 扩展类型定义

**Files:**
- Create: `src/types/productTree.ts`
- Modify: `src/types/blueprint.ts`

- [ ] **Step 1: 写 `src/types/productTree.ts`**

```typescript
export interface ProductTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  productIds: string[];     // 此节点下的蓝图ID（叶子节点）
  reverseIds: string[];     // 此节点下的逆向配置ID（叶子节点）
  tags: string[];           // 从此节点继承的标签
  isCustom: boolean;         // 自定义分类
}
```

- [ ] **Step 2: 修改 `src/types/blueprint.ts`**

在 `Blueprint` 接口末尾加 `isCustom?: boolean`。
在 `ReverseEngineeringData` 接口末尾加 `isCustom?: boolean`。

在 `Blueprint` 的 materials 类型中，将 `{ itemId: string; quantity: number }` 改为允许任意 category，但现有类型已包含 itemId/quantity，无需改。

- [ ] **Step 3: 验证** — `npx tsc --noEmit`

- [ ] **Step 4: 提交**

```bash
git add src/types/
git commit -m "feat: add ProductTreeNode type, isCustom fields"
```

---

### Task 2: 内置产品树数据

**Files:**
- Create: `src/data/productTree.ts`
- Modify: `src/data/index.ts`

- [ ] **Step 1: 写 `src/data/productTree.ts`**

```typescript
import type { ProductTreeNode } from '../types/productTree';

export const defaultTree: ProductTreeNode[] = [
  {
    id: 'root_ship', name: '舰船', parentId: null,
    productIds: [], reverseIds: [],
    tags: ['ship'], isCustom: false,
  },
  {
    id: 'cat_regular_ship', name: '常规舰船', parentId: 'root_ship',
    productIds: [], reverseIds: [],
    tags: ['regular_ship'], isCustom: false,
  },
  {
    id: 'cat_frigate', name: '护卫舰', parentId: 'cat_regular_ship',
    productIds: [], reverseIds: [],
    tags: ['frigate'], isCustom: false,
  },
  {
    id: 'cat_caldari_frigate', name: '加达里', parentId: 'cat_frigate',
    productIds: ['bp_condor_interceptor'], reverseIds: ['rev_condor_interceptor'],
    tags: ['caldari'], isCustom: false,
  },
  {
    id: 'cat_destroyer', name: '驱逐舰', parentId: 'cat_regular_ship',
    productIds: [], reverseIds: [],
    tags: ['destroyer'], isCustom: false,
  },
  {
    id: 'cat_cruiser', name: '巡洋舰', parentId: 'cat_regular_ship',
    productIds: ['bp_t8_cruiser'], reverseIds: [],
    tags: ['cruiser'], isCustom: false,
  },
  {
    id: 'cat_battleship', name: '战列舰', parentId: 'cat_regular_ship',
    productIds: [], reverseIds: [],
    tags: ['battleship'], isCustom: false,
  },
  {
    id: 'cat_base_battleship', name: '基础战列舰', parentId: 'cat_battleship',
    productIds: ['bp_t9_bs'], reverseIds: [],
    tags: [], isCustom: false,
  },
  {
    id: 'root_custom', name: '自定义产品', parentId: null,
    productIds: [], reverseIds: [],
    tags: [], isCustom: true,
  },
];

// 将自定义节点追加到树中
export function mergeCustomTree(
  builtin: ProductTreeNode[],
  custom: ProductTreeNode[],
): ProductTreeNode[] {
  return [...builtin.filter(n => !n.isCustom), ...custom];
}
```

- [ ] **Step 2: 更新 `src/data/index.ts`** 加导出

```typescript
export { defaultTree, mergeCustomTree } from './productTree';
```

- [ ] **Step 3: 验证** — `npx tsc --noEmit`

- [ ] **Step 4: 提交**

```bash
git add src/data/productTree.ts src/data/index.ts
git commit -m "feat: add built-in product tree data"
```

---

### Task 3: AppContext 扩展

**Files:**
- Modify: `src/state/AppContext.tsx`

- [ ] **Step 1: 添加自定义数据状态**

在 `AppProvider` 中，现有 `useLocalStorage` 调用之后追加：

```typescript
// 自定义产品
const [customBlueprints, setCustomBlueprints] = useLocalStorage<Blueprint[]>('evem_custom_blueprints', []);
const [customReverse, setCustomReverse] = useLocalStorage<ReverseEngineeringData[]>('evem_custom_reverse', []);
const [customTreeNodes, setCustomTreeNodes] = useLocalStorage<ProductTreeNode[]>('evem_custom_tree_nodes', []);
```

追加 imports：
```typescript
import type { ProductTreeNode } from '../types/productTree';
```

- [ ] **Step 2: 添加 CRUD 方法**

```typescript
const addCustomBlueprint = useCallback((bp: Blueprint) => {
  setCustomBlueprints(prev => [...prev, { ...bp, isCustom: true }]);
}, [setCustomBlueprints]);

const updateCustomBlueprint = useCallback((id: string, patch: Partial<Blueprint>) => {
  setCustomBlueprints(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
}, [setCustomBlueprints]);

const deleteCustomBlueprint = useCallback((id: string) => {
  setCustomBlueprints(prev => prev.filter(b => b.id !== id));
}, [setCustomBlueprints]);

const addCustomReverse = useCallback((rev: ReverseEngineeringData) => {
  setCustomReverse(prev => [...prev, { ...rev, isCustom: true }]);
}, [setCustomReverse]);

const updateCustomReverse = useCallback((id: string, patch: Partial<ReverseEngineeringData>) => {
  setCustomReverse(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
}, [setCustomReverse]);

const deleteCustomReverse = useCallback((id: string) => {
  setCustomReverse(prev => prev.filter(r => r.id !== id));
}, [setCustomReverse]);
```

- [ ] **Step 3: 更新 `getAllData` / `importData`**

在 `getAllData` 中追加：
```typescript
customBlueprints,
customReverse,
customTreeNodes,
```

在 `importData` 中追加对应的 setter 调用。

- [ ] **Step 4: 扩展 Provider value 类型**并传入新方法

- [ ] **Step 5: 验证** — `npx tsc --noEmit`

- [ ] **Step 6: 提交**

```bash
git add src/state/AppContext.tsx
git commit -m "feat: add custom blueprint/reverse CRUD with localStorage"
```

---

### Task 4: 产品树选择器

**Files:**
- Create: `src/components/ProductionPanel/ProductTreeSelector.tsx`
- Create: `src/components/ProductionPanel/ProductTreeSelector.module.css`
- Modify: `src/components/ProductionPanel/ProductionPanel.tsx`（引用新组件）

**Interfaces:**
- Consumes: `useApp()`, `useProduction()`, `defaultTree`, `mergeCustomTree`, `defaultBlueprints`, `defaultReverse`, `customBlueprints`, `customReverse`, `customTreeNodes`
- Produces: 可折叠产品树组件

- [ ] **Step 1: 写 `ProductTreeSelector.tsx`**

```tsx
import { useState, useMemo } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { defaultTree, mergeCustomTree } from '../../data/productTree';
import { defaultBlueprints, defaultReverse } from '../../data';
import styles from './ProductTreeSelector.module.css';

interface TreeNodeWithChildren extends ProductTreeNode {
  children: TreeNodeWithChildren[];
  depth: number;
}

function buildTree(
  nodes: ProductTreeNode[], parentId: string | null, depth: number,
): TreeNodeWithChildren[] {
  return nodes
    .filter(n => n.parentId === parentId)
    .map(n => ({ ...n, depth, children: buildTree(nodes, n.id, depth + 1) }));
}

function matchSearch(node: TreeNodeWithChildren, query: string): boolean {
  if (node.name.toLowerCase().includes(query)) return true;
  const allBps = [...defaultBlueprints, ...defaultReverse];
  for (const pid of node.productIds) {
    const bp = allBps.find(b => b.id === pid);
    if (bp?.name.toLowerCase().includes(query)) return true;
  }
  for (const rid of node.reverseIds) {
    const rev = allBps.find(r => r.id === rid);
    if (rev?.name.toLowerCase().includes(query)) return true;
  }
  return node.children.some(c => matchSearch(c, query));
}

export function ProductTreeSelector() {
  const { state, dispatch } = useProduction();
  const { customBlueprints, customReverse, customTreeNodes } = useApp();
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editorOpen, setEditorOpen] = useState(false);

  const allNodes = useMemo(() => {
    // 将自定义产品挂到自定义分类节点下
    const customCat = defaultTree.find(n => n.id === 'root_custom')!;
    const mergedCustomIds = [...new Set([
      ...customCat.productIds,
      ...customBlueprints.map(b => b.id),
    ])];
    const mergedCustomRevIds = [...new Set([
      ...customCat.reverseIds,
      ...customReverse.map(r => r.id),
    ])];
    const updatedNodes = defaultTree.map(n => {
      if (n.id === 'root_custom') {
        return { ...n, productIds: mergedCustomIds, reverseIds: mergedCustomRevIds };
      }
      return n;
    });
    return mergeCustomTree(updatedNodes, customTreeNodes);
  }, [customBlueprints, customReverse, customTreeNodes]);

  const tree = useMemo(() => buildTree(allNodes, null, 0), [allNodes]);

  const searchLower = search.toLowerCase().trim();

  // 搜索时自动展开匹配分支
  const visibleExpanded = useMemo(() => {
    if (!searchLower) return expandedIds;
    const autoExpand = new Set(expandedIds);
    function walk(nodes: TreeNodeWithChildren[]) {
      for (const n of nodes) {
        if (matchSearch(n, searchLower)) {
          autoExpand.add(n.id);
          let p = n.parentId;
          while (p) {
            autoExpand.add(p);
            const parent = allNodes.find(x => x.id === p);
            p = parent?.parentId ?? null;
          }
        }
        walk(n.children);
      }
    }
    walk(tree);
    return autoExpand;
  }, [searchLower, expandedIds, tree, allNodes]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allBps = [...defaultBlueprints, ...customBlueprints];
  const allRevs = [...defaultReverse, ...customReverse];

  const selectedId = state.projectType === 'manufacturing'
    ? state.manufacturing.blueprintId
    : state.reverse.reverseId;

  const handleSelectProduct = (bpId: string) => {
    dispatch({ type: 'SET_MANUFACTURING', payload: { blueprintId: bpId } });
  };

  const handleSelectReverse = (revId: string) => {
    dispatch({ type: 'SET_REVERSE', payload: { reverseId: revId } });
  };

  const items = state.projectType === 'manufacturing' ? allBps : allRevs;
  const handleSelectItem = state.projectType === 'manufacturing' ? handleSelectProduct : handleSelectReverse;
  const idField = state.projectType === 'manufacturing' ? 'productIds' : 'reverseIds' as const;

  function renderNode(node: TreeNodeWithChildren): JSX.Element {
    const isExpanded = visibleExpanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const productList = items.filter(b => (node as any)[idField]?.includes(b.id));

    return (
      <div key={node.id} style={{ paddingLeft: node.depth * 16 }}>
        <div
          className={`${styles.nodeRow} ${isExpanded ? styles.expanded : ''}`}
          onClick={() => hasChildren ? toggleExpand(node.id) : undefined}
        >
          {hasChildren && <span className={styles.arrow}>{isExpanded ? '▼' : '▶'}</span>}
          <span className={styles.nodeName}>
            {node.isCustom && '⚙️ '}{node.name}
          </span>
        </div>
        {isExpanded && (
          <div>
            {node.children.map(renderNode)}
            {productList.map(bp => (
              <div
                key={bp.id}
                className={`${styles.leafRow} ${selectedId === bp.id ? styles.selected : ''}`}
                style={{ paddingLeft: (node.depth + 1) * 16 }}
                onClick={() => handleSelectItem(bp.id)}
              >
                {bp.isCustom ? '⚙️ ' : ''}{bp.name}
              </div>
            ))}
            {node.id === 'root_custom' && (
              <div
                className={styles.addBtn}
                style={{ paddingLeft: (node.depth + 1) * 16 }}
                onClick={() => setEditorOpen(true)}
              >
                + 新建产品
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <label className={styles.label}>选择产品</label>
      <input
        className={styles.searchInput}
        placeholder="搜索产品..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className={styles.tree}>
        {tree.map(renderNode)}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 写 `ProductTreeSelector.module.css`**

```css
.section { display: flex; flex-direction: column; gap: 4px; max-height: 400px; overflow-y: auto; }
.label { font-size: 13px; color: var(--color-text-secondary); font-weight: 600; }
.searchInput {
  background: var(--color-bg); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 6px 10px; font-size: 13px; width: 100%;
}
.tree { margin-top: 4px; }
.nodeRow {
  display: flex; align-items: center; gap: 4px; padding: 3px 0; cursor: pointer;
  font-size: 13px; color: var(--color-text-secondary); user-select: none;
}
.nodeRow:hover { color: var(--color-text); }
.arrow { width: 14px; font-size: 10px; }
.nodeName { font-weight: 600; }
.leafRow {
  padding: 3px 0; cursor: pointer; font-size: 13px;
  color: var(--color-text); user-select: none;
}
.leafRow:hover { background: var(--color-surface); }
.selected { color: var(--color-primary); font-weight: 600; }
.addBtn {
  color: var(--color-success); cursor: pointer; font-size: 13px; padding: 3px 0;
}
.addBtn:hover { text-decoration: underline; }
```

- [ ] **Step 3: 更新 `ProductionPanel.tsx`** — 将 `<ProductSelector />` 替换为 `<ProductTreeSelector />`

- [ ] **Step 4: 验证** — `npx tsc --noEmit`

- [ ] **Step 5: 提交**

```bash
git add src/components/ProductionPanel/ProductTreeSelector.tsx src/components/ProductionPanel/ProductTreeSelector.module.css src/components/ProductionPanel/ProductionPanel.tsx
git commit -m "feat: replace flat product list with collapsible tree selector"
```

---

### Task 5: 自定义产品编辑器

**Files:**
- Create: `src/components/ProductionPanel/ProductEditor.tsx`
- Create: `src/components/ProductionPanel/ProductEditor.module.css`
- Modify: `src/components/ProductionPanel/ProductionPanel.tsx`

- [ ] **Step 1: 写 `ProductEditor.tsx`**

```tsx
import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { useProduction } from '../../state/ProductionContext';
import type { Blueprint, ReverseEngineeringData } from '../../types';
import styles from './ProductEditor.module.css';

interface Props {
  mode: 'mfg' | 'rev';
  initial?: Blueprint | ReverseEngineeringData; // 另存为时传入
  onClose: () => void;
}

export function ProductEditor({ mode, initial, onClose }: Props) {
  const { addCustomBlueprint, addCustomReverse, customBlueprints, customTreeNodes } = useApp();
  const { dispatch } = useProduction();

  const [name, setName] = useState(initial?.name ?? '');
  const [baseTime, setBaseTime] = useState(mode === 'mfg' ? (initial as any)?.baseTime ?? 3600 : (initial as any)?.baseTime ?? 1800);
  const [baseCost, setBaseCost] = useState((initial as any)?.baseCost ?? 0);
  const [productQuantity, setProductQuantity] = useState(mode === 'mfg' ? (initial as any)?.productQuantity ?? 1 : 1);

  // 逆向专用
  const [baseItemId, setBaseItemId] = useState('');
  const [maxItemCount, setMaxItemCount] = useState(1);
  const [maxBaseSR, setMaxBaseSR] = useState(0.5);

  // 材料：{ category: string, items: { itemId: string, quantity: number }[] }[]
  const [materialGroups, setMaterialGroups] = useState<Array<{ category: string; items: Array<{ itemId: string; quantity: number }> }>>(
    mode === 'mfg'
      ? (initial as Blueprint)?.materials
        ? Object.entries(
            (initial as Blueprint).materials.reduce<Record<string, Array<{ itemId: string; quantity: number }>>>((acc, m) => {
              // 从 itemId 推断类别（简化：从已有数据中找）
              return acc;
            }, {})
          ).map(([cat, items]) => ({ category: cat, items }))
        : [{ category: '矿物', items: [] }, { category: '行星材料', items: [] }]
      : [{ category: '数据核心', items: (initial as any)?.dataCores ?? [] }]
  );

  const handleSave = () => {
    if (!name.trim()) return;
    if (mode === 'mfg') {
      const materials = materialGroups.flatMap(g => g.items.map(i => ({ itemId: i.itemId, quantity: i.quantity })));
      const bp: Blueprint = {
        id: `custom_${Date.now().toString(36)}`,
        name, productItemId: '', productName: name, productQuantity, baseTime, baseCost,
        materials, maxRuns: 10, tags: ['custom'], isCustom: true,
      };
      addCustomBlueprint(bp);
      dispatch({ type: 'SET_MANUFACTURING', payload: { blueprintId: bp.id } });
    } else {
      const rev: ReverseEngineeringData = {
        id: `custom_rev_${Date.now().toString(36)}`,
        name: `${name}逆向`, targetBlueprintId: '',
        baseItemId, baseItemName: baseItemId, maxItemCount, maxBaseSuccessRate: maxBaseSR,
        baseTime, baseCost,
        dataCores: materialGroups.flatMap(g => g.items.map(i => ({ itemId: i.itemId, quantity: i.quantity }))),
        tags: ['custom'], isCustom: true,
      };
      addCustomReverse(rev);
      dispatch({ type: 'SET_REVERSE', payload: { reverseId: rev.id } });
    }
    onClose();
  };

  const addGroup = () => {
    const cat = prompt('材料类别名称:', '新材料');
    if (cat) setMaterialGroups(prev => [...prev, { category: cat, items: [] }]);
  };

  const removeGroup = (idx: number) => {
    setMaterialGroups(prev => prev.filter((_, i) => i !== idx));
  };

  const addItemToGroup = (groupIdx: number) => {
    const itemId = prompt('物品 ID:');
    const qty = parseInt(prompt('数量:') || '0');
    if (itemId && qty > 0) {
      setMaterialGroups(prev => prev.map((g, i) =>
        i === groupIdx ? { ...g, items: [...g.items, { itemId, quantity: qty }] } : g
      ));
    }
  };

  const removeItemFromGroup = (groupIdx: number, itemIdx: number) => {
    setMaterialGroups(prev => prev.map((g, i) =>
      i === groupIdx ? { ...g, items: g.items.filter((_, j) => j !== itemIdx) } : g
    ));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h4>{mode === 'mfg' ? '编辑制造产品' : '编辑逆向配置'}</h4>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.field}>
          <label>名称</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>基础时间 (秒)</label>
            <input type="number" value={baseTime} onChange={e => setBaseTime(parseInt(e.target.value) || 0)} />
          </div>
          <div className={styles.field}>
            <label>现金费用</label>
            <input type="number" value={baseCost} onChange={e => setBaseCost(parseInt(e.target.value) || 0)} />
          </div>
        </div>

        {mode === 'mfg' && (
          <div className={styles.field}>
            <label>产物数量</label>
            <input type="number" value={productQuantity} onChange={e => setProductQuantity(parseInt(e.target.value) || 1)} />
          </div>
        )}

        {mode === 'rev' && (
          <>
            <div className={styles.field}>
              <label>基底材料 ID</label>
              <input value={baseItemId} onChange={e => setBaseItemId(e.target.value)} />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>数量上限</label>
                <input type="number" value={maxItemCount} onChange={e => setMaxItemCount(parseInt(e.target.value) || 1)} />
              </div>
              <div className={styles.field}>
                <label>最大基础成功率</label>
                <input type="number" step="0.01" value={maxBaseSR} onChange={e => setMaxBaseSR(parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </>
        )}

        <div className={styles.materials}>
          <label>材料</label>
          {materialGroups.map((g, gi) => (
            <div key={gi} className={styles.group}>
              <div className={styles.groupHeader}>
                <span>{g.category}</span>
                <button onClick={() => removeGroup(gi)}>✕</button>
              </div>
              {g.items.map((it, ii) => (
                <div key={ii} className={styles.item}>
                  <span>{it.itemId} × {it.quantity}</span>
                  <button onClick={() => removeItemFromGroup(gi, ii)}>✕</button>
                </div>
              ))}
              <button className={styles.addItemBtn} onClick={() => addItemToGroup(gi)}>+ 添加材料</button>
            </div>
          ))}
          <button className={styles.addGroupBtn} onClick={addGroup}>+ 添加材料类别</button>
        </div>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 写 `ProductEditor.module.css`** — 暗色主题编辑器样式

```css
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.panel { background: var(--color-surface); border-radius: var(--radius); padding: 20px; width: 480px; max-height: 80vh; overflow-y: auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.closeBtn { background: none; border: none; color: var(--color-text); cursor: pointer; font-size: 16px; }
.field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.field label { font-size: 12px; color: var(--color-text-secondary); font-weight: 600; }
.field input { background: var(--color-bg); color: var(--color-text); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 4px 8px; font-size: 13px; width: 100%; }
.row { display: flex; gap: 12px; }
.row .field { flex: 1; }
.materials { margin-top: 8px; }
.group { margin: 6px 0; padding: 6px; background: var(--color-bg); border-radius: var(--radius); }
.groupHeader { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; }
.groupHeader button { background: none; border: none; color: var(--color-danger); cursor: pointer; }
.item { display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin: 2px 0; padding-left: 12px; }
.item button { background: none; border: none; color: var(--color-text-secondary); cursor: pointer; }
.addItemBtn, .addGroupBtn { color: var(--color-success); cursor: pointer; font-size: 12px; background: none; border: none; margin-top: 4px; }
.actions { margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px; }
.saveBtn { background: var(--color-primary); color: #fff; border: none; padding: 6px 20px; border-radius: var(--radius); cursor: pointer; }
```

- [ ] **Step 3: 集成到 `ProductionPanel.tsx`** — 在组件中添加 `editorOpen` 状态，树中 "+ 新建产品" 触发 `setEditorOpen(true)`，渲染 `<ProductEditor>` modal

- [ ] **Step 4: 验证** — `npx tsc --noEmit`

- [ ] **Step 5: 提交**

```bash
git add src/components/ProductionPanel/ProductEditor.tsx src/components/ProductionPanel/ProductEditor.module.css src/components/ProductionPanel/ProductionPanel.tsx
git commit -m "feat: add custom product editor with dynamic material categories"
```

---

### Task 6: 集成测试与构建验证

- [ ] **Step 1: 全面编译**

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npx tsc --noEmit
```

- [ ] **Step 2: 生产构建**

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npm run build
```

- [ ] **Step 3: 功能检查**
  - 产品树展开/折叠正常
  - 搜索高亮和自动展开正常
  - 自定义产品创建并出现在树中
  - 选中自定义产品后引擎计算正常
  - 刷新后自定义产品仍在

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore: integration testing and build verification for v2b"
```
