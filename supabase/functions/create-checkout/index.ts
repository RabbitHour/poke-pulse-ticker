import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkoutPolicy } from "../_shared/checkout-policy.ts";

serve(async (req) => {
  const origin=req.headers.get("origin");
  const origins=Deno.env.get("CHECKOUT_TEST_ALLOWED_ORIGINS") ?? "";
  const allowed=!!origin && origins.split(",").map(s=>s.trim()).includes(origin);
  const headers: Record<string,string>={"Content-Type":"application/json","Vary":"Origin",
    "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":"POST, OPTIONS"};
  if(allowed)headers["Access-Control-Allow-Origin"]=origin!;
  const reply=(status:number,error:string)=>new Response(JSON.stringify({error}),{status,headers});
  if(req.method==="OPTIONS")return new Response(null,{status:allowed?204:403,headers});
  if(req.method!=="POST")return reply(405,"POST required.");
  if(!allowed)return reply(403,"This checkout origin is not enabled.");
  const auth=req.headers.get("Authorization");
  if(!auth?.startsWith("Bearer "))return reply(401,"Sign in before checkout.");
  try {
    const supabase=createClient(Deno.env.get("SUPABASE_URL")??"",Deno.env.get("SUPABASE_ANON_KEY")??"");
    const {data,error}=await supabase.auth.getUser(auth.slice(7));
    if(error||!data.user?.email||!data.user.email_confirmed_at)return reply(401,"A confirmed account is required.");
    const body=await req.json();
    if(body.trial!=null||body.coupon!=null)return reply(400,"Trials and coupons are not accepted from the browser.");
    const secret=Deno.env.get("STRIPE_SECRET_KEY")??"";
    let policy: ReturnType<typeof checkoutPolicy>;
    try {policy=checkoutPolicy(secret,body.priceId,Deno.env.get("CHECKOUT_TEST_PRICE_IDS")??"",origin,origins);}
    catch {return reply(503,"Sandbox checkout is not configured for this selection.");}
    const stripe=new Stripe(secret,{apiVersion:"2025-08-27.basil"});
    const price=await stripe.prices.retrieve(policy.priceId);
    if(price.livemode||!price.active||!price.recurring)return reply(400,"An active sandbox subscription price is required.");
    const session=await stripe.checkout.sessions.create({
      customer_email:data.user.email,client_reference_id:data.user.id,
      line_items:[{price:policy.priceId,quantity:1}],mode:"subscription",
      success_url:policy.origin+"/?checkout=success",cancel_url:policy.origin+"/?checkout=canceled",
      metadata:{supabase_user_id:data.user.id},
    });
    return new Response(JSON.stringify({url:session.url,sandbox:true}),{status:200,headers});
  } catch {
    return reply(502,"Sandbox checkout could not be created. Check server configuration and retry.");
  }
});
