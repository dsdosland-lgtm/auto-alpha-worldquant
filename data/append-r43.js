const fs = require('fs');
const path = require('path');

const backlogPath = path.join(__dirname, 'idea-backlog.jsonl');
const appendPath = path.join(__dirname, 'idea-backlog-r43-append.jsonl');

const appendContent = fs.readFileSync(appendPath, 'utf8').trim();
const lines = appendContent.split('\n').filter(l => l.trim());

// Validate each line is valid JSON
lines.forEach((line, i) => {
  try {
    JSON.parse(line);
    console.log(`Line ${i+1}: valid JSON, id=${JSON.parse(line).id}`);
  } catch(e) {
    console.error(`Line ${i+1}: INVALID JSON - ${e.message}`);
    process.exit(1);
  }
});

// Read current backlog to check last char
const current = fs.readFileSync(backlogPath, 'utf8');
const needsNewline = !current.endsWith('\n');

// Build append string
const toAppend = (needsNewline ? '\n' : '') + lines.join('\n') + '\n';

fs.appendFileSync(backlogPath, toAppend, 'utf8');
console.log(`\nAppended ${lines.length} ideas to idea-backlog.jsonl`);
console.log(`Total lines now: ${(current + toAppend).split('\n').filter(l=>l.trim()).length}`);
