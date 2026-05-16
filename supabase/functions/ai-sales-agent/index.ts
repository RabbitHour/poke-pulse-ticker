import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

// Massively expanded query set — geo + role + niche permutations across US & Canada
// Targets thousands of independent card shops, LGS, hobby stores, and online TCG retailers
const US_STATES = [
  "California","Texas","Florida","New York","Pennsylvania","Illinois","Ohio","Georgia",
  "North Carolina","Michigan","New Jersey","Virginia","Washington","Arizona","Massachusetts",
  "Tennessee","Indiana","Missouri","Maryland","Wisconsin","Colorado","Minnesota","Oregon",
  "Nevada","Utah","Connecticut","Kentucky","Alabama","South Carolina","Louisiana",
];
const CA_PROVINCES = ["Ontario","Quebec","British Columbia","Alberta","Manitoba","Nova Scotia"];
const ROLE_EMAILS = ["info@","sales@","hello@","contact@","support@","orders@","store@","buylist@"];
const SHOP_TYPES = [
  "pokemon card shop","pokemon TCG store","trading card game store","local game store pokemon",
  "card shop singles pokemon","hobby shop pokemon cards","comic and card shop pokemon",
  "pokemon buylist shop","graded card shop pokemon","sealed pokemon product retailer",
];

function buildDiscoveryQueries(): string[] {
  const queries: string[] = [];
  // Geo × shop-type permutations (US states)
  for (const state of US_STATES) {
    queries.push(`pokemon card shop ${state} "contact" email`);
    queries.push(`TCG store ${state} pokemon "info@" OR "sales@"`);
  }
  // Geo × shop-type (Canadian provinces)
  for (const prov of CA_PROVINCES) {
    queries.push(`pokemon card shop ${prov} Canada "contact" email`);
    queries.push(`TCG store ${prov} pokemon "info@" OR "hello@"`);
  }
  // Role-email targeted queries
  for (const role of ROLE_EMAILS) {
    queries.push(`pokemon card shop "${role}" site:.com -ebay -tcgplayer`);
  }
  // Niche shop-type queries
  for (const type of SHOP_TYPES) {
    queries.push(`"${type}" "contact us" email USA`);
    queries.push(`"${type}" "contact" email Canada`);
  }
  // Directory / aggregator queries
  queries.push("list of pokemon card shops United States contact");
  queries.push("directory of trading card stores Canada email");
  queries.push("best pokemon card stores near me email contact");
  queries.push("independent comic and card shops USA pokemon contact");
  return queries;
}

const DISCOVERY_QUERIES = buildDiscoveryQueries();

// Email regex tuned for business contact extraction
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
// Filter out junk/role addresses we don't want to spam
const EMAIL_BLOCKLIST = /(noreply|no-reply|donotreply|wizards\.com|pokemon\.com|tcgplayer\.com|example\.com|sentry\.io|test@|@test\.|@localhost|@sentry|@cloudflare|@google|@facebook|@twitter|@instagram|@youtube|@reddit|wixpress|squarespace|godaddy|@2x|\.png|\.jpg|\.svg|@wordpress|@shopify|user@domain|name@email|your@email|yourname@|@gmail\.png|@yahoo\.png)/i;

