import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getCodeownersTeams } from "./helpers/getCodeownersTeams";

export class CodeownerTeamsProvider
  implements vscode.TreeDataProvider<TeamTreeItem>
{
  constructor(private workspaceRoot: string) {}

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
      vscode.window.showInformationMessage("No dependency in empty workspace");
      return Promise.resolve([]);
    }

    const codeownersPath = path.join(this.workspaceRoot, "CODEOWNERS");

    if (!fs.existsSync(codeownersPath)) {
      vscode.window.showInformationMessage("No CODEOWNERS file found");
      return Promise.resolve([]);
    }

    const teams = getCodeownersTeams(codeownersPath);

    return Promise.resolve(
      Array.from(teams)
        .sort((a, b) => a.localeCompare(b))
        .map((team) => new TeamTreeItem(team))
    );
  }
}

export class TeamTreeItem extends vscode.TreeItem {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.tooltip = this.label;
    this.iconPath = new vscode.ThemeIcon("shield");
    this.contextValue = "teamViewItem";
    this.command = {
      title: "Open Codeowners Graph",
      command: "codeownersTeams.openGraph",
      arguments: [label],
    };
  }
}
