# v2 Task 9: 技能设施面板 UI — 报告

**日期:** 2026-07-08
**状态:** ✅ 完成
**提交:** `3319f9a` — `feat: add Skills & Facilities panel UI with skill level controls`

---

## 做了什么

按照计划 v2 Task 9（技能设施面板 UI），创建了 `SkillsFacilitiesPanel` 组件并集成到 App 布局中。

### 新建文件

| 文件 | 路径 | 说明 |
|------|------|------|
| SkillsFacilitiesPanel.tsx | `src/components/SkillsFacilitiesPanel/SkillsFacilitiesPanel.tsx` | 主组件（259 行） |
| SkillsFacilitiesPanel.module.css | `src/components/SkillsFacilitiesPanel/SkillsFacilitiesPanel.module.css` | 样式模块（208 行） |

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/App.tsx` | 导入 SkillsFacilitiesPanel，添加 topBar 布局区域 |
| `src/App.module.css` | 新增 `.topBar` 样式 |

### 组件功能

1. **可折叠面板** — 点击标题栏展开/收起，初始默认展开
2. **批量预设下拉** — 6 个预设（000/540/550/553/554/555），选择后立即应用并重置下拉
3. **技能等级滑块** — 每个技能三行滑块（基础/进阶/专家，0-5 级），右侧显示三位数字（如 `540`）
   - 级联约束由 `AppContext.updateSkillLevel` 内置处理（进阶>0 需基础≥4，专家>0 需进阶≥5）
   - 滑块 onChange 直接调用组件顶层获取的 `updateSkillLevel`，无 hooks 错误
4. **设施选择器** — 下拉选择预设设施或"不使用设施（自定义加成）"
5. **自定义设施加成** — 四个数字输入框（材料效率/时间效率/成功率/费用倍率），步长 0.01
6. **加成汇总** — 四行汇总表，分列显示技能/设施/合计的百分比加成
   - 可展开的"技能明细"折叠区，列出每个技能的贡献

### computeBonusSummary

组件内定义了一个纯函数 `computeBonusSummary(skillLevels, customFacility)` → `BonusLayers`，遍历所有技能定义、根据当前等级累加 effect 值，生成完整的 BonusLayers 结构。

### 布局

SkillsFacilitiesPanel 位于 Header 下方、main 面板上方，独占一行宽度（`topBar` 容器）。

---

## 验证

- `npx tsc --noEmit` ✅ 退出码 0，无类型错误
- VS Code diagnostics: App.tsx 和 SkillsFacilitiesPanel.tsx 均为零错误

---

## 注意事项

- `updateSkillLevel` 方法在 Task 8 中已添加到 AppContext 中，本任务无需修改
- `batchSetSkillLevels` 方法也在 Task 8 中已实现
- 预设下拉选择后通过设置 `e.target.value = ''` 自动重置回占位选项，避免二次选择同一预设无反应的问题
- 设施列表 `defaultFacilities` 当前为空数组，下拉仅显示"不使用设施"选项；后续补录设施数据后自动生效
