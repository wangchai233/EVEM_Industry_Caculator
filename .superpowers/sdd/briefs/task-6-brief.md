### Task 6: 状态管理

**Files:**
- Create: `src/state/useLocalStorage.ts`, `src/state/AppContext.tsx`, `src/state/ProductionContext.tsx`, `src/state/SellingContext.tsx`

**Interfaces:**
- Consumes: type definitions from Task 2, data index from Task 3
- Produces:
  - `useLocalStorage<T>(key, initial)` → `[T, setter]`
  - `AppProvider` — wraps global state (price configs, getPrice, setPrice, import/export)
  - `ProductionProvider` — wraps production panel state
  - `SellingProvider` — wraps selling panel state

- [ ] **Step 1: 写 `src/state/useLocalStorage.ts`**

```typescript
import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const next = value instanceof Function ? value(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // localStorage 满
      }
      return next;
    });
  }, [key]);

  return [storedValue, setValue];
}
```

- [ ] **Step 2: 写 `src/state/AppContext.tsx`**

```typescript
import React, { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { PriceConfig } from '../types';
import { defaultItems, allItems, defaultBlueprints, defaultReverse, defaultDecoders } from '../data';

interface AppState {
  priceConfigs: PriceConfig[];
  activeConfigId: string;
  customItems: typeof defaultItems;
  customBlueprints: typeof defaultBlueprints;
  customReverse: typeof defaultReverse;
  customDecoders: typeof defaultDecoders;
}

interface AppContextType extends AppState {
  getPrice: (itemId: string) => number | null;
  setPrice: (itemId: string, price: number) => void;
  createPriceConfig: (name: string) => void;
  deletePriceConfig: (id: string) => void;
  renamePriceConfig: (id: string, name: string) => void;
  switchConfig: (id: string) => void;
  getAllData: () => object;
  importData: (data: object) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const defaultConfig: PriceConfig = {
  id: 'default',
  name: '默认价格',
  prices: {},
  updatedAt: new Date().toISOString(),
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useLocalStorage<PriceConfig[]>('evem_price_configs', [defaultConfig]);
  const [activeId, setActiveId] = useLocalStorage<string>('evem_active_config', 'default');

  const activeConfig = configs.find(c => c.id === activeId) ?? configs[0];

  const getPrice = useCallback((itemId: string): number | null => {
    if (itemId === 'isk') return 1;
    const price = activeConfig?.prices[itemId];
    return price !== undefined ? price : null;
  }, [activeConfig]);

  const setPrice = useCallback((itemId: string, price: number) => {
    setConfigs(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      return { ...c, prices: { ...c.prices, [itemId]: price }, updatedAt: new Date().toISOString() };
    }));
  }, [activeId, setConfigs]);

  const createPriceConfig = useCallback((name: string) => {
    const newConfig: PriceConfig = {
      id: Date.now().toString(36),
      name,
      prices: {},
      updatedAt: new Date().toISOString(),
    };
    setConfigs(prev => [...prev, newConfig]);
    setActiveId(newConfig.id);
  }, [setConfigs, setActiveId]);

  const deletePriceConfig = useCallback((id: string) => {
    setConfigs(prev => {
      const next = prev.filter(c => c.id !== id);
      return next.length === 0 ? [defaultConfig] : next;
    });
    if (id === activeId) setActiveId('default');
  }, [activeId, setConfigs, setActiveId]);

  const renamePriceConfig = useCallback((id: string, name: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }, [setConfigs]);

  const switchConfig = useCallback((id: string) => setActiveId(id), [setActiveId]);

  const getAllData = useCallback(() => ({
    version: 1,
    items: allItems,
    blueprints: defaultBlueprints,
    reverse: defaultReverse,
    decoders: defaultDecoders,
    priceConfigs: configs,
  }), [configs]);

  const importData = useCallback((data: any) => {
    if (data?.priceConfigs) setConfigs(data.priceConfigs);
    if (data?.activeConfigId) setActiveId(data.activeConfigId);
  }, [setConfigs, setActiveId]);

  return (
    <AppContext.Provider value={{
      priceConfigs: configs, activeConfigId: activeId,
      customItems: defaultItems, customBlueprints: defaultBlueprints,
      customReverse: defaultReverse, customDecoders: defaultDecoders,
      getPrice, setPrice, createPriceConfig, deletePriceConfig,
      renamePriceConfig, switchConfig, getAllData, importData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
```

