const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'apps/web/src/components/ui-kit/elements.tsx');
const destDir = path.join(__dirname, 'packages/ui-kit/src');
const componentsDir = path.join(destDir, 'components');

const content = fs.readFileSync(srcFile, 'utf8');

// Regex to capture component blocks
const componentRegex = /export function (Pixel[A-Za-z0-9_]+|PxlKitButton)([\s\S]*?)(?=\nexport function|\n\/\* *\u2550|\n$)/g;
let match;
const componentNames = [];

while ((match = componentRegex.exec(content)) !== null) {
  const name = match[1];
  const body = match[2];
  const fullComponent = `export function ${name}${body}`;
  componentNames.push(name);
  
  // Try to determine imports needed 
  let imports = `import React from 'react';\nimport { cn } from '../utils/cn';\n`;
  if (fullComponent.includes('useState') || fullComponent.includes('useEffect') || fullComponent.includes('useRef') || fullComponent.includes('useCallback') || fullComponent.includes('useMemo')) {
    imports += `import { useState, useEffect, useRef, useCallback, useMemo } from 'react';\n`;
  }
  if (fullComponent.includes('useClickOutside')) {
    imports += `import { useClickOutside } from '../utils/useClickOutside';\n`;
  }
  // This is a naive extraction. Real extraction needs proper typescript parsing but we'll try a regex approach first
  // We'll actually just write the entire matched block into a file and see if it builds.
  
  const fileContent = `${imports}\n// Types\n${fullComponent}\n`;
  // Let's hold off on this script and just copy the whole thing to index.tsx for now, then split it manually or cleanly.
}
