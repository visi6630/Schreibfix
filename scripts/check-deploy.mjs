#!/usr/bin/env node
// Usage: node scripts/check-deploy.mjs
// Reads the latest Vercel deployment status and prints error logs if it failed.
// Requires VERCEL_TOKEN and VERCEL_PROJECT_ID in apps/web/.env.local (or env).

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dir, "../apps/web/.env.local");
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local missing — rely on environment variables
  }
}

loadEnv();

const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

if (!TOKEN || TOKEN === "your_vercel_token_here") {
  console.error("❌  VERCEL_TOKEN not set. Add it to apps/web/.env.local");
  process.exit(1);
}
if (!PROJECT_ID || PROJECT_ID === "your_vercel_project_id_here") {
  console.error("❌  VERCEL_PROJECT_ID not set. Add it to apps/web/.env.local");
  process.exit(1);
}

async function vercelFetch(path) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel API ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  console.log("🔍  Checking latest Vercel deployment…\n");

  const { deployments } = await vercelFetch(
    `/v6/deployments?projectId=${PROJECT_ID}&limit=1`
  );

  if (!deployments?.length) {
    console.log("No deployments found for this project.");
    return;
  }

  const dep = deployments[0];
  const stateEmoji = { READY: "✅", ERROR: "❌", CANCELED: "⚠️", BUILDING: "🔨" };
  const emoji = stateEmoji[dep.state] ?? "❓";

  console.log(`${emoji}  State:   ${dep.state}`);
  console.log(`🌐  URL:     https://${dep.url}`);
  console.log(`📅  Created: ${new Date(dep.createdAt).toLocaleString()}`);
  console.log(`🆔  ID:      ${dep.uid}\n`);

  if (dep.state !== "ERROR") {
    console.log("Deployment is not in ERROR state — nothing to investigate.");
    return;
  }

  console.log("──────────────────────────────────────────");
  console.log("Build logs (last 100 lines):");
  console.log("──────────────────────────────────────────\n");

  try {
    const { build } = await vercelFetch(`/v2/deployments/${dep.uid}/events`);
    const events = Array.isArray(build) ? build : [];
    const lines = events
      .filter((e) => e.type === "stdout" || e.type === "stderr")
      .map((e) => e.payload?.text ?? "")
      .filter(Boolean);

    const tail = lines.slice(-100);
    for (const line of tail) process.stdout.write(line.endsWith("\n") ? line : line + "\n");
  } catch (err) {
    // Fall back to /v2/deployments/:id/events (different endpoint format)
    try {
      const events = await vercelFetch(`/v3/deployments/${dep.uid}/events?builds=1&limit=100`);
      const lines = (Array.isArray(events) ? events : [])
        .filter((e) => e.type === "stdout" || e.type === "stderr")
        .map((e) => e.payload?.text ?? "")
        .filter(Boolean);
      for (const line of lines) process.stdout.write(line.endsWith("\n") ? line : line + "\n");
    } catch {
      console.warn("Could not retrieve build logs:", err.message);
      console.log("\nOpen the Vercel dashboard to view the full logs:");
      console.log(`https://vercel.com/dashboard (project: ${PROJECT_ID})`);
    }
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
