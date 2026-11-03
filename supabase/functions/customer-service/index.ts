import {createClient} from 'npm:@supabase/supabase-js@2.57.2';
import Stripe from 'https://esm.sh/stripe@18.5.0';
const plans={poke:{env:'POKE_PRICE_ID',amount:299},predictor:{env:'PREDICTOR_PRICE_ID',amount:499}} as const;
let cached:{at:number;catalog:any;forecasts:any}|undefined;
async function sources(){if(cached&&Date.now()-cached.at<300000)return cached;const origin=new URL(Deno.env.get('PUBLIC_SITE_URL')||'');if(origin.protocol!=='https:')throw Error('HTTPS public site required');const fetchJson=async(p:string)=>{const r=await fetch(new URL(p,origin),{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Source unavailable');return r.json();};const [catalog,forecasts]=await Promise.all([fetchJson('/data/catalog.json'),fetchJson('/data/forecasts.json')]);if(!Array.isArray(catalog.entries)||!Array.isArray(forecasts.forecasts))throw Error('Invalid sources');cached={at:Date.now(),catalog,forecasts};return cached;}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';const allowed=(Deno.env.get('CUSTOMER_ALLOWED_ORIGINS')||'').split(',').map(s=>s.trim());
 const headers={'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'};
 const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(!allowed.includes(origin)||!origin)return new Response('Origin not allowed',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});if(req.method!=='POST')return reply({error:'POST required'},405);
 if(Deno.env.get('CUSTOMER_PLANS_ENABLED')!=='true')return reply({error:'Paid customer plans are not activated.'},503);
 try{
  const auth=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!);const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
  const {data:{user},error}=await auth.auth.getUser(token);if(error||!user?.email||!user.email_confirmed_at)return reply({error:'Sign in with a confirmed account first.'},401);
  const text=await req.text();if(text.length>16000)return reply({error:'Request too large'},413);const body=JSON.parse(text);if(!Object.hasOwn(plans,body.plan))return reply({error:'Invalid plan'},400);const kind=body.plan as keyof typeof plans;
  const priceId=Deno.env.get(plans[kind].env);if(!priceId)return reply({error:'Plan price not configured.'},503);
  const stripe=new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!,{apiVersion:'2025-08-27.basil'});const price=await stripe.prices.retrieve(priceId);
  if(!price.active||price.currency!=='usd'||price.unit_amount!==plans[kind].amount||price.recurring?.interval!=='month'||price.recurring?.interval_count!==1)return reply({error:'Plan price validation failed.'},503);
  const customers=await stripe.customers.list({email:user.email,limit:100});let customer=customers.data.find(c=>c.metadata?.supabase_user_id===user.id);
  if(body.action==='portal'){if(!customer)return reply({error:'No billing account found.'},404);return reply({url:(await stripe.billingPortal.sessions.create({customer:customer.id,return_url:origin+'/memberships'})).url});}
  const subs=customer?await stripe.subscriptions.list({customer:customer.id,status:'active',limit:100}):{data:[]};const active=subs.data.some(s=>s.items.data.some(i=>i.price.id===priceId));
  if(body.action==='checkout'){
   if(active)return reply({error:'This membership is already active.'},409);
   if(kind==='predictor'&&!(await sources()).forecasts.forecasts.length)return reply({error:'Predictor membership is not for sale until real dated forecasts are available.'},503);
   if(!customer)customer=await stripe.customers.create({email:user.email,metadata:{supabase_user_id:user.id}});
   const session=await stripe.checkout.sessions.create({customer:customer.id,client_reference_id:user.id,mode:'subscription',line_items:[{price:priceId,quantity:1}],success_url:origin+'/memberships?checkout=success',cancel_url:origin+'/memberships?checkout=canceled',subscription_data:{metadata:{supabase_user_id:user.id,feature:kind}}});return reply({url:session.url});
  }
  if(body.action!=='research')return reply({error:'Unknown action'},400);if(!active)return reply({error:'An active membership for this tool is required.'},402);
  const query=String(body.query||'').trim();if(query.length<2||query.length>200)return reply({error:'Enter a query of 2–200 characters.'},400);
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);const {data:used,error:quotaError}=await db.rpc('consume_customer_research',{p_user:user.id,p_kind:kind});if(quotaError)throw quotaError;if(!used)return reply({error:'Daily research limit reached. Try again tomorrow.'},429);
  const data=await sources();const words=query.toLowerCase().split(/\s+/).filter(Boolean);
  const pool=kind==='poke'?data.catalog.entries:data.forecasts.forecasts;
  const results=pool.filter((e:any)=>words.every(w=>`${e.name} ${e.set} ${e.number||''} ${e.variant||''}`.toLowerCase().includes(w))).slice(0,12).map((e:any)=>kind==='poke'?{recordId:e.id,name:e.name,set:e.set,variant:e.variant,market:e.market,image:e.image,sourceUpdated:e.sourceUpdated}:{...e,image:data.catalog.entries.find((c:any)=>c.id===e.recordId)?.image});
  let session:any;if(body.sessionId){const {data:s,error}=await db.from('customer_research_sessions').select('id,messages').eq('id',body.sessionId).eq('user_id',user.id).eq('kind',kind).gt('expires_at',new Date().toISOString()).maybeSingle();if(error||!s)return reply({error:'Session not found.'},404);session=s;}
  const message={query,results,at:new Date().toISOString()};const messages=[...(session?.messages||[]),message].slice(-50);
  const saved=session?await db.from('customer_research_sessions').update({messages}).eq('id',session.id).eq('user_id',user.id).select('id').single():await db.from('customer_research_sessions').insert({user_id:user.id,kind,messages}).select('id').single();if(saved.error)throw saved.error;
  return reply({sessionId:saved.data.id,results,message:`Saved source-based research. ${200-used} requests remain today. Missing quotes or forecasts are not invented.`});
 }catch{return reply({error:'Customer service unavailable. Please contact support.'},503);}
});
