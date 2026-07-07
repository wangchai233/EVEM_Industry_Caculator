import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import styles from './Header.module.css';

export function Header() {
  const { priceConfigs, activeConfigId, switchConfig, createPriceConfig, renamePriceConfig, deletePriceConfig } = useApp();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      createPriceConfig(newName.trim());
      setNewName('');
      setShowConfigModal(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renamePriceConfig(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>EVEM 工业计算器</h1>
      <div className={styles.configArea}>
        <label>价格方案：</label>
        <select
          value={activeConfigId}
          onChange={e => switchConfig(e.target.value)}
          className={styles.select}
        >
          {priceConfigs.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          className={styles.btn}
          onClick={() => setShowConfigModal(!showConfigModal)}
        >
          管理
        </button>
      </div>

      {showConfigModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>价格方案管理</h3>
            <div className={styles.configList}>
              {priceConfigs.map(c => (
                <div key={c.id} className={styles.configItem}>
                  {editingId === c.id ? (
                    <>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={() => handleRename(c.id)}
                        onKeyDown={e => e.key === 'Enter' && handleRename(c.id)}
                        autoFocus
                      />
                    </>
                  ) : (
                    <span className={c.id === activeConfigId ? styles.active : ''}>
                      {c.name}
                    </span>
                  )}
                  <div className={styles.configActions}>
                    <button onClick={() => { setEditingId(c.id); setEditName(c.name); }}>重命名</button>
                    {c.id !== 'default' && (
                      <button onClick={() => deletePriceConfig(c.id)}>删除</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.newConfig}>
              <input
                placeholder="新方案名称"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <button onClick={handleCreate}>创建</button>
            </div>
            <button onClick={() => setShowConfigModal(false)}>关闭</button>
          </div>
        </div>
      )}
    </header>
  );
}
