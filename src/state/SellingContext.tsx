import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
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
