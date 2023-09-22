export default class TreeNode {
  name: string;
  isCodeownersLeaf: boolean;
  isRoot: boolean;
  children: Record<string, TreeNode>;

  constructor(
    name: string,
    isCodeownersLeaf: boolean,
    isRoot: boolean = false
  ) {
    this.name = name;
    this.isCodeownersLeaf = isCodeownersLeaf;
    this.isRoot = isRoot;
    this.children = {};
  }
}
