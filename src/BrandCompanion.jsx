import React,{useEffect,useRef,useState} from 'react';

const storageKey='skm-companion-preferences';
const activities=['wave','peek','stretch','dance','doze'];

function BuddyArt(){return <svg viewBox="0 0 160 180" fill="none" aria-hidden="true">
  <ellipse className="buddy-shadow" cx="80" cy="165" rx="39" ry="6" fill="#214B32" opacity=".14"/>
  <g className="buddy-character">
    <g className="buddy-leg buddy-leg-left"><path d="M61 143v14" stroke="#214B32" strokeWidth="7" strokeLinecap="round"/><path d="M61 156H49c-5 0-7 8-1 8h18v-5" fill="#FBFAF4" stroke="#214B32" strokeWidth="3" strokeLinejoin="round"/></g>
    <g className="buddy-leg buddy-leg-right"><path d="M99 143v14" stroke="#214B32" strokeWidth="7" strokeLinecap="round"/><path d="M99 156h12c5 0 7 8 1 8H94v-5" fill="#FBFAF4" stroke="#214B32" strokeWidth="3" strokeLinejoin="round"/></g>
    <g className="buddy-arm buddy-arm-left"><path d="M44 95c-17 0-23 11-21 22" stroke="#214B32" strokeWidth="6" strokeLinecap="round"/><circle cx="23" cy="120" r="8" fill="#F3CB2D" stroke="#214B32" strokeWidth="3"/></g>
    <g className="buddy-arm buddy-arm-right"><path d="M116 95c17 0 23 11 21 22" stroke="#214B32" strokeWidth="6" strokeLinecap="round"/><circle cx="137" cy="120" r="8" fill="#F3CB2D" stroke="#214B32" strokeWidth="3"/></g>
    <path d="M60 65V49a20 20 0 0 1 40 0v16" stroke="#214B32" strokeWidth="9" strokeLinecap="round"/>
    <path d="M61 61V49a19 19 0 0 1 30-15" stroke="#FFFFFF" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round"/>
    <path d="M42 64h76l-4 75a10 10 0 0 1-10 10H56a10 10 0 0 1-10-10z" fill="#F3CB2D" stroke="#214B32" strokeWidth="3" strokeLinejoin="round"/>
    <path d="m49 72 3 61" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/>
    <path d="M109 75v61c0 4-2 6-6 6H59" stroke="#D4A91D" strokeWidth="4" strokeLinecap="round"/>
    <ellipse cx="56" cy="111" rx="8" ry="5" fill="#EA965E" opacity=".65"/><ellipse cx="104" cy="111" rx="8" ry="5" fill="#EA965E" opacity=".65"/>
    <g className="buddy-eyes"><circle cx="65" cy="96" r="11" fill="white"/><circle cx="95" cy="96" r="11" fill="white"/><g className="buddy-pupils"><circle cx="66" cy="97" r="5" fill="#192C20"/><circle cx="96" cy="97" r="5" fill="#192C20"/><circle cx="68" cy="95" r="1.7" fill="white"/><circle cx="98" cy="95" r="1.7" fill="white"/></g></g>
    <path className="buddy-smile" d="M70 115q10 12 20 0" stroke="#214B32" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="m76 134 4 4 4-4" stroke="#39823C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <g className="buddy-sparkles" stroke="#39823C" strokeWidth="2.5" strokeLinecap="round"><path d="M22 57v10m-5-5h10M135 46v12m-6-6h12"/></g>
    <g className="buddy-sleep" fill="#214B32" fontFamily="Inter, sans-serif" fontWeight="700"><text x="119" y="69" fontSize="14">z</text><text x="133" y="52" fontSize="18">z</text></g>
  </g>
</svg>}

export function BrandCompanion(){
  const [ready,setReady]=useState(false),[visible,setVisible]=useState(true),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[away,setAway]=useState(false),[activity,setActivity]=useState('wave'),[hello,setHello]=useState(false);
  const figure=useRef(null),settle=useRef(null),greeting=useRef(null),sequence=useRef(0),restore=useRef(null),play=useRef(null);
  useEffect(()=>{
    try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){setVisible(saved.visible!==false);setPaused(saved.paused===true)}}catch{}
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion=()=>setReduced(preference.matches),visibility=()=>setAway(document.hidden);
    motion();visibility();setReady(true);preference.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
    return()=>{preference.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);clearTimeout(settle.current);clearTimeout(greeting.current)};
  },[]);
  useEffect(()=>{if(ready)try{localStorage.setItem(storageKey,JSON.stringify({visible,paused}))}catch{}},[ready,visible,paused]);
  function animate(next){clearTimeout(settle.current);setActivity(next);settle.current=setTimeout(()=>setActivity('idle'),next==='doze'?3500:2500)}
  useEffect(()=>{
    if(!ready||!visible||paused||reduced||away){setActivity('idle');return}
    animate('wave');
    const timer=setInterval(()=>animate(activities[sequence.current++%activities.length]),8500);
    return()=>{clearInterval(timer);clearTimeout(settle.current)};
  },[ready,visible,paused,reduced,away]);
  useEffect(()=>{
    if(!ready||!visible||paused||reduced||away)return;
    let frame=0;
    const look=e=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const el=figure.current;if(!el)return;const box=el.getBoundingClientRect();el.style.setProperty('--look-x',`${Math.max(-3,Math.min(3,(e.clientX-box.left-box.width/2)/100))}px`);el.style.setProperty('--look-y',`${Math.max(-2,Math.min(2,(e.clientY-box.top-box.height/2)/160))}px`)})};
    window.addEventListener('pointermove',look,{passive:true});return()=>{window.removeEventListener('pointermove',look);cancelAnimationFrame(frame)};
  },[ready,visible,paused,reduced,away]);
  const react=()=>{if(!paused&&!reduced)animate(['happy','peek','dance'][sequence.current++%3])};
  function sayHello(){if(!paused&&!reduced)animate('happy');setHello(true);clearTimeout(greeting.current);greeting.current=setTimeout(()=>setHello(false),2800)}
  if(!ready)return null;
  return <aside className={`skm-companion ${paused||away?'is-paused':''} ${!visible?'is-hidden':''}`} aria-label="Website companion" data-activity={activity}>
    {visible?<>
      <div className="companion-controls">
        {!reduced&&<button type="button" aria-label={paused?'Resume companion animation':'Pause companion animation'} aria-pressed={paused} title={paused?'Resume movement':'Pause movement'} onClick={()=>setPaused(v=>!v)}>{paused?<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6z" fill="currentColor"/></svg>:<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 5v10M13 5v10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>}</button>}
        <button type="button" aria-label="Hide companion" title="Hide companion" onClick={()=>{setVisible(false);setHello(false);requestAnimationFrame(()=>restore.current?.focus())}}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8M6 14l8-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></button>
      </div>
      {hello&&<span className="companion-hello" role="status">Hi, friend! <span aria-hidden="true">✦</span></span>}
      <button type="button" ref={play} className="companion-play" aria-label="Say hello to your companion" title="Say hello!" onPointerEnter={react} onFocus={react} onClick={sayHello}><span className="companion-figure" ref={figure}><BuddyArt/></span></button>
    </>:<button type="button" ref={restore} className="companion-restore" onClick={()=>{setVisible(true);requestAnimationFrame(()=>play.current?.focus())}}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 8V6a5 5 0 0 1 10 0v2M4 8h16l-1 13H5z" strokeLinejoin="round"/><path d="M9 13h.01M15 13h.01M9 17q3 3 6 0" strokeLinecap="round"/></svg><span>Show buddy</span></button>}
  </aside>
}
