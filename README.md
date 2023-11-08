# CODEOWNERS Tree

CODEOWNERS Tree is an Visual Studio Code extension designed to simplify the management and visualization of ownership within your codebase. Managing code ownership across various files and directories can be a daunting task, especially in larger teams. With CODEOWNERS Tree, you can easily create and visualize ownership hierarchies in a beautiful tree-like graph, making it effortless to understand who is responsible for what in your codebase.

![Current File](/resources/demo.gif "Codeowners Tree")

## Installation

Before using CODEOWNERS Tree, you'll need to install the Graphviz application, which is used for rendering the interactive tree-like graph. Follow the steps below to install Graphviz:

### Installing Graphviz on Windows

1. Visit the [Graphviz download page](https://graphviz.gitlab.io/download/) for Windows.

2. Download the MSI installer for your Windows version (64-bit or 32-bit).

3. Run the installer and follow the on-screen instructions.

4. After installation, make sure to add the Graphviz `bin` directory to your system's PATH environment variable. This allows CODEOWNERS Tree to locate the Graphviz executables.

### Installing Graphviz on macOS

Install Graphviz using Homebrew by running the following command in your terminal:

`brew install graphviz`

Homebrew will automatically add Graphviz to your system's PATH.

### Installing Graphviz on Linux (Ubuntu/Debian)
Open a terminal and run the following command to install Graphviz using the package manager:

`sudo apt-get install graphviz`

## Getting Started
Once you have Graphviz installed, you can start using CODEOWNERS Tree to generate and visualize ownership hierarchies for your codebase.

The new panel is located in the Explorer.

## Support Further Development

<a href="https://www.buymeacoffee.com/aignatev" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217"></a>
