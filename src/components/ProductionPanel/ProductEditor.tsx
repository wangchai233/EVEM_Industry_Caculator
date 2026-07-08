import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { useProduction } from '../../state/ProductionContext';
import type { Blueprint, ReverseEngineeringData } from '../../types';
import styles from './ProductEditor.module.css';

interface MaterialGroup {
  category: string;
  items: Array<{ itemId: string; quantity: number }>;
}

interface Props {
  mode: 'mfg' | 'rev';
  initial?: Blueprint | ReverseEngineeringData;
  onClose: () => void;
}

function getDefaultGroups(mode: 'mfg'): MaterialGroup[] {
  return mode === 'mfg'
    ? [{ category: '矿物', items: [] }, { category: '行星材料', items: [] }]
    : [{ category: '数据核心', items: [] }];
}

export function ProductEditor({ mode, initial, onClose }: Props) {
  const { addCustomBlueprint, addCustomReverse } = useApp();
  const { dispatch } = useProduction();

  const [name, setName] = useState(initial?.name ?? '');
  const [baseTime, setBaseTime] = useState(
    mode === 'mfg'
      ? (initial as Blueprint | undefined)?.baseTime ?? 3600
      : (initial as ReverseEngineeringData | undefined)?.baseTime ?? 1800,
  );
  const [baseCost, setBaseCost] = useState(
    (initial as any)?.baseCost ?? 0,
  );
  const [productQuantity, setProductQuantity] = useState(
    mode === 'mfg' ? (initial as Blueprint | undefined)?.productQuantity ?? 1 : 1,
  );

  // 逆向专用字段
  const [baseItemId, setBaseItemId] = useState(
    (initial as ReverseEngineeringData | undefined)?.baseItemId ?? '',
  );
  const [maxItemCount, setMaxItemCount] = useState(
    (initial as ReverseEngineeringData | undefined)?.maxItemCount ?? 1,
  );
  const [maxBaseSR, setMaxBaseSR] = useState(
    (initial as ReverseEngineeringData | undefined)?.maxBaseSuccessRate ?? 0.5,
  );

  // 材料：从 initial 中提取已有的分组，否则用默认分组
  const [materialGroups, setMaterialGroups] = useState<MaterialGroup[]>(() => {
    if (mode === 'mfg' && initial) {
      // 将扁平材料列表归入默认分组（简单策略：都放在第一个分组）
      const bp = initial as Blueprint;
      const groups = getDefaultGroups('mfg');
      if (bp.materials.length > 0) {
        groups[0].items = bp.materials.map(m => ({ ...m }));
      }
      return groups;
    }
    if (mode === 'rev' && initial) {
      const rev = initial as ReverseEngineeringData;
      const groups = getDefaultGroups('rev');
      if (rev.dataCores.length > 0) {
        groups[0].items = rev.dataCores.map(d => ({ ...d }));
      }
      return groups;
    }
    return getDefaultGroups(mode);
  });

  const handleSave = () => {
    if (!name.trim()) return;
    if (mode === 'mfg') {
      const id = `custom_${Date.now().toString(36)}`;
      const materials = materialGroups.flatMap(g =>
        g.items.map(i => ({ itemId: i.itemId, quantity: i.quantity })),
      );
      const bp: Blueprint = {
        id,
        name,
        productItemId: id,
        productName: name,
        productQuantity,
        baseTime,
        baseCost,
        materials,
        maxRuns: 10,
        tags: ['custom'],
        isCustom: true,
      };
      addCustomBlueprint(bp);
      dispatch({ type: 'SET_MANUFACTURING', payload: { blueprintId: bp.id } });
    } else {
      const id = `custom_rev_${Date.now().toString(36)}`;
      const dataCores = materialGroups.flatMap(g =>
        g.items.map(i => ({ itemId: i.itemId, quantity: i.quantity })),
      );
      const rev: ReverseEngineeringData = {
        id,
        name: `${name}逆向`,
        targetBlueprintId: '',
        baseItemId,
        baseItemName: baseItemId,
        maxItemCount,
        maxBaseSuccessRate: maxBaseSR,
        baseTime,
        baseCost,
        dataCores,
        tags: ['custom'],
        isCustom: true,
      };
      addCustomReverse(rev);
      dispatch({ type: 'SET_REVERSE', payload: { reverseId: rev.id } });
    }
    onClose();
  };

  const addGroup = () => {
    const cat = prompt('材料类别名称:', '新材料');
    if (cat) setMaterialGroups(prev => [...prev, { category: cat, items: [] }]);
  };

  const removeGroup = (idx: number) => {
    setMaterialGroups(prev => prev.filter((_, i) => i !== idx));
  };

  const addItemToGroup = (groupIdx: number) => {
    const itemId = prompt('物品 ID:');
    const qty = parseInt(prompt('数量:') || '0', 10);
    if (itemId && qty > 0) {
      setMaterialGroups(prev =>
        prev.map((g, i) =>
          i === groupIdx
            ? { ...g, items: [...g.items, { itemId, quantity: qty }] }
            : g,
        ),
      );
    }
  };

  const removeItemFromGroup = (groupIdx: number, itemIdx: number) => {
    setMaterialGroups(prev =>
      prev.map((g, i) =>
        i === groupIdx
          ? { ...g, items: g.items.filter((_, j) => j !== itemIdx) }
          : g,
      ),
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h4>{mode === 'mfg' ? '编辑制造产品' : '编辑逆向配置'}</h4>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.field}>
          <label>名称</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>基础时间 (秒)</label>
            <input
              type="number"
              value={baseTime}
              onChange={e => setBaseTime(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className={styles.field}>
            <label>现金费用</label>
            <input
              type="number"
              value={baseCost}
              onChange={e => setBaseCost(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {mode === 'mfg' && (
          <div className={styles.field}>
            <label>产物数量</label>
            <input
              type="number"
              value={productQuantity}
              onChange={e =>
                setProductQuantity(parseInt(e.target.value) || 1)
              }
            />
          </div>
        )}

        {mode === 'rev' && (
          <>
            <div className={styles.field}>
              <label>基底材料 ID</label>
              <input
                value={baseItemId}
                onChange={e => setBaseItemId(e.target.value)}
              />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>数量上限</label>
                <input
                  type="number"
                  value={maxItemCount}
                  onChange={e =>
                    setMaxItemCount(parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className={styles.field}>
                <label>最大基础成功率</label>
                <input
                  type="number"
                  step="0.01"
                  value={maxBaseSR}
                  onChange={e =>
                    setMaxBaseSR(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </>
        )}

        <div className={styles.materials}>
          <label>材料</label>
          {materialGroups.map((g, gi) => (
            <div key={gi} className={styles.group}>
              <div className={styles.groupHeader}>
                <span>{g.category}</span>
                <button onClick={() => removeGroup(gi)}>✕</button>
              </div>
              {g.items.map((it, ii) => (
                <div key={ii} className={styles.item}>
                  <span>
                    {it.itemId} × {it.quantity}
                  </span>
                  <button onClick={() => removeItemFromGroup(gi, ii)}>✕</button>
                </div>
              ))}
              <button
                className={styles.addItemBtn}
                onClick={() => addItemToGroup(gi)}
              >
                + 添加材料
              </button>
            </div>
          ))}
          <button className={styles.addGroupBtn} onClick={addGroup}>
            + 添加材料类别
          </button>
        </div>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
