import chokidar from "chokidar";
import { spawn } from "node:child_process";

let currentBuild = null;
let queued = false;

function runBuild() {
  if (currentBuild) {
    // Kill running build before restarting
    currentBuild.kill();
    currentBuild = null;
  }

  currentBuild = spawn("node", ["scripts/build.js", "fast"], { stdio: "inherit" });

  currentBuild.on("close", () => {
    currentBuild = null;
    if (queued) {
      queued = false;
      runBuild();
    }
  });
}

const watcher = chokidar.watch(["src", "scripts/build.js", "scripts/pageBuilder.js"], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true,
});

watcher.on("ready", () => {
  console.log("Watching for changes...");
  runBuild();
});

watcher.on("all", (event, changedPath) => {
  console.log(`[${event}] ${changedPath}`);
  if (currentBuild) {
    queued = true;
  } else {
    runBuild();
  }
});
