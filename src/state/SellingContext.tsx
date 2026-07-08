import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { SellingConfig, SellingResult } from '../types';

export interface ManualSellData {
  quantity: number;
  totalCost: number | null;
}

interface SellingState {
  config: SellingConfig;
  result: SellingResult | null;
  costData: { totalCost: number | null; costPerUnit: number | null; productCount: number } | null;
  discountOverride: number | null; // null = 使用全局折扣
}

type Action =
  | { type: 'SET_CONFIG'; payload: SellingConfig }
  | { type: 'SET_RESULT'; payload: SellingResult | null }
  | { type: 'SET_COST_DATA'; payload: SellingState['costData'] }
  | { type: 'SET_DISCOUNT_OVERRIDE'; payload: number | null };

const initialState: SellingState = {
  config: { mode: 'market', sellPrice: 0, immediateSell: false, salesTaxRate: 0.20 },
  result: null,
  costData: null,
  discountOverride: null,
};

function reducer(state: SellingState, action: Action): SellingState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'SET_COST_DATA':
      return { ...state, costData: action.payload };
    case 'SET_DISCOUNT_OVERRIDE':
      return { ...state, discountOverride: action.payload };
    default:
      return state;
  }
}

const SellingContext = createContext<{
  state: SellingState;
  dispatch: Dispatch<Action>;
  manualData: ManualSellData | null;
  setManualData: (data: ManualSellData | null) => void;
} | null>(null);

export function SellingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [manualData, setManualData] = useLocalStorage<ManualSellData | null>('evem_selling_manual', null);

  return (
    <SellingContext.Provider value={{ state, dispatch, manualData, setManualData }}>
      {children}
    </SellingContext.Provider>
  );
}

export function useSelling() {
  const ctx = useContext(SellingContext);
  if (!ctx) throw new Error('useSelling must be used within SellingProvider');
  return ctx;
}
