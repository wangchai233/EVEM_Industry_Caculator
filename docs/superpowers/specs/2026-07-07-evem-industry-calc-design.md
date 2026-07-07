# EVEM 工业计算器 设计文档

> 日期: 2026-07-07 | 状态: 已批准

## 概述

一个完全离线的《星战前夜：无烬星河》工业利润计算网页应用。React + Vite + TypeScript 构建，PC 优先，移动端适配。帮助玩家在"开启项目"前计算投入产出比。

## 技术选型

| 项 | 选择 | 理由 |
|---|------|------|
| 框架 | React 18 + TypeScript | 组件化，类型安全 |
| 构建 | Vite | 快速构建，原生 ESM |
| 样式 | CSS Modules | 零运行时，样式隔离 |
| 状态管理 | React Context + useReducer | 零依赖，适合中型应用 |
| 公式渲染 | KaTeX / react-latex-next | 轻量 LaTeX 渲染 |
| 持久化 | localStorage | 完全离线存储 |

## 架构

### 组件树

```
App
├── Header (标题、价格配置切换/管理)
├── ProductionPanel (左侧/上方)
│   ├── ProjectTypeTabs (制造 / 逆向)
│   ├── ProductSelector (选择产品)
│   ├── EfficiencyConfig (材料效率、时间效率)
│   ├── DecoderSelector (解码器选择)
│   ├── MaterialList (材料清单，单价可编辑)
│   ├── ProductionSummary (流程数、耗时、成本)
│   └── ReverseExtras (仅逆向：材料数量、成功率、期望)
├── SellingPanel (右侧/下方)
│   ├── SellModeTabs (市场 / 合同)
│   ├── SellConfig (税率、售价)
│   └── ProfitSummary (税费、利润、利润率)
└── ImportExportBar (JSON 导入导出)
```

### 状态管理

- **AppContext**：全局（价格配置列表、当前配置、产品数据库）
- **ProductionContext**：生产面板状态（选中产品、效率、流程数、材料清单计算结果）
- **SellingContext**：出售面板状态（出售模式、税率、售价、利润计算结果）

### 数据流

```
内置数据 ──────────────────────┐
用户导入数据 ──────────────────┤
                              ├──→ AppContext ──→ ProductionContext ──→ 计算结果
localStorage 价格配置 ─────────┤                              │
                              │                       "发送到出售"
                              └────────────────────→ SellingContext ←──┘
```

## 数据模型

### 核心类型

```typescript
interface Item {
  id: string; name: string; category: ItemCategory; icon?: string;
}

type ItemCategory = 'mineral' | 'planetary' | 'data_core' | 'decoder' | 
                    'blueprint' | 'damaged_structure' | 'product' | 'isk';

interface MaterialEntry {
  item: Item; quantity: number; // 原始基准数量
}

interface Blueprint {
  id: string; productItem: Item; productQuantity: number;
  baseTime: number; // 秒
  baseCost: number; // ISK 现金费用
  materials: MaterialEntry[]; // 原始基准材料
  maxRuns: number; // 最大流程数
}

interface Decoder extends Item {
  meBonus: number;   // 材料效率乘算，默认 1.0
  teBonus: number;   // 时间效率乘算，默认 1.0
  runBonus: number;  // 额外流程数，默认 0
}

interface ReverseEngineeringData {
  baseItem: Item; // 基底材料（受损结构等）
  maxItemCount: number; // 最大基底材料数量
  successRatePerItem: number; // 每单位材料的成功率（如 0.10）
  baseTime: number; // 秒
  baseCost: number; // ISK
  dataCores: MaterialEntry[]; // 所需数据核心
  targetBlueprint: Blueprint; // 成功后获得的蓝图
}

interface PriceConfig {
  id: string; name: string;
  prices: Record<string, number>; // itemId → 单价
  updatedAt: string;
}
```

### 计算逻辑

```
// 制造
材料数量 = (原始基准 × 材料效率 × 流程数)  对普通材料
材料数量 = (原始基准 × 流程数)              对基底材料和解码器
产物数量 = 蓝图单流程产出 × (流程数 + 解码器runBonus)
耗时 = 原始基准 × 时间效率  (不乘流程数，多流程并行)
现金费用 = 原始基准 × 流程数
总成本 = 所有材料(数量×单价) + 现金费用 + 解码器单价

// 逆向
基础成功率 = 基底材料数量 × successRatePerItem
单次成本 = 基底材料(数量×单价) + 数据核心 + 解码器 + ISK费用
期望成本 = 单次成本 / 成功率

// 市场出售
立即出售且匹配: 税后收入 = 售价 × (1 - 销售税率)
立即出售不匹配: 物品不售出
挂单且匹配: 税后收入 = 售价 × (1 - 1%中介费 - 销售税率)
挂单不匹配: 立即扣 1% 中介费，成交时扣销售税

// 合同出售
中介费 = max(售价 × 4%, 1000)
定金 = max(售价 × 2.5%, 10000)  // 成交后退还
税后收入 = 售价 - 中介费
利润 = 税后收入 - 总成本
利润率 = 利润 / 总成本 × 100%
```

## 响应式策略

| 区域 | PC (≥1024px) | 移动端 (<768px) |
|------|-------------|-----------------|
| 整体 | 左右双面板 | 上下布局，面板切换标签 |
| 材料清单 | 完整表格 | 卡片式堆叠 |
| 汇总区 | 固定底部栏 | 底部固定，精简字段 |

## 边界处理

- 材料效率范围: 75% ~ 150%
- 时间效率: > 0
- 流程数: 1 ~ maxRuns
- 售价: > 0
- 成功率: ≤ 100%
- 未设价格: 材料行标黄，不计入总成本
- JSON 导入: 格式校验 + 版本检查
- localStorage 满: 提示用户
