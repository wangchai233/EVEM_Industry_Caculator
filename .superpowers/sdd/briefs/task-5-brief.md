### Task 5: 格式化工具函数

**Files:**
- Create: `src/utils/format.ts`, `src/utils/validation.ts`

**Interfaces:**
- Consumes: 无外部依赖
- Produces:
  - `formatNumber(n: number): string` — 千位分隔符
  - `formatTime(seconds: number): string` — hh:mm:ss (长耗时 MM:dd:hh:mm:ss)
  - `validateEfficiency(v: number, min: number, max: number): string | null`
  - `validatePositive(v: number, label: string): string | null`
  - `validateRuns(v: number, max: number): string | null`

- [ ] **Step 1: 写 `src/utils/format.ts`**

```typescript
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return n.toString();
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const s = Math.floor(totalSeconds);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (days > 0) {
    return `${String(days).padStart(2, '0')}:${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
```

- [ ] **Step 2: 写 `src/utils/validation.ts`**

```typescript
export function validateEfficiency(value: number, min: number, max: number): string | null {
  if (value < min) return `不能低于 ${min * 100}%`;
  if (value > max) return `不能超过 ${max * 100}%`;
  return null;
}

export function validatePositive(value: number, label: string): string | null {
  if (value <= 0) return `${label}必须大于 0`;
  return null;
}

export function validateRuns(value: number, max: number): string | null {
  if (value < 1) return '流程数最少为 1';
  if (value > max) return `流程数最多为 ${max}`;
  return null;
}
```

- [ ] **Step 3: 验证** — `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npx tsc --noEmit`

- [ ] **Step 4: 提交**

```bash
git add src/utils/
git commit -m "feat: add number/time formatting and validation utils"
```
