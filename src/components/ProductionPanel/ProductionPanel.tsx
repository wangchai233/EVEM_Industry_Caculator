import { useEffect, useState } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { getBlueprintById, getReverseById, getDecoderById } from '../../data';
import { getFacilityById } from '../../data/facilities';
import { defaultSkills } from '../../data/skills';
import { calculateManufacturing } from '../../engine/manufacturing';
import { calculateReverse } from '../../engine/reverse';
import { resolveBonuses } from '../../engine/resolver';
import { ProjectTypeTabs } from './ProjectTypeTabs';
import { ProductTreeSelector } from './ProductTreeSelector';
import { ProductEditor } from './ProductEditor';
import { EfficiencyConfig } from './EfficiencyConfig';
import { DecoderSelector } from './DecoderSelector';
import { MaterialList } from './MaterialList';
import { ProductionSummary } from './ProductionSummary';
import { ReverseExtras } from './ReverseExtras';
import styles from './ProductionPanel.module.css';

export function ProductionPanel() {
  const { state, dispatch } = useProduction();
  const { getPrice, skillLevels, customFacility, getDiscount, globalOverrides, customBlueprints, customReverse, activeFacilityIds } = useApp();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; mode: 'mfg' | 'rev' } | null>(null);
  const [ignoreUnsetPrice, setIgnoreUnsetPrice] = useState(false);
  const [roundQuantities, setRoundQuantities] = useState(true);
  const handleCloseEditor = () => { setEditorOpen(false); setEditTarget(null); };

  const getPriceWithIgnore = (itemId: string): number | null => {
    const price = getPrice(itemId);
    return price ?? (ignoreUnsetPrice ? 0 : null);
  };

  const handleEditProduct = (id: string, mode: 'mfg' | 'rev') => {
    setEditTarget({ id, mode });
    setEditorOpen(true);
  };

  const initialData = editTarget
    ? editTarget.mode === 'mfg'
      ? customBlueprints.find(b => b.id === editTarget.id)
      : customReverse.find(r => r.id === editTarget.id)
    : undefined;

  useEffect(() => {
    const activeFacilities = activeFacilityIds.map(id => getFacilityById(id)).filter((f): f is NonNullable<typeof f> => f != null);

    if (state.projectType === 'manufacturing') {
      const bp = getBlueprintById(state.manufacturing.blueprintId, customBlueprints);
      if (!bp) { dispatch({ type: 'SET_RESULT', payload: null }); return; }
      const decoder = state.manufacturing.decoderId
        ? getDecoderById(state.manufacturing.decoderId)
        : undefined;
      const productTags = bp.tags;
      let bonuses = resolveBonuses(productTags, defaultSkills, skillLevels, activeFacilities, customFacility, decoder, 'mfg');

      // 全局覆盖：skills.ME 在引擎中会被 1.5 − skills.ME，所以要设成 1.5 − target
      // TE 引擎用 1+skills.TE，所以要设成 targetTE − 1
      if (globalOverrides.enabled) {
        bonuses.skills.materialEfficiency = 1.5 - globalOverrides.materialEfficiency;
        bonuses.skills.timeEfficiency = globalOverrides.timeEfficiency - 1.0;
        bonuses.skills.successRate = globalOverrides.successRate;
        bonuses.facilities.materialEfficiency = 0;
        bonuses.facilities.timeEfficiency = 0;
        bonuses.facilities.successRate = 0;
        bonuses.decoder.materialEfficiency = 0;
        bonuses.decoder.timeEfficiency = 0;
        bonuses.decoder.successRate = 0;
      }

      const discountWrapper = (itemId: string) => getDiscount(itemId, 'buy');
      const result = calculateManufacturing(state.manufacturing, bp, decoder, getPriceWithIgnore, bonuses, discountWrapper, roundQuantities);
      dispatch({ type: 'SET_RESULT', payload: result });
    } else {
      const rev = getReverseById(state.reverse.reverseId, customReverse);
      if (!rev) { dispatch({ type: 'SET_RESULT', payload: null }); return; }
      const decoder = state.reverse.decoderId
        ? getDecoderById(state.reverse.decoderId)
        : undefined;
      const productTags = rev.tags;
      let bonuses = resolveBonuses(productTags, defaultSkills, skillLevels, activeFacilities, customFacility, decoder, 'rev');

      if (globalOverrides.enabled) {
        bonuses.skills.materialEfficiency = 1.5 - globalOverrides.materialEfficiency;
        bonuses.skills.timeEfficiency = globalOverrides.timeEfficiency - 1.0;
        bonuses.skills.successRate = globalOverrides.successRate;
        bonuses.facilities.materialEfficiency = 0;
        bonuses.facilities.timeEfficiency = 0;
        bonuses.facilities.successRate = 0;
        bonuses.decoder.materialEfficiency = 0;
        bonuses.decoder.timeEfficiency = 0;
        bonuses.decoder.successRate = 0;
      }

      const result = calculateReverse(state.reverse, rev, decoder, getPriceWithIgnore, bonuses, roundQuantities);
      dispatch({ type: 'SET_RESULT', payload: result });
    }
  }, [state.manufacturing, state.reverse, state.projectType, getPrice, dispatch, skillLevels, customFacility, getDiscount, globalOverrides, customBlueprints, customReverse, ignoreUnsetPrice, roundQuantities, activeFacilityIds]);

  return (
    <div className={styles.panel}>
      <ProjectTypeTabs />
      <ProductTreeSelector onOpenEditor={() => setEditorOpen(true)} onEditProduct={handleEditProduct} />
      <EfficiencyConfig />
      <DecoderSelector />
      {state.projectType === 'reverse' && <ReverseExtras />}
      <div className={styles.section}>
        <div className={styles.toggleRow}>
          <span>忽略未填价格</span>
          <div
            className={`${styles.toggle} ${ignoreUnsetPrice ? styles.toggleOn : ''}`}
            onClick={() => setIgnoreUnsetPrice(!ignoreUnsetPrice)}
          >
            <div className={styles.toggleKnob} />
          </div>
        </div>
        <div className={styles.toggleRow}>
          <span>材料数量取整（建议保持开启）</span>
          <div
            className={`${styles.toggle} ${roundQuantities ? styles.toggleOn : ''}`}
            onClick={() => setRoundQuantities(!roundQuantities)}
          >
            <div className={styles.toggleKnob} />
          </div>
        </div>
      </div>
      <MaterialList />
      <ProductionSummary />
      {editorOpen && (
        <ProductEditor
          mode={state.projectType === 'manufacturing' ? 'mfg' : 'rev'}
          initial={initialData}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}