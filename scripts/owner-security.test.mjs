import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
test('privileged owner functions gate verified identities before operational actions',async()=>{
 const audit=await fs.readFile('supabase/functions/site-audit/index.ts','utf8');
 assert.ok(audit.indexOf('isOwnerIdentity(user.id')<audit.indexOf('const userId = user.id'));
 const sales=await fs.readFile('supabase/functions/ai-sales-agent/index.ts','utf8');assert.ok(sales.includes('isOwnerIdentity(user?.id'));assert.ok(!sales.includes('user?.email === OWNER_EMAIL'));
 const owner=await fs.readFile('supabase/functions/poke-owner-agent/index.ts','utf8');assert.ok(owner.includes("scheduled&&action!=='run'"));assert.ok(owner.includes("if(scheduled)return reply({ok:true})"));assert.ok(owner.includes("'Cache-Control':'no-store'"));assert.ok(owner.includes('last_run_at.lt.'));
});