- [ ] **Step 3: 写 `src/state/ProductionContext.tsx`**

```typescript
import React, { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { ManufacturingConfig, ReverseEngineeringConfig, ProductionResult } from '../types';

type ProjectType = 'manufacturing' | 'reverse';

interface ProductionState {
  projectType: ProjectType;
  manufacturing: ManufacturingConfig;
  reverse: ReverseEngineeringConfig;
  result: (ProductionResult & { successRate?: number; expectedCost?: number | null }) | null;
}

type Action =
  | { type: 'SET_PROJECT_TYPE'; payload: ProjectType }
  | { type: 'SET_MANUFACTURING'; payload: Partial<ManufacturingConfig> }
  | { type: 'SET_REVERSE'; payload: Partial<ReverseEngineeringConfig> }
  | { type: 'SET_RESULT'; payload: ProductionState['result'] };

const initialState: ProductionState = {
  projectType: 'manufacturing',
  manufacturing: {
    blueprintId: '',
    runs: 1,
    materialEfficiency: 1.5,
    timeEfficiency: 1.0,
  },
  reverse: {
    reverseId: '',
    itemCount: 1,
    timeEfficiency: 1.0,
  },
  result: null,
};

function reducer(state: ProductionState, action: Action): ProductionState {
  switch (action.type) {
    case 'SET_PROJECT_TYPE':
      return { ...state, projectType: action.payload, result: null };
    case 'SET_MANUFACTURING':
      return { ...state, manufacturing: { ...state.manufacturing, ...action.payload } };
    case 'SET_REVERSE':
      return { ...state, reverse: { ...state.reverse, ...action.payload } };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    default:
      return state;
  }
}

const ProductionContext = createContext<{
  state: ProductionState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function ProductionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <ProductionContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const ctx = useContext(ProductionContext);
  if (!ctx) throw new Error('useProduction must be used within ProductionProvider');
  return ctx;
}
```

- [ ] **Step 4: 写 `src/state/SellingContext.tsx`**

```typescript
import React, { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { SellingConfig, SellingResult } from '../types';

interface SellingState {
  config: SellingConfig;
  result: SellingResult | null;
  costData: { totalCost: number | null; costPerUnit: number | null; productCount: number } | null;
}

type Action =
  | { type: 'SET_CONFIG'; payload: SellingConfig }
  | { type: 'SET_RESULT'; payload: SellingResult | null }
  | { type: 'SET_COST_DATA'; payload: SellingState['costData'] };

const initialState: SellingState = {
  config: { mode: 'market', sellPrice: 0, immediateSell: false, salesTaxRate: 0.20 },
  result: null,
  costData: null,
};

function reducer(state: SellingState, action: Action): SellingState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'SET_COST_DATA':
      return { ...state, costData: action.payload };
    default:
      return state;
  }
}

const SellingContext = createContext<{
  state: SellingState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function SellingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <SellingContext.Provider value={{ state, dispatch }}>
      {children}
    </SellingContext.Provider>
  );
}

export function useSelling() {
  const ctx = useContext(SellingContext);
  if (!ctx) throw new Error('useSelling must be used within SellingProvider');
  return ctx;
}
```

- [ ] **Step 5: 验证** — `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npx tsc --noEmit`

- [ ] **Step 6: 提交**

```bash
git add src/state/
git commit -m "feat: add state management (AppContext, ProductionContext, SellingContext)"
```
