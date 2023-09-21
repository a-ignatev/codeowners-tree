import * as fs from "fs";
import * as readline from "readline";
import { digraph } from "graphviz";
import * as path from "path";

class TreeNode {
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

export const generateGraph = (
  rootPath: string,
  team: string,
  onFinish: (path: string) => void
) => {
  const graph = digraph("CodeOwners");

  graph.set("rankdir", "LR");

  const readStream = readline.createInterface({
    input: fs.createReadStream(path.join(rootPath, "CODEOWNERS")),
  });

  const root = new TreeNode(team, false, true);

  readStream.on("line", (line: string) => {
    const [path, ...owners] = line.split(/\s+/);

    if (!owners.includes(team)) {
      return;
    }

    const pathParts = path.split("/");
    let currentNode = root;
    let fullPath = "";

    pathParts.forEach((part, index) => {
      fullPath += `/${part}`;

      const isCodeownersLeaf =
        index === pathParts.length - 1 || pathParts[index + 1] === "";

      if (part !== "") {
        if (!currentNode.children[fullPath]) {
          currentNode.children[fullPath] = new TreeNode(
            fullPath,
            isCodeownersLeaf
          );
        }
        currentNode = currentNode.children[fullPath];
      }
    });
  });

  function compactTree(root: TreeNode) {
    const children = Object.keys(root.children);

    if (
      !root.isRoot &&
      children.length === 1 &&
      !root.children[children[0]].name.includes(".")
    ) {
      return compactTree(root.children[children[0]]);
    }

    for (const childName in root.children) {
      root.children[childName] = compactTree(root.children[childName]);
    }

    return root;
  }

  function printTree(node: TreeNode, parentLabel?: string) {
    const text =
      parentLabel && node.name.indexOf(parentLabel) >= 0
        ? node.name.substring(
            node.name.indexOf(parentLabel) + parentLabel.length
          )
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
      href: node.name,
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
      const child = printTree(node.children[childName], text);
      graph.addEdge(root, child, { dir: "none", style: "dashed" });
    }

    return root;
  }

  readStream.on("close", () => {
    const compactedTree = compactTree(root);
    printTree(compactedTree);
    graph.render("svg", (data) => {
      onFinish(data.toString());
    });
  });
};
