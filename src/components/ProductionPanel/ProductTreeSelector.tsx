import React, { useState } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { defaultTree, mergeCustomTree } from '../../data/productTree';
import { defaultBlueprints, defaultReverse } from '../../data';
import type { ProductTreeNode } from '../../types/productTree';
import styles from './ProductTreeSelector.module.css';

interface Props {
  onOpenEditor?: () => void;
}

export function ProductTreeSelector({ onOpenEditor }: Props) {
  const { state, dispatch } = useProduction();
  const { customBlueprints, customReverse, customTreeNodes } = useApp();
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // 初始展开根级
    const roots = defaultTree.filter(n => n.parentId === null);
    return new Set(roots.map(n => n.id));
  });

  const isMfg = state.projectType === 'manufacturing';
  const idField = isMfg ? 'productIds' : 'reverseIds' as const;
  const allItems = isMfg
    ? [...defaultBlueprints, ...customBlueprints]
    : [...defaultReverse, ...customReverse];

  // 构建树节点列表（合并自定义数据）
  const allNodes: ProductTreeNode[] = (() => {
    const customCat = defaultTree.find(n => n.id === 'root_custom')!;
    const mergedCustomIds = isMfg
      ? [...new Set([...customCat.productIds, ...customBlueprints.map(b => b.id)])]
      : [...new Set([...customCat.reverseIds, ...customReverse.map(r => r.id)])];
    const updated = defaultTree.map(n => {
      if (n.id === 'root_custom') {
        return {
          ...n,
          productIds: isMfg ? mergedCustomIds : [],
          reverseIds: isMfg ? [] : mergedCustomIds,
        };
      }
      return n;
    });
    return mergeCustomTree(updated, customTreeNodes);
  })();

  // 获取节点的子节点
  const getChildren = (parentId: string | null): ProductTreeNode[] =>
    allNodes.filter(n => n.parentId === parentId);

  // 获取节点下的产品列表
  const getProducts = (node: ProductTreeNode) => {
    const ids: string[] = (node as any)[idField] || [];
    return allItems.filter(bp => ids.includes(bp.id));
  };

  // 搜索时自动展开匹配分支
  const searchLower = search.toLowerCase().trim();
  const nodeMatches = (node: ProductTreeNode): boolean => {
    if (searchLower && node.name.toLowerCase().includes(searchLower)) return true;
    const products = getProducts(node);
    for (const p of products) {
      const displayName = isMfg ? (p as any).productName || p.name : p.name;
      if (displayName.toLowerCase().includes(searchLower)) return true;
    }
    return false;
  };

  // 搜索时计算可见展开状态
  const getVisibleExpanded = (): Set<string> => {
    if (!searchLower) return expandedIds;
    const autoExpand = new Set<string>();
    function walk(node: ProductTreeNode) {
      const children = getChildren(node.id);
      let anyChildMatch = false;
      for (const child of children) {
        if (walk(child)) anyChildMatch = true;
      }
      const products = getProducts(node);
      const prodMatch = products.some(p => {
        const dn = isMfg ? (p as any).productName || p.name : p.name;
        return dn.toLowerCase().includes(searchLower);
      });
      if (nodeMatches(node) || prodMatch || anyChildMatch) {
        autoExpand.add(node.id);
      }
      return nodeMatches(node) || prodMatch || anyChildMatch;
    }
    getChildren(null).forEach(walk);
    return autoExpand;
  };

  const visibleExpanded = getVisibleExpanded();

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectedId = isMfg
    ? state.manufacturing.blueprintId
    : state.reverse.reverseId;

  const handleSelect = (id: string) => {
    if (isMfg) {
      dispatch({ type: 'SET_MANUFACTURING', payload: { blueprintId: id } });
    } else {
      dispatch({ type: 'SET_REVERSE', payload: { reverseId: id } });
    }
  };

  // 递归渲染节点
  function renderNode(node: ProductTreeNode, depth: number): React.JSX.Element {
    const children = getChildren(node.id);
    const products = getProducts(node);
    const isExpanded = visibleExpanded.has(node.id);
    const hasChildren = children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={`${styles.nodeRow} ${isExpanded ? styles.expanded : ''}`}
          style={{ paddingLeft: depth * 16 }}
          onClick={() => hasChildren ? toggleExpand(node.id) : undefined}
        >
          {hasChildren && <span className={styles.arrow}>{isExpanded ? '▼' : '▶'}</span>}
          {!hasChildren && <span className={styles.arrow} />}
          <span className={styles.nodeName}>
            {node.isCustom ? '⚙️ ' : ''}{node.name}
          </span>
        </div>
        {isExpanded && (
          <div>
            {products.map(bp => {
              const displayName = isMfg ? (bp as any).productName || bp.name : bp.name;
              return (
                <div
                  key={bp.id}
                  className={`${styles.leafRow} ${selectedId === bp.id ? styles.selected : ''}`}
                  style={{ paddingLeft: (depth + 1) * 16 }}
                  onClick={() => handleSelect(bp.id)}
                >
                  {bp.isCustom ? '⚙️ ' : ''}{displayName}
                </div>
              );
            })}
            {children.map(child => renderNode(child, depth + 1))}
            {node.id === 'root_custom' && (
              <div
                className={styles.addBtn}
                style={{ paddingLeft: (depth + 1) * 16 }}
                onClick={() => onOpenEditor?.()}
              >
                + 新建产品
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <label className={styles.label}>选择产品</label>
      <input
        className={styles.searchInput}
        placeholder="搜索产品..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className={styles.tree}>
        {getChildren(null).map(n => renderNode(n, 0))}
      </div>
    </div>
  );
}
