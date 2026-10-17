import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/mcp.mjs';
const send=(message,headers={})=>handler.fetch(new Request('https://brand.vercel.app/api/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream',...headers},body:JSON.stringify(message)}));
test('cloud MCP negotiates HTTP versions and accepts initialized notifications',async()=>{
  const r=await send({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25'}});
  assert.equal(r.status,200);const data=await r.json();assert.equal(data.result.protocolVersion,'2025-11-25');assert(data.result.capabilities.tools);
  const notification=await send({jsonrpc:'2.0',method:'notifications/initialized'});assert.equal(notification.status,202);assert.equal(await notification.text(),'');
});
test('cloud MCP calls existing tools and includes official resource files',async()=>{
  const colors=await (await send({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'get_brand_colors',arguments:{}}})).json();assert(JSON.stringify(colors).includes('#39823C'));
  const resource=await (await send({jsonrpc:'2.0',id:3,method:'resources/read',params:{uri:'brand://logos/yellow.svg'}})).json();assert(resource.result.contents[0].text.includes('<svg'));
});
test('cloud MCP rejects invalid origins, JSON-RPC and unsupported transport versions',async()=>{
  const message={jsonrpc:'2.0',id:1,method:'tools/list'};
  assert.equal((await send(message,{Origin:'https://untrusted.example'})).status,403);
  assert.equal((await send(message,{'MCP-Protocol-Version':'invalid'})).status,400);
  assert.equal((await send([message])).status,400);
  assert.equal((await handler.fetch(new Request('https://brand.vercel.app/api/mcp'))).status,405);
});
