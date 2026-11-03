import {serve} from 'https://deno.land/std@0.190.0/http/server.ts';
import {createClient} from 'npm:@supabase/supabase-js@2.57.2';
import Stripe from 'https://esm.sh/stripe@18.5.0';
// Dedicated, server-enforced reports feature. Defaults OFF until test-mode validation.
serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const allowed=(Deno.env.get('REPORTS_ALLOWED_ORIGINS')||'').split(',').map(s=>s.trim()).filter(Boolean);
 const cors={'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
 const reply=(d:unknown,status=200)=>new Response(JSON.stringify(d),{status,headers:{...cors,'Content-Type':'application/json'}});
 if(!allowed.includes(origin))return new Response('Origin not allowed',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply({error:'POST required'},405);
 if(Deno.env.get('REPORTS_ENABLED')!=='true')return reply({error:'Reports billing is not activated yet.'},503);
 try{
  const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token)return reply({error:'Sign in first.'},401);
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!);
  const {data:{user},error}=await db.auth.getUser(token);if(error||!user?.email||!user.email_confirmed_at)return reply({error:'A confirmed account is required.'},401);
  const bodyText=await req.text();if(bodyText.length>64000)return reply({error:'Collection is too large.'},413);
  const body=JSON.parse(bodyText);const stripe=new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!,{apiVersion:'2025-08-27.basil'});
  const priceId=Deno.env.get('REPORTS_PRICE_ID');if(!priceId)return reply({error:'Reports price is not configured.'},503);
  const price=await stripe.prices.retrieve(priceId);
  if(!price.active||price.currency!=='usd'||price.unit_amount!==299||price.recurring?.interval!=='month'||price.recurring?.interval_count!==1)return reply({error:'Reports price must be the configured USD 2.99 monthly price.'},503);
  const customers=await stripe.customers.list({email:user.email,limit:100});
  const customer=customers.data.find(c=>c.metadata?.supabase_user_id===user.id);
  if(body.action==='checkout'){
   const owned=customer||await stripe.customers.create({email:user.email,metadata:{supabase_user_id:user.id}});
   const active=await stripe.subscriptions.list({customer:owned.id,status:'active',limit:100});
   if(active.data.some(s=>s.items.data.some(i=>i.price.id===priceId)))return reply({error:'You already have reports access.'},409);
   const session=await stripe.checkout.sessions.create({customer:owned.id,client_reference_id:user.id,mode:'subscription',line_items:[{price:priceId,quantity:1}],success_url:origin+'/account?reports=success',cancel_url:origin+'/account?reports=canceled',subscription_data:{metadata:{supabase_user_id:user.id,feature:'collection-reports'}}});
   return reply({url:session.url});
  }
  if(body.action==='portal'){
   if(!customer)return reply({error:'No reports billing account exists.'},404);
   const session=await stripe.billingPortal.sessions.create({customer:customer.id,return_url:origin+'/account'});return reply({url:session.url});
  }
  if(body.action!=='export')return reply({error:'Unknown action.'},400);
  if(!customer)return reply({error:'Reports subscription required.'},402);
  const subscriptions=await stripe.subscriptions.list({customer:customer.id,status:'active',limit:100});
  if(!subscriptions.data.some(s=>s.items.data.some(i=>i.price.id===priceId)))return reply({error:'Active reports subscription required.'},402);
  if(!Array.isArray(body.items)||!body.items.length||body.items.length>500)return reply({error:'Choose 1–500 products.'},400);
  if(new Set(body.items.map((i:any)=>i.id)).size!==body.items.length)return reply({error:'Duplicate products must be combined.'},400);
  const url=new URL(Deno.env.get('REPORTS_CATALOG_URL')||'');if(url.protocol!=='https:')throw Error('Catalog URL must use HTTPS');
  const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Catalog unavailable');const catalog=await r.json();
  const sourceTime=Date.parse(catalog.sourceUpdated);if(!Number.isFinite(sourceTime)||sourceTime>Date.now()+3600000||Date.now()-sourceTime>48*3600000)return reply({error:'Provider quotes are stale. Export is temporarily unavailable.'},503);
  const quotes=new Map(catalog.entries.map((e:any)=>[e.id,e]));const rows=[];let cents=0;
  for(const item of body.items){const e:any=quotes.get(item.id);if(!e||e.kind==='digital'||!Number.isFinite(e.market)||e.market<=0||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>999)return reply({error:'Invalid product or quantity.'},400);
   const total=Math.round(e.market*100)*item.quantity;cents+=total;rows.push([e.id,e.name,e.set,e.variant||'',item.quantity,e.market.toFixed(2),(total/100).toFixed(2),catalog.sourceUpdated]);}
  // CSV spreadsheet formula injection prevention, including leading control whitespace.
  const cell=(v:unknown)=>{let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const csv=[['ID','Name','Set','Variant','Quantity','Reference USD','Total USD','Source release'],...rows].map(row=>row.map(cell).join(',')).join('\r\n');
  return reply({csv,total:cents/100,rows:rows.length,generatedAt:new Date().toISOString(),sourceUpdated:catalog.sourceUpdated});
 }catch{ return reply({error:'Reports service is temporarily unavailable.'},500); }
});
