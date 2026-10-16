import {getBrandContext,systemInstructions} from '../../src/brandKnowledge.js';

const reply=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});

export default async function brandChat(request){
  if(request.method!=='POST')return reply({error:'Use POST for brand questions.'},405,{Allow:'POST'});
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return reply({error:'Please use the helper on this website.'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'Send a JSON question.'},415);
  if(Number(request.headers.get('content-length')||0)>14000)return reply({error:'Please send a shorter question.'},413);
  let input;
  try{const text=await request.text();if(text.length>14000)return reply({error:'Please send a shorter question.'},413);input=JSON.parse(text)}catch{return reply({error:'Please send a valid question.'},400)}
  if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'Please send a valid question.'},400);
  const question=typeof input.question==='string'?input.question.trim():'';
  if(!question||question.length>1000)return reply({error:'Ask a question between 1 and 1,000 characters.'},400);
  if(input.messages!==undefined&&!Array.isArray(input.messages))return reply({error:'Invalid conversation.'},400);
  const history=(input.messages||[]).slice(-8);
  if(history.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>2000))return reply({error:'Invalid conversation.'},400);
  const key=process.env.GROQ_API_KEY;
  if(!key)return reply({error:'The brand helper is being connected. Please try again shortly.',code:'NOT_CONFIGURED'},503);
  const {context,sources}=getBrandContext(question,input.chapter,history);
  try{
    const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:process.env.GROQ_MODEL||'llama-3.3-70b-versatile',temperature:0.2,max_completion_tokens:700,messages:[{role:'system',content:systemInstructions+'\n\nREFERENCE DATA:\n'+context},...history.map(m=>({role:m.role,content:m.content})),{role:'user',content:question}]}),
      signal:AbortSignal.timeout(25000)
    });
    if(response.status===429)return reply({error:'The helper is busy. Please wait a moment and try again.'},429,{'Retry-After':'30'});
    if(!response.ok)return reply({error:'The answer service could not connect. Please try again shortly.'},502);
    const data=await response.json();const answer=data.choices?.[0]?.message?.content;
    if(typeof answer!=='string'||!answer.trim())return reply({error:'No answer came through. Please try your question again.'},502);
    return reply({answer:answer.trim(),sources});
  }catch{return reply({error:'The helper took too long to respond. Please try again.'},504)}
}

export const config={path:'/api/brand-chat',rateLimit:{windowLimit:12,windowSize:60,aggregateBy:['ip','domain']}};
