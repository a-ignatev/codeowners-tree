import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getCodeownersTeams } from "./helpers/getCodeownersTeams";

const DIVIDER = "---";

export class CodeownerTeamsProvider
  implements vscode.TreeDataProvider<TeamTreeItem>
{
  constructor(private workspaceRoot: string | undefined) {}

  private _onDidChangeTreeData: vscode.EventEmitter<
    TeamTreeItem | undefined | null | void
  > = new vscode.EventEmitter<TeamTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TeamTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TeamTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Thenable<TeamTreeItem[]> {
    if (!this.workspaceRoot) {
      return Promise.resolve([]);
    }
    const codeownersPath = path.join(this.workspaceRoot, "CODEOWNERS");

    if (!fs.existsSync(codeownersPath)) {
      vscode.window.showInformationMessage("No CODEOWNERS file found");
      return Promise.resolve([]);
    }

    const configuration = vscode.workspace.getConfiguration("codeownersTeams");
    const pinnedTeamsInConfig = configuration.get<string[]>("pinnedTeams", []);

    const teams = getCodeownersTeams(codeownersPath);

    const allTeams = Array.from(teams);
    const pinnedTeams = allTeams
      .filter((team) => pinnedTeamsInConfig.includes(team))
      .sort((a, b) => a.localeCompare(b))
      .map((team) => new TeamTreeItem(team, true));

    const otherTeams = allTeams
      .filter((team) => !pinnedTeamsInConfig.includes(team))
      .sort((a, b) => a.localeCompare(b))
      .map((team) => new TeamTreeItem(team, false));

    let result: TeamTreeItem[] = [];
    if (pinnedTeams.length) {
      result = pinnedTeams.concat([new TeamTreeItem(DIVIDER)]);
    }

    result = result.concat(otherTeams);

    return Promise.resolve(result);
  }
}

export class TeamTreeItem extends vscode.TreeItem {
  constructor(public readonly label: string, isPinned?: boolean) {
    super(label, vscode.TreeItemCollapsibleState.None);

    if (label === DIVIDER) {
      return;
    }

    this.tooltip = this.label;
    this.iconPath = new vscode.ThemeIcon("shield");
    this.contextValue = isPinned ? "teamViewItemPinned" : "teamViewItem";
    this.command = {
      title: "Open Codeowners Graph",
      command: "codeownersTeams.openGraph",
      arguments: [label],
    };
  }
}
