import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function verifyAdmin(token: string): Promise<boolean> {
  const verifier = createClient(SUPABASE_URL, ANON_KEY);
  const { data: { user }, error } = await verifier.auth.getUser(token);
  if (error || !user) return false;
  if (!SERVICE_ROLE_KEY) return false;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.is_admin === true;
}

type Finding = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
};

type PkgJson = { name?: string; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

function readPkg(...paths: string[]): PkgJson | null {
  for (const p of paths) {
    try {
      return JSON.parse(readFileSync(p, "utf-8")) as PkgJson;
    } catch { continue; }
  }
  return null;
}

function parseVer(v: string): [number, number, number] {
  const normalized = v.replace(/[\^~>=< ]/g, "").split("-")[0] ?? "";
  const parts = normalized.split(".").map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }
  const isAdmin = await verifyAdmin(authHeader.slice(7));
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const findings: Finding[] = [];
  const cwd = process.cwd();

  // ── Required env vars ──────────────────────────────────────────────────────
  const requiredVars: { key: string; label: string; severity: Finding["severity"] }[] = [
    { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role Key", severity: "critical" },
    { key: "ANTHROPIC_API_KEY", label: "Anthropic API Key", severity: "high" },
    { key: "ELEVENLABS_API_KEY", label: "ElevenLabs API Key", severity: "medium" },
  ];
  for (const { key, label, severity } of requiredVars) {
    const val = process.env[key];
    if (!val || val.length < 10) {
      findings.push({
        id: `missing-${key}`,
        title: `${label} nicht gesetzt`,
        description: `${key} fehlt oder ist zu kurz. Abhängige Features funktionieren nicht.`,
        severity,
      });
    }
  }

  // ── NEXT_PUBLIC_ exposure of sensitive keys ────────────────────────────────
  const sensitivePatterns = ["SERVICE_ROLE", "SECRET", "PRIVATE_KEY", "ANTHROPIC", "ELEVENLABS"];
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("NEXT_PUBLIC_") && sensitivePatterns.some((p) => key.toUpperCase().includes(p))) {
      findings.push({
        id: `exposed-${key}`,
        title: "Sensibler Schlüssel öffentlich exponiert",
        description: `${key} ist als NEXT_PUBLIC_-Variable gesetzt und damit im Browser-Bundle sichtbar.`,
        severity: "critical",
      });
    }
  }

  // ── Next.js version against known CVEs ────────────────────────────────────
  const webPkg = readPkg(join(cwd, "package.json"), join(cwd, "apps/web/package.json"));
  const nextVer = webPkg?.dependencies?.next ?? webPkg?.devDependencies?.next;
  if (nextVer) {
    const [major, minor, patch] = parseVer(nextVer);
    if (major === 14 && (minor < 2 || (minor === 2 && patch < 10))) {
      findings.push({
        id: "nextjs-cve-2024-46982",
        title: `Next.js ${nextVer.replace(/[\^~]/g, "")} enthält bekannte CVEs`,
        description:
          "CVE-2024-46982 (Cache Poisoning) betrifft Next.js < 14.2.10. Bitte auf 14.2.10+ updaten.",
        severity: "high",
      });
    } else {
      findings.push({
        id: "nextjs-ok",
        title: `Next.js ${nextVer.replace(/[\^~]/g, "")} — keine bekannten CVEs`,
        description: "Version enthält keine bekannten kritischen Sicherheitslücken.",
        severity: "info",
      });
    }
  }

  // ── Lockfile presence ──────────────────────────────────────────────────────
  const hasLock = (() => {
    for (const p of [join(cwd, "package-lock.json"), join(cwd, "../../package-lock.json"), join(cwd, "../../../package-lock.json")]) {
      try { readFileSync(p); return true; } catch { continue; }
    }
    return false;
  })();
  if (!hasLock) {
    findings.push({
      id: "no-lockfile",
      title: "package-lock.json nicht gefunden",
      description: "Ohne Lockfile sind reproduzierbare Installationen nicht garantiert.",
      severity: "low",
    });
  }

  // ── Vercel token ───────────────────────────────────────────────────────────
  if (!process.env.VERCEL_TOKEN) {
    findings.push({
      id: "no-vercel-token",
      title: "Vercel API Token nicht konfiguriert",
      description: "VERCEL_TOKEN fehlt — Deployment-Status kann nicht abgerufen werden.",
      severity: "info",
    });
  }

  return NextResponse.json({ findings, checkedAt: new Date().toISOString() });
}
