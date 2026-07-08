# EVEM 工业计算器 v2 B 期 — 产品树与自定义产品 Spec

> 日期: 2026-07-09

## Why
当前产品列表为扁平结构，无法支持数千级产品的层级浏览。用户无法创建自定义产品和逆向配置，无法保存自己修改的配方。

## What Changes
- **BREAKING**: 产品选择器从扁平列表改为多级折叠树
- 新增自定义产品/逆向配置的创建、编辑、删除功能
- 新增自定义产品分类节点
- 材料类别从固定列表变为用户可增删
- 自定义产品 localStorage 持久化 + 导入导出支持

## Impact
- Affected specs: v2 A 期 spec
- Affected code: `src/data/`, `src/types/`, `src/components/ProductionPanel/`, `src/state/AppContext.tsx`, `src/App.tsx`

## ADDED Requirements

### Requirement: 产品树形选择器
系统应提供层级可折叠的产品树，替代扁平列表。

#### Scenario: 树形浏览
- **WHEN** 用户打开产品选择器
- **THEN** 显示根级分类（如"舰船"），默认折叠。点击展开子分类，直到叶子节点显示具体产品。

#### Scenario: 搜索
- **WHEN** 用户在搜索框输入
- **THEN** 自动展开所有匹配的分支并高亮匹配项，不匹配的分支保持折叠

#### Scenario: 自定义产品标识
- **WHEN** 产品树中有自定义产品
- **THEN** 自定义产品前显示 ⚙️ 标识，与内置产品有醒目区分

### Requirement: 自定义产品编辑
系统应允许用户创建、编辑、删除自定义产品。

#### Scenario: 新建产品
- **WHEN** 用户点击"自定义产品"分类下的"+ 新建产品"
- **THEN** 打开产品编辑面板，产品名称、制造时间、现金费用、产物数量可编辑

#### Scenario: 多材料类别
- **WHEN** 用户编辑自定义产品
- **THEN** 可以添加任意数量的材料类别，每个类别下添加任意数量的材料条目（物品名 + 数量）

#### Scenario: 存储和恢复
- **WHEN** 用户保存自定义产品
- **THEN** 产品存入 localStorage，刷新后仍存在。同时更新导入导出数据范围

#### Scenario: 从现有产品另存
- **WHEN** 用户在内置产品上操作"另存为自定义"
- **THEN** 复制该产品的所有属性为初始值，用户可修改后保存为新的自定义产品

### Requirement: 自定义逆向配置
系统应支持自定义逆向工程配置。

#### Scenario: 新建逆向配置
- **WHEN** 用户创建自定义逆向项目
- **THEN** 可编辑：基底材料、数量上限、基础成功率、数据核心需求、逆向时间、费用

## MODIFIED Requirements

### Requirement: 产品数据结构
`Blueprint` 类型新增 `isCustom?: boolean` 字段。`ReverseEngineeringData` 类型新增 `isCustom?: boolean` 字段。材料条目支持任意类别名称。

### Requirement: 导入导出
`getAllData` 导出和 `importData` 导入需包含自定义产品、自定义逆向配置和自定义树节点。
