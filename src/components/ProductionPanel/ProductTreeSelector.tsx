import React, { useState, useMemo } from 'react';
import { useProduction } from '../../state/ProductionContext';
import { useApp } from '../../state/AppContext';
import { defaultTree, mergeCustomTree } from '../../data/productTree';
import { defaultBlueprints, defaultReverse } from '../../data';
import type { ProductTreeNode } from '../../types/productTree';
import styles from './ProductTreeSelector.module.css';

interface Props {
  onOpenEditor?: () => void;
}

interface TreeNodeWithChildren extends ProductTreeNode {
  children: TreeNodeWithChildren[];
  depth: number;
}

function buildTree(
  nodes: ProductTreeNode[], parentId: string | null, depth: number,
): TreeNodeWithChildren[] {
  return nodes
    .filter(n => n.parentId === parentId)
    .map(n => ({ ...n, depth, children: buildTree(nodes, n.id, depth + 1) }));
}

function matchSearch(node: TreeNodeWithChildren, query: string): boolean {
  if (node.name.toLowerCase().includes(query)) return true;
  const allBps = [...defaultBlueprints, ...defaultReverse];
  for (const pid of node.productIds) {
    const bp = allBps.find(b => b.id === pid);
    if (bp?.name.toLowerCase().includes(query)) return true;
  }
  for (const rid of node.reverseIds) {
    const rev = allBps.find(r => r.id === rid);
    if (rev?.name.toLowerCase().includes(query)) return true;
  }
  return node.children.some(c => matchSearch(c, query));
}

export function ProductTreeSelector({ onOpenEditor }: Props) {
  const { state, dispatch } = useProduction();
  const { customBlueprints, customReverse, customTreeNodes } = useApp();
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const allNodes = useMemo(() => {
    // 将自定义产品挂到自定义分类节点下
    const customCat = defaultTree.find(n => n.id === 'root_custom')!;
    const mergedCustomIds = [...new Set([
      ...customCat.productIds,
      ...customBlueprints.map(b => b.id),
    ])];
    const mergedCustomRevIds = [...new Set([
      ...customCat.reverseIds,
      ...customReverse.map(r => r.id),
    ])];
    const updatedNodes = defaultTree.map(n => {
      if (n.id === 'root_custom') {
        return { ...n, productIds: mergedCustomIds, reverseIds: mergedCustomRevIds };
      }
      return n;
    });
    return mergeCustomTree(updatedNodes, customTreeNodes);
  }, [customBlueprints, customReverse, customTreeNodes]);

  const tree = useMemo(() => buildTree(allNodes, null, 0), [allNodes]);

  const searchLower = search.toLowerCase().trim();

  // 搜索时自动展开匹配分支
  const visibleExpanded = useMemo(() => {
    if (!searchLower) return expandedIds;
    const autoExpand = new Set(expandedIds);
    function walk(nodes: TreeNodeWithChildren[]) {
      for (const n of nodes) {
        if (matchSearch(n, searchLower)) {
          autoExpand.add(n.id);
          let p = n.parentId;
          while (p) {
            autoExpand.add(p);
            const parent = allNodes.find(x => x.id === p);
            p = parent?.parentId ?? null;
          }
        }
        walk(n.children);
      }
    }
    walk(tree);
    return autoExpand;
  }, [searchLower, expandedIds, tree, allNodes]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allBps = [...defaultBlueprints, ...customBlueprints];
  const allRevs = [...defaultReverse, ...customReverse];

  const selectedId = state.projectType === 'manufacturing'
    ? state.manufacturing.blueprintId
    : state.reverse.reverseId;

  const handleSelectProduct = (bpId: string) => {
    dispatch({ type: 'SET_MANUFACTURING', payload: { blueprintId: bpId } });
  };

  const handleSelectReverse = (revId: string) => {
    dispatch({ type: 'SET_REVERSE', payload: { reverseId: revId } });
  };

  const items = state.projectType === 'manufacturing' ? allBps : allRevs;
  const handleSelectItem = state.projectType === 'manufacturing' ? handleSelectProduct : handleSelectReverse;
  const idField = state.projectType === 'manufacturing' ? 'productIds' : 'reverseIds' as const;

  function renderNode(node: TreeNodeWithChildren): React.JSX.Element {
    const isExpanded = visibleExpanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const productList = items.filter(b => (node as any)[idField]?.includes(b.id));

    return (
      <div key={node.id} style={{ paddingLeft: node.depth * 16 }}>
        <div
          className={`${styles.nodeRow} ${isExpanded ? styles.expanded : ''}`}
          onClick={() => hasChildren ? toggleExpand(node.id) : undefined}
        >
          {hasChildren && <span className={styles.arrow}>{isExpanded ? '▼' : '▶'}</span>}
          <span className={styles.nodeName}>
            {node.isCustom && '⚙️ '}{node.name}
          </span>
        </div>
        {isExpanded && (
          <div>
            {node.children.map(renderNode)}
            {productList.map(bp => (
              <div
                key={bp.id}
                className={`${styles.leafRow} ${selectedId === bp.id ? styles.selected : ''}`}
                style={{ paddingLeft: (node.depth + 1) * 16 }}
                onClick={() => handleSelectItem(bp.id)}
              >
                {bp.isCustom ? '⚙️ ' : ''}{bp.name}
              </div>
            ))}
            {node.id === 'root_custom' && (
              <div
                className={styles.addBtn}
                style={{ paddingLeft: (node.depth + 1) * 16 }}
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
        {tree.map(renderNode)}
      </div>
    </div>
  );
}
