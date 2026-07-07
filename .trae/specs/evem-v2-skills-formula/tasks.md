# Tasks

## Phase 1: 类型系统重做
- [ ] Task 1: 更新核心类型定义
  - [ ] 1.1: 新增 SkillDef, SkillTier, SkillLevelEffect, SkillLevels 类型
  - [ ] 1.2: 新增 FacilityDef, CustomFacilityBonus 类型
  - [ ] 1.3: 新增 DiscountRule 类型
  - [ ] 1.4: 新增 ProductTag 标签，扩展 Product/Blueprint 的 tags 字段
  - [ ] 1.5: 重定义 Decoder 类型（ME/TE/run/successRate/category: 'mfg'|'rev'）
  - [ ] 1.6: 新增 BonusLayers 类型（技能/设施/解码器各层加成汇总）
  - [ ] 1.7: 更新 ManufacturingConfig（移除 materialEfficiency 直接输入，改为由加成计算）、ReverseEngineeringConfig

## Phase 2: 内置数据重做
- [ ] Task 2: 内置技能和设施数据
  - [ ] 2.1: 创建 `src/data/skills.ts`（护卫舰制造技术 + 加达里发明原理）
  - [ ] 2.2: 创建 `src/data/facilities.ts`（初期空列表，含接口定义）
  - [ ] 2.3: 更新 `src/data/index.ts` 导出

- [ ] Task 3: 内置解码器数据重做
  - [ ] 3.1: 删除旧 3 个解码器
  - [ ] 3.2: 创建 8 个新解码器（4 制造 + 4 逆向）

- [ ] Task 4: 内置测试产品数据
  - [ ] 4.1: 更新 `src/data/blueprints.ts` 添加秃鹫级截击型蓝图
  - [ ] 4.2: 更新 `src/data/reverse.ts` 添加秃鹫级截击型逆向配置
  - [ ] 4.3: 更新 `src/data/items.ts` 添加相关材料物品

- [ ] Task 5: 产品树形标签系统
  - [ ] 5.1: 创建 `src/data/tags.ts`（标签定义和树形层级关系）
  - [ ] 5.2: 在产品数据中附上标签（从树节点继承）

## Phase 3: 加成计算引擎
- [ ] Task 6: 实现加成计算器（SkillFacilityResolver）
  - [ ] 6.1: 根据 SkillLevels 计算各技能对某产品的加成
  - [ ] 6.2: 根据设施选择计算设施加成
  - [ ] 6.3: 合并输出 BonusLayers 对象
  - [ ] 6.4: 标签匹配逻辑

- [ ] Task 7: 重构制造/逆向/出售引擎
  - [ ] 7.1: 更新 `calculateManufacturing` 接受 BonusLayers
  - [ ] 7.2: 更新 `calculateReverse` 接受 BonusLayers
  - [ ] 7.3: 更新新公式逻辑（材料效率加法、时间乘法、成功率等）
  - [ ] 7.4: 更新出售引擎（折扣集成）

## Phase 4: UI 组件
- [ ] Task 8: 技能和设施面板
  - [ ] 8.1: 创建 `SkillsFacilitiesPanel` 组件（折叠/展开）
  - [ ] 8.2: 技能显示（三位数、进度条、加成预览）
  - [ ] 8.3: 等级滑块 + 批量设置预设下拉
  - [ ] 8.4: 设施显示 + 自定义设施加成弹窗
  - [ ] 8.5: 加成汇总显示
  - [ ] 8.6: 等级约束校验（进阶≥4前置、专家≥5前置）

- [ ] Task 9: 折扣配置区域
  - [ ] 9.1: 折扣规则列表（分类/物品 + 折扣率 + 适用范围）
  - [ ] 9.2: 添加/编辑/删除折扣规则
  - [ ] 9.3: 材料清单单行折扣覆写
  - [ ] 9.4: 出售面板折扣覆写

- [ ] Task 10: 更新现有 UI 组件
  - [ ] 10.1: 更新 DecoderSelector 按制造/逆分家
  - [ ] 10.2: 更新 MaterialList（集成折扣显示、使用 BonusLayers 的加成溯源）
  - [ ] 10.3: 更新 ProductionSummary（自定义流程数、槽位计算、并行逆程数）
  - [ ] 10.4: 更新 MarketSellConfig/ContractSellConfig（折扣覆写）
  - [ ] 10.5: 解码器显示为「材料效率」「时间效率」中文

- [ ] Task 11: 教程文字
  - [ ] 11.1: 创建 `Tutorial` 组件（可折叠的帮助区域）
  - [ ] 11.2: 内容包括工具介绍、计算公式说明、使用步骤

## Phase 5: 状态管理更新
- [ ] Task 12: 更新 AppContext
  - [ ] 12.1: 添加 SkillLevels 状态，localStorage 持久化
  - [ ] 12.2: 添加 Facility 选择状态
  - [ ] 12.3: 添加 CustomFacilityBonus 状态
  - [ ] 12.4: 添加 DiscountRule[] 状态
  - [ ] 12.5: 添加 skillFacilityResolver 或计算结果的导出

- [ ] Task 13: 更新 ProductionContext/SellingContext
  - [ ] 13.1: ProductionContext 更新 config 类型适配新字段
  - [ ] 13.2: SellingContext 添加折扣覆写字段

## Phase 6: 集成与验证
- [ ] Task 14: 集成测试
  - [ ] 14.1: 使用新测试数据在新公式下计算，与实机对比
  - [ ] 14.2: 验证技能等级约束
  - [ ] 14.3: 验证标签匹配

# Task Dependencies
- Task 2, 4, 5 依赖 Task 1
- Task 3 依赖 Task 1
- Task 6 依赖 Task 1, 2
- Task 7 依赖 Task 1, 6
- Task 12, 13 依赖 Task 1
- Task 8 依赖 Task 2, 12
- Task 9 依赖 Task 12
- Task 10 依赖 Task 3, 7, 13
- Task 11 独立
- Task 14 依赖全部
