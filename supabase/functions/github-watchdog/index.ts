// GitHub Sync Watchdog — probes the project's GitHub repo every 5 min via pg_cron.
// If the repo API is unreachable, returns 5xx, or hasn't received a commit in >2h
// (indicating Lovable→GitHub sync is broken), it asks Claude (via Lovable AI Gateway,
// falling back through Sonnet → GPT-5 → Gemini) for an exact fix and emails the
// dev team via Brevo. Snapshot is cached in index_cache.github_watchdog for the UI.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALERT_EMAIL = "contact@poke-pulse-ticker.com";
const STALE_COMMIT_MS = 2 * 60 * 60 * 1000; // 2h with no commits → sync likely broken
const DEFAULT_REPO = "poke-pulse-ticker/poke-pulse-ticker"; // override via GITHUB_REPO env

const MODEL_CHAIN = [
  "anthropic/claude-opus-4-20250514",
  "anthropic/claude-3-5-sonnet-20241022",
  "openai/gpt-5",
  "google/gemini-2.5-pro",
  "google/gemini-3-flash-preview",
];

interface ProbeResult {
  reachable: boolean;
  status: number;
  latencyMs: number;
  lastCommitISO: string | null;
  lastCommitAgeMin: number | null;
  lastCommitMessage: string | null;
  lastCommitSha: string | null;
  reason?: string;
}

async function probeGitHub(repo: string): Promise<ProbeResult> {
  const t0 = Date.now();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "PokePulseGitHubWatchdog/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = Deno.env.get("GITHUB_TOKEN");
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    const latencyMs = Date.now() - t0;
    if (!res.ok) {
      return {
        reachable: false, status: res.status, latencyMs,
        lastCommitISO: null, lastCommitAgeMin: null, lastCommitMessage: null, lastCommitSha: null,
        reason: `HTTP ${res.status}`,
      };
    }
    const arr = await res.json();
    const top = Array.isArray(arr) ? arr[0] : null;
    const dateStr = top?.commit?.author?.date ?? top?.commit?.committer?.date ?? null;
    const ageMin = dateStr ? Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000) : null;
    return {
      reachable: true, status: res.status, latencyMs,
      lastCommitISO: dateStr,
      lastCommitAgeMin: ageMin,
      lastCommitMessage: top?.commit?.message?.slice(0, 200) ?? null,
      lastCommitSha: top?.sha?.slice(0, 7) ?? null,
    };
  } catch (e) {
    return {
      reachable: false, status: 0, latencyMs: Date.now() - t0,
      lastCommitISO: null, lastCommitAgeMin: null, lastCommitMessage: null, lastCommitSha: null,
      reason: e instanceof Error ? e.message : String(e),
    };
  }
}

async function callClaude(prompt: string): Promise<{ model: string; text: string } | null> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  for (const model of MODEL_CHAIN) {
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are the Poké-Pulse GitHub sync sentinel. Be terse, bullet-point, actionable. Identify root cause and the exact fix steps a developer should take." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (r.ok) {
        const j = await r.json();
        const text = j.choices?.[0]?.message?.content ?? "";
        if (text) return { model, text };
      } else {
        console.warn(`model ${model} → HTTP ${r.status}`);
      }
    } catch (e) {
      console.warn(`model ${model} threw`, e);
    }
  }
  return null;
}

async function emailAlert(subject: string, html: string) {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) return;
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { accept: "application/json", "api-key": key, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Poké-Pulse GitHub Watchdog", email: "noreply@notify.poke-pulse-ticker.com" },
      to: [{ email: ALERT_EMAIL, name: "PGVA Dev Team" }],
      subject,
      htmlContent: html,
    }),
  }).catch((e) => console.error("brevo send failed", e));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const repo = Deno.env.get("GITHUB_REPO") ?? DEFAULT_REPO;

  const probe = await probeGitHub(repo);

  // Decide: alert if unreachable OR no commits in 2h+
  const tooStale = probe.reachable && probe.lastCommitAgeMin !== null && probe.lastCommitAgeMin * 60_000 > STALE_COMMIT_MS;
  const shouldAlert = !probe.reachable || tooStale;

  let diagnosis: { model: string; text: string } | null = null;
  if (shouldAlert) {
    const prompt = `GitHub sync probe for repo ${repo}:
- API reachable: ${probe.reachable ? "YES" : "NO"} (status ${probe.status}, ${probe.latencyMs}ms${probe.reason ? `, reason: ${probe.reason}` : ""})
- Last commit: ${probe.lastCommitISO ?? "unknown"} (${probe.lastCommitAgeMin ?? "?"} min ago)
- Last sha: ${probe.lastCommitSha ?? "n/a"}
- Last message: ${probe.lastCommitMessage ?? "n/a"}

Lovable pushes commits to this repo automatically via its GitHub App. If no commits in >2h or API errors, the sync is likely broken. Diagnose root cause (Lovable GitHub App uninstalled, repo renamed/deleted, token revoked, GitHub incident, rate limit, branch mismatch) and give exact recovery steps. Be terse.`;
    diagnosis = await callClaude(prompt);

    await emailAlert(
      `🚨 GitHub Sync ${probe.reachable ? "STALE" : "DOWN"} — ${repo}`,
      `<h2>GitHub watchdog tripped</h2>
       <p><strong>Repo:</strong> ${repo}</p>
       <p><strong>Reachable:</strong> ${probe.reachable ? "✅" : "❌"} (status ${probe.status})</p>
       <p><strong>Last commit:</strong> ${probe.lastCommitISO ?? "unknown"} (${probe.lastCommitAgeMin ?? "?"} min ago)</p>
       <p><strong>Last sha / msg:</strong> ${probe.lastCommitSha ?? "n/a"} — ${probe.lastCommitMessage ?? "n/a"}</p>
       <h3>Claude diagnosis (${diagnosis?.model ?? "AI gateway unreachable"}):</h3>
       <pre style="white-space:pre-wrap;font-family:ui-monospace,monospace;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px">${diagnosis?.text ?? "AI gateway unreachable — investigate manually: open Lovable → + menu → GitHub → reconnect."}</pre>
       <p style="font-size:12px;color:#64748b">Triggered ${new Date().toISOString()}</p>`,
    );
  }

  const payload = {
    repo,
    reachable: probe.reachable,
    status: probe.status,
    latencyMs: probe.latencyMs,
    lastCommitISO: probe.lastCommitISO,
    lastCommitAgeMin: probe.lastCommitAgeMin,
    lastCommitSha: probe.lastCommitSha,
    lastCommitMessage: probe.lastCommitMessage,
    reason: probe.reason ?? null,
    alerted: shouldAlert,
    claudeModel: diagnosis?.model ?? null,
    claudeDiagnosis: diagnosis?.text ?? null,
    checkedAt: new Date().toISOString(),
  };

  await sb.from("index_cache").upsert(
    { cache_key: "github_watchdog", data: payload, expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() },
    { onConflict: "cache_key" },
  );

  return new Response(JSON.stringify(payload), {
    status: shouldAlert ? 503 : 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
