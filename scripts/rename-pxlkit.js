const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_PROCESS = [
  'packages',
  'apps/web/src',
];

const EXTENSIONS = ['.ts', '.tsx', '.md'];

const REPLACEMENTS = [
  { from: /\bPxlKit\b/g, to: 'PxlKitIcon' },
  { from: /\bAnimatedPxlKit\b/g, to: 'AnimatedPxlKitIcon' },
];

const IGNORE_FILES = [
  'node_modules',
  'dist',
  '.next'
];

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_FILES.includes(entry.name)) {
        processDirectory(fullPath);
      }
    } else {
      if (EXTENSIONS.includes(path.extname(entry.name))) {
        processFile(fullPath);
      }
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We want to avoid replacing PxlKitData, PxlKitProps, AnimatedPxlKitData, AnimatedPxlKitProps.
  // Wait, let's just replace PxlKit and AnimatedPxlKit only if it's the exact word and not followed by Data or Props.
  // Since \b matches the word boundary, it WON'T match PxlKitData as PxlKit. It will only match exactly "PxlKit".
  
  // Wait, what about PxlKitData? \bPxlKit\b won't match "PxlKitData". It will only match "PxlKit". So it's safe!
  
  for (const rule of REPLACEMENTS) {
    content = content.replace(rule.from, rule.to);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

for (const dir of DIRECTORIES_TO_PROCESS) {
  const fullDirPath = path.resolve(__dirname, '..', dir);
  if (fs.existsSync(fullDirPath)) {
    processDirectory(fullDirPath);
  } else {
    // If running from project root
    processDirectory(path.resolve(__dirname, dir));
  }
}

console.log('Done replacing strings.');
