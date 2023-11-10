import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";

export class WebviewHandler {
  private workspaceRoot: string;
  private panel: vscode.WebviewPanel;

  constructor(workspaceRoot: string, panel: vscode.WebviewPanel) {
    this.workspaceRoot = workspaceRoot;
    this.panel = panel;
  }

  navigateToHref(href: string) {
    const fullPath = this.getFullPath(href);

    // todo fix "file check"
    if (!href.includes(".")) {
      vscode.commands.executeCommand(
        "revealInExplorer",
        vscode.Uri.file(fullPath)
      );
    } else {
      vscode.workspace.openTextDocument(fullPath).then((file) => {
        vscode.window.showTextDocument(file);
      });
    }
  }

  private getFullPath(href: string) {
    return path.join(this.workspaceRoot, href);
  }

  listDirectories(path: string) {
    const directory = this.getFullPath(path);
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
      // todo extract constants
      .map((path) => "&#x1f4c4; " + path.name)
      .sort();
    const folders = content
      .filter((path) => path.isDirectory())
      // todo extract constants
      .map((path) => "&#128193; " + path.name)
      .sort();

    this.panel.webview.postMessage({
      command: "receiveDirectoryListing",
      content: folders.concat(files).join("\n"),
    });
  }

  copyToClipboard(value: string) {
    vscode.env.clipboard.writeText(value);
  }
}
