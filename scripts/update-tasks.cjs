// Update tasks.md: SKELETON -> IMPLEMENTED where code is done
const fs = require('fs');
const path = require('path');

const tasksPath = path.resolve(__dirname, '..', 'docs', 'mobile-redesign', 'tasks.md');
let content = fs.readFileSync(tasksPath, 'utf8');

// Replace SKELETON labels with IMPLEMENTED for code-done tasks
// Keep the original meaning but reflect that runtime verification is pending
const replaced = content
  .replace(/SKELETON \(code done, chua verify runtime\)/g, 'IMPLEMENTED (code done, chua verify runtime)');

// Add a new top-level section noting the current status
const bannerAddition = `

> **TRANG THAI HIEN TAI (2026-09-18, Batch 5)**: Toan bo MOB-XXX da IMPLEMENTED (code done) sau 4 batches (6776129, a1b371a, 4ae282b, 6ba45a4) + Batch 5 refactor + features/. Can verify runtime: \`cd mobile && npm install\`, \`npx tsc --noEmit\`, \`npx expo start\` emulator + contrast WebAIM tool. Sau do moi set DONE theo AGENTS.md.
`;

const final = replaced + bannerAddition;

fs.writeFileSync(tasksPath, final, 'utf8');
console.log('tasks.md updated');
