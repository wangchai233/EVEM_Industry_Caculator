# 产品树修复 + 教程前置

## 修正方案

### 1. 产品树重写（保持多层、不强制全展开）

- **Bug 修复**: 展开/折叠交互不稳定。重写 `ProductTreeSelector`，用简单的受控 `expandedIds` Set + 直接 onClick toggle。当前代码的 `visibleExpanded` memo 逻辑过于复杂，搜索模式和非搜索模式切换时 expand 状态容易丢失。
- **独立数据源**: 制造和逆向各自独立树结构。根节点只包含对应产品类型。
  - 制造树：根 → 分类 → ... → 叶子（显示 `productName`）
  - 逆向树：根 → 分类 → ... → 叶子（显示 `name`=蓝图名）
- **树节点结构保持**: 现有的 `productTree.ts` 节点结构保留。制造树用 `productIds`，逆用 `reverseIds`。
- **滚动**: 树容器加 `max-height: 300px; overflow-y: auto; overflow-x: auto`

### 2. 逆向命名修正

`src/data/reverse.ts`：`name` 从 "秃鹫级截击型逆向工程" 改为 "秃鹫级截击型蓝图"。其他逆向同理改为 `"[对应产品]蓝图"`。

### 3. 教程前置 + 首次自动展开

- `App.tsx`：`<Tutorial />` 移到最后 → 移到最前（Header 上方）
- `Tutorial.tsx`：首次加载检测 `localStorage.getItem('evem_tutorial_shown')`，若无则默认 `show=true`，关闭时写入 `'1'`

## 波及文件（5 个）

| 文件 | 改动 |
|------|------|
| `ProductTreeSelector.tsx` | 重写：修复展开、独立数据源、滚动 |
| `productTree.ts` | 保留现有 |
| `reverse.ts` | name 改为蓝图名 |
| `Tutorial.tsx` | 首次自动展开 |
| `App.tsx` | Tutorial 移到最上 |

## 验证

- `npx tsc --noEmit` 通过
- `npm run build` 成功
- 点击展开/折叠分支正常
- 制造模式择产品显示成品名
- 初次加载教程自动展开
