const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  runCommand: (command) => {
    ipcRenderer.send("run-command", command);
  },
  onCommandOutput: (callback) => {
    ipcRenderer.on("command-output", (_, data) => callback(data));
  },
});
