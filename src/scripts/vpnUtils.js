const { exec } = require("child_process");

function disconnectAllSessions(callback) {
  exec("openvpn3 sessions-list", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error listing sessions: ${error.message}`);
      callback(); // Ensure callback is called even on error
      return;
    }
    if (stderr) {
      console.error(`Error in sessions list: ${stderr}`);
      callback(); // Ensure callback is called even on error
      return;
    }

    // Parse session paths and disconnect them
    const sessionPaths = stdout.match(
      /\/net\/openvpn\/v3\/sessions\/[a-f0-9s]+/g
    );

    if (sessionPaths && sessionPaths.length > 0) {
      let count = sessionPaths.length;
      sessionPaths.forEach((sessionPath) => {
        exec(
          `openvpn3 session-manage --disconnect --path ${sessionPath}`,
          (disError, disStdout, disStderr) => {
            if (disError) {
              console.error(`Failed to disconnect ${sessionPath}: ${disError}`);
            } else {
              console.log(`Disconnected session ${sessionPath}: ${disStdout}`);
            }
            if (--count === 0) callback(); // Call callback after the last disconnect completes
          }
        );
      });
    } else {
      callback(); // Call callback if no sessions to disconnect
    }
  });
}

module.exports = { disconnectAllSessions };
