import * as vscode from "vscode";
import * as path from "path";
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

  <script>
    const vscode = acquireVsCodeApi();

    [...document.getElementsByTagName('a')].forEach((element) => {
      element.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        vscode.postMessage(event.target.parentNode.getAttribute('xlink:href'));
      }
    })
  </script>
</body>
</html>`;
}

export function openGraphPanel(rootPath: string, team: string) {
  const panel = vscode.window.createWebviewPanel(
    "codeownersTeams.graphPanel",
    team,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.onDidReceiveMessage((href) => {
    // todo fix "file check"
    if (!href.includes(".")) {
      vscode.commands.executeCommand(
        "revealInExplorer",
        vscode.Uri.file(path.join(rootPath, href))
      );
    } else {
      vscode.workspace
        .openTextDocument(path.join(rootPath, href))
        .then((file) => {
          vscode.window.showTextDocument(file);
        });
    }
  });

  generateGraph(rootPath, team, (data) => {
    panel.webview.html = getWebviewContent(team, data);
  });
}
