import {handleMessage} from '../mcp-server.mjs';

const versions=['2025-11-25','2025-06-18','2025-03-26'];
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const error=(status,code,message,id=null)=>new Response(JSON.stringify({jsonrpc:'2.0',id,error:{code,message}}),{status,headers});

export default {async fetch(request){
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return error(403,-32000,'Use an MCP client or the same website origin.');
  if(request.method!=='POST')return new Response(null,{status:405,headers:{Allow:'POST'}});
  const version=request.headers.get('mcp-protocol-version');
  if(version&&!versions.includes(version))return error(400,-32600,'Unsupported MCP protocol version.');
  if(!request.headers.get('content-type')?.includes('application/json'))return error(415,-32600,'Send JSON-RPC as application/json.');
  const accept=request.headers.get('accept')||'';
  if(!accept.includes('application/json')&&!accept.includes('*/*'))return error(406,-32600,'Accept application/json responses.');
  if(Number(request.headers.get('content-length')||0)>65536)return error(413,-32600,'Request is too large.');
  let message;
  try{const body=await request.text();if(body.length>65536)return error(413,-32600,'Request is too large.');message=JSON.parse(body)}catch{return error(400,-32700,'Invalid JSON.');}
  if(!message||Array.isArray(message)||message.jsonrpc!=='2.0'||typeof message.method!=='string'||(message.id!==undefined&&typeof message.id!=='string'&&typeof message.id!=='number')||(message.params!==undefined&&(!message.params||typeof message.params!=='object'||Array.isArray(message.params))))return error(400,-32600,'Invalid JSON-RPC request.');
  if(message.id===undefined){if(!message.method.startsWith('notifications/'))return error(400,-32600,'Requests need an id.');return new Response(null,{status:202});}
  try{
    const result=await handleMessage(message);
    if(message.method==='initialize'&&result?.result)result.result.protocolVersion=versions.includes(message.params?.protocolVersion)?message.params.protocolVersion:versions[0];
    return new Response(JSON.stringify(result),{headers});
  }catch{return error(500,-32603,'The brand MCP request could not be completed.',message.id);}
}};
