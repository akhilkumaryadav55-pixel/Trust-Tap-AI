/**
 * Capture screenshots of the running app (debug variant).
 *
 * Spins up `npm run dev` on port 3000 via execFile, streams the next output,
 * waits for the Ready line or /api/health, screenshots the key screens via
 * Playwright, and saves to screenshots/.
 */

import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const PWD = process.env.PWD ?? process.cwd();
const SCREENSHOT_DIR = join(PWD, "screenshots");

async function isUp() {
  try {
    const res = await fetch(`${BASE}/api/health`);
    if (!res.ok) return false;
    return true;
  } catch {
    return false;
  }
}

async function startAndScreenshot() {
  console.log("Starting dev server...");
  const proc = execFile("npm", ["run", "dev"], {
    cwd: PWD,
    env: { ...process.env, PORT: "3000", CI: "1" },
  });

  let ready = false;
  proc.stdout?.on("data", (d) => {
    const s = d.toString();
    if (s.includes("ready") || s.includes("started server") || s.includes("Local:")) {
      ready = true;
      console.log("Next dev boot signal seen.");
    }
  });
  proc.stderr?.on("data", (d) => {
    const s = d.toString();
    if (s.toLowerCase().includes("error")) console.error(s.slice(0, 200));
  });

  proc.on("exit", (code) => {
    console.log("Dev server exited:", code);
  });

  // give it time to start
  await sleep(5000);
  // poll health with a longer timeout
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (await isUp()) break;
    await sleep(1500);
  }

  if (!(await isUp())) {
    console.error("Dev server did not become healthy. Stopping.");
    try { proc.kill("SIGKILL"); } catch {}
    return;
  }

  // screenshots
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
  const page = await context.newPage();

  const screens = [
    { url: "/", name: "dashboard" },
    { url: "/check/text", name: "text-checker" },
    { url: "/check/link", name: "link-checker" },
    { url: "/check/screenshot", name: "screenshot-checker" },
    { url: "/results", name: "results-empty" },
    { url: "/emergency", name: "emergency" },
    { url: "/safety-center", name: "safety-center" },
    { url: "/learn", name: "learning-center" },
    { url: "/saved", name: "saved-checks" },
    { url: "/settings", name: "settings" },
  ];

  for (const { url, name } of screens) {
    await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    const path = join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path, fullPage: false });
    console.log("Saved:", path);
  }
  await browser.close();

  try { proc.kill("SIGKILL"); } catch {}
}

await mkdir(SCREENSHOT_DIR, { recursive: true });
await startAndScreenshot();
