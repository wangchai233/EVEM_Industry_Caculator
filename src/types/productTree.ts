export interface ProductTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  productIds: string[];     // 此节点下的蓝图ID（叶子节点）
  reverseIds: string[];     // 此节点下的逆向配置ID（叶子节点）
  tags: string[];           // 从此节点继承的标签
  isCustom: boolean;         // 自定义分类
}
