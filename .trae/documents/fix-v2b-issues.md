# B 期问题修复

## 问题清单

1. 产品树叶节点不自动显示 — 首次加载需手动展开才能看叶子
2. 产品命名混乱 — 制造产品应显示成品名（秃鹫级截击型），逆向显示蓝图名
3. 蓝图基底材料显示英文 ID — 应改为"{产品名}蓝图"
4. 解码器标记为"基底" — 应移除
5. 教程未加载 — Tutorial 组件存在但未加入 App.tsx，内容需更新为 v2 公式
6. 计划文件日期错误 — `2026-07-09` → `2026-07-08`

## 改动

### 1. ProductTreeSelector 默认展开根节点

`expandedIds` 初始值从空 Set 改为包含根级节点 ID：

```typescript
// 初始化默认展开根级
const rootIds = defaultTree.filter(n => n.parentId === null).map(n => n.id);
const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(rootIds));
```

### 2. 产品命名修正

修改 `src/data/blueprints.ts`：
- 制造蓝图：`name` 改为成品名（如"秃鹫级截击型"），`productName` 改为"秃鹫级截击型蓝图"（作为基底材料显示名）
- 旧蓝图的基底材料 `itemId` 从 `bp.id` 改为实际物品名

修改 `src/engine/manufacturing.ts`：
- 基底材料条目（蓝图自身）的 `itemName` 使用 `bp.name` 表示实际显示的基底名
- 当前引擎把蓝图自身作为 `itemId: bp.id` 处理，应改为显示 `bp.name` 作为基底材料名

### 3. 解码器"基底"标签移除

修改 `src/components/ProductionPanel/MaterialList.tsx`：
- `m.isBaseMaterial && category !== 'decoder'` 时才显示"基底"标签

### 4. 教程加入并更新

修改 `src/App.tsx`：导入并渲染 `<Tutorial />`

修改 `src/components/Tutorial/Tutorial.tsx`：更新步骤和公式为 v2：
- 步骤提到产品树展开、效率覆盖开关、发送到出售
- 公式更新为 ME = 1.5 − 技能 − 设施 + 解码器，时间乘法，成功率加法

### 5. 计划文件更名

`docs/superpowers/plans/2026-07-09-evem-v2b-product-tree-plan.md` → `2026-07-08`

## 验证

- `npx tsc --noEmit` 通过
- `npm run build` 成功
- 首次加载产品树即显示叶子产品
- 制造模式下产品名显示为成品名
- 解码器行不再有"基底"标签
- 教程按钮可见且内容正确
