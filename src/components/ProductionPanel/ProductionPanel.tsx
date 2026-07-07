import { useEffect } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { getBlueprintById, getReverseById, getDecoderById } from '../../data';
import { calculateManufacturing } from '../../engine/manufacturing';
import { calculateReverse } from '../../engine/reverse';
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
  const { getPrice } = useApp();

  useEffect(() => {
    if (state.projectType === 'manufacturing') {
      const bp = getBlueprintById(state.manufacturing.blueprintId);
      if (!bp) { dispatch({ type: 'SET_RESULT', payload: null }); return; }
      const decoder = getDecoderById(state.manufacturing.decoderId ?? 'decoder_none');
      const result = calculateManufacturing(state.manufacturing, bp, decoder, getPrice);
      dispatch({ type: 'SET_RESULT', payload: result });
    } else {
      const rev = getReverseById(state.reverse.reverseId);
      if (!rev) { dispatch({ type: 'SET_RESULT', payload: null }); return; }
      const decoder = getDecoderById(state.reverse.decoderId ?? 'decoder_none');
      const result = calculateReverse(state.reverse, rev, decoder, getPrice);
      dispatch({ type: 'SET_RESULT', payload: result });
    }
  }, [state.manufacturing, state.reverse, state.projectType, getPrice, dispatch]);

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
