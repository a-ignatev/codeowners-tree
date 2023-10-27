import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { generateGraph } from "./graph/generateGraph";
import { getWebviewContent } from "./getWebviewContent";

function addEventHandlers(panel: vscode.WebviewPanel, workspaceRoot: string) {
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "open":
        // todo fix "file check"
        if (!message.href.includes(".")) {
          vscode.commands.executeCommand(
            "revealInExplorer",
            vscode.Uri.file(path.join(workspaceRoot, message.href))
          );
        } else {
          vscode.workspace
            .openTextDocument(path.join(workspaceRoot, message.href))
            .then((file) => {
              vscode.window.showTextDocument(file);
            });
        }
        break;

      case "getDirectoryListing":
        const directory = path.join(workspaceRoot, message.directory);
        let content: fs.Dirent[] = [];

        try {
          content =
            (fs.existsSync(directory) &&
              fs.readdirSync(directory, {
                withFileTypes: true,
              })) ||
            [];
        } catch {
          // probably it is a file
        }

        const files = content
          .filter((path) => path.isFile())
          .map((path) => "&#x1f4c4; " + path.name)
          .sort();
        const folders = content
          .filter((path) => path.isDirectory())
          .map((path) => "&#128193; " + path.name)
          .sort();

        panel.webview.postMessage({
          command: "receiveDirectoryListing",
          content: folders.concat(files).join("\n"),
        });
        break;
    }
  });
}

export function openGraphPanel(team: string, workspaceRoot: string) {
  const panel = vscode.window.createWebviewPanel(
    "codeownersTeams.graphPanel",
    team,
    { viewColumn: vscode.ViewColumn.One, preserveFocus: true },
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
