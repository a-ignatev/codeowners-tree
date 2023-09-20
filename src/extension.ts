import * as vscode from "vscode";
import * as fs from "fs";
import { CodeownerTeamsProvider, TeamTreeItem } from "./CodeownerTeamsProvider";
import { openGraphPanel } from "./openGraphPanel";
import { generateGraph } from "./generateGraph";

export function activate(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;

  if (!rootPath) {
    vscode.window.showInformationMessage("No CODEOWNERS in empty workspace");
    return;
  }

  const provider = new CodeownerTeamsProvider(rootPath);

  vscode.window.registerTreeDataProvider("codeownersTeams", provider);
  vscode.commands.registerCommand("codeownersTeams.refreshEntry", () => {
    provider.refresh();
  });

  vscode.commands.registerCommand(
    "codeownersTeams.openGraph",
    (team: string) => {
      openGraphPanel(rootPath, team);
    }
  );

  vscode.commands.registerCommand(
    "codeownersTeams.downloadGraph",
    (item: TeamTreeItem) => {
      vscode.window
        .showSaveDialog({
          defaultUri: vscode.Uri.file(
            item.label.replace("@", "").replace("/", "_") +
              "_codeowner_graph.svg"
          ),
        })
        .then((fileInfos) => {
          if (fileInfos) {
            generateGraph(rootPath, item.label, (p) => {
              fs.writeFileSync(fileInfos.path, new TextEncoder().encode(p));
            });
          }
        });
    }
  );
}

export function deactivate() {}
