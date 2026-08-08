/**
 * skill-refs/tokens
 *
 * Renders the tokens & theming reference consumed by the pxlkit Claude Code
 * skills. Every table here is *parsed from the shipped sources* — the palette
 * out of `packages/ui-kit/styles.css`, the tone / surface / size scales out of
 * `packages/ui-kit/src/tokens.ts` and `packages/ui-kit/src/common.tsx` — so a
 * palette tweak or a new tone can never silently rot the reference. Only the
 * prose (why the two tone scales differ, the re-skin gotchas) is authored.
 *
 * The single most likely API error an agent makes with this kit is reaching for
 * `toneMap` where `tone` is required, or vice-versa: both are `Record<Tone, …>`,
 * both have a `border` key, and mixing them type-checks. The renderer therefore
 * always emits the literal sentence "The two tone scales are NOT
 * interchangeable" — guaranteed by a test, not by the goodwill of whoever edits
 * this file next.
 *
 * Consumed by `generate-skill-refs.ts`, which imports it dynamically and passes
 * `{ tokensTs, commonTsx, stylesCss }` plus the ui-kit version.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Raw sources the renderer parses. Empty strings are tolerated. */
export interface TokenSources {
  /** `packages/ui-kit/src/tokens.ts` — surface-scale `tone` map. */
  tokensTs: string;
  /** `packages/ui-kit/src/common.tsx` — `toneMap`, `SURFACE_TOKENS`, size scales. */
  commonTsx: string;
  /** `packages/ui-kit/styles.css` — the `--retro-*` palette. */
  stylesCss: string;
}

/** One palette variable resolved in both themes. */
export interface CssVarRow {
  name: string;
  light: string | null;
  dark: string | null;
  /** Tailwind colour namespace exposed via `@theme`, e.g. `retro-green`. */
  utility: string | null;
}

// ---------------------------------------------------------------------------
// CSS parsing
// ---------------------------------------------------------------------------

interface CssBlock {
  /** Text before the `{`, trimmed — e.g. `:root, :host`, `.dark`, `@theme`. */
  selector: string;
  /** Raw text between the braces, nested blocks included. */
  body: string;
}

/** Drop `/* … *\/` comments so a commented-out declaration can never win. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Brace-matched block scanner. A regex cannot do this: the real stylesheet
 * nests `:root` / `.dark` / `.light` inside `@layer base { … }`, and `@theme`
 * contains `@keyframes` blocks of its own.
 */
function cssBlocks(css: string): CssBlock[] {
  const out: CssBlock[] = [];
  const stack: Array<{ selector: string; start: number }> = [];
  let prelude = '';
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === '{') {
      stack.push({ selector: prelude.trim(), start: i + 1 });
      prelude = '';
    } else if (ch === '}') {
      const open = stack.pop();
      if (open) out.push({ selector: open.selector, body: css.slice(open.start, i) });
      prelude = '';
    } else if (ch === ';') {
      // Statement at-rules (`@import "tailwindcss";`) must not leak into the
      // next block's prelude.
      prelude = '';
    } else {
      prelude += ch;
    }
  }
  return out;
}

/** Text of `body` that sits at brace depth 0 — i.e. this block's own declarations. */
function ownDeclarations(body: string): string {
  let depth = 0;
  let out = '';
  for (const ch of body) {
    if (ch === '{') {
      depth += 1;
      continue;
    }
    if (ch === '}') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) out += ch;
  }
  return out;
}

/** `--name: value` pairs, in source order. */
function customProperties(body: string): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const re = /(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]+)/g;
  let m: RegExpExecArray | null;
  const own = ownDeclarations(body);
  while ((m = re.exec(own)) !== null) {
    const name = m[1];
    const value = (m[2] ?? '').trim();
    if (name && value) out.push([name, value]);
  }
  return out;
}

