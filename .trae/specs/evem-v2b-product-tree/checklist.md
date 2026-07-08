# Checklist

## 类型
- [ ] Blueprint.isCustom 字段存在
- [ ] ReverseEngineeringData.isCustom 字段存在
- [ ] ProductTreeNode 类型正确定义

## 数据
- [ ] 内置树节点覆盖所有现有产品
- [ ] 自定义产品树节点与内置节点共存

## 状态
- [ ] customBlueprints localStorage 持久化
- [ ] customReverse localStorage 持久化
- [ ] 导入导出包含自定义数据

## 产品树选择器
- [ ] 默认折叠
- [ ] 点击展开/折叠
- [ ] 搜索时自动展开并高亮
- [ ] 自定义产品有 ⚙️ 标识

## 自定义产品编辑
- [ ] 可编辑名称/时间/费用/产物数量
- [ ] 材料类别可动态增删
- [ ] 材料条目可动态增删
- [ ] "另存为自定义"复制现有产品数据
- [ ] 保存后选中的产品列表中可见
- [ ] 删除功能正常

## 逆向自定义
- [ ] 可编辑基底材料/成功率/数据核心
- [ ] 保存后在逆向产品树中可见

## 构建
- [ ] `npx tsc --noEmit` 零错误
- [ ] `npm run build` 成功
