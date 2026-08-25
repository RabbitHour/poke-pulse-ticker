import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { tcgdexFallback } from "./tcgdex.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-request-timestamp, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const POKEMON_TCG_BASE = "https://api.pokemontcg.io/v2";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const ALLOWED_PATHS = ["/cards", "/sets"];

function respond(ok: boolean, payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify({ ok, ...payload }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    if (isRateLimited(ip)) {
      return respond(false, { error: "Rate limit exceeded. Please try again later." });
    }

    const reqTimestamp = req.headers.get("x-request-timestamp");
    if (reqTimestamp) {
      const age = Date.now() - Number(reqTimestamp);
      if (age > 300_000 || age < -60_000) {
        return respond(false, { error: "Request expired. Please refresh and try again." });
      }
    }

    let body: { path?: string; params?: Record<string, string> };
    try {
      body = await req.json();
    } catch {
      return respond(false, { error: "Invalid request body" });
    }

    const { path, params } = body;

    if (!path || typeof path !== "string") {
      return respond(false, { error: "Missing 'path' parameter" });
    }

    const basePath = path.split("?")[0].replace(/\/[^/]+$/, "") || path.split("?")[0];
    const normalizedBase = basePath.startsWith("/") ? basePath : `/${basePath}`;
    const isAllowed = ALLOWED_PATHS.some(
      (allowed) => normalizedBase === allowed || normalizedBase.startsWith(allowed + "/")
    );
    if (!isAllowed) {
      return respond(false, { error: "Invalid API path" });
    }

    const allowedParams = ["q", "pageSize", "page", "orderBy", "select"];
    if (params && typeof params === "object") {
      for (const key of Object.keys(params)) {
        if (!allowedParams.includes(key)) {
          return respond(false, { error: `Invalid query parameter: ${key}` });
        }
      }
    }

    // ---- Source rotation ----------------------------------------------
    // Rotate the PRIMARY free source every day so no single provider sees
    // all of our traffic (avoids rate-limit bans / disconnects). Whichever
    // source is primary today, the others stay hot as automatic failover.
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    const SOURCES = ["pokemontcg", "tcgdex"] as const;
    const order = SOURCES.map((_, i) => SOURCES[(dayIndex + i) % SOURCES.length]);

    const fetchPokemonTcg = async (): Promise<Record<string, unknown> | null> => {
      const url = new URL(`${POKEMON_TCG_BASE}${path}`);
      if (params && typeof params === "object") {
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, String(value));
        }
      }

      const apiHeaders: Record<string, string> = {};
      const apiKey = Deno.env.get("POKEMON_TCG_API_KEY");
      if (apiKey) apiHeaders["X-Api-Key"] = apiKey;

      let apiRes: Response | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          apiRes = await fetch(url.toString(), { headers: apiHeaders });
        } catch {
          if (attempt === 2) return null;
          await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
          continue;
        }

        if (apiRes.status === 429) {
          const retryAfter = Number(apiRes.headers.get("Retry-After") || "2");
          await apiRes.text();
          await new Promise((r) => setTimeout(r, Math.min(retryAfter, 3) * 1000));
          continue;
        }
        break;
      }

      if (!apiRes || !apiRes.ok) {
        if (apiRes) await apiRes.text().catch(() => "");
        return null;
      }

      let rawText: string;
      try {
        rawText = await apiRes.text();
      } catch {
        return null;
      }

      try {
        const parsed = JSON.parse(rawText) as Record<string, unknown>;
        if (!parsed || (Array.isArray((parsed as any).data) && (parsed as any).data.length === 0)) {
          return null;
        }
        return { ...parsed, _source: "pokemontcg" };
      } catch {
        return null;
      }
    };

    const fetchTcgdex = async (): Promise<Record<string, unknown> | null> => {
      try {
        return await tcgdexFallback(path, params);
      } catch {
        return null;
      }
    };

    const attempted: string[] = [];
    for (const source of order) {
      attempted.push(source);
      const data = source === "pokemontcg" ? await fetchPokemonTcg() : await fetchTcgdex();
      if (data) {
        return new Response(JSON.stringify({ ...data, _sourceOrder: order, _attempted: attempted }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return respond(false, {
      error: "All live pricing sources unavailable",
      diagnostics: { attempted, order },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return respond(false, { error: msg, diagnostics: { error_stage: "unhandled" } });
  }

});
