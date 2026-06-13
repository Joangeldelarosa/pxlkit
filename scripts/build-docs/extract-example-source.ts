/**
 * extract-example-source — turn a component's `.examples.tsx` file into
 * consumer-facing usage code.
 *
 * The SSOT examples are real, runnable React components with realistic
 * props, which makes their SOURCE the best possible usage documentation —
 * provided two transforms:
 *
 *   1. Relative imports (`./PixelAreaChart`, `../actions`) become the
 *      package specifier consumers actually write: `@pxlkit/ui-kit`.
 *   2. The bare `import React from 'react'` line is dropped when React is
 *      not referenced as a value (the kit targets the automatic JSX
 *      runtime); files that use `React.*` keep it.
 *
 * Consumers:
 *   - generate-docs-page embeds the full transformed source as a "Usage"
 *     block per component on /docs.
 *   - the usage-snippets map gives /ui-kit a shorter cut: the module
 *     preamble (imports + shared data consts) plus the FIRST exported
 *     example only.
 */

const RELATIVE_IMPORT_RE = /from\s+(['"])(\.{1,2}\/[^'"]*)\1/g;

/** Rewrite relative import specifiers to the public package name. */
export function rewriteRelativeImports(source: string, packageName = '@pxlkit/ui-kit'): string {
  return source.replace(RELATIVE_IMPORT_RE, (_m, quote: string) => `from ${quote}${packageName}${quote}`);
}

/** Drop `import React ... from 'react'` when React is never used as a value. */
export function dropUnusedReactImport(source: string): string {
  const usesReactValue = /\bReact\s*[.(]/.test(source.replace(/import[^;]+;/g, ''));
  if (usesReactValue) return source;
  return source.replace(/^import\s+React(?:\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"];\s*\r?\n/m, (match) => {
    // Preserve named imports (hooks) if the React default was combined with them.
    const named = /\{([^}]*)\}/.exec(match);
    return named ? `import {${named[1]}} from 'react';\n` : '';
  });
}

/**
 * Find the index just past the balanced closing brace of the block whose
 * opening brace sits at/after `from`. String/template/comment aware.
 * Returns -1 when the block never closes.
 */
function endOfBracedBlock(source: string, from: number): number {
  const openBrace = source.indexOf('{', from);
  if (openBrace === -1) return -1;

  let depth = 0;
  let i = openBrace;
  let state: 'code' | 'single' | 'double' | 'template' | 'line' | 'block' = 'code';
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    switch (state) {
      case 'code':
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) return i + 1;
        } else if (ch === "'") state = 'single';
        else if (ch === '"') state = 'double';
        else if (ch === '`') state = 'template';
        else if (ch === '/' && next === '/') state = 'line';
        else if (ch === '/' && next === '*') { state = 'block'; i++; }
        break;
      case 'single':
        if (ch === '\\') i++;
        else if (ch === "'") state = 'code';
        break;
      case 'double':
        if (ch === '\\') i++;
        else if (ch === '"') state = 'code';
        break;
      case 'template':
        if (ch === '\\') i++;
        else if (ch === '`') state = 'code';
        break;
      case 'line':
        if (ch === '\n') state = 'code';
        break;
      case 'block':
        if (ch === '*' && next === '/') { state = 'code'; i++; }
        break;
    }
    i++;
  }
  return -1;
}

const EXPORT_FN_RE = /^export function\s+(\w+)/gm;

/**
 * Extract every top-level `export function Name() {...}` block, verbatim,
 * keyed by export name.
 */
export function extractExportFunctions(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  EXPORT_FN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = EXPORT_FN_RE.exec(source)) !== null) {
    const end = endOfBracedBlock(source, m.index);
    if (end === -1) continue;
    out[m[1]!] = source.slice(m.index, end).trimEnd() + '\n';
    EXPORT_FN_RE.lastIndex = end;
  }
  return out;
}

/**
 * Slice the module from the top through the end of the FIRST
 * `export function …` block — the preamble (imports, shared sample data)
 * plus the canonical Default example. Returns null when no export function
 * is found.
 */
export function sliceThroughFirstExport(source: string): string | null {
  const start = source.search(/^export function\s+\w+/m);
  if (start === -1) return null;
  const end = endOfBracedBlock(source, start);
  if (end === -1) return null;
  return source.slice(0, end).trimEnd() + '\n';
}

/** Full usage document: whole examples file, consumer-ready. */
export function toUsageSource(examplesSource: string, packageName = '@pxlkit/ui-kit'): string {
  return dropUnusedReactImport(rewriteRelativeImports(examplesSource, packageName)).trim() + '\n';
}

/** Short usage snippet: preamble + first export only, consumer-ready. */
export function toUsageSnippet(examplesSource: string, packageName = '@pxlkit/ui-kit'): string | null {
  const sliced = sliceThroughFirstExport(examplesSource);
  if (!sliced) return null;
  return toUsageSource(sliced, packageName);
}
