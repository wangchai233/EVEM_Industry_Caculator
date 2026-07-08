# EVEM Industry Calc v2b — 构建错误修复报告

**日期**: 2026-07-08
**分支**: (当前)
**提交**: `fix: resolve v2b build type errors`

---

## 修复概况

共修复 3 个 TypeScript 编译错误，涉及 2 个文件。

| # | 文件 | 行号 | 错误类型 | 修复方式 |
|---|------|------|----------|----------|
| 1 | `src/components/ProductionPanel/ProductEditor.tsx` | 18 | 参数类型 `'mfg'` 不接受 `'rev'` | 将 `getDefaultGroups` 参数类型从 `'mfg'` 扩展为 `'mfg' \| 'rev'` |
| 2 | `src/components/ProductionPanel/ProductEditor.tsx` | 65, 71 | 同上（调用点报错） | 同上 |
| 3 | `src/components/ProductionPanel/ProductTreeSelector.tsx` | 119 | 找不到命名空间 `JSX` | 添加 `import React from 'react'`，将 `JSX.Element` 改为 `React.JSX.Element` |

---

## 详细修复

### 修复 1 & 2: ProductEditor.tsx — getDefaultGroups 参数类型

**原因**: `getDefaultGroups` 函数签名中参数类型硬编码为 `'mfg'`，但 `ProductEditor` 组件的 `mode` prop 定义为 `'mfg' | 'rev'`，导致调用 `getDefaultGroups('rev')` 时报类型不匹配。

**修改**:
```diff
-function getDefaultGroups(mode: 'mfg'): MaterialGroup[] {
+function getDefaultGroups(mode: 'mfg' | 'rev'): MaterialGroup[] {
```

影响范围：第 18 行函数签名。调用点（第 57, 65, 71 行）无需修改。

### 修复 3: ProductTreeSelector.tsx — JSX 命名空间

**原因**: React 19 的 `@types/react` 不再将 `JSX` 声明为全局命名空间，需通过 `React.JSX.Element` 访问。

**修改**:
```diff
-import { useState, useMemo } from 'react';
+import React, { useState, useMemo } from 'react';
```
```diff
-function renderNode(node: TreeNodeWithChildren): JSX.Element {
+function renderNode(node: TreeNodeWithChildren): React.JSX.Element {
```

---

## 构建验证

| 步骤 | 命令 | 结果 |
|------|------|------|
| 类型检查 | `npx tsc --noEmit` | ✅ exit 0 |
| 完整构建 | `npm run build` | ✅ exit 0，产出 dist/ |

构建产物：
- `dist/index.html` — 0.42 kB (gzip: 0.30 kB)
- `dist/assets/index-DtDaE4mA.css` — 15.37 kB (gzip: 3.06 kB)
- `dist/assets/index-DISaSCPU.js` — 249.97 kB (gzip: 76.16 kB)

---

## 结论

3 个 v2b 构建错误已全部修复，`tsc --noEmit` 和 `npm run build` 均通过，无回归问题。
