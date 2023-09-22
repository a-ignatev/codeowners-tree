import * as vscode from "vscode";
import * as path from "path";
import { generateGraph } from "./graph/generateGraph";
import { getWebviewContent } from "./getWebviewContent";

function addEventHandlers(panel: vscode.WebviewPanel, workspaceRoot: string) {
  panel.webview.onDidReceiveMessage((href) => {
    // todo fix "file check"
    if (!href.includes(".")) {
      vscode.commands.executeCommand(
        "revealInExplorer",
        vscode.Uri.file(path.join(workspaceRoot, href))
      );
    } else {
      vscode.workspace
        .openTextDocument(path.join(workspaceRoot, href))
        .then((file) => {
          vscode.window.showTextDocument(file);
        });
    }
  });
}

export function openGraphPanel(team: string, workspaceRoot: string) {
  const panel = vscode.window.createWebviewPanel(
    "codeownersTeams.graphPanel",
    team,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  addEventHandlers(panel, workspaceRoot);

  generateGraph({
    workspaceRoot,
    team,
    addLinks: true,
    onFinish: (data) => {
      panel.webview.html = getWebviewContent(team, data);
    },
  });
}
