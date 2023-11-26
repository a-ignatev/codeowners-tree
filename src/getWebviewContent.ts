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

  <div class="search">
    <div>
      <input class="button-4 search-input" placeholder="Search (Ctrl+F)" id="search" />
      <button class="button-4" id="search-prev" title="Previous match">&lt;</button>
      <button class="button-4" id="search-next" title="Next match">&gt;</button>
      <button class="button-4" id="copy-results" title="Copy all matches to the clipboard">&#x2398;</button>
    </div>
    <div>
      <span id="matches-count" />
    </div>
  </div>

  <div class="controls">
    <div class="buttons">
      <button class="button-4" id="zoom-in" title="Zoom in">+</button>
      <button class="button-4" id="zoom-reset" title="Reset zoom">O</button>
      <button class="button-4" id="zoom-out" title="Zoom out">-</button>
    </div>
  </div>

  <div id="simpleToast" />

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
