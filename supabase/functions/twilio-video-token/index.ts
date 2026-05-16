import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-timestamp, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Twilio Video Access Token generation using JWT
// We build the token manually since we can't use the Node SDK in Deno

function base64url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function textToUint8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textToUint8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, textToUint8(data));
  return base64url(new Uint8Array(sig));
}

async function createTwilioVideoToken(
  accountSid: string,
  apiKeySid: string,
  apiKeySecret: string,
  identity: string,
  roomName: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const ttl = 3600; // 1 hour

  const header = { alg: "HS256", typ: "JWT", cty: "twilio-fpa;v=1" };
  const grants: Record<string, any> = {
    identity,
    video: { room: roomName },
  };
  const payload = {
    jti: `${apiKeySid}-${now}`,
    iss: apiKeySid,
    sub: accountSid,
    iat: now,
    exp: now + ttl,
    grants,
  };

  const headerB64 = base64url(textToUint8(JSON.stringify(header)));
  const payloadB64 = base64url(textToUint8(JSON.stringify(payload)));
  const signature = await hmacSign(apiKeySecret, `${headerB64}.${payloadB64}`);

  return `${headerB64}.${payloadB64}.${signature}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check age verification
    const { data: profile } = await supabase
      .from("profiles")
      .select("chat_age_verified, display_name")
      .eq("id", user.id)
      .single();

    if (!profile?.chat_age_verified) {
      return new Response(JSON.stringify({ error: "Age verification required (18+)" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { duelId } = await req.json();
    if (!duelId) {
      return new Response(JSON.stringify({ error: "duelId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is participant in the duel
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: duel } = await serviceClient
      .from("prediction_duels")
      .select("*")
      .eq("id", duelId)
      .single();

    if (!duel || (duel.challenger_id !== user.id && duel.opponent_id !== user.id)) {
      return new Response(JSON.stringify({ error: "Not a participant in this duel" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (duel.status !== "active") {
      return new Response(JSON.stringify({ error: "Duel is not active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const apiKeySid = Deno.env.get("TWILIO_API_KEY_SID");
    const apiKeySecret = Deno.env.get("TWILIO_API_KEY_SECRET");

    if (!accountSid || !apiKeySid || !apiKeySecret) {
      return new Response(JSON.stringify({ error: "Twilio not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const identity = profile.display_name || user.id.slice(0, 8);
    const roomName = `duel-${duelId}`;

    const token = await createTwilioVideoToken(
      accountSid,
      apiKeySid,
      apiKeySecret,
      identity,
      roomName
    );

    return new Response(JSON.stringify({ token, roomName, identity }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Twilio token error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
