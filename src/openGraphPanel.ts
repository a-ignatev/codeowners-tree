import * as vscode from "vscode";
import * as path from "path";
import { generateGraph } from "./generateGraph";
import { getWebviewContent } from "./getWebviewContent";

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
