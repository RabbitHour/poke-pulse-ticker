// Recover a clean checkout from the same durable public branch if raw-file delivery fails.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {prepareCatalog} from './catalog-delivery.mjs';
const run=promisify(execFile);
const cloneBranch=checkout=>run('git',['clone','--depth=1','--single-branch','--branch','market-data','https://github.com/RabbitHour/poke-pulse-ticker.git',checkout],{timeout:180000,maxBuffer:1024*1024});
export async function prepareBuildCatalog(dataDir,{prepare=prepareCatalog,clone=cloneBranch}={}){
 try{return await prepare(dataDir);}catch(error){
  console.warn('Normal catalog delivery failed; restoring the durable Git branch.');
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'poke-catalog-'));
  try{
   const checkout=path.join(temp,'market-data');
   await clone(checkout);
   // Only copy known data artifacts. No code, credentials, repository settings or executable hooks.
   for(const name of ['catalog.json','catalog','images','forecasts.json','history','sealed-indexes.json','image-discovery.json']){
    const source=path.join(checkout,name);
    try{await fs.cp(source,path.join(dataDir,name),{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
   }
   // Full manifest/shard validation remains mandatory. Invalid data still stops the build.
   return await prepare(dataDir);
  }catch(recovery){throw new Error(`Catalog recovery failed: ${recovery.message}`,{cause:error});}
  finally{await fs.rm(temp,{recursive:true,force:true});}
 }
}
