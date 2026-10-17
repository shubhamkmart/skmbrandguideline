import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
process.chdir(path.dirname(fileURLToPath(import.meta.url)));
const routes=JSON.parse(await readFile('dist/route-manifest.json','utf8'));
const titles=new Set();let links=0;
for(const r of routes){const file=path.join('dist',r.id==='overview'?'index.html':`${r.id}/index.html`);const s=await readFile(file,'utf8');assert.equal((s.match(/<h1[ >]/g)||[]).length,1,`${r.id}: one visible H1`);const title=s.match(/<title>(.*?)<\/title>/)[1];assert(!titles.has(title),'Unique titles');titles.add(title);assert(s.includes('<main'),'Main landmark');assert(s.includes('index,follow'),'Indexable metadata');assert(s.includes('aria-current="page"'),'Active chapter');assert(s.includes('name="description"'),'Description');const main=s.split('<main')[1].split('</main>')[0];assert(main.replace(/<[^>]*>/g,'').length>500,`${r.id}: meaningful initial HTML content`);assert(!/\b(signage|uniforms|billing|store walkthrough|physical retail|print production)\b/i.test(main),'Digital-only content');for(const match of s.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)){const u=match[1];const target=path.join('dist',u.endsWith('/')?u+'index.html':u);assert((await stat(target)).isFile(),`${r.id}: missing ${u}`);links++;}const ld=s.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);assert(JSON.parse(ld[1])['@type']==='CreativeWork');}
assert.equal(routes.length,19);
const guide=await readFile('dist/brand-guide.txt','utf8');
assert(guide.includes('#39823C')&&guide.includes('#F3CB2D')&&guide.includes('Inter'),'Crawlable color and font standards');
assert(guide.includes('Brand Green #39823C only')&&guide.includes('Brand Gold #F3CB2D only'),'Crawlable logo background restrictions');
assert((await readFile('dist/llms.txt','utf8')).includes('/brand-guide.txt'),'Text guide discoverable');
assert((await readFile('dist/robots.txt','utf8')).includes('Allow: /'));
console.log(`PASS: ${routes.length} prerendered chapters; ${links} local links/assets; unique metadata; one H1 per page; structured data; digital scope.`);
