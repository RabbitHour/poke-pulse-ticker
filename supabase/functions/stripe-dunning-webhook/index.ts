import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.text();
    const event = JSON.parse(body);

    console.log("[DUNNING] Event received:", event.type);

    // Handle failed payment events for win-back
    if (event.type === "invoice.payment_failed" || event.type === "customer.subscription.deleted") {
      const obj = event.data.object;
      const customerId = obj.customer;
      const attemptCount = obj.attempt_count || 1;

      // Get customer email
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) throw new Error("Customer deleted");

      const email = (customer as Stripe.Customer).email;
      const name = (customer as Stripe.Customer).name || email?.split("@")[0] || "there";

      if (!email) {
        console.log("[DUNNING] No email for customer", customerId);
        return new Response(JSON.stringify({ received: true, skipped: "no_email" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const templateName = event.type === "customer.subscription.deleted" ? "dunning-recovery" : "dunning-recovery";
      const idempotencyKey = `dunning-${event.id}`;

      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName,
          recipientEmail: email,
          idempotencyKey,
          templateData: {
            recipientName: name,
            attemptNumber: attemptCount,
          },
        },
      });

      if (error) {
        console.error("[DUNNING] Send failed:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("[DUNNING] Win-back email queued for", email);

      return new Response(JSON.stringify({ received: true, sent: email }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ received: true, type: event.type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[DUNNING] Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
