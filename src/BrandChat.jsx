import React,{useState,useEffect,useRef} from 'react';

const starters=['What are our brand colors?','Which font should I use?','Where should I place the logo?'];
function ChatIcon({close=false}){return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={close?'m6 6 12 12M6 18 18 6':'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z'}/>{!close&&<path d="M8 11h8M8 14h5"/>}</svg>}
function Answer({text}){return <div className="chat-answer">{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part,i)=>part.startsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part.startsWith('`')?<code key={i}>{part.slice(1,-1)}</code>:<React.Fragment key={i}>{part}</React.Fragment>)}</div>}

export function BrandChat({chapter}){
  const [open,setOpen]=useState(false),[draft,setDraft]=useState(''),[messages,setMessages]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const panel=useRef(null),input=useRef(null),launcher=useRef(null),last=useRef(null),controller=useRef(null),pending=useRef(false);
  useEffect(()=>()=>controller.current?.abort(),[]);
  useEffect(()=>{if(open)input.current?.focus()},[open]);
  useEffect(()=>{if(open)last.current?.scrollIntoView({block:'nearest'})},[messages,busy,error,open]);
  useEffect(()=>{if(!open)return;const escape=e=>{if(e.key==='Escape'){e.preventDefault();setOpen(false);launcher.current?.focus()}};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape)},[open]);
  async function ask(text){
    const question=text.trim();if(!question||pending.current)return;
    pending.current=true;setError('');setBusy(true);setDraft('');
    const previous=messages.filter(m=>!m.failed).slice(-8);
    setMessages(v=>[...v,{role:'user',content:question}]);
    controller.current=new AbortController();
    const timeout=setTimeout(()=>controller.current?.abort(),32000);
    try{
      const response=await fetch('/api/brand-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,chapter,messages:previous.map(({role,content})=>({role,content:content.slice(0,2000)}))}),signal:controller.current.signal});
      let data;try{data=await response.json()}catch{throw Error(response.status===429?'The helper is busy. Please wait a moment and try again.':'The helper could not connect. Please try again shortly.')}
      if(!response.ok)throw Error(data.error||'Please try again shortly.');
      if(typeof data.answer!=='string')throw Error('No answer came through. Please try again.');
      setMessages(v=>[...v,{role:'assistant',content:data.answer,sources:Array.isArray(data.sources)?data.sources.filter(s=>s&&typeof s.title==='string'&&/^\/[a-z0-9-]+\/$/.test(s.url)).slice(0,4):[]}]);
    }catch(e){setError(e.name==='AbortError'?'The helper took too long. Please try again.':e.message);setDraft(question);setMessages(v=>v.slice(0,-1))}
    finally{clearTimeout(timeout);pending.current=false;setBusy(false)}
  }
  return <div className="brand-chat" data-open={open?'true':'false'}>
    {open&&<section ref={panel} className="chat-panel" role="dialog" aria-modal="false" aria-labelledby="brand-helper-title">
      <header className="chat-header"><div className="chat-avatar"><ChatIcon/></div><div><h2 id="brand-helper-title">Your brand helper</h2><span>Shubham K Mart · Digital guidelines</span></div><button className="chat-close" aria-label="Close brand helper" onClick={()=>{setOpen(false);launcher.current?.focus()}}><ChatIcon close/></button></header>
      <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label="Brand helper conversation">
        <div className="chat-welcome"><span className="chat-greeting">A little guidance, right here.</span><p>Ask about colors, fonts, logo placement, social posts or your next digital design.</p></div>
        {!messages.length&&<div className="chat-starters">{starters.map(q=><button key={q} onClick={()=>ask(q)} disabled={busy}>{q}<span aria-hidden="true">↗</span></button>)}</div>}
        {messages.map((m,i)=><article className={`chat-message chat-${m.role}`} key={i}><span className="chat-speaker">{m.role==='user'?'YOU':'BRAND HELPER'}</span><Answer text={m.content}/>{m.sources?.length>0&&<nav className="chat-sources" aria-label="Related guidelines"><span>From the guide</span>{m.sources.map(s=><a href={s.url} key={s.url}>{s.title} ↗</a>)}</nav>}</article>)}
        {busy&&<p className="chat-thinking" role="status">Finding the right guideline<span aria-hidden="true">…</span></p>}
        {error&&<div className="chat-error" role="alert">{error}<button onClick={()=>ask(draft)} disabled={busy}>Try again</button></div>}
        <div ref={last}/>
      </div>
      <form className="chat-compose" onSubmit={e=>{e.preventDefault();ask(draft)}}><label className="chat-sr-only" htmlFor="brand-question">Your brand question</label><textarea ref={input} id="brand-question" placeholder="Ask about the brand…" value={draft} maxLength={1000} rows="2" disabled={busy} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();ask(draft)}}}/><button type="submit" aria-label="Send brand question" disabled={busy||!draft.trim()}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v15"/></svg></button></form>
      <footer className="chat-disclosure"><span>Answers use this guide. Check details before publishing.</span>{messages.length>0&&<button disabled={busy} onClick={()=>{setMessages([]);setError('');setDraft('');input.current?.focus()}}>New chat</button>}</footer>
    </section>}
    <button ref={launcher} className="chat-launcher" aria-label={open?'Close brand helper':'Ask the brand helper'} aria-expanded={open} onClick={()=>setOpen(!open)}><ChatIcon close={open}/><span>{open?'Close helper':'Ask the brand'}</span>{!open&&<span className="chat-live-dot"/>}</button>
  </div>
}
