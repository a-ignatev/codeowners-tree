import * as vscode from "vscode";
import { generateGraph } from "./generateGraph";

function getWebviewContent(team: string, p: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Ownership ${team}</title>
</head>
<body>
   ${p}
</body>
</html>`;
}

export function openGraphPanel(rootPath: string, team: string) {
  const panel = vscode.window.createWebviewPanel(
    "codeownersTeams.graphPanel",
    team,
    vscode.ViewColumn.One
  );

  generateGraph(rootPath, team, (p) => {
    panel.webview.html = getWebviewContent(team, p);
  });
}
