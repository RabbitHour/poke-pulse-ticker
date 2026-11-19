import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {prepareBuildCatalog} from './prepare-build-catalog.mjs';
test('normal validated delivery does not clone a second data source',async()=>{
 const result=await prepareBuildCatalog('unused',{prepare:async()=>({recordCount:2}),clone:async()=>{throw Error('must not clone');}});
 assert.equal(result.recordCount,2);
});
test('failed normal delivery restores only data and validates again',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'collector-recovery-test-'));let count=0;
 try{await prepareBuildCatalog(dir,{prepare:async()=>{if(++count===1)throw Error('network');assert.equal(await fs.readFile(path.join(dir,'catalog.json'),'utf8'),'validated by second call');},clone:async dest=>{await fs.mkdir(dest);await fs.writeFile(path.join(dest,'catalog.json'),'validated by second call');await fs.writeFile(path.join(dest,'unrelated.js'),'never copy code');}});assert.equal(count,2);await assert.rejects(fs.access(path.join(dir,'unrelated.js')));}finally{await fs.rm(dir,{recursive:true,force:true});}
});
