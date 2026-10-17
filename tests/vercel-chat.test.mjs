import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/brand-chat.mjs';

test('Vercel handler preserves the shared helper request validation',async()=>{
  const origin='https://brand.vercel.app';
  const get=await handler.fetch(new Request(`${origin}/api/brand-chat`));
  assert.equal(get.status,405);
  assert.equal(get.headers.get('allow'),'POST');
  const post=await handler.fetch(new Request(`${origin}/api/brand-chat`,{
    method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({question:''})
  }));
  assert.equal(post.status,400);
  assert.match((await post.json()).error,/question/i);
});
