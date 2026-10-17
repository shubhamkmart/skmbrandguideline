import React,{useState,useEffect,useRef} from 'react';
import {chapters,palette,campaignPalette,complementaryPalette,colorCombinations,gradientIdeas,paletteMatrix,brandRecommendation,tokens,href} from './data.js';
import {McpGuide} from './McpGuide.jsx';
import {BrandChat} from './BrandChat.jsx';
import {BrandCompanion} from './BrandCompanion.jsx';
import {VisualSummary} from './VisualSummary.jsx';

export const tokenCSS=`:root {
  --brand-green: #39823C;
  --brand-gold: #F3CB2D;
  --brand-green-deep: #214B32;
  --text-primary: #192C20;
  --text-inverse: #FFFFFF;
  --text-charcoal: #111827;
  --surface-base: #FFFFFF;
  --surface-warm: #FBFAF4;
  --surface-mint: #D9F7E5;
  --surface-golden-cream: #FFF7D6;
  --border-default: #E2E8DE;
  /* Campaign & Promotion Inspiration Colors */
  --campaign-orange: #FF941A;
  --campaign-red: #E63946;
  --campaign-mint: #D9F7E5;
  --campaign-charcoal: #111827;
  --campaign-forest-green: #1B5E20;
  --campaign-golden-cream: #FFF7D6;
  --campaign-purple: #7C3AED;
  --campaign-sky-blue: #38BDF8;
  --campaign-mint-bright: #A7E3A1;
  /* Category Complementary Palette */
  --category-chilli-red: #D8232A;
  --category-sunrise-orange: #F37021;
  --category-confectionery-lilac: #9678B6;
  --category-rich-cocoa: #3D1E16;
  --category-terracotta: #C86D51;
  --category-deep-plum: #3E162F;
  --category-school-cyan: #00A3E0;
  --font-latin: 'Inter', system-ui, sans-serif;
  --font-devanagari: 'Noto Sans Devanagari', sans-serif;
  --space-1: 4px; --space-2: 8px;
  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px;
  --space-12: 48px; --space-16: 64px;
  --radius-sm: 8px; --radius-md: 12px;
  --radius-lg: 16px;
  --content-width: 1200px;
  --button-height: 48px;
  --target-size: 44px;
  --motion-fast: 150ms;
  --motion-standard: 250ms;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`;
