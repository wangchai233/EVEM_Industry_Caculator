### Task 1: 项目初始化

**Files:**
- Create: 项目根目录 `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`

**Interfaces:**
- Produces: 可启动的开发服务器，Vite + React + TypeScript 模板

- [ ] **Step 1: 使用 Vite 创建项目**

```bash
cd d:\Trae_Projects\EVEM_Industry_Calc
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: 安装额外依赖**

```bash
npm install katex
npm install -D @types/katex
```

- [ ] **Step 3: 验证项目能启动**

```bash
npm run dev
```

Expected: 开发服务器启动在 localhost，浏览器打开显示 Vite + React 默认页面。

- [ ] **Step 4: 清理默认文件，保留基本结构**

删除 `src/App.css`，清理 `src/App.tsx` 为简单组件。

```tsx
// src/App.tsx
function App() {
  return <div className="app">EVEM 工业计算器</div>;
}
export default App;
```

```css
/* src/index.css */
:root {
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-border: #30363d;
  --color-text: #c9d1d9;
  --color-text-secondary: #8b949e;
  --color-primary: #58a6ff;
  --color-warning: #d2991d;
  --color-danger: #f85149;
  --color-success: #3fb950;
  --font-mono: 'SF Mono', 'Consolas', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --radius: 6px;
  --gap: 12px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
}
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "chore: init Vite + React + TypeScript project"
```
