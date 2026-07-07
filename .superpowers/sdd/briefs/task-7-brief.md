### Task 7: LaTeX 公式组件

**Files:**
- Create: `src/components/Formula/Formula.tsx`

**Interfaces:**
- Produces: `<Formula latex={string} displayMode?={boolean} />` — KaTeX公式渲染

- [ ] **Step 1: 写 `src/components/Formula/Formula.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaProps {
  latex: string;
  displayMode?: boolean;
}

export function Formula({ latex, displayMode = false }: FormulaProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, {
        displayMode,
        throwOnError: false,
      });
    }
  }, [latex, displayMode]);

  return <span ref={ref} />;
}
```

- [ ] **Step 2: 验证** — `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npx tsc --noEmit`

- [ ] **Step 3: 提交**

```bash
git add src/components/Formula/
git commit -m "feat: add KaTeX formula rendering component"
```
