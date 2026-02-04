#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const skillsDir = path.join(os.homedir(), '.claude', 'skills');
const sourceFile = path.join(__dirname, '..', 'SKILL.md');
const targetFile = path.join(skillsDir, 'curriculum-designer.md');

// Create skills directory if it doesn't exist
if (!fs.existsSync(skillsDir)) {
  fs.mkdirSync(skillsDir, { recursive: true });
  console.log('Created ~/.claude/skills/ directory');
}

// Copy the skill file
fs.copyFileSync(sourceFile, targetFile);
console.log('✅ Installed curriculum-designer skill for Claude Code');
console.log(`   Location: ${targetFile}`);
console.log('\n📝 Start a new Claude Code session to use the skill.');
