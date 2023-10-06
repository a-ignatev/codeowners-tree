import * as vscode from "vscode";
import { CodeownerTeamsProvider, TeamTreeItem } from "./CodeownerTeamsProvider";
import { openGraphPanel } from "./openGraphPanel";
import { isGraphvizInstalled } from "./helpers/isGraphvizInstalled";
import { getWorkspaceRoot } from "./helpers/getWorkspaceRoot";
import { showNoGraphvizMessaage } from "./helpers/showNoGraphvizMessaage";
import { saveGraphAsFile } from "./saveGraphAsFile";

export async function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = getWorkspaceRoot();

  const provider = new CodeownerTeamsProvider(workspaceRoot);

  vscode.window.registerTreeDataProvider("codeownersTeams", provider);

  if (!workspaceRoot) {
    vscode.window.showInformationMessage("No CODEOWNERS in empty workspace");
    return;
  }

  const isInstalled = await isGraphvizInstalled();
  if (!isInstalled) {
    showNoGraphvizMessaage();
  }

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

      openGraphPanel(team, workspaceRoot);
    }
  );

  vscode.commands.registerCommand(
    "codeownersTeams.downloadGraph",
    (item: TeamTreeItem) => {
      if (!isInstalled) {
        showNoGraphvizMessaage();
        return;
      }

      saveGraphAsFile(item, workspaceRoot);
    }
  );
}

export function deactivate() {}
