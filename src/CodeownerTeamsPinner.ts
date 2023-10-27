import * as vscode from "vscode";
import { CodeownerTeamsProvider } from "./CodeownerTeamsProvider";

export class CodeownerTeamsPinner {
  private teamOwnersProvider: CodeownerTeamsProvider;

  constructor(teamOwnersProvider: CodeownerTeamsProvider) {
    this.teamOwnersProvider = teamOwnersProvider;
  }

  pinTeam(teamName: string) {
    const pinnedTeams = this.getPinnedTeams();

    if (pinnedTeams.includes(teamName)) {
      return;
    }

    this.setPinnedTeams([...pinnedTeams, teamName]);
  }

  unpinTeam(teamName: string) {
    const pinnedTeams = this.getPinnedTeams();

    if (!pinnedTeams.includes(teamName)) {
      return;
    }

    this.setPinnedTeams(pinnedTeams.filter((team) => team !== teamName));
  }

  private getPinnedTeams() {
    const configuration = vscode.workspace.getConfiguration("codeownersTeams");
    return configuration.get<string[]>("pinnedTeams", []);
  }

  private setPinnedTeams(teams: string[]) {
    const configuration = vscode.workspace.getConfiguration("codeownersTeams");
    configuration
      .update("pinnedTeams", teams, vscode.ConfigurationTarget.Global)
      .then(() => {
        this.teamOwnersProvider.refresh();
      });
  }
}
