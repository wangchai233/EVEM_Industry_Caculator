import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { PriceConfig, SkillLevels, CustomFacilityBonus, DiscountRule, ProductTreeNode, Blueprint, ReverseEngineeringData } from '../types';
import { defaultItems, allItems, defaultBlueprints, defaultReverse, defaultDecoders } from '../data';
import { defaultSkills, defaultSkillLevels } from '../data/skills';

interface AppState {
  priceConfigs: PriceConfig[];
  activeConfigId: string;
  customItems: typeof defaultItems;
  customBlueprints: Blueprint[];
  customReverse: ReverseEngineeringData[];
  customTreeNodes: ProductTreeNode[];
  customDecoders: typeof defaultDecoders;
  skillLevels: SkillLevels;
  activeFacilityIds: string[];
  customFacility: CustomFacilityBonus;
  discountRules: DiscountRule[];
}

interface AppContextType extends AppState {
  getPrice: (itemId: string) => number | null;
  setPrice: (itemId: string, price: number) => void;
  clearPrice: (itemId: string) => void;
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
  setActiveFacilityIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  toggleFacility: (id: string) => void;
  setCustomFacility: (bonus: CustomFacilityBonus | ((prev: CustomFacilityBonus) => CustomFacilityBonus)) => void;
  // 折扣相关
  setDiscountRules: (rules: DiscountRule[] | ((prev: DiscountRule[]) => DiscountRule[])) => void;
  addDiscountRule: (rule: Omit<DiscountRule, 'id'>) => void;
  removeDiscountRule: (id: string) => void;
  getDiscount: (itemId: string, scope: 'buy' | 'sell', category?: string) => number | null;
  // 材料折扣覆写
  materialDiscounts: Record<string, number>;
  setMaterialDiscount: (itemId: string, rate: number | null) => void;
  clearMaterialDiscount: (itemId: string) => void;
  // 全局效率覆盖
  globalOverrides: { enabled: boolean; materialEfficiency: number; timeEfficiency: number; successRate: number };
  setGlobalOverrides: (v: { enabled: boolean; materialEfficiency: number; timeEfficiency: number; successRate: number } | ((prev: { enabled: boolean; materialEfficiency: number; timeEfficiency: number; successRate: number }) => { enabled: boolean; materialEfficiency: number; timeEfficiency: number; successRate: number })) => void;
  // 自定义蓝图的 CRUD
  addCustomBlueprint: (bp: Blueprint) => void;
  updateCustomBlueprint: (id: string, patch: Partial<Blueprint>) => void;
  deleteCustomBlueprint: (id: string) => void;
  // 自定义逆向配置的 CRUD
  addCustomReverse: (rev: ReverseEngineeringData) => void;
  updateCustomReverse: (id: string, patch: Partial<ReverseEngineeringData>) => void;
  deleteCustomReverse: (id: string) => void;
  setCustomTreeNodes: (nodes: ProductTreeNode[] | ((prev: ProductTreeNode[]) => ProductTreeNode[])) => void;
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
  const [activeFacilityIds, setActiveFacilityIds] = useLocalStorage<string[]>('evem_active_facilities', []);

