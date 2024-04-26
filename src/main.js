const { app, BrowserWindow, ipcMain } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const { disconnectAllSessions } = require("./scripts/vpnUtils");

let isQuitting = false; // Flag to control quit prevention

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 450,
    webPreferences: {
      preload: path.join(__dirname, "scripts", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "pages", "index.html"));

  ipcMain.on("run-command", (event, command) => {
    exec(command, (error, stdout, stderr) => {
      event.reply("command-output", { error, stdout, stderr });
    });
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", (event) => {
  if (!isQuitting) {
    event.preventDefault(); // Prevent default quit only if we're not already quitting
    isQuitting = true; // Set flag to indicate that quitting process has started
    disconnectAllSessions(() => {
      app.quit(); // Quit the application once cleanup is done
    });
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