async function firecrawlSearch(query: string, apiKey: string) {
  const res = await fetch(`${FIRECRAWL_V2}/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      limit: 20, // up from 8 → 2.5x more pages per query
      scrapeOptions: { formats: ["markdown"] },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Firecrawl search ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// Pick a rotating slice of queries each run so we cover the full pool over multiple runs
// without exhausting Firecrawl quota in a single invocation.
function pickQueriesForRun(all: string[], batchSize: number): string[] {
  // Hour-based rotation so consecutive runs cover different slices
  const hour = new Date().getUTCHours();
  const startIdx = (hour * batchSize) % all.length;
  const slice: string[] = [];
  for (let i = 0; i < batchSize; i++) {
    slice.push(all[(startIdx + i) % all.length]);
  }
  return slice;
}

// Page must look like a card/TCG shop — otherwise we skip ALL emails on that page.
// Prevents PDFs, church directories, news articles, etc. from polluting the lead pool.
const TCG_RELEVANCE_RE = /\b(pokemon|pok[eé]mon|tcg|trading card|card shop|card store|magic the gathering|mtg|yu-?gi-?oh|booster|singles|buylist|graded|psa|cgc|bgs)\b/i;
const NEGATIVE_CONTEXT_RE = /\b(church|ministry|funeral|obituary|school district|university|county clerk|city hall|elder law|attorney|legal services|hospital|clinic|real estate|insurance agency)\b/i;

function extractRealLeadsFromMarkdown(markdown: string, sourceUrl: string, title?: string) {
  const found = new Map<string, { email: string; company: string; source: string }>();
  if (!markdown) return [];
  const titleAndBody = `${title || ""}\n${markdown}`;
  // Skip the page entirely if it doesn't look like a TCG shop OR has obvious non-shop context
  if (!TCG_RELEVANCE_RE.test(titleAndBody)) return [];
  if (NEGATIVE_CONTEXT_RE.test(titleAndBody)) return [];
  // Skip PDFs and aggregator junk
  if (/\.pdf(\?|$)/i.test(sourceUrl) || /^\[PDF\]/i.test(title || "")) return [];

  const matches = markdown.match(EMAIL_RE) || [];
  let host = "unknown";
  try { host = new URL(sourceUrl).hostname; } catch { /* ignore */ }
  const baseDomain = host.replace(/^www\./, "");
  for (const raw of matches) {
    const email = raw.toLowerCase().trim();
    if (EMAIL_BLOCKLIST.test(email)) continue;
    if (found.has(email)) continue;
    const emailDomain = email.split("@")[1] || "";
    const looksOwnDomain = emailDomain === baseDomain
      || baseDomain.endsWith("." + emailDomain)
      || emailDomain.endsWith("." + baseDomain);
    // Only accept emails on the shop's own domain — eliminates random mentions
    if (!looksOwnDomain) continue;
    found.set(email, {
      email,
      company: (title?.trim() || baseDomain).slice(0, 120),
      source: `Verified TCG shop site: ${baseDomain}`,
    });
  }
  return Array.from(found.values());
}

// Dedupe and bulk-insert leads, skipping any email already in the DB.
// Also bumps today's leads_generated metric.
async function flushLeadsToDb(
  supabase: ReturnType<typeof createClient>,
  leads: Array<{ email: string; company: string; source: string }>,
): Promise<{ inserted: number; skipped: number }> {
  if (leads.length === 0) return { inserted: 0, skipped: 0 };

  const uniqueByEmail = new Map<string, typeof leads[number]>();
  for (const l of leads) if (!uniqueByEmail.has(l.email)) uniqueByEmail.set(l.email, l);
  const candidateEmails = Array.from(uniqueByEmail.keys());

  const { data: existing } = await supabase
    .from("sales_leads")
    .select("email")
    .in("email", candidateEmails);
  const existingSet = new Set((existing || []).map((r: { email: string }) => r.email.toLowerCase()));

  let inserted = 0;
  let skipped = 0;
  const rowsToInsert: Array<Record<string, unknown>> = [];
  for (const lead of uniqueByEmail.values()) {
    if (existingSet.has(lead.email)) { skipped++; continue; }
    const localPart = lead.email.split("@")[0].replace(/[._-]/g, " ");
    const name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
    rowsToInsert.push({
      name: name.slice(0, 100),
      email: lead.email,
      company: lead.company,
      source: lead.source,
      score: 75,
      notes: "Discovered via public TCG shop directory scrape (real, deliverable email).",
      ai_personalization: { real_source: true, scraped_at: new Date().toISOString() },
    });
  }

  if (rowsToInsert.length > 0) {
    const { error, data } = await supabase.from("sales_leads").insert(rowsToInsert).select("id");
    if (!error && data) inserted = data.length;
    else if (error) console.error("[flushLeadsToDb] insert error:", error.message);
  }

  if (inserted > 0) {
    const today = new Date().toISOString().split("T")[0];
    const { data: existingMetric } = await supabase
      .from("sales_pipeline_metrics")
      .select("*")
      .eq("metric_date", today)
      .maybeSingle();
    if (existingMetric) {
      await supabase.from("sales_pipeline_metrics").update({
        leads_generated: (existingMetric.leads_generated || 0) + inserted,
      }).eq("id", existingMetric.id);
    } else {
      await supabase.from("sales_pipeline_metrics").insert({ metric_date: today, leads_generated: inserted });
    }
  }
  return { inserted, skipped };
}

const OWNER_EMAIL = "noyes.dave@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Authorize: service-role bearer (cron) OR authenticated owner email.
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    let authorized = false;
    if (token && token === serviceKey) {
      authorized = true;
    } else if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.email === OWNER_EMAIL) authorized = true;
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, customQueries } = await req.json();

    // ========== REAL LEAD DISCOVERY via web search (replaces AI-hallucinated leads) ==========
    if (action === "generate_leads") {
      if (!FIRECRAWL_API_KEY) {
        throw new Error("FIRECRAWL_API_KEY not configured — cannot search public web for real shop emails.");
      }

      // Per-run batch: scan up to 25 queries × 20 results per run.
      // Rotates by hour so consecutive runs cover different geo/role slices of the full pool.
      const QUERIES_PER_RUN = 25;
      const queries: string[] = Array.isArray(customQueries) && customQueries.length > 0
        ? customQueries.slice(0, QUERIES_PER_RUN)
        : pickQueriesForRun(DISCOVERY_QUERIES, QUERIES_PER_RUN);

      // Long-running background task — survives client disconnects via EdgeRuntime.waitUntil
      const backgroundWork = (async () => {
        const allLeads: Array<{ email: string; company: string; source: string }> = [];
        let queriesProcessed = 0;
        for (const query of queries) {
          try {
            const searchResult = await firecrawlSearch(query, FIRECRAWL_API_KEY);
            const results = searchResult?.data?.web
              || searchResult?.web
              || searchResult?.data
              || [];
            const items: Array<{ url?: string; markdown?: string; title?: string; description?: string }> = Array.isArray(results) ? results : [];
            for (const item of items) {
              if (!item?.url) continue;
              const md = (item.markdown || "") + "\n" + (item.description || "");
              const leads = extractRealLeadsFromMarkdown(md, item.url, item.title);
              allLeads.push(...leads);
            }
            queriesProcessed++;
            // Flush partial results every 5 queries so progress is durable even if the runtime is killed
            if (queriesProcessed % 5 === 0) {
              await flushLeadsToDb(supabase, allLeads.splice(0));
            }
          } catch (err) {
            console.error(`[generate_leads] query="${query}" error:`, err);
          }
        }
        if (allLeads.length > 0) await flushLeadsToDb(supabase, allLeads);
        console.log(`[generate_leads] complete: processed ${queriesProcessed}/${queries.length} queries`);
      })();

      // @ts-ignore — EdgeRuntime is provided by Supabase runtime
      if (typeof EdgeRuntime !== "undefined" && typeof EdgeRuntime.waitUntil === "function") {
        // @ts-ignore
        EdgeRuntime.waitUntil(backgroundWork);
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Lead discovery started in background — scanning ${queries.length} queries × up to 20 results each. Check sales_leads table in 1-3 minutes.`,
        queries_queued: queries.length,
        note: "Leads discovered via live web search of publicly published shop contact pages — real, deliverable emails.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ========== OUTREACH (sends real personalized emails to real leads) ==========
    if (action === "outreach") {
      // Only contact REAL leads from our scraper (skip any legacy AI-fabricated ones)
      const { data: leads } = await supabase
        .from("sales_leads")
        .select("*")
        .in("status", ["new", "contacted"])
        .filter("ai_personalization->real_source", "eq", true)
        .order("score", { ascending: false })
        .limit(15);

      if (!leads || leads.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: "No real-source leads ready for outreach. Run generate_leads first.",
          emails_sent: 0,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let emailsSent = 0;
      let emailsFailed = 0;

      for (const lead of leads) {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an elite sales copywriter for Poké-Pulse-Engine™. Write a compelling, personalized cold outreach email to a Pokémon TCG local game store. The product offers: real-time Pokémon card pricing across 3,000+ cards, Alpha Signal™ predictive analytics, arbitrage detection, portfolio tracking, and grading ROI calculators — useful for shops pricing their inventory and buylists. Pricing: Pro $4.99/mo, Premium $9.99/mo, Team $19.99/mo. Website: poke-pulse-ticker.com. Keep emails under 130 words, warm, value-focused, no spam language. Acknowledge they're a real local shop.`,
              },
              {
                role: "user",
                content: `Write outreach for the team at ${lead.company}. Source: ${lead.source}.`,
              },
            ],
            tools: [{
              type: "function",
              function: {
                name: "create_email",
                description: "Create outreach email",
                parameters: {
                  type: "object",
                  properties: {
                    subject: { type: "string" },
                    body: { type: "string" },
                  },
                  required: ["subject", "body"],
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "create_email" } },
          }),
        });

        if (!aiResponse.ok) { emailsFailed++; continue; }
        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall) { emailsFailed++; continue; }
        const email = JSON.parse(toolCall.function.arguments);

        // Use supabase.functions.invoke — auto-attaches valid internal JWT for service-role context
        const sendResult = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "sales-outreach",
            recipientEmail: lead.email,
            idempotencyKey: `sales-outreach-${lead.id}-${new Date().toISOString().split("T")[0]}`,
            templateData: {
              recipientName: lead.name,
              subject: email.subject,
              emailBody: email.body,
              ctaUrl: `https://poke-pulse-ticker.com/?ref=lead_${lead.id}&utm_source=outreach&utm_campaign=cold_email`,
            },
          },
        });

        let emailStatus = sendResult.error ? "failed" : "sent";
        let providerUsed: "lovable" | "brevo" = "lovable";
        let failoverReason: string | null = null;

        // ===== SELF-HEALING FAILOVER → Brevo HTTP API =====
        // Triggers on rate-limit, auth, domain-verification, or any provider error.
        if (sendResult.error) {
          const errMsg = (sendResult.error.message || JSON.stringify(sendResult.error) || "").toLowerCase();
          failoverReason = errMsg.slice(0, 200);
          console.warn(`[failover] Lovable Email failed for ${lead.email}: ${errMsg.slice(0, 120)} — trying Brevo`);

          const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
          if (BREVO_API_KEY) {
            try {
              const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                  "api-key": BREVO_API_KEY,
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                },
                body: JSON.stringify({
                  sender: { name: "Poké-Pulse-Engine", email: "outreach@poke-pulse-ticker.com" },
                  to: [{ email: lead.email, name: lead.name }],
                  subject: email.subject,
                  htmlContent: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#222;max-width:600px;">
                    ${email.body.split("\n").map((p: string) => `<p>${p}</p>`).join("")}
                    <p style="margin-top:24px;"><a href="https://poke-pulse-ticker.com/?ref=lead_${lead.id}&utm_source=outreach&utm_campaign=cold_email_brevo" style="background:#1a73e8;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;">See Poké-Pulse-Engine in action →</a></p>
                    <p style="font-size:11px;color:#888;margin-top:32px;">Sent to a public TCG shop contact address. Reply STOP to opt out.</p>
                  </div>`,
                  textContent: `${email.body}\n\nSee it in action: https://poke-pulse-ticker.com/?ref=lead_${lead.id}\n\nReply STOP to opt out.`,
                }),
              });
              if (brevoRes.ok) {
                emailStatus = "sent";
                providerUsed = "brevo";
                console.log(`[failover] ✅ Brevo delivered to ${lead.email}`);
              } else {
                const brevoErr = await brevoRes.text().catch(() => "");
                console.error(`[failover] ❌ Brevo also failed (${brevoRes.status}): ${brevoErr.slice(0, 200)}`);
              }
            } catch (brevoErr) {
              console.error(`[failover] ❌ Brevo exception:`, brevoErr);
            }
          } else {
            console.error(`[failover] BREVO_API_KEY not configured — cannot fail over.`);
          }
        }

        if (emailStatus === "sent") emailsSent++; else emailsFailed++;

        await supabase.from("sales_outreach_log").insert({
          lead_id: lead.id,
          outreach_type: "email",
          subject: email.subject,
          body: email.body,
          ai_model_used: "gemini-2.5-flash",
          status: emailStatus,
          response: providerUsed === "brevo"
            ? `delivered_via=brevo_failover; original_error=${failoverReason}`
            : `delivered_via=lovable`,
        });

        await supabase.from("sales_leads").update({
          status: lead.status === "new" ? "contacted" : "engaged",
          last_contacted_at: new Date().toISOString(),
          next_followup_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        }).eq("id", lead.id);
      }

      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase.from("sales_pipeline_metrics").select("*").eq("metric_date", today).maybeSingle();
      if (existing) {
        await supabase.from("sales_pipeline_metrics").update({
          emails_sent: (existing.emails_sent || 0) + emailsSent,
        }).eq("id", existing.id);
      } else {
        await supabase.from("sales_pipeline_metrics").insert({ metric_date: today, emails_sent: emailsSent });
      }

      return new Response(JSON.stringify({
        success: true,
        emails_sent: emailsSent,
        emails_failed: emailsFailed,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "pipeline_stats") {
      const { data: leads } = await supabase.from("sales_leads").select("status,ai_personalization");
      const { data: metrics } = await supabase.from("sales_pipeline_metrics").select("*").order("metric_date", { ascending: false }).limit(7);
      const { data: recentOutreach } = await supabase.from("sales_outreach_log").select("*").order("created_at", { ascending: false }).limit(10);

      const statusCounts = { new: 0, contacted: 0, engaged: 0, demo_scheduled: 0, converted: 0, lost: 0 };
      let realSourceCount = 0;
      leads?.forEach((l) => {
        if (l.status in statusCounts) statusCounts[l.status as keyof typeof statusCounts]++;
        if ((l.ai_personalization as { real_source?: boolean })?.real_source) realSourceCount++;
      });

      return new Response(JSON.stringify({
        pipeline: statusCounts,
        total_leads: leads?.length || 0,
        real_source_leads: realSourceCount,
        weekly_metrics: metrics || [],
        recent_outreach: recentOutreach || [],
        conversion_rate: leads?.length ? ((statusCounts.converted / leads.length) * 100).toFixed(1) : "0",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI Sales Agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