  const toggleFacility = useCallback((id: string) => {
    setActiveFacilityIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, [setActiveFacilityIds]);
  const [customFacility, setCustomFacility] = useLocalStorage<CustomFacilityBonus>('evem_custom_facility', {
    materialEfficiency: 0,
    timeEfficiency: 0,
    successRate: 0,
    costMultiplier: 0,
  });

  // 折扣规则
  const [discountRules, setDiscountRules] = useLocalStorage<DiscountRule[]>('evem_discount_rules', []);
  // 材料折扣覆写（每物品手动折扣率）
  const [materialDiscounts, setMaterialDiscounts] = useLocalStorage<Record<string, number>>('evem_material_discounts', {});

  // 自定义产品
  const [customBlueprints, setCustomBlueprints] = useLocalStorage<Blueprint[]>('evem_custom_blueprints', []);
  const [customReverse, setCustomReverse] = useLocalStorage<ReverseEngineeringData[]>('evem_custom_reverse', []);
  const [customTreeNodes, setCustomTreeNodes] = useLocalStorage<ProductTreeNode[]>('evem_custom_tree_nodes', []);

  // 自定义蓝图 CRUD
  const addCustomBlueprint = useCallback((bp: Blueprint) => {
    setCustomBlueprints(prev => [...prev, { ...bp, isCustom: true }]);
  }, [setCustomBlueprints]);

  const updateCustomBlueprint = useCallback((id: string, patch: Partial<Blueprint>) => {
    setCustomBlueprints(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }, [setCustomBlueprints]);

  const deleteCustomBlueprint = useCallback((id: string) => {
    setCustomBlueprints(prev => prev.filter(b => b.id !== id));
  }, [setCustomBlueprints]);

  // 自定义逆向配置 CRUD
  const addCustomReverse = useCallback((rev: ReverseEngineeringData) => {
    setCustomReverse(prev => [...prev, { ...rev, isCustom: true }]);
  }, [setCustomReverse]);

  const updateCustomReverse = useCallback((id: string, patch: Partial<ReverseEngineeringData>) => {
    setCustomReverse(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, [setCustomReverse]);

  const deleteCustomReverse = useCallback((id: string) => {
    setCustomReverse(prev => prev.filter(r => r.id !== id));
  }, [setCustomReverse]);

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

  const clearPrice = useCallback((itemId: string) => {
    setConfigs(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      const newPrices = { ...c.prices };
      delete newPrices[itemId];
      return { ...c, prices: newPrices, updatedAt: new Date().toISOString() };
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
    customBlueprints,
    customReverse,
    customTreeNodes,
  }), [configs, customBlueprints, customReverse, customTreeNodes]);

  const importData = useCallback((data: any) => {
    if (data?.priceConfigs) setConfigs(data.priceConfigs);
    if (data?.activeConfigId) setActiveId(data.activeConfigId);
    if (data?.customBlueprints) setCustomBlueprints(data.customBlueprints);
    if (data?.customReverse) setCustomReverse(data.customReverse);
    if (data?.customTreeNodes) setCustomTreeNodes(data.customTreeNodes);
  }, [setConfigs, setActiveId, setCustomBlueprints, setCustomReverse, setCustomTreeNodes]);

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
    // 三层优先级：手动覆写 > 材料清单 > 全局
    if (scope === 'buy' && materialDiscounts[itemId] !== undefined) return materialDiscounts[itemId];
    for (const rule of discountRules) {
      if (rule.scope !== scope) continue;
      if (rule.type === 'item' && rule.targetId === itemId) return rule.rate;
      if (rule.type === 'category' && rule.targetId === category) return rule.rate;
    }
    return null;
  }, [discountRules, materialDiscounts]);

  // 全局效率覆盖（适合跳过技能设施设置的用户）
  const [globalOverrides, setGlobalOverrides] = useLocalStorage<{
    enabled: boolean;
    materialEfficiency: number;
    timeEfficiency: number;
    successRate: number;
  }>('evem_global_overrides', {
    enabled: true,
    materialEfficiency: 1.5,
    timeEfficiency: 1.0,
    successRate: 0,
  });

  // 材料折扣覆写
  const setMaterialDiscount = useCallback((itemId: string, rate: number | null) => {
    setMaterialDiscounts(prev => {
      if (rate === null) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: rate };
    });
  }, [setMaterialDiscounts]);

  const clearMaterialDiscount = useCallback((itemId: string) => {
    setMaterialDiscounts(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, [setMaterialDiscounts]);

  return (
    <AppContext.Provider value={{
      priceConfigs: configs, activeConfigId: activeId,
      customItems: defaultItems, customBlueprints,
      customReverse, customTreeNodes, customDecoders: defaultDecoders,
      getPrice, setPrice, clearPrice, createPriceConfig, deletePriceConfig,
      renamePriceConfig, switchConfig, getAllData, importData,
      // 技能
      skillLevels, setSkillLevels, updateSkillLevel, batchSetSkillLevels,
      // 设施
      activeFacilityIds, setActiveFacilityIds, toggleFacility, customFacility, setCustomFacility,
      // 折扣
      discountRules, setDiscountRules, addDiscountRule, removeDiscountRule, getDiscount,
      // 材料折扣覆写
      materialDiscounts, setMaterialDiscount, clearMaterialDiscount,
      // 全局效率覆盖
      globalOverrides, setGlobalOverrides,
      // 自定义蓝图 CRUD
      addCustomBlueprint, updateCustomBlueprint, deleteCustomBlueprint,
      // 自定义逆向配置 CRUD
      addCustomReverse, updateCustomReverse, deleteCustomReverse,
      setCustomTreeNodes,
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
