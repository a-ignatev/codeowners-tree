import * as vscode from "vscode";
import * as fs from "fs";
import { CodeownerTeamsProvider, TeamTreeItem } from "./CodeownerTeamsProvider";
import { openGraphPanel } from "./openGraphPanel";
import { generateGraph } from "./generateGraph";
import { isGraphvizInstalled } from "./isGraphvizInstalled";

function showNoGraphvizMessaage() {
  vscode.window.showInformationMessage(
    "Application graphviz need to be installed, please check the README.md"
  );
}

export async function activate(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;

  if (!rootPath) {
    vscode.window.showInformationMessage("No CODEOWNERS in empty workspace");
    return;
  }

  const isInstalled = await isGraphvizInstalled();
  if (!isInstalled) {
    showNoGraphvizMessaage();
  }

  const provider = new CodeownerTeamsProvider(rootPath);

  vscode.window.registerTreeDataProvider("codeownersTeams", provider);
  vscode.commands.registerCommand("codeownersTeams.refreshEntries", () => {
    provider.refresh();
  });

  vscode.commands.registerCommand(
    "codeownersTeams.openGraph",
    (team: string) => {
      if (!isInstalled) {
        showNoGraphvizMessaage();
        return;
      }

      openGraphPanel(rootPath, team);
    }
  );

  vscode.commands.registerCommand(
    "codeownersTeams.downloadGraph",
    (item: TeamTreeItem) => {
      if (!isInstalled) {
        showNoGraphvizMessaage();
        return;
      }

      vscode.window
        .showSaveDialog({
          defaultUri: vscode.Uri.file(
            item.label.replace("@", "").replace("/", "_") +
              "_codeowner_graph.svg"
          ),
        })
        .then((fileInfos) => {
          if (fileInfos) {
            generateGraph({
              rootPath,
              team: item.label,
              addLinks: false,
              onFinish: (p) => {
                fs.writeFileSync(fileInfos.path, new TextEncoder().encode(p));
              },
            });
          }
        });
    }
  );
}

export function deactivate() {}
