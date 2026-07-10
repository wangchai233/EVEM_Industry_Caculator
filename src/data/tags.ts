export interface TagNode {
  id: string;
  name: string;
  parentTags: string[]; // 该节点自动继承的父级标签
}

export const tagTree: TagNode[] = [
  { id: 'ship', name: '舰船', parentTags: [] },
  { id: 'ship_regular', name: '常规舰船', parentTags: ['ship'] },
  { id: 'frigate', name: '护卫舰', parentTags: ['ship', 'ship_regular'] },
  { id: 'frigate_intercepter', name: '截击护卫舰', parentTags: ['ship', 'ship_regular', 'frigate']},
  { id: 'destroyer', name: '驱逐舰', parentTags: ['ship', 'ship_regular'] },
  { id: 'cruiser', name: '巡洋舰', parentTags: ['ship', 'ship_regular'] },
  { id: 'battlecruiser', name: '战列巡洋舰', parentTags: ['ship', 'ship_regular'] },
  { id: 'battleship', name: '战列舰', parentTags: ['ship', 'ship_regular'] },
  { id: 'battleship_basic', name: '基础战列舰', parentTags: ['ship', 'ship_regular', 'battleship'] },
  { id: 'battleship_bomber', name: '轰炸战列舰', parentTags: ['ship', 'ship_regular', 'battleship'] },
  /*
  { id: 'caldari', name: '加达里', parentTags: [] },
  { id: 'gallente', name: '盖伦特', parentTags: [] },
  { id: 'amarr', name: '艾玛', parentTags: [] },
  { id: 'minmatar', name: '米玛塔尔', parentTags: [] },
  { id: 'interceptor', name: '截击型', parentTags: [] },
   */
];

// 计算节点的完整标签列表（含继承）
export function resolveTags(nodeId: string): string[] {
  const node = tagTree.find(n => n.id === nodeId);
  if (!node) return [nodeId];
  const tags = new Set<string>();
  for (const p of node.parentTags) {
    tags.add(p);
    for (const t of resolveTags(p)) tags.add(t);
  }
  tags.add(nodeId);
  return [...tags];
}
