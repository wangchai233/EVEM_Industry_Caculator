# Tasks

## Phase 1: 项目初始化
- [ ] Task 1: 初始化 React + Vite + TypeScript 项目，安装依赖（katex, react-latex-next 或等效库）
  - [ ] 1.1: `npm create vite@latest . -- --template react-ts`
  - [ ] 1.2: 安装 KaTeX 相关依赖
  - [ ] 1.3: 配置 vite.config.ts 静态站点构建

## Phase 2: 数据层
- [ ] Task 2: 实现核心数据模型和类型定义
  - [ ] 2.1: 定义 Item, MaterialEntry, Blueprint, Decoder 类型
  - [ ] 2.2: 定义 ManufacturingConfig, ReverseEngineeringConfig, SellingConfig 类型
  - [ ] 2.3: 定义 ProductionResult, SellingResult 类型
  - [ ] 2.4: 定义 PriceConfig 类型

- [ ] Task 3: 实现计算引擎（纯函数，无 UI 依赖）
  - [ ] 3.1: 制造材料数量计算（材料效率 + 解码器 + 流程数）
  - [ ] 3.2: 制造时间和费用计算（时间效率 + 流程数）
  - [ ] 3.3: 逆向成功率和期望成本计算
  - [ ] 3.4: 市场出售税费计算（含立即出售逻辑）
  - [ ] 3.5: 合同出售税费计算

- [ ] Task 4: 实现内置默认数据（演示级 3-5 个产品）
  - [ ] 4.1: 内置物品库（矿物、行星材料、数据核心、解码器、基底材料等）
  - [ ] 4.2: 内置 2-3 个制造蓝图（含完整材料表）
  - [ ] 4.3: 内置 1-2 个逆向工程配置

- [ ] Task 5: 实现状态管理（React Context + useReducer）
  - [ ] 5.1: AppContext（价格配置、产品数据库）
  - [ ] 5.2: ProductionContext（生产面板状态）
  - [ ] 5.3: SellingContext（出售面板状态）
  - [ ] 5.4: localStorage 读写 Hook

## Phase 3: UI 组件
- [ ] Task 6: 布局框架组件
  - [ ] 6.1: App 主布局（左右双面板 + 响应式）
  - [ ] 6.2: Header 组件（标题 + 价格配置切换）
  - [ ] 6.3: 底部导入导出工具栏

- [ ] Task 7: 生产面板组件
  - [ ] 7.1: ProjectTypeTabs（制造/逆向切换）
  - [ ] 7.2: ProductSelector（带搜索的下拉产品选择器）
  - [ ] 7.3: EfficiencyConfig（材料/时间效率预设 + 手动输入）
  - [ ] 7.4: DecoderSelector（解码器下拉，含加成预览）
  - [ ] 7.5: MaterialList（材料分类表格，单价可编辑）
  - [ ] 7.6: ProductionSummary（流程数滑块 + 耗时/成本汇总）
  - [ ] 7.7: ReverseExtras（材料数量滑块 + 成功率 + 期望成本）

- [ ] Task 8: 出售面板组件
  - [ ] 8.1: SellModeTabs（市场/合同切换）
  - [ ] 8.2: MarketSellConfig（税率预设、立即出售开关、售价输入）
  - [ ] 8.3: ContractSellConfig（税费展示、售价输入）
  - [ ] 8.4: ProfitSummary（税费明细 + 利润 + 利润率）

- [ ] Task 9: 价格配置管理弹窗
  - [ ] 9.1: 配置列表（名称、物品数、时间）
  - [ ] 9.2: 新建/重命名/删除/设为默认

- [ ] Task 10: 数据导入导出
  - [ ] 10.1: 导出 JSON（打包所有数据下载）
  - [ ] 10.2: 导入 JSON（文件选择 + 校验 + 预览差异 + 合并确认）
  - [ ] 10.3: 重置为默认数据

## Phase 4: 格式化与渲染
- [ ] Task 11: 数字格式化工具（千位分隔符）
- [ ] Task 12: 时间格式化工具（hh:mm:ss / MM:dd:hh:mm:ss）
- [ ] Task 13: LaTeX 公式渲染集成（KaTeX 或 react-latex-next）

## Phase 5: 样式与响应式
- [ ] Task 14: 全局样式和 CSS 变量（主题色、间距、字体）
- [ ] Task 15: 响应式布局（PC 左右并排 / 移动端上下布局）
- [ ] Task 16: 移动端材料清单卡片式布局

## Phase 6: 边界处理
- [ ] Task 17: 输入校验（效率范围、流程数范围、成功率范围等）
- [ ] Task 18: 价格未设置提示（材料清单标黄）
- [ ] Task 19: localStorage 容量检测和提示

# Task Dependencies
- Task 3 依赖 Task 2
- Task 5 依赖 Task 2
- Task 4 依赖 Task 2
- Task 7,8,9,10 依赖 Task 5,6
- Task 7,8 依赖 Task 3
- Task 11,12,13 可与 Task 7,8 并行
- Task 14,15,16 可与 Task 7,8 并行
