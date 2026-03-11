const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/index.tsx');
let content = fs.readFileSync(file, 'utf8');

const destDir = path.join(__dirname, 'src');

// 1. Extract common headers (Types, Utilities, Tokens, Mini Icons, Internals)
// They go from start up to /* LAYOUT */
const parts = content.split(/\/\* ═══════════════════════════════════════════════════════════════════════════════\s*(.*?)\s*═══════════════════════════════════════════════════════════════════════════════ \*\//g);

const sections = {};
let currentHeader = 'COMMON';
sections[currentHeader] = parts[0]; // the 'use client' + imports

for (let i = 1; i < parts.length; i += 2) {
  const header = parts[i].trim();
  const code = parts[i + 1];
  if (['TYPES', 'UTILITIES', 'DESIGN TOKENS', 'PIXEL MICRO-ICONS  (inline SVG, no external deps)', 'INTERNALS'].includes(header)) {
    sections['COMMON'] += code;
  } else {
    sections[header] = code;
  }
}

// Write common.tsx
fs.writeFileSync(path.join(destDir, 'common.tsx'), sections['COMMON']);

// Now for each component section, we'll write a file
Object.keys(sections).forEach(header => {
  if (header === 'COMMON' || header === 'COMPONENT REGISTRY') return;
  
  const safeName = header.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fileCode = `import React, { useCallback, useEffect, useRef, useState } from 'react';\nimport {\n  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,\n  toneMap, sizeClass, focusRing, inputBase,\n  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell\n} from './common';\n\n` + sections[header];
  
  fs.writeFileSync(path.join(destDir, `${safeName}.tsx`), fileCode);
});

// Since common.tsx needs exports, let's fix common.tsx to export its types and utilities
let commonCode = fs.readFileSync(path.join(destDir, 'common.tsx'), 'utf8');
commonCode = commonCode.replace(/type Tone/g, 'export type Tone');
commonCode = commonCode.replace(/type Size/g, 'export type Size');
commonCode = commonCode.replace(/type Option/g, 'export type Option');
commonCode = commonCode.replace(/type TabItem/g, 'export type TabItem');
commonCode = commonCode.replace(/type AccordionItem/g, 'export type AccordionItem');
commonCode = commonCode.replace(/function cn/g, 'export function cn');
commonCode = commonCode.replace(/function useClickOutside/g, 'export function useClickOutside');
commonCode = commonCode.replace(/const toneMap/g, 'export const toneMap');
commonCode = commonCode.replace(/const sizeClass/g, 'export const sizeClass');
commonCode = commonCode.replace(/const focusRing/g, 'export const focusRing');
commonCode = commonCode.replace(/const inputBase/g, 'export const inputBase');
commonCode = commonCode.replace(/function ChevronDown/g, 'export function ChevronDown');
commonCode = commonCode.replace(/function CheckIcon/g, 'export function CheckIcon');
commonCode = commonCode.replace(/function CloseIcon/g, 'export function CloseIcon');
commonCode = commonCode.replace(/function FieldShell/g, 'export function FieldShell');

fs.writeFileSync(path.join(destDir, 'common.tsx'), commonCode);

// Write a new index.ts to export everything
const indexExports = Object.keys(sections)
  .filter(h => h !== 'COMMON' && h !== 'COMPONENT REGISTRY')
  .map(h => `export * from './${h.toLowerCase().replace(/[^a-z0-9]+/g, '-')}';`)
  .join('\n');

fs.writeFileSync(path.join(destDir, 'index.ts'), indexExports);

console.log('Split completed!');
