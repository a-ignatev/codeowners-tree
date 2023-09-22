import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

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

  getChildren(element?: TeamTreeItem): Thenable<TeamTreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No dependency in empty workspace");
      return Promise.resolve([]);
    }

    const codeownersPath = path.join(this.workspaceRoot, "CODEOWNERS");

    if (!fs.existsSync(codeownersPath)) {
      vscode.window.showInformationMessage("No CODEOWNERS file found");
      return Promise.resolve([]);
    }

    const codeowners = fs.readFileSync(codeownersPath, "utf-8");

    const teams: Set<string> = new Set();

    codeowners.split("\n").map((line) => {
      const cleared =
        line.indexOf("#") >= 0
          ? line.substring(0, line.indexOf("#")).trimEnd()
          : line;
      if (!cleared) {
        return;
      }

      const [, ...owners] = cleared.split(/\s+/);
      owners.forEach((owner) => {
        teams.add(owner);
      });
    });

    return Promise.resolve(
      [...teams.values()]
        .map(
          (team) => new TeamTreeItem(team, vscode.TreeItemCollapsibleState.None)
        )
        .sort((a, b) => a.label.localeCompare(b.label))
    );
  }
}

export class TeamTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    this.command = {
      command: "codeownersTeams.openGraph",
      arguments: [label],
    } as vscode.Command;
    this.iconPath = new vscode.ThemeIcon("shield");
    this.contextValue = "teamViewItem";
  }
}
