import { Graph } from "graphviz";
import TreeNode from "./TreeNode";

export function convertTreeToGraph(
  graph: Graph,
  node: TreeNode,
  parentLabel: string | null,
  addLinks: boolean
) {
  const text =
    parentLabel && node.name.indexOf(parentLabel) >= 0
      ? node.name.substring(node.name.indexOf(parentLabel) + parentLabel.length)
      : node.name;

  const label = node.isCodeownersLeaf ? text + " ⛨" : text;
  const tooltip = node.isCodeownersLeaf ? text + " (owned)" : text;

  let attrs = {
    style: "filled",
    label: label,
    shape: "folder",
    fillcolor: "#ffe9a2",
    width: "0",
    height: "0",
    fontsize: "10",
    fontname: "monospace",
    tooltip: tooltip,
    ...(addLinks ? { href: node.name } : {}),
  };

  if (!Object.keys(node.children).length) {
    const nameParts = node.name.split("/");
    const label = nameParts[nameParts.length - 1];

    // todo fix "file check"
    if (label.includes(".")) {
      attrs = {
        ...attrs,
        style: "",
        shape: "note",
      };
    }
  }

  const root = graph.addNode(node.name, attrs);
  for (const childName in node.children) {
    const child = convertTreeToGraph(
      graph,
      node.children[childName],
      text,
      addLinks
    );
    graph.addEdge(root, child, { dir: "none", style: "dashed" });
  }

  return root;
}
