import * as vscode from "vscode";
import { generateGraph } from "./graph/generateGraph";
import { getWebviewContent } from "./getWebviewContent";
import { WebviewHandler } from "./WebviewHandler";

function addEventHandlers(
  panel: vscode.WebviewPanel,
  webviewHandler: WebviewHandler
) {
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "open":
        webviewHandler.navigateToHref(message.href);
        break;

      case "getDirectoryListing":
        webviewHandler.listDirectories(message.directory);
        break;

      case "copyToClipboard":
        webviewHandler.copyToClipboard(message.value);
        break;
    }
  });
}

export function openGraphPanel(
  extensionUri: vscode.Uri,
  team: string,
  workspaceRoot: string
) {
  const panel = vscode.window.createWebviewPanel(
    "codeownersTeams.graphPanel",
    team,
    { viewColumn: vscode.ViewColumn.One, preserveFocus: true },
    { enableScripts: true, localResourceRoots: [extensionUri] }
  );

  const webviewHandler = new WebviewHandler(workspaceRoot, panel);

  addEventHandlers(panel, webviewHandler);

  generateGraph({
    workspaceRoot,
    team,
    addLinks: true,
    onFinish: (data) => {
      panel.webview.html = getWebviewContent(
        panel.webview,
        extensionUri,
        team,
        data
      );
    },
  });
}
