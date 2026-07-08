import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { PriceConfig, SkillLevels, CustomFacilityBonus, DiscountRule } from '../types';
import { EMPTY_BONUS } from '../types/bonus';
import { defaultItems, allItems, defaultBlueprints, defaultReverse, defaultDecoders } from '../data';
import { defaultSkills, defaultSkillLevels } from '../data/skills';

interface AppState {
  priceConfigs: PriceConfig[];
  activeConfigId: string;
  customItems: typeof defaultItems;
  customBlueprints: typeof defaultBlueprints;
  customReverse: typeof defaultReverse;
  customDecoders: typeof defaultDecoders;
  skillLevels: SkillLevels;
  activeFacilityId: string;
  customFacility: CustomFacilityBonus;
  discountRules: DiscountRule[];
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
  // 技能相关
  setSkillLevels: (levels: SkillLevels | ((prev: SkillLevels) => SkillLevels)) => void;
  updateSkillLevel: (skillId: string, tier: 0 | 1 | 2, level: number) => void;
  batchSetSkillLevels: (preset: string) => void;
  // 设施相关
  setActiveFacilityId: (id: string | ((prev: string) => string)) => void;
  setCustomFacility: (bonus: CustomFacilityBonus | ((prev: CustomFacilityBonus) => CustomFacilityBonus)) => void;
  // 折扣相关
  setDiscountRules: (rules: DiscountRule[] | ((prev: DiscountRule[]) => DiscountRule[])) => void;
  addDiscountRule: (rule: Omit<DiscountRule, 'id'>) => void;
  removeDiscountRule: (id: string) => void;
  getDiscount: (itemId: string, scope: 'buy' | 'sell', category?: string) => number | null;
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

  // 技能状态
  const [skillLevels, setSkillLevels] = useLocalStorage<SkillLevels>('evem_skill_levels', defaultSkillLevels);

  // 设施状态
  const [activeFacilityId, setActiveFacilityId] = useLocalStorage<string>('evem_active_facility', '');
  const [customFacility, setCustomFacility] = useLocalStorage<CustomFacilityBonus>('evem_custom_facility', {
    materialEfficiency: 0,
    timeEfficiency: 0,
    successRate: 0,
    costMultiplier: 0,
  });

  // 折扣规则
  const [discountRules, setDiscountRules] = useLocalStorage<DiscountRule[]>('evem_discount_rules', []);

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

  // 批量设置技能等级
  const batchSetSkillLevels = useCallback((preset: string) => {
    const b = parseInt(preset[0] || '0');
    const a = parseInt(preset[1] || '0');
    const e = parseInt(preset[2] || '0');
    const newLevels: SkillLevels = {};
    defaultSkills.forEach(s => { newLevels[s.id] = [b, a, e]; });
    setSkillLevels(newLevels);
  }, [setSkillLevels]);

  // 更新单个技能等级（带级联约束）
  const updateSkillLevel = useCallback((skillId: string, tier: 0 | 1 | 2, level: number) => {
    setSkillLevels(prev => {
      const current = [...(prev[skillId] ?? [0, 0, 0])] as [number, number, number];
      current[tier] = Math.max(0, Math.min(5, level));
      // 级联约束：进阶>0 需要基础≥4
      if (current[1] > 0 && current[0] < 4) current[1] = 0;
      // 级联约束：专家>0 需要进阶≥5
      if (current[2] > 0 && current[1] < 5) current[2] = 0;
      return { ...prev, [skillId]: current };
    });
  }, [setSkillLevels]);

  // 添加折扣规则
  const addDiscountRule = useCallback((rule: Omit<DiscountRule, 'id'>) => {
    const newRule: DiscountRule = { ...rule, id: Date.now().toString(36) };
    setDiscountRules(prev => [...prev, newRule]);
  }, [setDiscountRules]);

  // 删除折扣规则
  const removeDiscountRule = useCallback((id: string) => {
    setDiscountRules(prev => prev.filter(r => r.id !== id));
  }, [setDiscountRules]);

  // 获取折扣
  const getDiscount = useCallback((itemId: string, scope: 'buy' | 'sell', category?: string): number | null => {
    for (const rule of discountRules) {
      if (rule.scope !== scope) continue;
      if (rule.type === 'item' && rule.targetId === itemId) return rule.rate;
      if (rule.type === 'category' && rule.targetId === category) return rule.rate;
    }
    return null;
  }, [discountRules]);

  return (
    <AppContext.Provider value={{
      priceConfigs: configs, activeConfigId: activeId,
      customItems: defaultItems, customBlueprints: defaultBlueprints,
      customReverse: defaultReverse, customDecoders: defaultDecoders,
      getPrice, setPrice, createPriceConfig, deletePriceConfig,
      renamePriceConfig, switchConfig, getAllData, importData,
      // 技能
      skillLevels, setSkillLevels, updateSkillLevel, batchSetSkillLevels,
      // 设施
      activeFacilityId, setActiveFacilityId, customFacility, setCustomFacility,
      // 折扣
      discountRules, setDiscountRules, addDiscountRule, removeDiscountRule, getDiscount,
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
