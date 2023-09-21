export function getWebviewContent(team: string, data: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Ownership ${team}</title>
</head>
<body>
   ${data}

  <script>
    const vscode = acquireVsCodeApi();

    [...document.getElementsByTagName('a')].forEach((element) => {
      element.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        vscode.postMessage(event.target.parentNode.getAttribute('xlink:href'));
      }
    })
  </script>
</body>
</html>`;
}
