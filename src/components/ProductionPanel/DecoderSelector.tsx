import { useProduction } from '../../state/ProductionContext';
import { defaultDecoders } from '../../data/decoders';
import type { Decoder } from '../../types/blueprint';
import styles from './ProductionPanel.module.css';

const NO_DECODER: Decoder = {
  id: '',
  name: '无解码器',
  category: 'mfg',
  materialEfficiency: 0,
  timeEfficiency: 0,
  runBonus: 0,
  successRate: 0,
};

function getNoDecoder(isMfg: boolean): Decoder {
  return { ...NO_DECODER, category: isMfg ? 'mfg' : 'rev' };
}

export function DecoderSelector() {
  const { state, dispatch } = useProduction();

  const isMfg = state.projectType === 'manufacturing';
  const availableDecoders = defaultDecoders.filter(d => d.category === (isMfg ? 'mfg' : 'rev'));
  const allOptions = [getNoDecoder(isMfg), ...availableDecoders];
  const decoderId = isMfg ? state.manufacturing.decoderId : state.reverse.decoderId;
  const selected = allOptions.find(d => d.id === decoderId);

  const setDecoder = (id: string) => {
    const payload = id ? { decoderId: id } : { decoderId: undefined };
    if (isMfg) dispatch({ type: 'SET_MANUFACTURING', payload });
    else dispatch({ type: 'SET_REVERSE', payload });
  };

  return (
    <div className={styles.section}>
      <label className={styles.label}>解码器</label>
      <select
        className={styles.select}
        value={decoderId ?? ''}
        onChange={e => setDecoder(e.target.value)}
      >
        {allOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      {selected && selected.id && (
        <div className={styles.decoderPreview}>
          {selected.materialEfficiency !== 0 && (
            <span>材料效率: {(selected.materialEfficiency * 100).toFixed(0)}%</span>
          )}
          <span>时间效率: {(selected.timeEfficiency * 100).toFixed(0)}%</span>
          {selected.runBonus > 0 && <span>流程: +{selected.runBonus}</span>}
          {selected.successRate !== 0 && (
            <span>成功率: {(selected.successRate * 100).toFixed(0)}%</span>
          )}
        </div>
      )}
    </div>
  );
}
