import type { PxlKitData, AnimatedPxlKitData, AnyIcon } from '../types';

/**
 * Parses a TypeScript/JSON code string into a PxlKitData object.
 *
 * This is designed for the "paste AI-generated code" workflow:
 * a user generates icon code using an LLM, pastes it into the builder,
 * and this function parses it back into a usable PxlKitData.
 *
 * Supports:
 * - Raw JSON objects
 * - TypeScript `const x: PxlKitData = { ... }` declarations
 * - Exported declarations (`export const x = { ... }`)
 *
 * @param code - String containing icon data definition
 * @returns Parsed PxlKitData or null if parsing fails
 */
export function parseIconCode(code: string): PxlKitData | null {
  try {
    // Try direct JSON parse first
    const trimmed = code.trim();

    let jsonStr = trimmed;

    // Strip TypeScript export/const/type annotations
    // Match patterns like: export const Name: PxlKitData = { ... }
    const tsPattern =
      /(?:export\s+)?(?:const|let|var)\s+\w+(?:\s*:\s*\w+)?\s*=\s*/;
    const tsMatch = trimmed.match(tsPattern);
    if (tsMatch) {
      jsonStr = trimmed.slice(tsMatch[0].length);
    }

    // Remove trailing semicolons
    jsonStr = jsonStr.replace(/;\s*$/, '');

    // Remove trailing "as const"
    jsonStr = jsonStr.replace(/\s+as\s+const\s*$/, '');

    // Try to fix common JS-to-JSON issues:
    // - Single quotes → double quotes
    // - Trailing commas
    // - Unquoted keys
    let sanitized = jsonStr
      // Replace single quotes with double quotes (but not inside strings)
      .replace(/'/g, '"')
      // Remove trailing commas before } or ]
      .replace(/,\s*([}\]])/g, '$1')
      // Quote unquoted keys: word: → "word":
      .replace(/(\s*)(\w+)\s*:/g, '$1"$2":');

    const parsed = JSON.parse(sanitized);

    // Validate minimal structure
    if (
      parsed &&
      typeof parsed.name === 'string' &&
      typeof parsed.size === 'number' &&
      Array.isArray(parsed.grid) &&
      typeof parsed.palette === 'object'
    ) {
      return {
        name: parsed.name,
        size: parsed.size,
        category: parsed.category || 'custom',
        grid: parsed.grid,
        palette: parsed.palette,
        tags: parsed.tags || [],
        author: parsed.author,
      } as PxlKitData;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parses a code string into either a PxlKitData or AnimatedPxlKitData.
 *
 * Detects animated icons by the presence of a `frames` array.
 * Supports the same input formats as parseIconCode (raw JSON, TS declarations, etc.).
 *
 * @param code - String containing icon data definition
 * @returns Parsed AnyIcon or null if parsing fails
 */
export function parseAnyIconCode(code: string): AnyIcon | null {
  try {
    const trimmed = code.trim();
    let jsonStr = trimmed;

    // Strip TypeScript export/const/type annotations
    const tsPattern =
      /(?:export\s+)?(?:const|let|var)\s+\w+(?:\s*:\s*\w+)?\s*=\s*/;
    const tsMatch = trimmed.match(tsPattern);
    if (tsMatch) {
      jsonStr = trimmed.slice(tsMatch[0].length);
    }

    // Remove trailing semicolons and "as const"
    jsonStr = jsonStr.replace(/;\s*$/, '').replace(/\s+as\s+const\s*$/, '');

    // Fix common JS-to-JSON issues
    let sanitized = jsonStr
      .replace(/'/g, '"')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/(\s*)(\w+)\s*:/g, '$1"$2":');

    const parsed = JSON.parse(sanitized);

    // Detect animated icon (has frames array, no top-level grid)
    if (
      parsed &&
      typeof parsed.name === 'string' &&
      typeof parsed.size === 'number' &&
      Array.isArray(parsed.frames) &&
      parsed.frames.length > 0 &&
      typeof parsed.palette === 'object'
    ) {
      // Validate frames structure
      const validFrames = parsed.frames.every(
        (f: Record<string, unknown>) => f && Array.isArray(f.grid)
      );
      if (!validFrames) return null;

      return {
        name: parsed.name,
        size: parsed.size,
        category: parsed.category || 'custom',
        palette: parsed.palette,
        frames: parsed.frames.map((f: Record<string, unknown>) => ({
          grid: f.grid as string[],
          ...(f.palette ? { palette: f.palette as Record<string, string> } : {}),
        })),
        frameDuration: parsed.frameDuration || 150,
        loop: parsed.loop !== false,
        trigger: parsed.trigger,
        tags: parsed.tags || [],
        author: parsed.author,
      } as AnimatedPxlKitData;
    }

    // Detect static icon (has top-level grid)
    if (
      parsed &&
      typeof parsed.name === 'string' &&
      typeof parsed.size === 'number' &&
      Array.isArray(parsed.grid) &&
      typeof parsed.palette === 'object'
    ) {
      return {
        name: parsed.name,
        size: parsed.size,
        category: parsed.category || 'custom',
        grid: parsed.grid,
        palette: parsed.palette,
        tags: parsed.tags || [],
        author: parsed.author,
      } as PxlKitData;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generates the TypeScript code representation of a PxlKitData.
 *
 * This produces copy-pasteable code that can be used to add icons
 * to a pack or shared with others.
 *
 * @param icon - The icon data
 * @param exportName - Optional PascalCase export name (defaults to icon.name in PascalCase)
 * @returns TypeScript source code string
 */
export function generateIconCode(
  icon: PxlKitData,
  exportName?: string
): string {
  const name =
    exportName ||
    icon.name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

  const gridLines = icon.grid
    .map((row) => `    '${row}',`)
    .join('\n');

  const paletteEntries = Object.entries(icon.palette)
    .map(([key, value]) => `    '${key}': '${value}',`)
    .join('\n');

  const tagsStr = icon.tags.map((t) => `'${t}'`).join(', ');

  return `import type { PxlKitData } from '@pxlkit/core';

export const ${name}: PxlKitData = {
  name: '${icon.name}',
  size: ${icon.size},
  category: '${icon.category}',
  grid: [
${gridLines}
  ],
  palette: {
${paletteEntries}
  },
  tags: [${tagsStr}],${icon.author ? `\n  author: '${icon.author}',` : ''}
};
`;
}
