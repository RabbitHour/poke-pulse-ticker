import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const source=await fs.readFile('supabase/functions/weekly-portfolio-email/index.ts','utf8');
async function invoke(method,env={},headers={}) {
 let handler; let databaseCalls=0;
 const code=ts.transpileModule(source.replace(/^import .*;\n/gm,''),{compilerOptions:{module:ts.ModuleKind.None}}).outputText;
 vm.runInNewContext(code,{serve:fn=>handler=fn,Deno:{env:{get:key=>env[key]}},Response,console,createClient:()=>{databaseCalls++;throw Error('Database must not be accessed');}});
 const response=await handler(new Request('https://example.test/email',{method,headers}));
 return {status:response.status,databaseCalls};
}
test('bulk email rejects an ordinary authenticated caller before database access',async()=>assert.deepEqual(await invoke('POST',{}, {authorization:'Bearer customer-token'}),{status:403,databaseCalls:0}));
test('bulk email rejects wrong scheduler secret',async()=>assert.deepEqual(await invoke('POST',{POKE_EMAIL_SCHEDULE_SECRET:'correct'},{'x-poke-email-schedule':'wrong'}),{status:403,databaseCalls:0}));
test('bulk email rejects non-POST requests',async()=>assert.deepEqual(await invoke('GET'),{status:405,databaseCalls:0}));
test('legacy bulk email remains disabled even with scheduler authentication',async()=>assert.deepEqual(await invoke('POST',{POKE_EMAIL_SCHEDULE_SECRET:'correct'},{'x-poke-email-schedule':'correct'}),{status:503,databaseCalls:0}));
