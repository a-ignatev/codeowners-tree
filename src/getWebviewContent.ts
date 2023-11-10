import * as vscode from "vscode";
import { getNonce } from "./getNonce";

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  team: string,
  data: string
) {
  const styleMainUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "main.css")
  );

  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "main.js")
  );

  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Ownership ${team}</title>

    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; media-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

    <link href="${styleMainUri}" rel="stylesheet">
</head>
<body>
  <div class="graph-content">
  ${data}
  </div>

  <div class="controls">
    <div class="buttons">
      <button class="button-4" id="zoom-in">+</button>
      <button class="button-4" id="zoom-reset">O</button>
      <button class="button-4" id="zoom-out">-</button>
    </div>
    <div>
      <input class="button-4 search-input" placeholder="Search" id="search" />
    </div>
    <div>
      <span id="matches-count" />
    </div>
  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
