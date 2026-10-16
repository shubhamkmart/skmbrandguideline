import {build} from 'esbuild';
import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);
await mkdir('.build',{recursive:true});
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/render.jsx'],outfile:'.build/render.mjs',bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic'});
const {render,chapters,tokens,tokenCSS,href}=await import(pathToFileURL(path.join(root,'.build/render.mjs')).href+`?v=${Date.now()}`);
await build({entryPoints:['src/client.jsx'],outfile:'dist/assets/app.js',bundle:true,format:'esm',minify:true,jsx:'automatic',target:['es2020'],define:{'process.env.NODE_ENV':'"production"'}});
await cp('public','dist',{recursive:true});
await cp('src/styles.css','dist/assets/styles.css');
await cp('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2','dist/assets/inter-latin-wght-normal.woff2');
await cp('node_modules/@fontsource-variable/inter/LICENSE','dist/assets/Inter-LICENSE.txt');
await writeFile('dist/assets/skm-tokens-v1.json',JSON.stringify(tokens,null,2));
await writeFile('dist/assets/skm-tokens-v1.css',tokenCSS);
const rawOrigin=process.env.SITE_URL;
let origin='';
if(rawOrigin){const u=new URL(rawOrigin);if(!['https:','http:'].includes(u.protocol)||u.pathname!=='/'||u.search||u.hash||u.username||u.password)throw Error('SITE_URL must be an HTTP(S) origin, such as https://brand.yourdomain.com');origin=u.origin;}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const c of chapters){const dir=c.id==='overview'?'dist':`dist/${c.id}`;await mkdir(dir,{recursive:true});const title=`${c.id==='overview'?'Digital Brand Guidelines':c.nav} | Shubham K Mart`;const description=c.intro;const canonical=origin?origin+href(c.id):'';const ld={"@context":"https://schema.org","@type":"CreativeWork",name:title,description,inLanguage:'en',...(canonical?{url:canonical}:{})};const html=`<!doctype html>\n<html lang="en" data-page="${c.id}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow"><meta name="theme-color" content="#214B32">${canonical?`<link rel="canonical" href="${esc(canonical)}"><meta property="og:url" content="${esc(canonical)}">`:''}<meta property="og:type" content="website"><meta property="og:site_name" content="Shubham K Mart Digital Brand Guidelines"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${origin}/assets/social-preview.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/svg+xml" href="/assets/logo-yellow-on-green.svg"><link rel="preload" href="/assets/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/styles.css"><script type="application/ld+json">${JSON.stringify(ld).replaceAll('<','\\u003c')}</script></head><body><div id="root">${render(c.id)}</div><script type="module" src="/assets/app.js"></script></body></html>`;await writeFile(`${dir}/index.html`,html);}
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n${origin?`\nSitemap: ${origin}/sitemap.xml\n`:''}`);
const urls=chapters.map(c=>`${origin}${href(c.id)}`);
if(origin)await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(u)}</loc></url>`).join('')}</urlset>`);
else {const {rm}=await import('node:fs/promises');await rm('dist/sitemap.xml',{force:true});}
await writeFile('dist/404.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Shubham K Mart</title><link rel="stylesheet" href="/assets/styles.css"></head><body><main style="padding:15vh 8vw"><h1>This page has moved off the grid.</h1><p style="margin:24px 0">Find the guideline you need in the brand book.</p><a class="btn gold" href="/">Open brand guidelines →</a></main></body></html>');
await writeFile('dist/_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
// Editable layout templates embed the untouched original SVG master.
const logo=Buffer.from(await readFile('public/assets/logo-yellow-on-green.svg')).toString('base64');
for(const [name,w,h] of [['feed',1080,1350],['story',1080,1920],['banner',1080,600]]){const vertical=name==='story',banner=name==='banner';const inset=banner?48:64,top=vertical?270:inset;const s=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>Shubham K Mart proposed ${name} digital template</title><desc>Editable editorial layout. Original supplied SVG logo embedded without alteration. Review actual platform crops before publication.</desc><rect width="${w}" height="${h}" fill="#F3CB2D"/><image x="${inset}" y="${top}" width="${banner?135:180}" height="${banner?135:180}" xlink:href="data:image/svg+xml;base64,${logo}"/><g fill="#214B32" font-family="Inter, Arial, sans-serif"><text x="${inset}" y="${top+(banner?205:320)}" font-size="${banner?65:102}" font-weight="700">Ghar ki list,</text><text x="${inset}" y="${top+(banner?282:435)}" font-size="${banner?65:102}" font-weight="700">ab thodi easier.</text><text x="${inset}" y="${top+(banner?340:520)}" font-size="${banner?22:30}">A little everyday warmth.</text><path d="M${inset} ${h-(vertical?390:95)}H${w-inset}" stroke="#214B32" opacity=".3"/><text x="${inset}" y="${h-(vertical?350:55)}" font-size="22">Shubham K Mart · Proposed digital layout</text></g></svg>`;await writeFile(`dist/assets/skm-${name}-template.svg`,s);}
await writeFile('dist/route-manifest.json',JSON.stringify(chapters.map(c=>({id:c.id,title:c.title,path:href(c.id)})),null,2));
console.log(`Built ${chapters.length} React-rendered HTML chapters, local fonts, assets and templates.`);
console.log(origin?`Canonical URLs and sitemap generated for ${origin}`:'Local build: set SITE_URL to the final public origin and rebuild for canonical URLs and sitemap.');
