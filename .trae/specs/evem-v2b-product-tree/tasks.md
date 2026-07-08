# Tasks

## Phase 1: 数据与类型
- [ ] Task 1: 扩展类型定义
  - [ ] 1.1: Blueprint 加 `isCustom?: boolean`
  - [ ] 1.2: ReverseEngineeringData 加 `isCustom?: boolean`
  - [ ] 1.3: 新增 `ProductTreeNode` 类型
  - [ ] 1.4: Blueprint.materials 条目支持任意 category 名称

- [ ] Task 2: 内置产品树数据
  - [ ] 2.1: 创建 `src/data/productTree.ts`（内置树节点定义）
  - [ ] 2.2: 将现有关键产品挂到树节点下

## Phase 2: 状态管理
- [ ] Task 3: AppContext 扩展
  - [ ] 3.1: 添加 `customBlueprints: Blueprint[]` localStorage 状态
  - [ ] 3.2: 添加 `customReverse: ReverseEngineeringData[]` localStorage 状态
  - [ ] 3.3: 添加 `customTreeNodes: ProductTreeNode[]` localStorage 状态
  - [ ] 3.4: 添加 CRUD 方法（add/update/delete custom blueprint/reverse）
  - [ ] 3.5: 更新 `getAllData` / `importData` 包含自定义数据

## Phase 3: UI 组件
- [ ] Task 4: 产品树选择器
  - [ ] 4.1: 重写 `ProductSelector` 为树形组件（折叠/展开/搜索高亮）
  - [ ] 4.2: 叶子节点显示产品名 + 自定义标识
  - [ ] 4.3: "自定义产品"分类 + "+ 新建"按钮

- [ ] Task 5: 自定义产品编辑面板
  - [ ] 5.1: 创建 `ProductEditor` 组件（名称/时间/费用/产物数量）
  - [ ] 5.2: 多材料类别动态增删 UI
  - [ ] 5.3: 每个类别内材料条目动态增删
  - [ ] 5.4: "另存为自定义"功能
  - [ ] 5.5: 保存/删除按钮

- [ ] Task 6: 自定义逆向编辑
  - [ ] 6.1: 扩展 ProductEditor 或创建 ReverseEditor 组件
  - [ ] 6.2: 编辑基底材料、成功率、数据核心

## Phase 4: 集成与验证
- [ ] Task 7: 集成测试
  - [ ] 7.1: 验证产品树展开/折叠
  - [ ] 7.2: 验证自定义产品创建和编辑
  - [ ] 7.3: 验证自定义产品在计算引擎中正确工作
  - [ ] 7.4: 验证 localStorage 持久化
  - [ ] 7.5: 验证导入导出包含自定义数据
  - [ ] 7.6: `npx tsc --noEmit` 通过
  - [ ] 7.7: `npm run build` 成功

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1
- Task 4 依赖 Task 2, 3
- Task 5 依赖 Task 3, 4
- Task 6 依赖 Task 3
- Task 7 依赖全部
