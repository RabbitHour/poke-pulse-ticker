import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {it} from 'node:test';
import assert from 'node:assert/strict';
const root=process.cwd();
const routes=[...readFileSync(join(root,'src/App.tsx'),'utf8').matchAll(/<Route path="([^"]+)"/g)].map(m=>m[1]).filter(x=>x!=='*');
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):e.name.endsWith('.tsx')?[join(dir,e.name)]:[]);}
it('all literal internal page destinations have a registered route',()=>{
 const broken=[];
 for(const file of files(join(root,'src')))for(const match of readFileSync(file,'utf8').matchAll(/(?:to|href)=["'](\/[^"']*)["']|navigate\(["'](\/[^"']*)["']/g)){
  const url=match[1]||match[2],path=url.split(/[?#]/)[0];
  if(/^\/(data|videos|images|assets)\//.test(path))continue;
  if(!routes.some(route=>new RegExp('^'+route.replace(/:[\w]+/g,'[^/]+')+'$').test(path)))broken.push(file+': '+url);
 }
 assert.deepEqual(broken,[]);
});
