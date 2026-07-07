import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
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
