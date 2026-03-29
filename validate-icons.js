const fs = require('fs');
const path = require('path');

const ICON_DIRS = [
  'packages/gamification/src/icons',
  'packages/feedback/src/icons',
  'packages/social/src/icons',
  'packages/weather/src/icons',
  'packages/ui/src/icons',
  'packages/effects/src/icons',
  'packages/parallax/src/icons',
];

function readIconFiles() {
  const result = [];
  for (const dir of ICON_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));
    for (const file of files) {
      result.push(path.join(dir, file));
    }
  }
  return result;
}

function extractPaletteKeys(content) {
  const keys = new Set();
  const re = /palette:\s*\{([\s\S]*?)\}/g;
  let paletteMatch;
  while ((paletteMatch = re.exec(content)) !== null) {
    for (const m of paletteMatch[1].matchAll(/["']?([A-Za-z0-9])["']?\s*:/g)) {
      keys.add(m[1]);
    }
  }
  return keys;
}

function extractGridBlocks(content) {
  const blocks = [];
  const re = /grid:\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    blocks.push(m[1]);
  }
  return blocks;
}

function parseRows(gridBlock) {
  return [...gridBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function occupancySignature(rows) {
  return rows.join('').split('').map((c) => (c === '.' ? '0' : '1')).join('');
}

function similarity(sigA, sigB) {
  if (sigA.length !== sigB.length) return 0;
  let same = 0;
  for (let i = 0; i < sigA.length; i += 1) {
    if (sigA[i] === sigB[i]) same += 1;
  }
  return same / sigA.length;
}

const iconFiles = readIconFiles();
const errors = [];
const warnings = [];
const iconShapes = [];

for (const filePath of iconFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const paletteKeys = extractPaletteKeys(content);
  const gridBlocks = extractGridBlocks(content);

  if (gridBlocks.length === 0) {
    errors.push(`${filePath}: no grid found`);
    continue;
  }

  for (let i = 0; i < gridBlocks.length; i += 1) {
    const rows = parseRows(gridBlocks[i]);
    const frameLabel = gridBlocks.length > 1 ? ` frame ${i + 1}` : '';

    if (rows.length !== 16) {
      errors.push(`${filePath}:${frameLabel} has ${rows.length} rows (expected 16)`);
      continue;
    }

    rows.forEach((r, idx) => {
      if (r.length !== 16) {
        errors.push(`${filePath}:${frameLabel} row ${idx + 1} has ${r.length} chars (expected 16)`);
      }
    });

    const gridChars = new Set(rows.join('').split('').filter((c) => c !== '.'));
    for (const gc of gridChars) {
      if (!paletteKeys.has(gc)) {
        errors.push(`${filePath}:${frameLabel} grid char "${gc}" missing from palette`);
      }
    }
  }

  const firstRows = parseRows(gridBlocks[0]);
  if (firstRows.length === 16 && firstRows.every((r) => r.length === 16)) {
    iconShapes.push({
      filePath,
      signature: occupancySignature(firstRows),
    });
  }
}

for (let i = 0; i < iconShapes.length; i += 1) {
  for (let j = i + 1; j < iconShapes.length; j += 1) {
    const a = iconShapes[i];
    const b = iconShapes[j];
    const score = similarity(a.signature, b.signature);
    if (score === 1) {
      warnings.push(`DUPLICATE_SHAPE: ${a.filePath} <-> ${b.filePath}`);
    } else if (score >= 0.93) {
      warnings.push(`NEAR_DUPLICATE_SHAPE(${score.toFixed(2)}): ${a.filePath} <-> ${b.filePath}`);
    }
  }
}

if (errors.length === 0) {
  console.log(`Validated ${iconFiles.length} icon files successfully.`);
} else {
  errors.forEach((e) => console.log(`ERROR: ${e}`));
}

if (warnings.length) {
  console.log('');
  console.log('Potential duplicate/near-duplicate shapes:');
  warnings.forEach((w) => console.log(`WARN: ${w}`));
}

if (errors.length > 0) {
  process.exitCode = 1;
}
