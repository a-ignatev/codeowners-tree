import * as vscode from "vscode";
import { CodeownerTeamsProvider, TeamTreeItem } from "./CodeownerTeamsProvider";
import { openGraphPanel } from "./openGraphPanel";
import { isGraphvizInstalled } from "./helpers/isGraphvizInstalled";
import { getWorkspaceRoot } from "./helpers/getWorkspaceRoot";
import { showNoGraphvizMessaage } from "./helpers/showNoGraphvizMessaage";
import { saveGraphAsFile } from "./saveGraphAsFile";
import { CodeownerTeamsPinner } from "./CodeownerTeamsPinner";

export async function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = getWorkspaceRoot();

  const provider = new CodeownerTeamsProvider(workspaceRoot);
  const teamsPinner = new CodeownerTeamsPinner(provider);

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

  vscode.commands.registerCommand(
    "codeownersTeams.pinTeam",
    (item: TeamTreeItem) => {
      teamsPinner.pinTeam(item.label);
    }
  );

  vscode.commands.registerCommand(
    "codeownersTeams.unpinTeam",
    (item: TeamTreeItem) => {
      teamsPinner.unpinTeam(item.label);
    }
  );
}

export function deactivate() {}
