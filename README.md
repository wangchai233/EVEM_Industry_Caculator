# EVEM 工业计算器

面向《星战前夜：无烬星河》(EVE Echoes) 的工业制造与逆向工程利润计算器。

## 功能

- 制造计算：根据蓝图、技能等级、设施加成、解码器，计算材料消耗、生产时间和成本
- 逆向工程：计算逆向成功率、期望成本
- 利润分析：结合市场价格/合同价格，计算制造/逆向利润
- 多套价格方案：支持同时管理多套材料价格配置
- 自定义产品：支持自定义蓝图和逆向工程数据
- 数据导入/导出：JSON 格式的配置备份与恢复
- localStorage 持久化：所有配置自动保存在浏览器中

## 技术栈

React 19 · TypeScript · Vite 7 · KaTeX · CSS Modules

## 本地运行

```bash
npm install
npm run dev      # 开发模式，默认 http://localhost:5173
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

## 许可证

MIT
