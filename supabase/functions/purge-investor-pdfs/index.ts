import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: files, error: listErr } = await admin.storage
    .from("investor-assets")
    .list("", { limit: 1000 });

  if (listErr) {
    return new Response(JSON.stringify({ error: listErr.message }), { status: 500 });
  }

  const pdfs = (files ?? []).filter((f) => f.name.toLowerCase().endsWith(".pdf")).map((f) => f.name);
  if (pdfs.length === 0) {
    return new Response(JSON.stringify({ removed: [] }), { headers: { "Content-Type": "application/json" } });
  }

  const { error: delErr } = await admin.storage.from("investor-assets").remove(pdfs);
  if (delErr) {
    return new Response(JSON.stringify({ error: delErr.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ removed: pdfs }), { headers: { "Content-Type": "application/json" } });
});
