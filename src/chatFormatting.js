export function splitTableRow(line){
  let text=line.trim();if(text.startsWith('|'))text=text.slice(1);if(text.endsWith('|')&&!text.endsWith('\\|'))text=text.slice(0,-1);
  const cells=[];let cell='',code=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];if(c==='\\'&&text[i+1]==='|'){cell+='|';i++;continue}
    if(c==='`')code=!code;
    if(c==='|'&&!code){cells.push(cell.trim());cell=''}else cell+=c;
  }
  cells.push(cell.trim());return cells;
}
const divider=line=>line.includes('|')&&splitTableRow(line).every(c=>/^:?-{3,}:?$/.test(c));
const listItem=line=>line.match(/^\s*(?:([-*+])|\d+[.)])\s+(.+)$/);

export function parseChatAnswer(text){
  const lines=String(text).replaceAll('\r','').split('\n'),blocks=[];let i=0;
  while(i<lines.length){
    const line=lines[i].trim();if(!line){i++;continue}
    if(line.includes('|')&&i+1<lines.length&&divider(lines[i+1])){
      const headers=splitTableRow(line),rows=[];i+=2;
      while(i<lines.length&&lines[i].trim()&&lines[i].includes('|')){
        const cells=splitTableRow(lines[i]);rows.push(headers.map((_,j)=>j===headers.length-1?cells.slice(j).join(' | '):cells[j]||''));i++;
      }
      blocks.push({type:'table',headers,rows});continue;
    }
    const heading=line.match(/^#{1,6}\s+(.+)$/);
    if(heading){blocks.push({type:'heading',text:heading[1]});i++;continue}
    const list=listItem(line);
    if(list){const ordered=!list[1],items=[];
      while(i<lines.length){const item=listItem(lines[i]);if(!item||(!item[1])!==ordered)break;items.push(item[2]);i++;}
      blocks.push({type:'list',ordered,items});continue;
    }
    const paragraph=[line];i++;
    while(i<lines.length&&lines[i].trim()&&!/^#{1,6}\s/.test(lines[i])&&!listItem(lines[i])&&!(lines[i].includes('|')&&i+1<lines.length&&divider(lines[i+1]))){paragraph.push(lines[i].trim());i++;}
    blocks.push({type:'paragraph',text:paragraph.join('\n')});
  }
  return blocks;
}
