import { useProduction } from '../../state/ProductionContext';

// v2: 时间效率由技能、设施、解码器加成管线统一管理，不再需要用户手动输入

export function EfficiencyConfig() {
  const {} = useProduction();
  return null;
}
