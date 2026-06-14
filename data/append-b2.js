const fs = require('fs');
const path = require('path');

const backlogPath = path.join(__dirname, 'idea-backlog.jsonl');
const appendPath = path.join(__dirname, 'backlog-append-b2.jsonl');

const appendContent = fs.readFileSync(appendPath, 'utf8');
const lines = appendContent.split('\n').filter(l => l.trim());

// Ensure backlog ends with newline before appending
let existing = fs.readFileSync(backlogPath, 'utf8');
if (!existing.endsWith('\n')) {
  existing += '\n';
}

const toAppend = lines.join('\n') + '\n';
fs.appendFileSync(backlogPath, toAppend, 'utf8');

console.log(`Appended ${lines.length} entries to idea-backlog.jsonl`);

// Verify last few lines
const result = fs.readFileSync(backlogPath, 'utf8');
const resultLines = result.split('\n').filter(l => l.trim());
console.log(`Total entries now: ${resultLines.length}`);
console.log(`Last entry idea_id: ${JSON.parse(resultLines[resultLines.length - 1]).idea_id}`);
