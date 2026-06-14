const fs = require('fs');

const backlogPath = 'C:\\Users\\dsdos\\OneDrive\\Desktop\\Claude Project\\Alpha-WorldQuant\\data\\idea-backlog.jsonl';
const appendPath = 'C:\\Users\\dsdos\\OneDrive\\Desktop\\Claude Project\\Alpha-WorldQuant\\data\\goal6c-append-temp.jsonl';

const newLines = fs.readFileSync(appendPath, 'utf8')
  .split('\n')
  .filter(line => line.trim() !== '');

const existing = fs.readFileSync(backlogPath, 'utf8');
const lastChar = existing[existing.length - 1];
const prefix = (lastChar === '\n') ? '' : '\n';

const toAppend = prefix + newLines.join('\n') + '\n';

fs.appendFileSync(backlogPath, toAppend, 'utf8');
console.log('Appended', newLines.length, 'new ideas to idea-backlog.jsonl');

const finalContent = fs.readFileSync(backlogPath, 'utf8');
const finalLines = finalContent.split('\n').filter(l => l.trim() !== '');
console.log('Total lines in backlog now:', finalLines.length);

const last8 = finalLines.slice(-8).map(l => {
  try { return JSON.parse(l).idea_id || JSON.parse(l).id || '(no id)'; } catch(e) { return '(parse error)'; }
});
console.log('Last 8 idea_ids:', JSON.stringify(last8, null, 2));
