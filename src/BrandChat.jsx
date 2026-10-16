import React,{useState,useEffect,useRef} from 'react';
import {ChatAnswer} from './ChatAnswer.jsx';
import {BuddyArt} from './BrandCompanion.jsx';

const starters=['What are our brand colors?','Which font should I use?','Where should I place the logo?'];
function ChatIcon({close=false}){return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={close?'m6 6 12 12M6 18 18 6':'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z'}/>{!close&&<path d="M8 11h8M8 14h5"/>}</svg>}
export function BrandChat({chapter,open,onOpenChange,triggerRef}){
  const [draft,setDraft]=useState(''),[messages,setMessages]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[voiceSupported,setVoiceSupported]=useState(null),[listening,setListening]=useState(false),[voiceNote,setVoiceNote]=useState('');
  const panel=useRef(null),input=useRef(null),last=useRef(null),controller=useRef(null),pending=useRef(false),recognition=useRef(null),speechAPI=useRef(null);
  function stopVoice(){const active=recognition.current;if(active){recognition.current=null;active.onresult=active.onerror=active.onend=null;active.abort()}setListening(false)}
  function close(){stopVoice();onOpenChange(false);requestAnimationFrame(()=>triggerRef.current?.focus())}
  useEffect(()=>{speechAPI.current=window.SpeechRecognition||window.webkitSpeechRecognition;setVoiceSupported(!!speechAPI.current);return()=>{controller.current?.abort();recognition.current?.abort()}},[]);
  useEffect(()=>{if(!open||busy)stopVoice()},[open,busy]);
  useEffect(()=>{if(open)input.current?.focus()},[open]);
  useEffect(()=>{if(open)last.current?.scrollIntoView({block:'nearest'})},[messages,busy,error,open]);
  useEffect(()=>{if(!open)return;const escape=e=>{if(e.key==='Escape'){e.preventDefault();close()}};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape)},[open]);
  function toggleVoice(){
    if(recognition.current){recognition.current.stop();return}
    if(!speechAPI.current||busy)return;
    const active=new speechAPI.current(),prefix=draft.trimEnd();recognition.current=active;
    active.lang=navigator.language||'en-IN';active.continuous=false;active.interimResults=true;
    setVoiceNote('');setListening(true);
    active.onresult=e=>{if(recognition.current!==active)return;const words=Array.from(e.results,result=>result[0].transcript).join(' ');setDraft(`${prefix}${prefix?' ':''}${words}`.slice(0,1000));setVoiceNote('Review your words, then press send.')};
    active.onerror=e=>{if(recognition.current!==active)return;const notes={'not-allowed':'Microphone access was denied. Allow it in your browser, or type your question.','service-not-allowed':'Voice typing is unavailable in this browser. You can still type your question.','audio-capture':'No microphone was found. Connect one, or type your question.','no-speech':'No speech was heard. Tap the microphone to try again.',network:'Voice typing could not connect. Try again, or type your question.'};setVoiceNote(notes[e.error]||'Voice typing stopped. You can try again or keep typing.')};
    active.onend=()=>{if(recognition.current!==active)return;recognition.current=null;setListening(false);input.current?.focus()};
    try{active.start()}catch{stopVoice();setVoiceNote('Voice typing could not start. Please try again or type your question.')}
  }
  async function ask(text){
    const question=text.trim();if(!question||pending.current)return;
    stopVoice();setVoiceNote('');pending.current=true;setError('');setBusy(true);setDraft('');
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
    {open&&<section id="brand-helper-panel" ref={panel} className="chat-panel" role="dialog" aria-modal="false" aria-labelledby="brand-helper-title">
      <header className="chat-header"><div className="chat-avatar"><BuddyArt/></div><div><h2 id="brand-helper-title">Your brand helper</h2><span>Shubham K Mart · Digital guidelines</span></div><button className="chat-close" aria-label="Close brand helper" onClick={close}><ChatIcon close/></button></header>
      <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label="Brand helper conversation">
        <div className="chat-welcome"><span className="chat-greeting">A little guidance, right here.</span><p>Ask about colors, fonts, logo placement, social posts or your next digital design.</p></div>
        {!messages.length&&<div className="chat-starters">{starters.map(q=><button key={q} onClick={()=>ask(q)} disabled={busy}>{q}<span aria-hidden="true">↗</span></button>)}</div>}
        {messages.map((m,i)=><article className={`chat-message chat-${m.role}`} key={i}><span className="chat-speaker">{m.role==='user'?'YOU':'BRAND HELPER'}</span><ChatAnswer text={m.content}/>{m.sources?.length>0&&<nav className="chat-sources" aria-label="Related guidelines"><span>From the guide</span>{m.sources.map(s=><a href={s.url} key={s.url}>{s.title} ↗</a>)}</nav>}</article>)}
        {busy&&<p className="chat-thinking" role="status">Finding the right guideline<span aria-hidden="true">…</span></p>}
        {error&&<div className="chat-error" role="alert">{error}<button onClick={()=>ask(draft)} disabled={busy}>Try again</button></div>}
        <div ref={last}/>
      </div>
      <form className="chat-compose" onSubmit={e=>{e.preventDefault();ask(draft)}}><label className="chat-sr-only" htmlFor="brand-question">Your brand question</label><textarea ref={input} id="brand-question" placeholder="Ask about the brand…" value={draft} maxLength={1000} rows="2" disabled={busy} readOnly={listening} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();ask(draft)}}}/><button type="button" className="chat-mic" aria-label={listening?'Stop voice typing':'Start voice typing'} aria-pressed={listening} aria-describedby="voice-status" title={voiceSupported?'Voice typing':'Voice typing is unavailable in this browser'} disabled={busy||!voiceSupported} onClick={toggleVoice}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{listening?<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>:<><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></>}</svg></button><button type="submit" aria-label="Send brand question" disabled={busy||!draft.trim()}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v15"/></svg></button></form>
      <p id="voice-status" className={`chat-voice-status ${listening?'is-listening':''}`} role="status">{listening?'Listening… Tap stop when finished.':voiceNote||(voiceSupported===false?'Voice typing is unavailable here. You can type your question.':'Tap the mic to dictate. Review before sending.')}</p>
      <footer className="chat-disclosure"><span>Answers use this guide. Check details before publishing.</span>{messages.length>0&&<button disabled={busy} onClick={()=>{stopVoice();setVoiceNote('');setMessages([]);setError('');setDraft('');input.current?.focus()}}>New chat</button>}</footer>
    </section>}
  </div>
}
