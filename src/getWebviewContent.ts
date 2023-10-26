export function getWebviewContent(team: string, data: string) {
  return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Ownership ${team}</title>
    <style>
      body {
        background-color: white;
        cursor: grab;
      }

      body.grabbed {
        cursor: grabbing;
      }

      a {
        cursor: pointer;
      }

      .controls {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 999;
        display: flex;
        gap: 4px;
        padding: 16px;
        flex-direction: column;
      }

      .highlight {
        stroke: crimson;
        stroke-width: 2px;
      }

      .controls span {
        color: #abb2bf;
        margin-left: 4px;
      }

      .graph-content {
        padding: 100px 24px;
      }
    </style>
</head>
<body>
  <div class="graph-content">
  ${data}
  </div>

  <div class="controls">
    <div>
      <button id="zoom-in">+</button>
      <button id="zoom-reset">O</button>
      <button id="zoom-out">-</button>
      <span>Ctrl + Wheel</span>
    </div>
    <div>
      <input placeholder="Search" id="search" />
    </div>
    <div>
      <span id="matches-count" />
    </div>
  </div>

  <script>
    // todo move somewhere
    const folderColor = '#ffe9a2'
    const folderTooltipId = 'folder-tooltip';
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
          case 'receiveDirectoryListing':
            const tooltip = document.getElementById(folderTooltipId);
            if (message.content) {
              tooltip.textContent = message.content;
            } else {
              tooltip?.remove();
            }
          break;
      }
    });

    [...document.getElementsByTagName('a')].forEach((element) => {
      const isFile = element.getElementsByTagName('polygon')[0].getAttribute('fill') !== folderColor;

      element.onclick = (event) => {
        console.log(event)
        event.preventDefault();
        event.stopPropagation();
        vscode.postMessage({ command: 'open', href: event.target.parentNode.getAttribute('xlink:href') });
      }

      if (!isFile) {
        element.getElementsByTagName('text')[0].style.pointerEvents = 'none';

        element.onmouseover = (event) => {
          const rect = element.getBoundingClientRect()
          let tooltip = document.createElement("tooltip");
          tooltip.id = folderTooltipId;
          tooltip.textContent = 'Loading...';
          tooltip.style.position = 'fixed';
          tooltip.style.left = rect.left + "px";
          tooltip.style.top = rect.top + 50 + "px";
          tooltip.style.backgroundColor = folderColor;
          tooltip.style.border = '1px solid black';
          tooltip.style.padding = '4px';
          tooltip.style.borderRadius = '4px';
          tooltip.style.color = 'black';
          tooltip.style.whiteSpace = 'pre';

          element.tooltip = tooltip

          document.body.appendChild(tooltip)
          vscode.postMessage({ command: 'getDirectoryListing', directory: event.target.parentNode.getAttribute('xlink:href') });
        }

        element.onmouseout = (event) => {
          element.tooltip?.remove()
          element.tooltip = undefined
        }
      }
    })

    // Mouse panning
    let isMouseDown = false

    document.addEventListener('mousedown', () => {
      document.body.classList.add('grabbed')
      isMouseDown = true
    })

    document.addEventListener('mouseup', () => {
      document.body.classList.remove('grabbed')
      isMouseDown = false
    })

    document.addEventListener('mousemove', (e) => {
      if (isMouseDown) {
        window.scrollBy(-e.movementX, -e.movementY)
      }
    })

    // Graph zoom
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

    // Search shortcut
    document.addEventListener('keyup', (e) => {
      if (e.ctrlKey && e.key === "f") {
        document.getElementById('search').focus()
      }
    })

    // Search
    let found = []
    let foundIndex = 0
    let currentHighlight = null

    document.getElementById("search").addEventListener("keyup", (e) => {
      if (currentHighlight) {
        currentHighlight.getElementsByTagName('polygon')[0].classList.remove('highlight')
        currentHighlight.getElementsByTagName('text')[0].innerHTML = currentHighlight.getElementsByTagName('text')[0].originalText
      }

      if (e.key === "Enter" && found.length > 1) {
        if (e.shiftKey) {
          foundIndex = foundIndex - 1 >= 0 ? foundIndex - 1 : found.length - 1
        } else {
          foundIndex = foundIndex + 1 >= found.length ? 0 : foundIndex + 1
        }
      }

      const searchValue = e.target.value

      if (!searchValue) {
        document.getElementById('matches-count').innerText = ""
        return
      }

      found = [...document.getElementsByTagName('a')].filter((element) => {
        return element.textContent.toLowerCase().includes(searchValue.toLowerCase())
      })
   
      currentHighlight = found[foundIndex]

      if (currentHighlight) {
        document.getElementById('matches-count').innerText = (foundIndex + 1) + "/" + found.length
        currentHighlight.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        })
        currentHighlight.getElementsByTagName('polygon')[0].classList.add('highlight')
        const originalText = currentHighlight.getElementsByTagName('text')[0].innerHTML
        currentHighlight.getElementsByTagName('text')[0].innerHTML = originalText.replace(new RegExp('(' + searchValue+')', 'ig'), '<tspan fill="red" font-weight="bold">$1</tspan>')
        currentHighlight.getElementsByTagName('text')[0].originalText = originalText
      } else {
        document.getElementById('matches-count').innerText = ""
      }
    })
  </script>
</body>
</html>`;
}
