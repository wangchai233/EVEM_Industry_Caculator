import { useRef } from 'react';
import { useApp } from '../../state/AppContext';
import styles from './ImportExportBar.module.css';

export function ImportExportBar() {
  const { getAllData, importData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evem-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.version !== undefined) {
          importData(data);
          alert('数据导入成功！');
        } else {
          alert('无效的数据文件格式。');
        }
      } catch {
        alert('JSON 解析失败，请检查文件格式。');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (confirm('确定要重置为默认数据吗？所有自定义价格配置将丢失。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={styles.bar}>
      <button className={styles.btn} onClick={handleExport}>导出数据</button>
      <button className={styles.btn} onClick={() => fileInputRef.current?.click()}>导入数据</button>
      <button className={styles.btnDanger} onClick={handleReset}>重置</button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
    </div>
  );
}
