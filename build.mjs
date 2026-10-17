import {build} from 'esbuild';
import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);
await mkdir('.build',{recursive:true});
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/render.jsx'],outfile:'.build/render.mjs',bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic'});
const {render,chapters,palette,campaignPalette,complementaryPalette,colorCombinations,gradientIdeas,paletteMatrix,brandRecommendation,tokens,tokenCSS,href}=await import(pathToFileURL(path.join(root,'.build/render.mjs')).href+`?v=${Date.now()}`);
await build({entryPoints:['src/client.jsx'],outfile:'dist/assets/app.js',bundle:true,format:'esm',minify:true,jsx:'automatic',target:['es2020'],define:{'process.env.NODE_ENV':'"production"'}});
await cp('public','dist',{recursive:true});
await writeFile('dist/assets/styles.css',(await readFile('src/styles.css','utf8'))+'\n'+(await readFile('src/chat.css','utf8'))+'\n'+(await readFile('src/editorial.css','utf8'))+'\n'+(await readFile('src/companion.css','utf8'))+'\n'+(await readFile('src/visual-guide.css','utf8')));
await cp('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2','dist/assets/inter-latin-wght-normal.woff2');
await cp('node_modules/@fontsource-variable/inter/LICENSE','dist/assets/Inter-LICENSE.txt');
await writeFile('dist/assets/skm-tokens-v1.json',JSON.stringify(tokens,null,2));
await writeFile('dist/assets/skm-tokens-v1.css',tokenCSS);
const rawOrigin=process.env.SITE_URL || (process.env.NETLIFY === 'true' ? process.env.URL : undefined);
let origin='';
if(rawOrigin){const u=new URL(rawOrigin);if(!['https:','http:'].includes(u.protocol)||u.pathname!=='/'||u.search||u.hash||u.username||u.password)throw Error('SITE_URL must be an HTTP(S) origin, such as https://brand.yourdomain.com');origin=u.origin;}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const chapterText=c=>[c.title,c.intro,...(c.cards||[]).map(row=>row.join(': ')),...(c.rules||[]).map(row=>row.join(': ')),...(c.table?[c.table.headers.join(' | '),...c.table.rows.map(row=>row.join(' | '))]:[]),...(c.checks||[])].join('\n');
const facts=chapters.map(chapterText).join('\n\n');
const compText = (complementaryPalette||[]).map(c=>Array.isArray(c)?`${c[0]} | ${c[1]} | ${c[2]} | ${c[3]}`:`${c.name} | ${c.hex} | ${c.category} | ${c.role}`).join('\n');
const campaignText = (campaignPalette||[]).map(c=>Array.isArray(c)?`${c[0]} | ${c[1]} | ${c[2]} | ${c[3]}`:`${c.name} | ${c.hex} | ${c.category} | ${c.role}`).join('\n');
const combosText = (colorCombinations||[]).map(c=>`${c.title} (${c.badge}): ${c.swatches.map(s=>`${s.name} ${s.hex}`).join(', ')} | ${c.bestFor}`).join('\n');
const gradientsText = (gradientIdeas||[]).map(g=>`${g.title}: ${g.names} (${g.stops.join(' → ')}) | CSS: ${g.css} | ${g.bestFor}`).join('\n');
const matrixText = (paletteMatrix||[]).map(m=>`${m.purpose} | ${m.combination} | ${m.hexes.join(' · ')} | ${m.context}`).join('\n');
await writeFile('dist/brand-guide.txt',`Shubham K Mart Digital Brand Guidelines\n\nCanonical Brand Palette\n${palette.map(row=>row.join(' | ')).join('\n')}\n\nCampaign & Promotion Inspiration Palette\n${campaignText}\n\nCategory Complementary Palette (Promotional Canvas Only)\n${compText}\n\n5 Curated Color Combinations\n${combosText}\n\n5 Banner Gradient Styles\n${gradientsText}\n\nWhich Palette Should You Use? Selection Matrix\n${matrixText}\n\nBrand Identity Recommendation\n${brandRecommendation.quote}\n\n${facts}\n\nDesign tokens\n${JSON.stringify(tokens,null,2)}\n`);
await writeFile('dist/llms.txt',`# Shubham K Mart Digital Brand Guidelines\n\n> Digital identity, original SVG assets, typography, color and format-specific logo placement.\n\n- [Complete text guide](${origin}/brand-guide.txt): Full digital standards and design tokens.\n\n## Chapters\n${chapters.map(c=>`- [${c.nav}](${origin}${href(c.id)}): ${c.seoDescription||c.intro}`).join('\n')}\n`);
const bagMaster=await readFile('public/assets/logo-bag-only-yellow-transparent.svg','utf8');
const bagIcon=bagMaster.replace(/<svg\b[^>]*>/,'<svg x="8" y="6" width="48" height="52" viewBox="819 730 560 741" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">');
await writeFile('dist/assets/favicon-bag.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><title>Shubham K Mart logo</title><rect width="64" height="64" rx="14" fill="#39823C"/>${bagIcon}</svg>`);
for(const c of chapters){
  const dir=c.id==='overview'?'dist':`dist/${c.id}`;
  await mkdir(dir,{recursive:true});
  const title=`${c.id==='overview'?'Digital Brand Guidelines':c.nav} | Shubham K Mart`;
  const description=c.seoDescription||c.intro;
  const canonical=origin?origin+href(c.id):'';
  const ogUrl=canonical || (origin ? `${origin}${href(c.id)}` : href(c.id));
  const ogImg=origin ? `${origin}/assets/social-preview.png` : '/assets/social-preview.png';
  const ld={"@context":"https://schema.org","@type":"CreativeWork",name:title,description,text:chapterText(c),keywords:['Shubham K Mart','digital brand guidelines',c.nav],inLanguage:'en',...(canonical?{url:canonical}:{})};
  const html=`<!doctype html>\n<html lang="en" data-page="${c.id}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow"><link rel="help" type="text/plain" href="/brand-guide.txt"><meta name="theme-color" content="#214B32">${canonical?`<link rel="canonical" href="${esc(canonical)}">`:''}<meta property="og:type" content="website"><meta property="og:site_name" content="Shubham K Mart Digital Brand Guidelines"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(ogUrl)}"><meta property="og:image" content="${esc(ogImg)}"><meta property="og:image:secure_url" content="${esc(ogImg)}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Shubham K Mart Digital Brand Guidelines - ${esc(title)}"><meta property="og:locale" content="en_IN"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(ogImg)}"><meta name="twitter:image:alt" content="Shubham K Mart Digital Brand Guidelines - ${esc(title)}"><link rel="icon" type="image/svg+xml" sizes="any" href="/assets/favicon-bag.svg"><link rel="preload" href="/assets/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/styles.css"><script type="application/ld+json">${JSON.stringify(ld).replaceAll('<','\\u003c')}</script></head><body><div id="root">${render(c.id)}</div><script type="module" src="/assets/app.js"></script></body></html>`;
  await writeFile(`${dir}/index.html`,html);
}
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n${origin?`\nSitemap: ${origin}/sitemap.xml\n`:''}`);
const urls=chapters.map(c=>`${origin}${href(c.id)}`);
if(origin)await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(u)}</loc></url>`).join('')}</urlset>`);
else {const {rm}=await import('node:fs/promises');await rm('dist/sitemap.xml',{force:true});}
await writeFile('dist/404.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Shubham K Mart</title><link rel="stylesheet" href="/assets/styles.css"></head><body><main style="padding:15vh 8vw"><h1>This page has moved off the grid.</h1><p style="margin:24px 0">Find the guideline you need in the brand book.</p><a class="btn gold" href="/">Open brand guidelines →</a></main></body></html>');
await writeFile('dist/_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
// Editable layout templates embed the tightly cropped vector logo (viewBox="819 730 560 741")
// to guarantee prominent, bold rendering without the 2160x2160 transparent canvas margin.
const rawGreenSvg=await readFile('public/assets/logo-bag-only-green-transparent.svg','utf8');
const rawYellowSvg=await readFile('public/assets/logo-bag-only-yellow-transparent.svg','utf8');
const tightGreenSvg=rawGreenSvg.replace(/viewBox="0 0 2160 2160"/,'viewBox="819 730 560 741"');
const tightYellowSvg=rawYellowSvg.replace(/viewBox="0 0 2160 2160"/,'viewBox="819 730 560 741"');
const logoGreen=Buffer.from(tightGreenSvg).toString('base64');
const logoYellow=Buffer.from(tightYellowSvg).toString('base64');
for(const [name,w,h,isGold,logoW,logoH,headTop,subTop,bodyTop,inset,top] of [
  ['banner',1080,600,false,110,145,265,340,400,48,48],
  ['app-banner',1080,600,true,110,145,265,340,400,48,48],
  ['og',1200,630,false,115,152,290,370,435,64,64]
]){
  const bg=isGold?'#F3CB2D':'#39823C';
  const fg=isGold?'#214B32':'#FFFFFF';
  const activeLogo=isGold?logoGreen:logoYellow;
  const label=name==='app-banner'?'App banner (1080 × 600 · Brand Gold)':name==='banner'?'Digital web banner (1080 × 600 · Brand Green)':name==='og'?'Open Graph image (1200 × 630 · Brand Green)':`Proposed ${name} digital layout`;
  const s=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>Shubham K Mart proposed ${name} digital template</title><desc>Editable digital banner layout. Vector logo cropped to artwork bounding box for prominent display. Review actual platform crops before publication.</desc><rect width="${w}" height="${h}" fill="${bg}"/><image x="${inset}" y="${top}" width="${logoW}" height="${logoH}" xlink:href="data:image/svg+xml;base64,${activeLogo}"/><g fill="${fg}" font-family="Inter, Arial, sans-serif"><text x="${inset}" y="${headTop}" font-size="62" font-weight="700">Ghar ki list,</text><text x="${inset}" y="${subTop}" font-size="62" font-weight="700">ab thodi easier.</text><text x="${inset}" y="${bodyTop}" font-size="24">A little everyday warmth.</text><path d="M${inset} ${h-95}H${w-inset}" stroke="${fg}" opacity=".3"/><text x="${inset}" y="${h-55}" font-size="22">Shubham K Mart · ${label}</text></g></svg>`;
  await writeFile(`dist/assets/skm-${name}-template.svg`,s);
}
await writeFile('dist/route-manifest.json',JSON.stringify(chapters.map(c=>({id:c.id,title:c.title,path:href(c.id)})),null,2));
console.log(`Built ${chapters.length} React-rendered HTML chapters, local fonts, assets and templates.`);
console.log(origin?`Canonical URLs and sitemap generated for ${origin}`:'Local build: set SITE_URL to the final public origin and rebuild for canonical URLs and sitemap.');
