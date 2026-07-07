import { useProduction } from '../../state/ProductionContext';
import { defaultDecoders } from '../../data';
import styles from './ProductionPanel.module.css';

export function DecoderSelector() {
  const { state, dispatch } = useProduction();

  const decoderId = state.projectType === 'manufacturing'
    ? state.manufacturing.decoderId
    : state.reverse.decoderId;

  const setDecoder = (id?: string) => {
    if (state.projectType === 'manufacturing') {
      dispatch({ type: 'SET_MANUFACTURING', payload: { decoderId: id } });
    } else {
      dispatch({ type: 'SET_REVERSE', payload: { decoderId: id } });
    }
  };

  const selected = defaultDecoders.find(d => d.id === decoderId);

  return (
    <div className={styles.section}>
      <label className={styles.label}>解码器</label>
      <select
        className={styles.select}
        value={decoderId ?? 'decoder_none'}
        onChange={e => setDecoder(e.target.value === 'decoder_none' ? undefined : e.target.value)}
      >
        {defaultDecoders.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      {selected && selected.id !== 'decoder_none' && (
        <div className={styles.decoderPreview}>
          <span>ME: ×{selected.meBonus}</span>
          <span>TE: ×{selected.teBonus}</span>
          {selected.runBonus > 0 && <span>流程: +{selected.runBonus}</span>}
        </div>
      )}
    </div>
  );
}
