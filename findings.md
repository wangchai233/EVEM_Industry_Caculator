# 研究发现

## 项目状态

- **框架：** React 19 + TypeScript + Vite 7
- **公式渲染：** KaTeX
- **状态管理：** React Context + useReducer + localStorage
- **功能：** 制造计算、逆向工程、利润分析、价格方案管理、自定义产品、JSON 导入导出
- **版本号：** package.json 中为 0.0.0，需改为 0.0.1
- **Git：** 未初始化，无提交历史
- **README：** 不存在
- **CHANGELOG：** 不存在
- **构建：** `npm run dev` / `npm run build` / `npm run preview` 均可用
- **设施数据：** src/data/facilities.ts 当前为空
- **内部文档：** .superpowers/、.trae/、docs/superpowers/、新要求/ 含大量开发过程记录

## 待忽略文件

需要在 .gitignore 中追加：
- `.superpowers/`
- `.trae/`
- `新要求/`
- `docs/superpowers/`
- `EVEM工业计算需求.md`

## GitHub Pages 配置

- 仓库名假设为 `evem-industry-calc`
- Vite `base` 需设为 `'/evem-industry-calc/'`
- 部署工作流：push main → build → deploy to GitHub Pages
