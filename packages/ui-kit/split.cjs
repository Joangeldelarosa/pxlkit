const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/index.tsx');
let content = fs.readFileSync(file, 'utf8');

const destDir = path.join(__dirname, 'src');

const parts = content.split(/\/\* ═══════════════════════════════════════════════════════════════════════════════\s*(.*?)\s*═══════════════════════════════════════════════════════════════════════════════ \*\//g);

const sections = {};
let currentHeader = 'COMMON';
sections[currentHeader] = parts[0];

for (let i = 1; i < parts.length; i += 2) {
  const header = parts[i].trim();
  const code = parts[i + 1];
  if (['TYPES', 'UTILITIES', 'DESIGN TOKENS', 'PIXEL MICRO-ICONS  (inline SVG, no external deps)', 'INTERNALS'].includes(header)) {
    sections['COMMON'] += code;
  } else {
    sections[header] = code;
  }
}

fs.writeFileSync(path.join(destDir, 'common.tsx'), sections['COMMON']);

Object.keys(sections).forEach(header => {
  if (header === 'COMMON' || header === 'COMPONENT REGISTRY') return;
  
  const safeName = header.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fileCode = `import React, { useCallback, useEffect, useRef, useState } from 'react';\nimport {\n  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,\n  toneMap, sizeClass, focusRing, inputBase,\n  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell\n} from './common';\n\n` + sections[header];
  
  fs.writeFileSync(path.join(destDir, `${safeName}.tsx`), fileCode);
});

let commonCode = fs.readFileSync(path.join(destDir, 'common.tsx'), 'utf8');
commonCode = commonCode.replace(/type Tone =/g, 'export type Tone =')
                     .replace(/type Size =/g, 'export type Size =')
                     .replace(/type Option =/g, 'export type Option =')
                     .replace(/type TabItem =/g, 'export type TabItem =')
                     .replace(/type AccordionItem =/g, 'export type AccordionItem =')
                     .replace(/function cn/g, 'export function cn')
                     .replace(/function useClickOutside/g, 'export function useClickOutside')
                     .replace(/const toneMap:/g, 'export const toneMap:')
                     .replace(/const sizeClass:/g, 'export const sizeClass:')
                     .replace(/const focusRing =/g, 'export const focusRing =')
                     .replace(/const inputBase =/g, 'export const inputBase =')
                     .replace(/function ChevronDownIcon/g, 'export function ChevronDownIcon')
                     .replace(/function CheckIcon/g, 'export function CheckIcon')
                     .replace(/function CloseIcon/g, 'export function CloseIcon')
                     .replace(/function FieldShell/g, 'export function FieldShell');

fs.writeFileSync(path.join(destDir, 'common.tsx'), commonCode);

const indexExports = Object.keys(sections)
  .filter(h => h !== 'COMMON' && h !== 'COMPONENT REGISTRY')
  .map(h => `export * from './${h.toLowerCase().replace(/[^a-z0-9]+/g, '-')}';`)
  .join('\n');

fs.writeFileSync(path.join(destDir, 'index.tsx'), indexExports);

console.log('Split completed!');
