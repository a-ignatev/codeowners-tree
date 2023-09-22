export function getWebviewContent(team: string, data: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Ownership ${team}</title>
    <style>
      body {
        background-color: white;
      }

      .controls {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 999;
        display: flex;
        gap: 4px;
        padding: 16px;
        align-items: center;
      }

      .controls span {
        color: #abb2bf;
        margin-left: 4px;
      }
    </style>
</head>
<body>
  ${data}

  <div class="controls">
    <button id="zoom-in">+</button>
    <button id="zoom-reset">O</button>
    <button id="zoom-out">-</button>
    <span>Ctrl + Wheel</span>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    [...document.getElementsByTagName('a')].forEach((element) => {
      element.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        vscode.postMessage(event.target.parentNode.getAttribute('xlink:href'));
      }
    })

    const svg = document.getElementsByTagName('svg')[0]
  
    let scale = 1;
    svg.setAttribute("transform-origin", "0 0");
    svg.setAttribute("transform", "scale(" + scale + ")");

    document.addEventListener("wheel", (e) => {
      if (e.ctrlKey) {
        scale -= e.deltaY * scale * 0.0005;
        scale = Math.max(0.2, Math.min(3, scale));

        svg.setAttribute("transform", "scale(" + scale + ")");
      }
    });

    document.getElementById('zoom-in').addEventListener('click', () => {
      scale += 0.1;
      svg.setAttribute("transform", "scale(" + scale + ")");
    })

    document.getElementById('zoom-reset').addEventListener('click', () => {
      scale = 1;
      svg.setAttribute("transform", "scale(" + scale + ")");
    })

    document.getElementById('zoom-out').addEventListener('click', () => {
      scale -= 0.1;
      svg.setAttribute("transform", "scale(" + scale + ")");
    })
  </script>
</body>
</html>`;
}
