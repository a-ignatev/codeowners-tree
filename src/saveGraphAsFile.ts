import * as vscode from "vscode";
import * as fs from "fs";
import { TeamTreeItem } from "./CodeownerTeamsProvider";
import { generateGraph } from "./graph/generateGraph";

export function saveGraphAsFile(item: TeamTreeItem, workspaceRoot: string) {
  vscode.window
    .showSaveDialog({
      defaultUri: vscode.Uri.file(
        item.label.replace("@", "").replace("/", "_") + "_codeowner_graph.svg"
      ),
    })
    .then((fileInfos) => {
      if (fileInfos) {
        generateGraph({
          workspaceRoot,
          team: item.label,
          addLinks: false,
          onFinish: (p) => {
            fs.writeFileSync(fileInfos.path, new TextEncoder().encode(p));
          },
        });
      }
    });
}
