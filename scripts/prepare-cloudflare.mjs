// Runs only inside the deployment job. Never log or persist the deployment token.
const token=process.env.CLOUDFLARE_API_TOKEN,account=process.env.CLOUDFLARE_ACCOUNT_ID,name=process.env.CLOUDFLARE_PROJECT;
if(!token||!account||!name)throw Error('Cloudflare configuration is incomplete.');
if(!/^[a-z0-9][a-z0-9-]{0,57}[a-z0-9]$/.test(name)||!/^\w{32}$/.test(account))throw Error('Invalid Cloudflare project or account identifier.');
const base='https://api.cloudflare.com/client/v4/accounts/'+account+'/pages/projects';
const headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
let response=await fetch(base+'/'+encodeURIComponent(name),{headers,signal:AbortSignal.timeout(20000)});
if(response.status===404){response=await fetch(base,{method:'POST',headers,body:JSON.stringify({name,production_branch:'main'}),signal:AbortSignal.timeout(20000)});}
const body=await response.json();if(!response.ok||!body.success)throw Error('Cloudflare project setup failed. Check account scope and Pages Edit permission. HTTP '+response.status);
console.log('Cloudflare Pages project ready: '+name+'.pages.dev');