function selectorParts(selector: string): string[] {
  return selector
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Resolve every `--retro-*` variable into a light value and a dark value.
 *
 * Light comes from `:root` / `:host`; a variable declared only in the explicit
 * `.light` block (used for previews nested inside `.dark`) falls back to it.
 * `--color-retro-*` is deliberately excluded: those are Tailwind `@theme`
 * mirrors, not tokens a consumer should redefine directly (the re-skin recipe
 * below explains when they nevertheless must be re-declared).
 */
export function parseCssVars(stylesCss: string): CssVarRow[] {
  const css = stripCssComments(stylesCss ?? '');
  const blocks = cssBlocks(css);

  const root = new Map<string, string>();
  const lightClass = new Map<string, string>();
  const dark = new Map<string, string>();
  /** `--retro-green` → `retro-green` when `@theme` exposes it as a colour. */
  const utility = new Map<string, string>();

  for (const block of blocks) {
    const parts = selectorParts(block.selector);
    const isRoot = parts.some((p) => p === ':root' || p === ':host');
    const isDark = parts.some((p) => p === '.dark' || p.startsWith('.dark'));
    const isLight = parts.some((p) => p === '.light' || p.startsWith('.light'));
    const isTheme = block.selector.startsWith('@theme');

    for (const [name, value] of customProperties(block.body)) {
      if (isTheme && name.startsWith('--color-')) {
        const ref = /var\(\s*(--retro-[A-Za-z0-9_-]+)\s*\)/.exec(value);
        if (ref?.[1]) utility.set(ref[1], name.slice('--color-'.length));
        continue;
      }
      if (!name.startsWith('--retro-')) continue;
      if (isRoot && !root.has(name)) root.set(name, value);
      else if (isLight && !lightClass.has(name)) lightClass.set(name, value);
      if (isDark && !dark.has(name)) dark.set(name, value);
    }
  }

  // Source order: :root first (the canonical declaration order), then anything
  // that only exists in .light, then anything that only exists in .dark.
  const names: string[] = [];
  for (const key of root.keys()) names.push(key);
  for (const key of lightClass.keys()) if (!names.includes(key)) names.push(key);
  for (const key of dark.keys()) if (!names.includes(key)) names.push(key);

  return names.map((name) => ({
    name,
    light: root.get(name) ?? lightClass.get(name) ?? null,
    dark: dark.get(name) ?? null,
    utility: utility.get(name) ?? null,
  }));
}

// ---------------------------------------------------------------------------
// TypeScript parsing
// ---------------------------------------------------------------------------

/**
 * Remove `//` and block comments while respecting string/template literals.
 * Required before splitting object literals: the real sources carry comments
 * such as `// 4px corner cut — cards, alerts, sections`, whose commas would
 * otherwise be read as entry separators.
 */
function stripTsComments(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i] as string;
    if (ch === "'" || ch === '"' || ch === '`') {
      out += ch;
      i += 1;
      while (i < src.length) {
        const c = src[i] as string;
        if (c === '\\') {
          out += c + (src[i + 1] ?? '');
          i += 2;
          continue;
        }
        out += c;
        i += 1;
        if (c === ch) break;
      }
      continue;
    }
    if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

/** Body of the object literal assigned to `const <name>`, braces excluded. */
function objectLiteralBody(src: string, name: string): string | null {
  const source = stripTsComments(src ?? '');
  const decl = new RegExp(`(?:export\\s+)?const\\s+${name}\\b[^=]*=\\s*`).exec(source);
  if (!decl) return null;
  let i = decl.index + decl[0].length;
  if (source[i] !== '{') return null;
  let depth = 0;
  let quote: string | null = null;
  for (let j = i; j < source.length; j += 1) {
    const ch = source[j] as string;
    if (quote) {
      if (ch === '\\') {
        j += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(i + 1, j);
    }
  }
  return null;
}

/** Split an object-literal body on its top-level commas. */
function splitTopLevel(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = '';
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i] as string;
    if (quote) {
      cur += ch;
      if (ch === '\\') {
        cur += body[i + 1] ?? '';
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') depth += 1;
    else if (ch === '}' || ch === ']' || ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

/** `key -> raw value text`, in source order. */
function objectEntries(body: string | null): Array<[string, string]> {
  if (!body) return [];
  const out: Array<[string, string]> = [];
  for (const part of splitTopLevel(body)) {
    const m = /^\s*['"]?([A-Za-z_$][A-Za-z0-9_$-]*|\d+)['"]?\s*:\s*([\s\S]*)$/.exec(part);
    if (!m || !m[1]) continue;
    out.push([m[1], (m[2] ?? '').trim()]);
  }
  return out;
}

function stringLiteral(raw: string): string | null {
  const m = /^['"`]([\s\S]*)['"`]$/.exec(raw.trim());
  return m ? (m[1] ?? '') : null;
}

/** Parse `Record<K, string>` — e.g. `sizeClass`. */
export function parseStringMap(src: string, name: string): Array<[string, string]> {
  return objectEntries(objectLiteralBody(src, name))
    .map(([key, raw]) => [key, stringLiteral(raw)] as const)
    .filter((pair): pair is readonly [string, string] => pair[1] !== null)
    .map(([key, value]) => [key, value] as [string, string]);
}

/** Parse `Record<K, Record<string, string>>` — e.g. `tone`, `toneMap`, `SURFACE_TOKENS`. */
export function parseNestedMap(
  src: string,
  name: string,
): { keys: string[]; fields: string[]; values: Map<string, Map<string, string>> } {
  const entries = objectEntries(objectLiteralBody(src, name));
  const keys: string[] = [];
  const fields: string[] = [];
  const values = new Map<string, Map<string, string>>();
  for (const [key, raw] of entries) {
    if (!raw.startsWith('{')) continue;
    const inner = new Map<string, string>();
    const innerBody = raw.slice(1, raw.lastIndexOf('}'));
    for (const [field, fieldRaw] of objectEntries(innerBody)) {
      const value = stringLiteral(fieldRaw);
      if (value === null) continue;
      inner.set(field, value);
      if (!fields.includes(field)) fields.push(field);
    }
    keys.push(key);
    values.set(key, inner);
  }
  return { keys, fields, values };
}

// ---------------------------------------------------------------------------
// Markdown helpers
// ---------------------------------------------------------------------------

function code(value: string | null | undefined): string {
  return value ? `\`${value.replace(/\|/g, '\\|')}\`` : '—';
}

function joinCode(items: string[]): string {
  return items.length ? items.map((i) => `\`${i}\``).join(', ') : '—';
}

function table(header: string[], rows: string[][]): string {
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function paletteSection(rows: CssVarRow[]): string {
  if (rows.length === 0) {
    return [
      '## Palette variables',
      '',
      'No `--retro-*` declarations could be parsed from `styles.css`.',
    ].join('\n');
  }
  const body = table(
    ['Variable', 'Light (`:root, :host`)', 'Dark (`.dark`)', 'Tailwind namespace'],
    rows.map((r) => [code(r.name), code(r.light), code(r.dark), code(r.utility)]),
  );
  return [
    '## Palette variables',
    '',
    `Parsed from \`packages/ui-kit/styles.css\` — ${rows.length} variable(s). Light is the`,
    '`:root, :host` block (a variable declared only in the explicit `.light` block is',
    'shown from there); dark is the `.dark` class block. Dark mode is a **class on',
    '`<html>`**, never a media query.',
    '',
    body,
    '',
    'Only variables with a Tailwind namespace can be used as utilities (`bg-…`,',
    '`text-…`, `border-…`, `ring-…`). The rest — notably the `--retro-shadow-*`',
    'trio — are consumed inside other custom properties and are **not** utility',
    'classes: `bg-retro-shadow-green` does not exist and silently renders nothing.',
  ].join('\n');
}

function toneSection(tokensTs: string, commonTsx: string): string {
  const surfaces = parseNestedMap(tokensTs, 'tone');
  const controls = parseNestedMap(commonTsx, 'toneMap');

  const lines: string[] = [
    '## The two tone scales',
    '',
    '**The two tone scales are NOT interchangeable.** The kit ships two',
    '`Record<Tone, …>` maps with overlapping field names. They type-check against',
    'each other, so a mix-up produces no error — only wrong pixels.',
    '',
    `- \`toneMap\` — from \`packages/ui-kit/src/common.tsx\` — **CONTROLS** (button, input, badge, chip, toast) — keys: ${joinCode(controls.keys)}`,
    `- \`tone\` — from \`packages/ui-kit/src/tokens.ts\` — **SURFACES** (card, hero, bento, charts, sidebar) — keys: ${joinCode(surfaces.keys)}`,
    '',
    'Which one to reach for:',
    '',
    '- Building or restyling a **control** — anything control-scale with a border',
    '  that must stay legible at body-text size: import `toneMap` from `common.tsx`.',
    '  Its borders are `border-*/40` and it carries a `hover` tier because controls',
    '  are interactive.',
    '- Building or restyling a **surface** — a card, section, hero, bento cell,',
    '  chart panel: import `tone` from `tokens.ts`. Its borders are the softer',
    '  `border-*/30` (a large area with a 40 %% border reads heavy) and it carries a',
    '  `glow` shadow tier instead of `hover`, because surfaces are not interactive',
    '  by default.',
    '',
    'The divergence is a rendered design decision, not drift. Do **not** "sync" the',
    'two maps: aligning them changes shipped pixels for one of the two component',
    'families. See the decision comment on `tone` in `tokens.ts`.',
  ];

  if (controls.keys.length && controls.fields.length) {
    lines.push(
      '',
      '### `toneMap` — control scale (`common.tsx`)',
      '',
      table(
        ['Tone', ...controls.fields.map((f) => `\`${f}\``)],
        controls.keys.map((k) => [
          code(k),
          ...controls.fields.map((f) => code(controls.values.get(k)?.get(f) ?? null)),
        ]),
      ),
    );
  }

  if (surfaces.keys.length && surfaces.fields.length) {
    lines.push(
      '',
      '### `tone` — surface scale (`tokens.ts`)',
      '',
      table(
        ['Tone', ...surfaces.fields.map((f) => `\`${f}\``)],
        surfaces.keys.map((k) => [
          code(k),
          ...surfaces.fields.map((f) => code(surfaces.values.get(k)?.get(f) ?? null)),
        ]),
      ),
    );
  }

  return lines.join('\n').replace('40 %%', '40 %');
}

function surfaceSection(commonTsx: string): string {
  const parsed = parseNestedMap(commonTsx, 'SURFACE_TOKENS');
  const intro = [
    '## `surfaceClasses(surface)` — `pixel` vs `linear`',
    '',
    '`surfaceClasses(surface: Surface = "pixel"): SurfaceClasses` (exported from',
    '`common.tsx`) resolves the aesthetic bundle every component composes. The',
    'active surface comes from the nearest `PxlKitSurfaceProvider`; a component`s',
    '`surface` prop overrides it for that instance only.',
    '',
  ].join('\n');

  if (!parsed.keys.length || !parsed.fields.length) {
    return `${intro}Could not parse \`SURFACE_TOKENS\` from \`common.tsx\`.`;
  }

  const pixel = parsed.values.get('pixel');
  const linear = parsed.values.get('linear');
  const body = table(
    ['Field', '`pixel`', '`linear`'],
    parsed.fields.map((f) => [code(f), code(pixel?.get(f) ?? null), code(linear?.get(f) ?? null)]),
  );

  return [
    intro + body,
    '',
    'Never hard-code a radius, border width or shadow on a kit component: read it',
    'from `surfaceClasses()` so the component follows the provider. The `pxl-*`',
    'classes are real utilities defined in `styles.css` (`clip-path` staircase',
    'corners plus `filter: drop-shadow`, so the shadow follows the cut silhouette).',
  ].join('\n');
}

function sizeSection(commonTsx: string): string {
  const sizeClass = new Map(parseStringMap(commonTsx, 'sizeClass'));
  const sizeHeight = new Map(parseStringMap(commonTsx, 'sizeHeight'));
  const sizeSquare = new Map(parseStringMap(commonTsx, 'sizeSquare'));

  const keys: string[] = [];
  for (const map of [sizeClass, sizeHeight, sizeSquare]) {
    for (const key of map.keys()) if (!keys.includes(key)) keys.push(key);
  }

  const intro = [
    '## Size scales',
    '',
    'Three `Record<Size, string>` maps in `common.tsx`. `Size` is `"sm" | "md" |',
    '"lg"`; `md` is every component`s default.',
    '',
    '- `sizeClass` — height + horizontal padding + text size + gap, for controls',
    '  that own their padding (`PixelButton`, `PixelInput`, `PixelSelect`).',
    '- `sizeHeight` — height + text size only, for shells that lay out their own',
    '  interior (input shells, sliders, switches).',
    '- `sizeSquare` — square geometry for icon buttons, avatars and swatches.',
    '',
  ].join('\n');

  if (!keys.length) return `${intro}Could not parse the size maps from \`common.tsx\`.`;

  const body = table(
    ['Size', '`sizeClass`', '`sizeHeight`', '`sizeSquare`'],
    keys.map((k) => [
      code(k),
      code(sizeClass.get(k) ?? null),
      code(sizeHeight.get(k) ?? null),
      code(sizeSquare.get(k) ?? null),
    ]),
  );

  return [
    intro + body,
    '',
    'Heights are shared across the three maps at the same step, so a button, an',
    'input shell and an icon button on the same form row align on the baseline.',
    'Mixing steps (an `lg` button next to an `md` input) is the usual cause of a',
    'ragged row.',
  ].join('\n');
}

/**
 * Re-skin recipe.
 *
 * Authored prose, but every fact is checkable against `styles.css`: the
 * `@theme` block registers `--color-retro-*` from `var(--retro-*)`, and the
 * `--shadow-pixel*` entries hard-wire the green and gold shadow variables.
 */
const RESKIN = `\
## Re-skin recipe

Override the \`--retro-*\` variables **after** importing the stylesheet. One
change propagates to every component and utility, because nothing in the kit
hard-codes a hex value.

The example below re-skins three variables so the pattern is visible end to end.
Repeat the same three-selector treatment for **every** variable you change.

\`\`\`css
@import "@pxlkit/ui-kit/styles.css";

/* Light theme — the default. */
:root, :host {
  --retro-surface: #F0EFED;
  --retro-text: #1C1917;
  --retro-green: #16A34A;
  --retro-shadow-green: rgba(22, 163, 74, 0.3);
  --retro-shadow-green-lg: rgba(22, 163, 74, 0.2);
}

/* Dark theme — a class on <html>, not a media query. */
.dark {
  --retro-surface: #1C1917;
  --retro-text: #FAFAF9;
  --retro-green: #4ADE80;
  --retro-shadow-green: rgba(74, 222, 128, 0.3);
  --retro-shadow-green-lg: rgba(74, 222, 128, 0.2);

  /* Re-declare the Tailwind mirrors — see gotcha 1. */
  --color-retro-surface: #1C1917;
  --color-retro-text: #FAFAF9;
  --color-retro-green: #4ADE80;
}

/* Explicit light — only needed for a light preview nested inside .dark. */
.light {
  --retro-surface: #F0EFED;
  --retro-text: #1C1917;
  --retro-green: #16A34A;

  --color-retro-surface: #F0EFED;
  --color-retro-text: #1C1917;
  --color-retro-green: #16A34A;
}
\`\`\`

### Gotcha 1 — \`@property\` forces re-declaration in \`.dark\` / \`.light\`

Tailwind v4's \`@theme\` registers every \`--color-retro-*\` mirror with
\`@property\`, \`syntax: "<color>"\`, \`inherits: true\`. A registered property is
**computed at the element that declares it**, so \`--color-retro-<name>:
var(--retro-<name>)\` resolves to a concrete colour on \`:root\` and children
inherit *that computed colour*, not the \`var()\` expression.

Consequence: redefining only \`--retro-<name>\` inside \`.dark\` or \`.light\` changes
raw \`var(--retro-<name>)\` consumers but leaves every Tailwind utility
(\`bg-retro-*\`, \`text-retro-*\`, \`border-retro-*\`) showing the \`:root\` colour.
This is why the shipped \`.dark\` and \`.light\` blocks each carry a full second
copy of the \`--color-retro-*\` mirrors. If you add a theme boundary of your own
(a \`.theme-brand\` class, a nested preview), you must mirror both sets there too.

Redefining on \`:root\` alone is enough **only** when you are not changing the
value per theme.

### Gotcha 2 — the pixel shadows are wired to green and gold

The \`@theme\` block hard-wires three shadow utilities to specific palette
variables:

| Utility | Reads |
| --- | --- |
| \`shadow-pixel\` | \`--retro-shadow-green\` |
| \`shadow-pixel-lg\` | \`--retro-shadow-green-lg\` |
| \`shadow-pixel-gold\` | \`--retro-shadow-gold\` |

They are **not** derived from \`--retro-green\` / \`--retro-gold\`: the shadow
variables carry their own rgba with baked-in alpha. Change the green or the gold
hue and the offset shadows keep the old tint until you update
\`--retro-shadow-green\`, \`--retro-shadow-green-lg\` and \`--retro-shadow-gold\` by
hand, in **every** selector where you set the hue. There is no green-tinted
shadow for the other tones — cyan, red, purple and pink surfaces reuse the green
shadow or the neutral \`.pxl-shadow\` (a flat \`rgba(0, 0, 0, 0.25)\` drop-shadow
that ignores the palette entirely).

### Checklist

1. Import the stylesheet first; your overrides must come after it.
2. Set every variable you change in \`:root, :host\` **and** \`.dark\` — a variable
   set in one theme only inherits the other theme's value.
3. Mirror \`--color-retro-*\` in \`.dark\` / \`.light\` (gotcha 1).
4. Update the three \`--retro-shadow-*\` variables whenever green or gold moves
   (gotcha 2).
5. Do not restyle by patching component classes — a component that stops reading
   \`surfaceClasses()\` and \`tone\` / \`toneMap\` drops out of the theme system.`;

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Render the tokens & theming reference as markdown.
 *
 * Degrades to prose-only sections when a source cannot be parsed — a missing
 * table is recoverable, an exception here would take down the whole docs build.
 *
 * @param sources Raw `tokens.ts`, `common.tsx` and `styles.css` contents.
 * @param version The `@pxlkit/ui-kit` version stamped in the header.
 */
export function renderTokensReference(sources: TokenSources, version: string): string {
  const header = `<!-- GENERATED from @pxlkit/ui-kit v${version} — do not edit; run npm run docs:build -->`;
  const tokensTs = sources?.tokensTs ?? '';
  const commonTsx = sources?.commonTsx ?? '';
  const stylesCss = sources?.stylesCss ?? '';

  const intro = [
    '# Tokens & theming',
    '',
    `Design tokens of \`@pxlkit/ui-kit\` v${version}, parsed from the shipped sources.`,
    '',
    'Read "The two tone scales" before writing any component code: `tone` and',
    '`toneMap` are the one pair in this kit that can be confused without a type',
    'error.',
  ].join('\n');

  return (
    [
      header,
      intro,
      paletteSection(parseCssVars(stylesCss)),
      toneSection(tokensTs, commonTsx),
      surfaceSection(commonTsx),
      sizeSection(commonTsx),
      RESKIN,
    ].join('\n\n') + '\n'
  );
}

export default renderTokensReference;
