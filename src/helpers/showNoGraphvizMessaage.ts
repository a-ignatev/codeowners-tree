import * as vscode from "vscode";

export function showNoGraphvizMessaage() {
  vscode.window.showInformationMessage(
    "Application graphviz need to be installed, please check the README.md"
  );
}