function Icon({name,size=18,...rest}) {const paths={arrow:'M4 12h16m-6-6 6 6-6 6',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M6 18 18 6',check:'m5 12 4 4L19 6',copy:'M9 9h12v12H9zM15 5V2H2v13h3',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',sun:'M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',code:'m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',spark:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',external:'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',left:'m14 6-6 6 6 6',right:'m10 6 6 6-6 6',book:'M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1m0-16c3-2 7-2 10-1v16c-3-1-7-1-10 1V5'};return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}><path d={paths[name]||paths.grid}/></svg>}
function Logo({alternate=false,className='',...props}){const file=alternate?'logo-bag-only-green-transparent.svg':'logo-bag-only-yellow-transparent.svg';const label=`Shubham K Mart logo (${alternate?'green on gold':'yellow on green'})`;return <svg className={`logo-art ${className}`} viewBox="819 730 560 741" role="img" aria-label={label} {...props}><image href={`/assets/${file}`} width="2160" height="2160"/></svg>;}
function Kicker({children}){return <div className="kicker"><span/>{children}</div>}
function RuleList({rules}){return <div className="rule-list">{rules.map(([title,text],i)=><div className="rule" key={title}><span className="rule-number">{String(i+1).padStart(2,'0')}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div>}
function Table({table}){return <div className="table-wrap"><table><thead><tr>{table.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{table.rows.map((r,i)=><tr key={i}>{r.map((c,j)=>j===0?<th key={j} scope="row">{c}</th>:<td key={j} data-label={table.headers[j]}>{c}</td>)}</tr>)}</tbody></table></div>}
function Cards({cards}){return <div className="detail-cards">{cards.map(([label,title,text])=><article className="detail-card" key={label}><span className="label">{label}</span><h3>{title}</h3><p>{text}</p></article>)}</div>}
function DownloadFormats({file,label,png=false}){const formats=png?['png','svg']:[file.split('.').pop()];return <div className="download-formats" aria-label={`${label} download formats`}>{formats.map(format=><a key={format} download href={`/assets/${file.replace(/\.[^.]+$/,'.'+format)}`} aria-label={`Download ${label} as ${format.toUpperCase()}`}><Icon name="download" size={15}/>{format.toUpperCase()}</a>)}</div>}
function Campaign({format='portrait',label=true,theme='gold'}){const isGreen=theme==='green';return <div className={`campaign campaign-${format} ${isGreen?'campaign-green':''}`}><div className="campaign-header"><Logo alternate={!isGreen}/><span>DIGITAL EDITORIAL CONCEPT</span></div><div className="campaign-copy"><span className="mini-tag">THE EVERYDAY EDIT</span><h3>Ghar ki list,<br/>ab thodi<br/><em>easier.</em></h3><p>Little lists. Everyday possibilities.</p></div><div className="abstract-art" aria-hidden="true"><div className="art-box box-one"/><div className="art-box box-two"/><span className="art-orbit"/></div><div className="campaign-bottom">Shubham K Mart <span>Made for your everyday ↗</span></div>{label&&<span className="concept-label">Illustrative layout · no product or offer claim</span>}</div>}
function Overview(){return <><section className="hero"><div className="hero-copy"><Kicker>THE DIGITAL BRAND BOOK</Kicker><h1>One brand.<br/>Every digital<br/><em>moment.</em></h1><p>A familiar identity, wherever we show up.<br/>The design language for everyone building<br className="desktop-br"/> and creating for Shubham K Mart.</p><a className="btn gold" href="/mission/">Explore the guidelines <Icon name="arrow"/></a><div className="hero-meta"><span className="tiny-dot"/>DIGITAL EDITION <i/> PROPOSED V1.0</div></div><div className="hero-art"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><div className="brand-tile"><Logo alternate className="hero-brand-logo"/></div><span className="floating-note note-top">ROOTED IN FAMILIARITY <Icon name="spark" size={14}/></span><span className="floating-note note-bottom">Designed for every screen. <span>↗</span></span><div className="hero-art-caption">OUR IDENTITY · THE LOGO</div></div></section><div className="intro-strip"><div><span className="small-caps">ONE SHARED LANGUAGE</span><h2>Familiar at every tap.</h2></div><p>From a first impression to the smallest interface detail, consistency makes every digital experience feel like Shubham K Mart.</p><Icon name="spark" size={38}/></div><section className="essentials"><div className="section-heading"><div><span className="small-caps">THE FOUNDATIONS</span><h2>Start with what makes us, us.</h2></div><span className="quiet">The essentials, at a glance</span></div><div className="foundation-grid"><a className="foundation color-foundation" href="/colors/"><div className="mini-swatches"><span/><span/><span/><span/></div><div><span className="label">01 / COLOR</span><h3>Grounded. Bright. Ours.</h3><p>A purposeful palette for every screen.</p></div><Icon name="arrow"/></a><a className="foundation type-foundation" href="/typography/"><div className="giant-aa">Aa<span>Inter</span></div><div><span className="label">02 / TYPOGRAPHY</span><h3>Clarity has a type.</h3><p>One family. A confident hierarchy.</p></div><Icon name="arrow"/></a><a className="foundation voice-foundation" href="/voice/"><div className="quote-art">“Ghar ki list,<br/>ab thodi <em>easier.</em>”</div><div><span className="label">03 / VOICE</span><h3>Warm. Clear. Familiar.</h3><p>Words that feel close to home.</p></div><Icon name="arrow"/></a></div></section><section className="application-preview"><div className="preview-visual"><Campaign format="landscape" label={false}/></div><div className="preview-copy"><span className="small-caps">THE BRAND IN ACTION</span><h2>A system built<br/>for your next idea.</h2><p>Web banners, app interfaces and digital promotions. A consistent foundation with room for creativity.</p><a className="text-link" href="/banners/">See digital applications <Icon name="arrow"/></a></div></section></>}
function Visual({page,onCopy}){const [colorFilter,setColorFilter]=useState('all'),[bannerTheme,setBannerTheme]=useState('green'),[sample,setSample]=useState('Everyday feels familiar.'),[sampleWeight,setSampleWeight]=useState('700'),[sampleSize,setSampleSize]=useState(40),[tokenTab,setTokenTab]=useState('CSS'),[checked,setChecked]=useState([]);const k=page.kind;
 if(k==='logo')return <><div className="logo-gallery"><div className="logo-on-green"><div className="logo-showcase-box"><svg className="logo-stage-art" viewBox="819 730 560 741" role="img" aria-label="Yellow logo on Brand Green background"><image href="/assets/logo-bag-only-yellow-transparent.svg" width="2160" height="2160"/></svg></div><span className="logo-version-title">Yellow logo · transparent</span><span className="logo-background-rule">ONLY ON BRAND GREEN · #39823C</span><DownloadFormats file="logo-bag-only-yellow-transparent.svg" label="Yellow logo" png/></div><div className="logo-on-gold"><div className="logo-showcase-box"><svg className="logo-stage-art" viewBox="819 730 560 741" role="img" aria-label="Green logo on Brand Gold background"><image href="/assets/logo-bag-only-green-transparent.svg" width="2160" height="2160"/></svg></div><span className="logo-version-title">Green logo · transparent</span><span className="logo-background-rule">ONLY ON BRAND GOLD · #F3CB2D</span><DownloadFormats file="logo-bag-only-green-transparent.svg" label="Green logo" png/></div></div><div className="logo-donts"><div><span className="small-caps">KEEP THE IDENTITY INTACT</span><h2>Logo only.<br/>Clear boundaries.</h2><p>The logo is the sole visual brand mark. The named wordmark logo is not permitted in brand communications.</p></div><ul><li>Use only the official logo; do not use the named logo.</li><li>Yellow logo belongs ONLY on Brand Green #39823C.</li><li>Green logo belongs ONLY on Brand Gold #F3CB2D.</li><li>No transparent logos on white, cream, black or arbitrary colors.</li><li>No transparent logos directly over photography or gradients.</li><li>No stretching, rotation, or added text lockups.</li></ul></div></>;
 if(k==='colors'){
  const allColors = [
    ...palette.map(([name, hex, role], i) => ({
      name,
      hex,
      role,
      type: 'canonical',
      tag: 'Canonical Core',
      detail: role,
      index: i
    })),
    ...campaignPalette.map(([name, hex, category, usage], i) => ({
      name,
      hex,
      role: usage,
      type: 'campaign',
      tag: `Campaign · ${category}`,
      detail: `${category} · ${usage}`,
      index: i + palette.length
    })),
    ...complementaryPalette.map(([name, hex, category, usage], i) => ({
      name,
      hex,
      role: usage,
      type: 'category',
      tag: `Category · ${category}`,
      detail: `${category} · ${usage}`,
      index: i + palette.length + campaignPalette.length
    }))
  ];
  const displayedColors = colorFilter === 'all' ? allColors : allColors.filter(c => c.type === colorFilter);
  const darkHexes = ['#39823C','#214B32','#192C20','#111827','#1B5E20','#7C3AED','#E63946','#D8232A','#3D1E16','#3E162F','#C86D51','#00A3E0'];

  return <>
    <div className="palette-section-intro">
      <span className="small-caps">OUR DIGITAL PALETTE</span>
      <h2>Brand, Campaign &amp; Category Colors</h2>
      <p>The complete digital color system for banners, social media creatives, website graphics, sale promotions, and e-commerce designs. Grounded in Brand Green and Brand Gold, with campaign colors for festive energy and clearance offers. Click any swatch or chip to copy its HEX value.</p>
    </div>

    <div className="segmented color-filter-bar" aria-label="Color palette filter">
      {[
        ['all', `All colors (${allColors.length})`],
        ['canonical', `Canonical identity (${palette.length})`],
        ['campaign', `Campaign & promotion (${campaignPalette.length})`],
        ['category', `Category mood (${complementaryPalette.length})`]
      ].map(([val, label]) => (
        <button 
          key={val} 
          type="button" 
          className={colorFilter === val ? 'selected' : ''} 
          aria-pressed={colorFilter === val} 
          onClick={() => setColorFilter(val)}
        >
          {label}
        </button>
      ))}
    </div>

    <div className="palette-grid main-palette-grid">
      {displayedColors.map((color) => {
        const isDark = darkHexes.includes(color.hex);
        return (
          <button 
            className={`swatch swatch-${color.type} swatch-item-${color.index}`} 
            key={color.hex} 
            onClick={() => onCopy(color.hex)} 
            aria-label={`Copy ${color.name} ${color.hex}`}
          >
            <span 
              className="swatch-sample" 
              style={{
                background: color.hex, 
                color: isDark ? '#FFFFFF' : '#111827'
              }}
            >
              <Icon name="copy" />
              <span>Aa</span>
            </span>
            <span className="swatch-info">
              <span className={`swatch-badge ${color.type}`}>{color.tag}</span>
              <strong>{color.name}</strong>
              <code>{color.hex}</code>
              <small>{color.detail}</small>
            </span>
          </button>
        );
      })}
    </div>

    {/* Section 1: 5 Curated Color Combinations */}
    <section className="color-combinations-section" aria-labelledby="combinations-heading">
      <div className="section-subheading">
        <div>
          <span className="small-caps">PURPOSE-DRIVEN PALETTES</span>
          <h2 id="combinations-heading">5 Curated Color Combinations to Try</h2>
        </div>
        <p className="section-subtext">Tailored palettes for grocery, discounts, luxury podiums, mobile apps, and minimal product cards—anchored in Brand Yellow and Green.</p>
      </div>

      <div className="combinations-grid">
        {colorCombinations.map((combo) => (
          <article className="combination-card" key={combo.id}>
            <div className="combination-card-header">
              <span className="combination-badge">{combo.badge}</span>
              <h3>{combo.title}</h3>
            </div>
            
            <div className="combination-palette-strip" aria-label={`${combo.title} palette chips`}>
              {combo.swatches.map((swatch) => {
                const isDark = darkHexes.includes(swatch.hex);
                return (
                  <button
                    type="button"
                    key={swatch.hex}
                    className="combination-chip"
                    style={{
                      background: swatch.hex,
                      color: isDark ? '#FFFFFF' : '#111827'
                    }}
                    onClick={() => onCopy(swatch.hex)}
                    title={`Click to copy ${swatch.name} (${swatch.hex})`}
                    aria-label={`Copy ${swatch.name} ${swatch.hex}`}
                  >
                    <span className="chip-name">{swatch.name}</span>
                    <code className="chip-hex">{swatch.hex}</code>
                  </button>
                );
              })}
            </div>

            <div className="combination-meta">
              <p className="combination-concept">
                <strong>Visual inspiration:</strong> {combo.concept}
              </p>
              <div className="combination-best-for">
                <span className="best-for-tag">BEST FOR</span>
                <span>{combo.bestFor}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>

    {/* Section 2: Banner Gradient Ideas */}
    <section className="banner-gradients-section" aria-labelledby="gradients-heading">
      <div className="section-subheading">
        <div>
          <span className="small-caps">DYNAMIC CAMPAIGN BACKDROPS</span>
          <h2 id="gradients-heading">5 Gradient Ideas for Banners</h2>
        </div>
        <p className="section-subtext">Signature two-stop linear gradients for digital web banners, in-app promotions, and festive social assets. Click any gradient or button to copy its CSS rule.</p>
      </div>

      <div className="gradients-grid">
        {gradientIdeas.map((grad) => (
          <article className="gradient-card" key={grad.id}>
            <div
              className="gradient-canvas"
              style={{ background: grad.css }}
              onClick={() => onCopy(`background: ${grad.css};`)}
              title="Click to copy CSS gradient"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCopy(`background: ${grad.css};`); }}
              aria-label={`Copy ${grad.title} CSS gradient`}
            >
              <div className="gradient-canvas-overlay">
                <span className="gradient-stops-label">{grad.names}</span>
                <span className="gradient-copy-hint"><Icon name="copy" size={14} /> Copy CSS</span>
              </div>
            </div>
            
            <div className="gradient-card-body">
              <div className="gradient-card-title-row">
                <h3>{grad.title}</h3>
                <div className="gradient-stop-dots">
                  {grad.stops.map(hex => (
                    <span 
                      key={hex} 
                      className="stop-dot" 
                      style={{ background: hex }} 
                      title={hex}
                    />
                  ))}
                </div>
              </div>
              <div className="gradient-hex-flow">
                <code>{grad.stops[0]}</code>
                <span className="arrow-flow">→</span>
                <code>{grad.stops[1]}</code>
              </div>
              <p className="gradient-best-for">{grad.bestFor}</p>
              <button 
                type="button" 
                className="gradient-copy-btn" 
                onClick={() => onCopy(`background: ${grad.css};`)}
              >
                <Icon name="copy" size={14} />
                <span>Copy gradient CSS</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>

    {/* Section 3: Which Palette Should You Use? Selection Matrix */}
    <section className="palette-matrix-section" aria-labelledby="matrix-heading">
      <div className="section-subheading">
        <div>
          <span className="small-caps">DECISION MATRIX</span>
          <h2 id="matrix-heading">Which Palette Should You Use?</h2>
        </div>
        <p className="section-subtext">A quick application guide matching creative formats and retail categories to their ideal color combinations.</p>
      </div>

      <div className="table-wrap palette-matrix-table-wrap">
        <table className="palette-matrix-table">
          <thead>
            <tr>
              <th scope="col">Design Purpose</th>
              <th scope="col">Best Combination</th>
              <th scope="col">Palette Swatches &amp; HEX Codes</th>
              <th scope="col">Application Context</th>
            </tr>
          </thead>
          <tbody>
            {paletteMatrix.map((row, idx) => (
              <tr key={idx}>
                <th scope="row" className="purpose-cell">
                  <strong>{row.purpose}</strong>
                </th>
                <td data-label="Best Combination" className="combo-name-cell">
                  <span className="combo-name-badge">{row.combination}</span>
                </td>
                <td data-label="Palette Swatches & HEX" className="hexes-cell">
                  <div className="table-hex-chips">
                    {row.hexes.map((hex) => {
                      const isDark = darkHexes.includes(hex);
                      return (
                        <button
                          type="button"
                          key={hex}
                          className="table-hex-chip"
                          style={{
                            background: hex,
                            color: isDark ? '#FFFFFF' : '#111827'
                          }}
                          onClick={() => onCopy(hex)}
                          title={`Click to copy ${hex}`}
                          aria-label={`Copy ${hex}`}
                        >
                          <span>Aa</span>
                          <code>{hex}</code>
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td data-label="Application Context" className="context-cell">
                  {row.context}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {/* Section 4: Brand Identity Recommendation Callout */}
    <aside className="brand-recommendation-card" aria-label="Brand design recommendation">
      <div className="recommendation-accent-strip" />
      <div className="recommendation-content">
        <div className="recommendation-eyebrow">
          <Icon name="spark" size={18} />
          <span>BRAND DESIGN PRINCIPLE · CONSISTENCY WITH CREATIVE VARIETY</span>
        </div>
        <blockquote>
          “{brandRecommendation.quote}”
        </blockquote>
        <div className="recommendation-footer">
          <div className="recommendation-anchor-pill">
            <span className="anchor-dot" />
            <span>Permanent Brand Anchor: Brand Green (<strong>#39823C</strong>) &amp; Brand Gold (<strong>#F3CB2D</strong> / <strong>#F3CB2C</strong>)</span>
          </div>
          <small className="recommendation-source">Official Shubham K Mart Brand Identity Standard</small>
        </div>
      </div>
    </aside>

    <div className="palette-rules-duo">
      <div className="note-box">
        <strong>Canonical Core:</strong> Grounded in Brand Green (#39823C) and Brand Gold (#F3CB2D / #F3CB2C), balanced by warm Cream (#FBFAF4) and clean White (#FFFFFF) surfaces with high-contrast Ink (#192C20) typography.
      </div>
      <div className="note-box note-box-complementary">
        <strong>Campaign &amp; Anchor Rule:</strong> Campaign, sale, and category colors belong on promotional canvases. Every creative must retain the official Shubham K Mart brand anchor (yellow logo on Brand Green or green logo on Brand Gold).
      </div>
    </div>
  </>;
 }
 if(k==='typography')return <><div className="type-role-grid" aria-label="Primary, secondary and interface typography"><article className="type-role type-role-primary"><span className="type-role-label">PRIMARY / HEADLINES</span><h2>Inter ExtraBold</h2><span className="type-role-weight">Bold 700 · ExtraBold 800</span><div className="type-primary-example">Everyday,<br/>made easier.</div><p className="type-role-use">Campaign headlines, hero titles and key messages. Large, bold and instantly recognizable.</p></article><article className="type-role type-role-secondary"><span className="type-role-label">SECONDARY / BODY COPY</span><h2>Inter Regular</h2><span className="type-role-weight">Regular 400</span><div className="type-secondary-example">Familiar at every tap.</div><p className="type-body-example">Clear information, familiar words and enough room to read. Use this lighter weight for paragraphs, descriptions and supporting content.</p><p className="type-role-use">Body copy · 16 px · 1.5 line height</p></article><article className="type-role type-role-interface"><div><span className="type-role-label">UI / LABELS &amp; CONTROLS</span><h2>Inter Medium &amp; SemiBold</h2><span className="type-role-weight">Medium 500 · SemiBold 600</span></div><div className="type-ui-examples"><span>Explore essentials</span><span>Search the guide</span></div><p className="type-role-use">Buttons, navigation, field labels and compact interface text.</p></article></div><div className="type-specimen"><div className="type-specimen-top"><strong>Inter</strong><span>THE ACTUAL WEBSITE FONT</span></div><div className="type-showcase"><span>Aa</span><p>Clear words.<br/>Familiar shapes.</p></div><p className="type-proof">Every sample below renders in Inter, the same font used across this website.</p><p className="alphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>abcdefghijklmnopqrstuvwxyz<br/>0123456789 ₹ &amp; @ ! ?</p><label htmlFor="type-sample">TRY THE TYPEFACE</label><input id="type-sample" value={sample} maxLength={90} onChange={e=>setSample(e.target.value)}/><div className="type-controls"><div><label htmlFor="type-weight">WEIGHT</label><select id="type-weight" value={sampleWeight} onChange={e=>setSampleWeight(e.target.value)}>{[['400','Regular · 400'],['500','Medium · 500'],['600','SemiBold · 600'],['700','Bold · 700'],['800','ExtraBold · 800']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><div><label htmlFor="type-size">PREVIEW SIZE · {sampleSize} PX</label><input id="type-size" type="range" min="24" max="64" step="2" value={sampleSize} onChange={e=>setSampleSize(Number(e.target.value))}/></div></div><p className="live-specimen" style={{fontWeight:sampleWeight,fontSize:sampleSize}}>{sample||'Type something familiar.'}</p><div className="type-weight-samples" aria-label="Inter font weight examples">{[['400','Regular'],['500','Medium'],['600','SemiBold'],['700','Bold'],['800','ExtraBold']].map(([w,l])=> <div key={w}><span>{l} · {w}</span><p style={{fontWeight:w}}>Shubham K Mart</p></div>)}</div></div></>;
 if(k==='placement')return <div className="placement-demo"><div className="clear-space"><span className="measure top">¼ × symbol width</span><div className="clear-space-inner"><Logo/></div><span className="measure bottom">PROPOSED CLEAR-SPACE RULE</span></div><div className="placement-copy"><span className="small-caps">LET THE MARK BREATHE</span><h2>Space is part<br/>of the signature.</h2><p>The boundary is an exclusion zone, not a border to export. Measure from the visible mark, and review the complete lockup at the intended size.</p></div></div>;
 if(k==='banners')return <><div className="segmented" aria-label="Banner preview theme">{[['green','Digital web banner · 1080 × 600 (Green)'],['gold','App banner · 1080 × 600 (Gold)']].map(([v,l])=><button key={v} aria-pressed={bannerTheme===v} className={bannerTheme===v?'selected':''} onClick={()=>setBannerTheme(v)}>{l}</button>)}</div><div className="banner-stage"><Campaign format="landscape" theme={bannerTheme}/></div><div className="spec-row"><span>1080 × 600 PX</span><span>48 PX PROPOSED INSET</span><span>{bannerTheme==='green'?'THEME: BRAND GREEN #39823C · YELLOW LOGO':'THEME: BRAND GOLD #F3CB2D · GREEN LOGO'}</span><span>ONE CLEAR MESSAGE</span></div></>;
 if(k==='layout')return <div className="layout-demo"><div className="grid-visual" aria-hidden="true">{Array.from({length:12},(_,i)=><span key={i}/>)}<div className="grid-content"><span className="small-caps">A SHARED FOUNDATION</span><h2>Room for<br/>the good stuff.</h2><div className="grid-line"/><div className="grid-line short"/></div></div><div className="spacing-scale">{[4,8,12,16,24,32,48,64].map(n=><div key={n}><span style={{height:n}}/><code>{n}</code></div>)}</div></div>;
 if(k==='website')return <div className="browser-demo"><div className="browser-chrome"><span/><span/><span/><div>Shubham K Mart / illustrative digital interface</div></div><div className="demo-nav"><Logo/><span>Discover</span><span>Essentials</span><span>Help</span></div><div className="demo-content"><span className="mini-tag">MADE FOR THE EVERYDAY</span><h2>A little easier.<br/>Every day.</h2><p>A clear headline. A familiar color.<br/>A useful next step.</p><div className="component-example" aria-label="Sample primary button appearance">Explore essentials <Icon name="arrow"/></div><div className="demo-search"><Icon name="search"/> Search household essentials</div></div><div className="demo-footer">ILLUSTRATIVE UI COMPONENTS · NO LIVE CATALOGUE</div></div>;
 if(k==='tokens')return <div className="code-panel"><div className="code-toolbar"><div>{['CSS','JSON'].map(t=><button key={t} className={tokenTab===t?'active':''} onClick={()=>setTokenTab(t)} aria-pressed={tokenTab===t}>{t}</button>)}</div><button onClick={()=>onCopy(tokenTab==='CSS'?tokenCSS:JSON.stringify(tokens,null,2))}><Icon name="copy" size={16}/>Copy tokens</button></div><pre><code>{tokenTab==='CSS'?tokenCSS:JSON.stringify(tokens,null,2)}</code></pre><div className="code-bottom"><span>PROPOSED V1.0</span><a download href={`/assets/skm-tokens-v1.${tokenTab==='CSS'?'css':'json'}`}>Download {tokenTab} <Icon name="download" size={14}/></a></div></div>;
 if(k==='assets')return <div className="asset-grid">{[['logo-bag-only-yellow-transparent.svg','Logo · yellow on green','Supplied PNG + SVG · #39823C','transparent-yellow'],['logo-bag-only-green-transparent.svg','Logo · green on gold','Supplied PNG + SVG · #F3CB2D','transparent-green'],['skm-tokens-v1.css','CSS design tokens','Proposed semantic variables','code'],['skm-tokens-v1.json','JSON design tokens','Proposed shared values','code'],['skm-banner-template.svg','Web banner template','1080 × 600 · editable SVG','layout'],['skm-app-banner-template.svg','App banner template','1080 × 600 · editable SVG','layout'],['skm-og-template.svg','Open Graph template','1200 × 630 · editable SVG','layout']].map(([file,title,sub,type])=><article className="asset-card" key={file}><a className="asset-main-download" href={`/assets/${file}`} download aria-label={`Download ${title} as ${file.split('.').pop().toUpperCase()}`}><div className={`asset-thumb ${type}`}>{type==='green'?<Logo/>:type==='yellow'?<Logo alternate/>:type==='transparent-yellow'?<Logo className="asset-thumb-logo"/>:type==='transparent-green'?<Logo alternate className="asset-thumb-logo"/>:<Icon name={type==='code'?'code':'grid'} size={42}/>}</div><div className="asset-copy"><h3>{title}</h3><p>{sub}</p></div></a><div className="asset-download-row"><span>Download</span><DownloadFormats file={file} label={title} png={type.startsWith('transparent-')}/></div></article>)}</div>;
 if(k==='release')return <div className="checklist"><div className="checklist-header"><div><span className="small-caps">CURRENT SESSION</span><h2>{checked.length} of {page.checks.length} reviewed</h2></div><button className="text-button" onClick={()=>setChecked([])}>Reset</button></div><progress value={checked.length} max={page.checks.length} aria-label="Release review progress"/>{page.checks.map((t,i)=><label className={checked.includes(i)?'checked':''} key={t}><input type="checkbox" checked={checked.includes(i)} onChange={()=>setChecked(v=>v.includes(i)?v.filter(n=>n!==i):[...v,i])}/><span>{t}</span></label>)}<p className="quiet">Session-only checklist. Record final evidence and approval with the release.</p></div>;
 if(k==='voice')return <div className="voice-example"><span className="small-caps">THE EXISTING BRAND TAGLINE</span><blockquote>Shopping karo khulke,<br/><em>paise bachao jamke!</em></blockquote><span>FAMILIAR LANGUAGE. A RECOGNIZABLE SIGNATURE.</span></div>;
 if(k==='imagery')return <div className="imagery-demo"><div className="illustration-space"><div className="abstract-shape shape-a"/><div className="abstract-shape shape-b"/><Icon name="spark" size={58}/></div><div><span className="small-caps">A PURPOSEFUL COMPOSITION</span><h2>One focal point.<br/>Room for the story.</h2><p>Abstract shapes shown as editorial illustration. Use approved catalogue imagery for actual product communication.</p></div></div>;
 return null;
}
export function App({pageId='overview'}){const page=chapters.find(c=>c.id===pageId)||chapters[0];const index=chapters.indexOf(page),[query,setQuery]=useState(''),[menu,setMenu]=useState(false),[toast,setToast]=useState(''),[chatOpen,setChatOpen]=useState(false),helperTrigger=useRef(null);useEffect(()=>{const key=e=>{if(e.key==='Escape')setMenu(false);if(['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(e.target.tagName)||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'&&chapters[index+1])window.location.href=href(chapters[index+1].id);if(e.key==='ArrowLeft'&&chapters[index-1])window.location.href=href(chapters[index-1].id);};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[index]);useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2400);return()=>clearTimeout(t)},[toast]);useEffect(()=>{const workspace=document.querySelector('.workspace');document.body.classList.toggle('menu-open',menu);workspace.inert=menu;return()=>{document.body.classList.remove('menu-open');workspace.inert=false}},[menu]);useEffect(()=>{const breakpoint=window.matchMedia('(max-width: 1024px)');const closeOnDesktop=()=>{if(!breakpoint.matches)setMenu(false)};breakpoint.addEventListener('change',closeOnDesktop);return()=>breakpoint.removeEventListener('change',closeOnDesktop)},[]);async function copy(t){try{await navigator.clipboard.writeText(t);setToast(t.length<15?`Copied ${t}`:'Copied to clipboard')}catch{setToast('Clipboard unavailable. Select the value or download the file.')}}const groups=['START HERE','FOUNDATIONS','IDENTITY','DESIGN SYSTEM','DIGITAL APPLICATIONS','HANDOFF'];const results=chapters.filter(c=>JSON.stringify(c).toLowerCase().includes(query.toLowerCase()));return <><a className="skip-link" href="#main">Skip to content</a><header className="mobile-header"><a className="mobile-brand" href="/" aria-label="Shubham K Mart brand guidelines"><Logo className="mobile-logo-art"/><span className="mobile-brand-title">SHUBHAM K MART</span></a><button aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} aria-controls="sidebar" onClick={()=>setMenu(!menu)}><span className="menu-glyph" aria-hidden="true"><span/><span/><i/></span></button></header>{menu&&<button className="nav-backdrop" aria-label="Dismiss navigation overlay" tabIndex={-1} onClick={()=>setMenu(false)}/>}<aside id="sidebar" className={`sidebar ${menu?'is-open':''}`}><a className="sidebar-brand" href="/"><Logo className="sidebar-logo"/><span>SHUBHAM K MART<small>Digital brand guidelines</small></span></a><div className="edition"><span className="tiny-dot"/>THE DIGITAL EDITION <span>V1.0</span></div><div className="nav-search"><Icon name="search" size={16}/><input aria-label="Search guidelines" placeholder="Find a guideline…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Clear search" onClick={()=>setQuery('')}><Icon name="close" size={14}/></button>}</div><nav aria-label="Brand guideline chapters">{groups.map(g=>{const items=results.filter(c=>c.group===g);return items.length?<div className="nav-group" key={g}><div className="nav-label">{g}</div>{items.map(c=><a key={c.id} href={href(c.id)} className={page.id===c.id?'nav-active':''} aria-current={page.id===c.id?'page':undefined}><span className="nav-number">{String(chapters.indexOf(c)+1).padStart(2,'0')}</span>{c.nav}{page.id===c.id&&<span className="active-dot"/>}</a>)}</div>:null})}{!results.length&&<p className="no-results">No matching guidelines. Try “logo”, “font” or “banners”.</p>}</nav><div className="sidebar-bottom"><a href="/mcp/"><Icon name="code" size={16}/>MCP &amp; AI setup <Icon name="external" size={14}/></a><a href="/assets/"><Icon name="download" size={16}/>Brand assets <Icon name="external" size={14}/></a><span>Built for screens. Made for people.</span></div></aside><div className="workspace"><header className="topbar"><div className="breadcrumbs"><span>Brand guidelines</span><span>/</span><strong>{page.nav}</strong></div><div className="topbar-right"><span className="status-pill"><span/>Proposed v1.0</span><a className="top-download" href="/assets/"><Icon name="download" size={16}/><span>Get brand assets</span></a></div></header><main id="main" tabIndex="-1" data-chapter={page.id}><div className="chapter-bar" style={{'--chapter-progress':`${((index+1)/chapters.length)*100}%`}}><span><Icon name="book" size={15}/> THE SHUBHAM K MART GUIDELINES</span><span>{String(index+1).padStart(2,'0')} <i>/</i> {String(chapters.length).padStart(2,'0')}</span></div>{page.kind==='overview'?<Overview/>:<><header className="chapter-heading"><span className="chapter-cover-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><Kicker>{page.eyebrow}</Kicker><h1>{page.headline.split('\n').map((line,i)=><React.Fragment key={line}>{i>0&&<br/>}{i===1?<em>{line}</em>:line}</React.Fragment>)}</h1><p>{page.intro}</p></header>{page.kind==='mcp'&&<McpGuide onCopy={copy}/>}<VisualSummary page={page} Icon={Icon}/><Visual key={page.id} page={page} onCopy={copy}/>{page.cards&&page.kind!=='content'&&<Cards cards={page.cards}/>}<section className="chapter-details"><div className="section-heading"><div><span className="small-caps">THE PRACTICAL DETAILS</span><h2>{page.kind==='tokens'?'Implementation notes':'Guidelines in practice'}</h2></div><span className="quiet">Proposed digital standards</span></div>{page.table&&<Table table={page.table}/>}<RuleList rules={page.rules}/></section></>}<nav className="page-turner" aria-label="Chapter navigation"><div>{index>0?<a href={href(chapters[index-1].id)}><Icon name="left"/><span><small>PREVIOUS CHAPTER</small>{chapters[index-1].nav}</span></a>:<span className="edition-label">YOUR GUIDE TO A CONSISTENT DIGITAL BRAND</span>}</div><div className="chapter-dots" aria-label={`Chapter ${index+1} of ${chapters.length}`}>{chapters.map((c,i)=><a key={c.id} href={href(c.id)} className={i===index?'current':''} aria-label={`Chapter ${i+1}: ${c.nav}`} aria-current={i===index?'page':undefined}/>)}</div><div>{index<chapters.length-1?<a className="next-chapter" href={href(chapters[index+1].id)}><span><small>NEXT CHAPTER</small>{chapters[index+1].nav}</span><Icon name="right"/></a>:<a href="/">Back to overview <Icon name="arrow"/></a>}</div></nav><footer className="footer"><span>Shubham K Mart <span>© 2026</span></span><span>Digital brand guidelines · Proposed v1.0</span><button onClick={()=>window.print()}>Print this chapter <Icon name="external" size={12}/></button></footer></main></div><BrandChat chapter={page.id} open={chatOpen} onOpenChange={setChatOpen} triggerRef={helperTrigger}/><BrandCompanion onAsk={()=>setChatOpen(true)} chatOpen={chatOpen} triggerRef={helperTrigger}/><div className={`toast ${toast?'visible':''}`} role="status" aria-live="polite">{toast&&<><Icon name="check"/>{toast}</>}</div></>}
