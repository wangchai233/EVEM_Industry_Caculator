import { createContext, useContext, useCallback, type ReactNode } from 'react';
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
