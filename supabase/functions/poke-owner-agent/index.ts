import {serve} from 'https://deno.land/std@0.190.0/http/server.ts';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {isOwnerIdentity} from '../../../src/lib/ownerAgentPolicy.ts';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info, x-poke-schedule','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 const owner=Deno.env.get('POKE_OWNER_USER_ID');
 if(!owner)return reply({error:'Owner dashboard has not been configured.'},503);
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const scheduleSecret=Deno.env.get('POKE_AGENT_SCHEDULE_SECRET');
 const scheduled=Boolean(scheduleSecret&&req.headers.get('x-poke-schedule')===scheduleSecret);
 if(!scheduled){
  const token=(req.headers.get('authorization')??'').replace(/^Bearer\s+/i,'');
  if(!token)return reply({error:'Sign in required'},401);
  const {data,error}=await db.auth.getUser(token);
  if(error||!isOwnerIdentity(data.user?.id,owner))return reply({error:'Owner access required'},403);
 }
 try{
  if(Number(req.headers.get('content-length')??0)>4096)return reply({error:'Request too large'},413);
  const raw=await req.text();if(raw.length>4096)return reply({error:'Request too large'},413);
  let body;try{body=JSON.parse(raw);}catch{return reply({error:'Invalid JSON'},400);}
  const action=body?.action??'status';
  if(scheduled&&action!=='run')return reply({error:'Scheduled credential can only run reports'},403);
  const {data:settings,error:settingsError}=await db.from('poke_agent_settings').select('*').eq('id',1).single();
  if(settingsError)throw Error('Owner agent storage has not been provisioned.');
  if(action==='pause'||action==='resume'){
   const {error}=await db.from('poke_agent_settings').update({enabled:action==='resume',updated_at:new Date().toISOString()}).eq('id',1);if(error)throw error;
  }else if(action==='run'){
   if(!settings.enabled)return scheduled?reply({skipped:true,reason:'Paused'}):reply({error:'Agent is paused. Resume it before running a report.'},409);
   const cutoff=new Date(Date.now()-300000).toISOString();
   const {data:lease,error:leaseError}=await db.from('poke_agent_settings').update({last_run_at:new Date().toISOString()}).eq('id',1).eq('enabled',true).or(`last_run_at.is.null,last_run_at.lt.${cutoff}`).select('id');
   if(leaseError)throw Error('Agent cooldown storage unavailable');
   if(!lease?.length)return scheduled?reply({skipped:true,reason:'Cooldown or paused'}):reply({error:'Wait five minutes between audits, or check whether the agent is paused.'},429);
   const response=await fetch('https://raw.githubusercontent.com/RabbitHour/poke-pulse-ticker/market-data/catalog.json',{signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error('Published catalog could not be checked.');
   const catalog=await response.json();
   if(!Number.isFinite(Date.parse(catalog.sourceUpdated)))throw Error('Published source date is invalid.');
   const hours=Math.max(0,(Date.now()-Date.parse(catalog.sourceUpdated))/3600000);
   const report={createdAt:new Date().toISOString(),sourceUpdated:catalog.sourceUpdated,sourceAgeHours:Math.round(hours),englishCatalogEntries:catalog.englishCatalogCount??null,pricedRecords:catalog.pricedRecords??null,providerGroups:catalog.providerGroups??null,analyticsStatus:'Not connected: no visitor or retention estimates are fabricated.',mode:'Research audit only; no source edits, deployments, outreach or financial actions.',recommendations:[...(hours>48?['Investigate stale source delivery before promoting market movement.']:[]),'Review missing exact-printing artwork and rarity metadata.','Measure saved-card activation and seven-day return rate after analytics consent and ingestion are configured.','Evaluate forecasts on unseen dated outcomes against unchanged-price baselines.'],requiresDavidReview:true};
   const {error}=await db.from('poke_agent_reports').insert({report});if(error)throw error;
   if(scheduled)return reply({ok:true});
  }else if(action!=='status')return reply({error:'Unknown action'},400);
  const [{data:state,error:stateError},{data:reports,error:reportError}]=await Promise.all([db.from('poke_agent_settings').select('*').eq('id',1).single(),db.from('poke_agent_reports').select('id,created_at,report').order('created_at',{ascending:false}).limit(20)]);
  if(stateError||reportError)throw Error('Owner report storage unavailable');
  return reply({settings:state,reports});
 }catch(error){return reply({error:'Owner agent is unavailable. Check server configuration and report storage.'},503);}
});
