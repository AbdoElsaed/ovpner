const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const cancelBtn = document.getElementById("cancelBtn");
const selectedFile = document.getElementById("selectedFile");

let currentSessionPath = null;

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.path.endsWith(".ovpn")) {
    console.log(`File selected: ${file.path}`);

    fileLabel.classList.add("hidden");
    selectedFile.classList.remove("hidden");
    selectedFile.innerText = `selected file: ${file.name}`;
    cancelBtn.classList.remove("hidden");
  } else {
    console.error("Please select a valid .ovpn file.");
    showToast(
      "Invalid file type. Please select a valid .ovpn file.",
      "error",
      5000
    );
  }
});

cancelBtn.addEventListener("click", () => {
  fileInput.value = "";
  selectedFilePath = null;
  fileLabel.classList.remove("hidden");
  selectedFile.classList.add("hidden");
  cancelBtn.classList.add("hidden");
});

connectBtn.addEventListener("click", () => {
  const filePath = fileInput.files[0]?.path;
  if (filePath && filePath.endsWith(".ovpn")) {
    // run the connection command
    Promise.resolve(
      window.electronAPI.runCommand(
        `openvpn3 session-start --config "${filePath}"`
      )
    ).then(() => {
      showLoadingSpinner();
    });

    window.electronAPI.onCommandOutput((data) => {
      if (data.error) {
        console.error(`exec error: ${data.error}`);
        showToast(`Error: ${data.error}`, "error", 5000);
        return;
      }
      console.log(`stdout: ${data.stdout}`);
      console.error(`stderr: ${data.stderr}`);

      const match = data.stdout.match(/Session path: (.+)/);
      if (match) {
        currentSessionPath = match[1].trim();
      }
      showToast("VPN Connected Successfully!");

      connectBtn.classList.add("hidden");
      disconnectBtn.classList.remove("hidden");

      stopLoadingSpinner();
    });
  } else {
    alert("Please select a valid .ovpn file first.");
  }
});

disconnectBtn.addEventListener("click", () => {
  if (currentSessionPath) {
    Promise.resolve(
      window.electronAPI.runCommand(
        `openvpn3 session-manage --disconnect --session-path "${currentSessionPath}"`
      )
    ).then(() => {
      showLoadingSpinner();
    });

    window.electronAPI.onCommandOutput((data) => {
      if (data.error) {
        console.error(`disconnect error: ${data.error}`);
        return;
      }
      console.log(`stdout: ${data.stdout}`);
      console.error(`stderr: ${data.stderr}`);
      currentSessionPath = null;

      connectBtn.classList.remove("hidden");
      disconnectBtn.classList.add("hidden");

      showToast("VPN Disconnected Successfully!");
      stopLoadingSpinner();
    });
  } else {
    console.log("No active session to disconnect.");
  }
});
