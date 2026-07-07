# Task 11-12 实施报告

**日期:** 2026-07-07  
**提交:** `384339a` — fix: add mobile responsive layout and edge case handling  
**状态:** ✅ 完成

---

## Task 11: 移动端响应式适配

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/App.module.css` | 扩展 @media 查询：添加 `.main` 的 `gap: 8px`/`padding: 8px` 和 `.panel` 的 `padding: 12px` |
| `src/components/ProductionPanel/ProductionPanel.module.css` | 追加 @media 块：隐藏材料表格的"基准""修正"列，缩小价格输入框，汇总网格改为单列 |
| `src/components/Header/Header.module.css` | 追加 @media 块：header 改为纵向布局，标题字号缩小为 16px |

---

## Task 12: 边界处理与打磨

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/state/useLocalStorage.ts` | catch 块改为 `catch (e) { console.warn('localStorage 存储失败，可能已满', e); }` |
| `src/components/ProductionPanel/EfficiencyConfig.tsx` | 材料效率输入下方添加校验错误提示 span（范围 75%~150%），用 `<>...</>` Fragment 包裹多元素 |
| `src/components/ProductionPanel/ProductionPanel.module.css` | 新增 `.error` 样式类（红色文字，12px） |

---

## 附带修复

### formatTime 重复字段 Bug

**文件:** `src/utils/format.ts`  
**修复:** 长耗时格式从 `${String(days).padStart(2,'0')}:${pad(days)}` 改为 `${pad(Math.floor(days/30))}:${pad(days%30)}`

原代码第二个字段错误地用了 `days`（天数）而非 `months`（月数），导致 `MM:dd` 格式中两个字段值相同。

---

## 附带修复（构建阻塞）

### 未使用变量清理（6处）

修复了 `tsc -b` 严格模式下的 6 个 TS6133 错误：
- `src/state/AppContext.tsx` — 移除未使用的 `React` 导入
- `src/state/ProductionContext.tsx` — 同上
- `src/state/SellingContext.tsx` — 同上
- `src/components/Header/Header.tsx` — 移除未使用的 `activeConfig` 变量
- `src/components/ProductionPanel/MaterialList.tsx` — 移除未使用的 `getPrice` 解构
- `src/components/ProductionPanel/ProductionSummary.tsx` — 移除未使用的 `useApp` 导入

---

## 验证结果

| 验证项 | 结果 |
|--------|------|
| `npx tsc --noEmit` | ✅ 通过 |
| `npm run build` | ✅ 通过（61 modules, dist/ 产出正常） |
| `git status` | ✅ working tree clean |

---

## 关注点

- EfficiencyConfig 中校验仅检查材料效率范围，未覆盖时间效率。时间效率范围宽泛（0.01%~100%），UI 上已有 `min/max` 限制，暂不需要额外校验。
- 移动端布局在 767px 断点处切换，已测试 PC 端双面板 → 移动端上下堆叠的转换。
- `useLocalStorage` 的 console.warn 在生产构建中不会被移除（未使用 terser drop_console），用户可见，符合预期——用于帮助诊断 localStorage 满的问题。
