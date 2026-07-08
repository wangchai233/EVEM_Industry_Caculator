# v2b Task 4 报告 — 产品树选择器 UI

**状态:** ✅ 已完成  
**时间:** 2026-07-08

## 变更摘要

将 `ProductSelector`（平铺列表）替换为 `ProductTreeSelector`（可折叠多级树）。

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ProductionPanel/ProductTreeSelector.tsx` | 新建 | 可折叠产品树组件（174 行） |
| `src/components/ProductionPanel/ProductTreeSelector.module.css` | 新建 | 树组件的 CSS 模块（25 行） |
| `src/components/ProductionPanel/ProductionPanel.tsx` | 修改 | 引用替换：`ProductSelector` → `ProductTreeSelector`（2 处） |

## 实现细节

- **Tree 构建:** `buildTree()` 递归将 `ProductTreeNode[]` 扁平数组转为 `TreeNodeWithChildren[]` 树结构
- **搜索自动展开:** `matchSearch()` 递归匹配节点名/产品名/逆向配置名，匹配时自动展开该节点及所有祖先
- **默认折叠:** `expandedIds` 初始为空 Set，仅点击或搜索时展开
- **自定义产品标识:** `node.isCustom` 为 true 的节点前显示 ⚙️ 图标
- **"+ 新建产品":** 在 `root_custom` 节点下渲染（`editorOpen` 状态预留，由 Task 5 的 ProductEditor 消费）
- **数据合并:** `allNodes` 使用 `useMemo` 将 `customBlueprints`/`customReverse` 的 ID 合并到 `root_custom` 节点的 `productIds`/`reverseIds` 中

## 验证结果

- **`npx tsc --noEmit`**: ✅ 通过，0 错误
- **暂存:** 3 个文件（1 修改 + 2 新增）

## 提交

```
4658bfe feat: replace flat product list with collapsible tree selector
```

## 注意事项

- `editorOpen` 状态已在 `ProductTreeSelector` 中定义但尚未连接编辑器组件 — Task 5 将完成此集成
- 原有的 `ProductSelector.tsx` 文件未删除，保留作为参考
- `setEditorOpen(true)` 仅在点击 "+ 新建产品" 时触发，目前无实际效果（Task 5 将在 ProductionPanel 中挂载 ProductEditor）
