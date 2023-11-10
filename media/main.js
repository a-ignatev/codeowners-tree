const folderColor = "#ffe9a2";
const folderTooltipId = "folder-tooltip";
const vscode = acquireVsCodeApi();

const PADDING_LEFT = 120;
const PADDING_TOP = 24;

window.addEventListener("message", (event) => {
  const message = event.data;
  switch (message.command) {
    case "receiveDirectoryListing":
      const tooltip = document.getElementById(folderTooltipId);
      if (message.content) {
        tooltip.innerHTML = message.content;
      } else {
        tooltip?.remove();
      }
      break;
  }
});

[...document.getElementsByTagName("a")].forEach((element) => {
  const isFile =
    element.getElementsByTagName("polygon")[0].getAttribute("fill") !==
    folderColor;

  element.onclick = (event) => {
    console.log(event);
    event.preventDefault();
    event.stopPropagation();
    vscode.postMessage({
      command: "open",
      href: event.target.parentNode.getAttribute("xlink:href"),
    });
  };

  if (!isFile) {
    element.getElementsByTagName("text")[0].style.pointerEvents = "none";

    element.onmouseover = (event) => {
      const rect = element.getBoundingClientRect();
      let tooltip = document.createElement("tooltip");
      tooltip.id = folderTooltipId;
      tooltip.textContent = "Loading...";
      tooltip.style.position = "fixed";
      tooltip.style.left = rect.left + "px";
      tooltip.style.top = rect.top + 50 + "px";
      tooltip.style.backgroundColor = folderColor;
      tooltip.style.border = "1px solid black";
      tooltip.style.padding = "4px";
      tooltip.style.borderRadius = "4px";
      tooltip.style.color = "black";
      tooltip.style.whiteSpace = "pre";

      element.tooltip = tooltip;

      document.body.appendChild(tooltip);
      vscode.postMessage({
        command: "getDirectoryListing",
        directory: event.target.parentNode.getAttribute("xlink:href"),
      });
    };

    element.onmouseout = (event) => {
      element.tooltip?.remove();
      element.tooltip = undefined;
    };
  }
});

// Mouse panning
let isMouseDown = false;

document.addEventListener("mousedown", () => {
  document.body.classList.add("grabbed");
  isMouseDown = true;
});

document.addEventListener("mouseup", () => {
  document.body.classList.remove("grabbed");
  isMouseDown = false;
});

document.addEventListener("mousemove", (e) => {
  window.mouseX = e.clientX;
  window.mouseY = e.clientY;

  if (isMouseDown) {
    window.scrollBy(-e.movementX, -e.movementY);
  }
});

document.addEventListener("scroll", (event) => {
  vscode.setState({
    ...(vscode.getState() || {}),
    windowX: window.scrollX,
    windowY: window.scrollY,
  });
});

// Graph zoom
const svg = document.getElementsByTagName("svg")[0];

let scale = vscode.getState()?.scale || 1;
svg.setAttribute("transform-origin", "0 0");
svg.setAttribute("transform", "scale(" + scale + ")");

function updateScale(diff, centerX, centerY) {
  const { windowX, windowY } = vscode.getState();
  const prevScale = scale;
  scale -= diff;
  scale = Math.max(0.2, Math.min(3, scale));
  const ratio = scale / prevScale;

  const nmx = (windowX + centerX - PADDING_LEFT) * ratio;
  const nmy = (windowY + centerY - PADDING_TOP) * ratio;
  const nwx = nmx - centerX + PADDING_LEFT;
  const nwy = nmy - centerY + PADDING_TOP;

  window.scrollBy(nwx - windowX, nwy - windowY);

  svg.setAttribute("transform", "scale(" + scale + ")");
  vscode.setState({ ...(vscode.getState() || {}), scale: scale });
}

document.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();

    updateScale(e.deltaY * scale * 0.0005, window.mouseX, window.mouseY);
  },
  { passive: false }
);

document.getElementById("zoom-in").addEventListener("click", () => {
  updateScale(-0.1, window.innerWidth / 2, window.innerHeight / 2);
});

document.getElementById("zoom-reset").addEventListener("click", () => {
  scale = 1;
  svg.setAttribute("transform", "scale(" + scale + ")");
  vscode.setState({ ...(vscode.getState() || {}), scale: scale });
  document.getElementById("node1").scrollIntoView({
    block: "center",
    inline: "center",
  });
});

document.getElementById("zoom-out").addEventListener("click", () => {
  updateScale(0.1, window.innerWidth / 2, window.innerHeight / 2);
});

// Search shortcut
document.addEventListener("keyup", (e) => {
  if (e.ctrlKey && e.key === "f") {
    document.getElementById("search").focus();
  }
});

// Search
let found = [];
let foundIndex = 0;
let currentHighlight = null;

document.getElementById("search").addEventListener("keyup", (e) => {
  if (currentHighlight) {
    currentHighlight
      .getElementsByTagName("polygon")[0]
      .classList.remove("highlight");
    currentHighlight.getElementsByTagName("text")[0].innerHTML =
      currentHighlight.getElementsByTagName("text")[0].originalText;
  }

  if (e.key === "Enter" && found.length > 1) {
    if (e.shiftKey) {
      foundIndex = foundIndex - 1 >= 0 ? foundIndex - 1 : found.length - 1;
    } else {
      foundIndex = foundIndex + 1 >= found.length ? 0 : foundIndex + 1;
    }
  }

  const searchValue = e.target.value;

  if (!searchValue) {
    document.getElementById("matches-count").innerText = "";
    return;
  }

  found = [...document.getElementsByTagName("a")].filter((element) => {
    return element.textContent
      .toLowerCase()
      .includes(searchValue.toLowerCase());
  });

  currentHighlight = found[foundIndex];

  if (currentHighlight) {
    document.getElementById("matches-count").innerText =
      foundIndex + 1 + "/" + found.length;
    currentHighlight.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
    currentHighlight
      .getElementsByTagName("polygon")[0]
      .classList.add("highlight");
    const originalText =
      currentHighlight.getElementsByTagName("text")[0].innerHTML;
    currentHighlight.getElementsByTagName("text")[0].innerHTML =
      originalText.replace(
        new RegExp("(" + searchValue + ")", "ig"),
        '<tspan fill="red" font-weight="bold">$1</tspan>'
      );
    currentHighlight.getElementsByTagName("text")[0].originalText =
      originalText;
  } else {
    document.getElementById("matches-count").innerText = "";
  }
});

const state = vscode.getState();

if (state) {
  window.scrollTo(state.windowX, state.windowY);
} else {
  // scroll to the root of the tree
  document.getElementById("node1").scrollIntoView({
    block: "center",
    inline: "center",
  });
}
