import test from 'node:test';
import assert from 'node:assert/strict';
import {parseChatAnswer,splitTableRow} from '../src/chatFormatting.js';

test('renders the observed Groq palette table as structured rows',()=>{
  const blocks=parseChatAnswer('**Brand palette**\n\n| Role | Color name | HEX | Usage |\n|---|---|---|---|\n| Brand surface | Green | `#3D6948` | Primary background |\n| Accent | Gold | `#F3CB2D` | Emphasis |');
  assert.equal(blocks.length,2);assert.equal(blocks[1].type,'table');assert.deepEqual(blocks[1].headers,['Role','Color name','HEX','Usage']);assert.equal(blocks[1].rows[1][2],'`#F3CB2D`');
});
test('keeps headings, bullet lists, numbered instructions and paragraphs distinct',()=>{
  const blocks=parseChatAnswer('## Logo placement\n\n- Keep clear space\n- Preserve proportions\n\n1. Choose a format\n2. Preview the crop\n\nReview final artwork.');
  assert.deepEqual(blocks.map(b=>b.type),['heading','list','list','paragraph']);assert.equal(blocks[1].ordered,false);assert.equal(blocks[2].ordered,true);
});
test('preserves escaped pipes and code content inside table cells',()=>{
  assert.deepEqual(splitTableRow('| Voice | A \\| B | `x|y` |'),['Voice','A | B','`x|y`']);
  assert.equal(parseChatAnswer('Use green | gold as an accent.')[0].type,'paragraph');
});
test('handles short rows and retains untrusted markup as inert text',()=>{
  const table=parseChatAnswer('| Name | Value |\n|---|---|\n| Green |')[0];assert.equal(table.rows[0][1],'');
  assert.equal(parseChatAnswer('<script>alert(1)</script>')[0].text,'<script>alert(1)</script>');
});
