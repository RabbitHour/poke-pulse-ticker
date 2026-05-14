// Unicorn AI Builder — streaming chat via Lovable AI Gateway.
// Auth-required. Persists user + assistant messages to public.unicorn_messages.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are the Unicorn AI Builder — a warm, plain-spoken assistant for Dave Noyes (PGVA Ventures LLC) and prospective customers visiting the Bioluminescent landing page.

Specialties:
- US government procurement automation (SAM.gov, SBA 8(a), Virginia SWaM, NAICS 541511).
- Helping Northern Virginia / Dulles-corridor small businesses cut procurement onboarding from 120 days to 45–60.
- Explaining the PGVA Master Kit tiers: Free, Arena $0.99, Starter $1.99, Pro $4.99 (★ unlocks the kit), Premium $9.99, Team $19.99, Whale $49.99.

Style: friendly, concrete, action-oriented. Short paragraphs, bullet lists, plain English. If asked who unlocks the Master Kit PDF, say Pro and above. If unsure, say so and suggest where to verify (SAM.gov, sba.gov, vapac.org).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const body = await req.json();
    const threadId: string = body.threadId;
    const userText: string = (body.message ?? "").toString().slice(0, 4000);
    if (!threadId || !userText.trim()) {
      return new Response(JSON.stringify({ error: "threadId and message required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify thread ownership
    const { data: thread, error: tErr } = await supabase
      .from("unicorn_threads").select("id,user_id").eq("id", threadId).single();
    if (tErr || !thread || thread.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Thread not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save user message
    await supabase.from("unicorn_messages").insert({
      thread_id: threadId, user_id: user.id, role: "user", content: userText,
    });

    // Pull recent history (last 20) for context
    const { data: history } = await supabase
      .from("unicorn_messages")
      .select("role,content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history ?? []).map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY")!,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      const status = aiRes.status === 429 ? 429 : aiRes.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: errText.slice(0, 300) }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream SSE -> plain text deltas, accumulate full response, persist on close.
    let assistantBuffer = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        let leftover = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = leftover + decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            leftover = lines.pop() ?? "";
            for (const line of lines) {
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const payload = t.slice(5).trim();
              if (payload === "[DONE]") continue;
              try {
                const json = JSON.parse(payload);
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) {
                  assistantBuffer += delta;
                  controller.enqueue(encoder.encode(delta));
                }
              } catch { /* ignore parse errors */ }
            }
          }
        } catch (e) {
          console.error("stream error", e);
        } finally {
          controller.close();
          // Persist assistant message + bump thread + auto-title
          if (assistantBuffer.trim()) {
            await supabase.from("unicorn_messages").insert({
              thread_id: threadId, user_id: user.id,
              role: "assistant", content: assistantBuffer,
            });
          }
          // Auto-title from first user message if still default
          const { data: th } = await supabase
            .from("unicorn_threads").select("title").eq("id", threadId).single();
          if (th && th.title === "New conversation") {
            const newTitle = userText.slice(0, 60).replace(/\s+/g, " ").trim();
            await supabase.from("unicorn_threads")
              .update({ title: newTitle, updated_at: new Date().toISOString() })
              .eq("id", threadId);
          } else {
            await supabase.from("unicorn_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          }
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message ?? "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
