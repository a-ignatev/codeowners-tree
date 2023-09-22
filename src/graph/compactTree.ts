import TreeNode from "./TreeNode";

export function compactTree(root: TreeNode) {
  const children = Object.keys(root.children);

  if (
    !root.isRoot &&
    children.length === 1 &&
    !root.children[children[0]].name.includes(".") // todo fix "file check"
  ) {
    return compactTree(root.children[children[0]]);
  }

  for (const childName in root.children) {
    root.children[childName] = compactTree(root.children[childName]);
  }

  return root;
}
