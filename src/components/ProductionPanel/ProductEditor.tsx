import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { useProduction } from '../../state/ProductionContext';
import { tagTree } from '../../data/tags';
import type { Blueprint, ReverseEngineeringData, ProductTreeNode } from '../../types';
import styles from './ProductEditor.module.css';

interface MaterialGroup {
  category: string;
  items: Array<{ itemId: string; quantity: number; isBase?: boolean }>;
}

interface Props {
  mode: 'mfg' | 'rev';
  initial?: Blueprint | ReverseEngineeringData;
  onClose: () => void;
}

function getDefaultGroups(mode: 'mfg' | 'rev'): MaterialGroup[] {
  return mode === 'mfg'
    ? [{ category: '矿物', items: [] }, { category: '行星材料', items: [] }]
    : [{ category: '数据核心', items: [] }];
}

export function ProductEditor({ mode, initial, onClose }: Props) {
  const {
    addCustomBlueprint, updateCustomBlueprint,
    addCustomReverse, updateCustomReverse,
    customTreeNodes, setCustomTreeNodes,
  } = useApp();
  const { dispatch } = useProduction();

  const isEdit = !!initial;
  const initBp = mode === 'mfg' ? (initial as Blueprint | undefined) : undefined;
  const initRev = mode === 'rev' ? (initial as ReverseEngineeringData | undefined) : undefined;

  const [name, setName] = useState(initial?.name ?? '');
  const [baseTime, setBaseTime] = useState(
    mode === 'mfg' ? (initBp?.baseTime ?? 3600) : (initRev?.baseTime ?? 1800),
  );
  const [baseCost, setBaseCost] = useState((initial as any)?.baseCost ?? 0);
  const [productQuantity, setProductQuantity] = useState(
    mode === 'mfg' ? (initBp?.productQuantity ?? 1) : 1,
  );

  // 逆向专用字段
  const [baseItemId, setBaseItemId] = useState(initRev?.baseItemId ?? '');
  const [maxItemCount, setMaxItemCount] = useState(initRev?.maxItemCount ?? 1);
  const [maxBaseSR, setMaxBaseSR] = useState(initRev?.maxBaseSuccessRate ?? 0.5);

  // 材料分组
  const [materialGroups, setMaterialGroups] = useState<MaterialGroup[]>(() => {
    if (mode === 'mfg' && initBp) {
      const groups = getDefaultGroups('mfg');
      if (initBp.materials.length > 0) {
        groups[0].items = initBp.materials.map(m => ({ ...m }));
      }
      return groups;
    }
    if (mode === 'rev' && initRev) {
      const groups = getDefaultGroups('rev');
      if (initRev.dataCores.length > 0) {
        groups[0].items = initRev.dataCores.map(d => ({ ...d }));
      }
      return groups;
    }
    return getDefaultGroups(mode);
  });

  // Tag 选择
  const allAvailableTags = [
    ...tagTree.map(t => ({ id: t.id, name: t.name, isCustom: false })),
    ...customTreeNodes
      .filter(n => !tagTree.some(t => t.id === n.id))
      .map(n => ({ id: n.id, name: n.name, isCustom: true })),
  ];
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial?.tags ?? ['custom'],
  );
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId],
    );
  };

  const handleCreateTag = () => {
    const tagName = newTagInput.trim();
    if (!tagName) return;
    const tagId = `tag_custom_${Date.now().toString(36)}`;
    const newNode: ProductTreeNode = {
      id: tagId,
      name: tagName,
      parentId: 'root_custom',
      productIds: mode === 'mfg' ? [initial?.id ?? ''] : [],
      reverseIds: mode === 'rev' ? [initial?.id ?? ''] : [],
      tags: [],
      isCustom: true,
    };
    setCustomTreeNodes(prev => [...prev, newNode]);
    setSelectedTags(prev => [...prev, tagId]);
    setNewTagInput('');
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (mode === 'mfg') {
      const materials = materialGroups.flatMap(g =>
        g.items.map(i => ({ itemId: i.itemId, quantity: i.quantity, isBase: i.isBase })),
      );
      const bpData: Blueprint = {
        id: initial?.id ?? `custom_${Date.now().toString(36)}`,
        name,
        productItemId: initial?.id ?? '',
        productName: name,
        productQuantity,
        baseTime,
        baseCost,
        materials,
        maxRuns: 10,
        tags: selectedTags,
        isCustom: true,
      };
      if (isEdit) {
        updateCustomBlueprint(initial!.id, bpData);
      } else {
        addCustomBlueprint(bpData);
        dispatch({ type: 'SET_MANUFACTURING', payload: { blueprintId: bpData.id } });
      }
    } else {
      const dataCores = materialGroups.flatMap(g =>
        g.items.map(i => ({ itemId: i.itemId, quantity: i.quantity, isBase: i.isBase })),
      );
      const revData: ReverseEngineeringData = {
        id: initial?.id ?? `custom_rev_${Date.now().toString(36)}`,
        name: `${name}逆向`,
        targetBlueprintId: '',
        baseItemId,
        baseItemName: baseItemId,
        maxItemCount,
        maxBaseSuccessRate: maxBaseSR,
        baseTime,
        baseCost,
        dataCores,
        tags: selectedTags,
        isCustom: true,
      };
      if (isEdit) {
        updateCustomReverse(initial!.id, revData);
      } else {
        addCustomReverse(revData);
        dispatch({ type: 'SET_REVERSE', payload: { reverseId: revData.id } });
      }
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

  const toggleItemBase = (groupIdx: number, itemIdx: number) => {
    setMaterialGroups(prev =>
      prev.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              items: g.items.map((it, j) =>
                j === itemIdx ? { ...it, isBase: !it.isBase } : it,
              ),
            }
          : g,
      ),
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h4>{isEdit ? (mode === 'mfg' ? '编辑制造产品' : '编辑逆向配置') : (mode === 'mfg' ? '新建制造产品' : '新建逆向配置')}</h4>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.field}>
          <label>名称</label>
          <input value={name} onChange={e => setName(e.target.value)} />
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
              onChange={e => setProductQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
        )}

        {mode === 'rev' && (
          <>
            <div className={styles.field}>
              <label>基底材料 ID</label>
              <input value={baseItemId} onChange={e => setBaseItemId(e.target.value)} />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>数量上限</label>
                <input
                  type="number"
                  value={maxItemCount}
                  onChange={e => setMaxItemCount(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className={styles.field}>
                <label>最大基础成功率</label>
                <input
                  type="number"
                  step="0.01"
                  value={maxBaseSR}
                  onChange={e => setMaxBaseSR(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </>
        )}

        {/* Tag 选择器 */}
        <div className={styles.field}>
          <label>产品标签</label>
          <div className={styles.tagArea}>
            <div className={styles.tagChips}>
              {selectedTags.map(tagId => {
                const tag = allAvailableTags.find(t => t.id === tagId);
                return (
                  <span key={tagId} className={styles.tagChip}>
                    {tag?.name ?? tagId}
                    <button onClick={() => toggleTag(tagId)}>✕</button>
                  </span>
                );
              })}
            </div>
            <div className={styles.tagRow}>
              <button
                className={styles.tagBtn}
                onClick={() => setShowTagDropdown(!showTagDropdown)}
              >
                + 选择标签
              </button>
              <input
                className={styles.tagNewInput}
                placeholder="新建标签..."
                value={newTagInput}
                onChange={e => setNewTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateTag(); }}
              />
              <button className={styles.tagBtn} onClick={handleCreateTag}>新建</button>
            </div>
            {showTagDropdown && (
              <div className={styles.tagDropdown}>
                {allAvailableTags.map(tag => (
                  <label key={tag.id} className={styles.tagOption}>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                    />
                    {tag.name}
                    {tag.isCustom && <span className={styles.customBadge}>自定义</span>}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 材料区域 */}
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
                  <span className={styles.itemName}>
                    {it.itemId} × {it.quantity}
                  </span>
                  <span className={styles.itemActions}>
                    <label className={styles.baseCheck}>
                      <input
                        type="checkbox"
                        checked={!!it.isBase}
                        onChange={() => toggleItemBase(gi, ii)}
                      />
                      基底
                    </label>
                    <button onClick={() => removeItemFromGroup(gi, ii)}>✕</button>
                  </span>
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
