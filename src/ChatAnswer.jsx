import React from 'react';
import {parseChatAnswer} from './chatFormatting.js';

function Inline({text}){return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part,i)=>part.startsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part.startsWith('`')?<code key={i}>{part.slice(1,-1)}</code>:<React.Fragment key={i}>{part}</React.Fragment>)}
export function ChatAnswer({text}){
  return <div className="chat-answer">{parseChatAnswer(text).map((block,i)=>{
    if(block.type==='heading')return <h3 key={i}><Inline text={block.text}/></h3>;
    if(block.type==='list'){const List=block.ordered?'ol':'ul';return <List key={i}>{block.items.map((t,j)=><li key={j}><Inline text={t}/></li>)}</List>}
    if(block.type==='table')return <div className="chat-table" key={i}><table><thead><tr>{block.headers.map((h,j)=><th scope="col" key={j}><Inline text={h}/></th>)}</tr></thead><tbody>{block.rows.map((row,j)=><tr key={j}>{row.map((c,k)=>k===0?<th scope="row" key={k}><Inline text={c}/></th>:<td data-label={block.headers[k]} key={k}><Inline text={c}/></td>)}</tr>)}</tbody></table></div>;
    return <p key={i}><Inline text={block.text}/></p>;
  })}</div>;
}
