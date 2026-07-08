import { useEffect } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { getBlueprintById, getReverseById, getDecoderById } from '../../data';
import { defaultSkills } from '../../data/skills';
import { calculateManufacturing } from '../../engine/manufacturing';
import { calculateReverse } from '../../engine/reverse';
import { resolveBonuses } from '../../engine/resolver';
import { ProjectTypeTabs } from './ProjectTypeTabs';
import { ProductSelector } from './ProductSelector';
import { EfficiencyConfig } from './EfficiencyConfig';
import { DecoderSelector } from './DecoderSelector';
import { MaterialList } from './MaterialList';
import { ProductionSummary } from './ProductionSummary';
import { ReverseExtras } from './ReverseExtras';
import styles from './ProductionPanel.module.css';

export function ProductionPanel() {
  const { state, dispatch } = useProduction();
  const { getPrice, skillLevels, customFacility, getDiscount } = useApp();

  useEffect(() => {
    if (state.projectType === 'manufacturing') {
      const bp = getBlueprintById(state.manufacturing.blueprintId);
      if (!bp) { dispatch({ type: 'SET_RESULT', payload: null }); return; }
      const decoder = state.manufacturing.decoderId
        ? getDecoderById(state.manufacturing.decoderId)
        : undefined;
      const productTags = bp.tags;
      const bonuses = resolveBonuses(productTags, defaultSkills, skillLevels, undefined, customFacility, decoder);
      const discountWrapper = (itemId: string) => getDiscount(itemId, 'buy');
      const result = calculateManufacturing(state.manufacturing, bp, decoder, getPrice, bonuses, discountWrapper);
      dispatch({ type: 'SET_RESULT', payload: result });
    } else {
      const rev = getReverseById(state.reverse.reverseId);
      if (!rev) { dispatch({ type: 'SET_RESULT', payload: null }); return; }
      const decoder = state.reverse.decoderId
        ? getDecoderById(state.reverse.decoderId)
        : undefined;
      const productTags = rev.tags;
      const bonuses = resolveBonuses(productTags, defaultSkills, skillLevels, undefined, customFacility, decoder);
      const result = calculateReverse(state.reverse, rev, decoder, getPrice, bonuses);
      dispatch({ type: 'SET_RESULT', payload: result });
    }
  }, [state.manufacturing, state.reverse, state.projectType, getPrice, dispatch, skillLevels, customFacility, getDiscount]);

  return (
    <div className={styles.panel}>
      <ProjectTypeTabs />
      <ProductSelector />
      <EfficiencyConfig />
      <DecoderSelector />
      {state.projectType === 'reverse' && <ReverseExtras />}
      <MaterialList />
      <ProductionSummary />
    </div>
  );
}
