/**
 * Start the Next.js dev server for screenshots/tests.
 *
 * Usage:
 *   node scripts/start-dev.mjs
 *
 * Runs `npm run dev` on port 3000, waits for /api/health, prints the URL, and
 * keeps the server alive until you stop it (Ctrl+C or kill).
 */

import { exec } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PWD = process.env.PWD ?? process.cwd();
const PORT = 3000;
const BASE = `http://localhost:${PORT}`;

// On Windows, spawning npm directly can fail because npm is a shell script.
// Using exec with the Windows cmd wrapper sidesteps that.
const proc = exec(`npm run dev`, {
  cwd: PWD,
  env: { ...process.env, PORT: String(PORT), CI: "1" },
  windowsHide: false,
});

proc.stdout?.on("data", (d) => process.stdout.write(`[next] ${d}`));
proc.stderr?.on("data", (d) => process.stderr.write(`[next err] ${d}`));

proc.on("exit", (code) => {
  if (code !== null && code !== 0) {
    process.stderr.write(`Dev server exited with code ${code}\n`);
  }
});

const waitForHealth = async (ms = 90000) => {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) {
        console.log(`Dev server ready: ${BASE}`);
        return true;
      }
    } catch {
      // ignore
    }
    await sleep(1000);
  }
  return false;
};

const ok = await waitForHealth();
if (!ok) {
  process.stderr.write("Timed out waiting for dev server.\n");
  try { proc.kill(); } catch {}
  process.exit(2);
}

// Keep alive until the process is killed.
await new Promise(() => {});
