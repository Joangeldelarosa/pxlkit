/**
 * How an Angular rendering maps onto the React reference DOM.
 */
import type { CanonicalOptions } from '../../../../scripts/parity/canonical';
import * as kit from '../public-api';

/**
 * Element hosts of the Angular components → the root element the React
 * component renders in their place (one map per category, in ./hosts).
 * Attribute-selector components (`button[pxlButton]`) are their own root and
 * need no entry.
 */
export const HOST_TAGS: Readonly<Record<string, string | null>> = Object.assign(
  {},
  ...Object.values(
    import.meta.glob<{ HOST_TAGS: Record<string, string | null> }>('./hosts/*.ts', { eager: true }),
  ).map((module) => module.HOST_TAGS),
);

/**
 * Attributes with an effect of their own. When one also feeds an input it is
 * still compared, so leaving it on a host fails parity: a static `title`
 * shows a native tooltip, `align="center"` on a `<div>` still centres its
 * content (legacy presentational attribute), a duplicated `id` breaks label
 * and ARIA references.
 */
const GLOBAL_MEANINGFUL = new Set([
  'accesskey', 'autocapitalize', 'autofocus', 'class', 'contenteditable', 'dir', 'draggable', 'enterkeyhint',
  'hidden', 'id', 'inert', 'inputmode', 'is', 'lang', 'nonce', 'popover', 'role', 'slot', 'spellcheck', 'style',
  'tabindex', 'title', 'translate',
]);

/** Element-specific attributes with an effect (including legacy presentational ones). */
const ELEMENT_MEANINGFUL: Readonly<Record<string, readonly string[]>> = {
  a: ['href', 'target', 'rel', 'download', 'hreflang', 'ping', 'referrerpolicy', 'type', 'name'],
  button: ['disabled', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'name', 'type', 'value', 'popovertarget'],
  input: [
    'accept', 'alt', 'autocomplete', 'checked', 'dirname', 'disabled', 'form', 'height', 'list', 'max', 'maxlength',
    'min', 'minlength', 'multiple', 'name', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'src', 'step',
    'type', 'value', 'width',
  ],
  textarea: ['autocomplete', 'cols', 'dirname', 'disabled', 'form', 'maxlength', 'minlength', 'name', 'placeholder', 'readonly', 'required', 'rows', 'wrap'],
  select: ['autocomplete', 'disabled', 'form', 'multiple', 'name', 'required', 'size'],
  option: ['disabled', 'label', 'selected', 'value'],
  optgroup: ['disabled', 'label'],
  label: ['for', 'form'],
  fieldset: ['disabled', 'form', 'name'],
  form: ['action', 'autocomplete', 'enctype', 'method', 'name', 'novalidate', 'target'],
  img: ['alt', 'src', 'srcset', 'sizes', 'width', 'height', 'loading', 'decoding', 'align', 'border'],
  details: ['open', 'name'],
  dialog: ['open'],
  ol: ['start', 'reversed', 'type'],
  li: ['value', 'type'],
  table: ['align', 'border', 'bgcolor', 'cellpadding', 'cellspacing', 'width', 'frame', 'rules'],
  td: ['colspan', 'rowspan', 'headers', 'align', 'valign', 'width', 'height', 'nowrap', 'bgcolor'],
  th: ['colspan', 'rowspan', 'headers', 'scope', 'abbr', 'align', 'valign', 'width', 'height', 'nowrap', 'bgcolor'],
  tr: ['align', 'valign', 'bgcolor'],
  hr: ['align', 'size', 'width', 'noshade', 'color'],
  progress: ['max', 'value'],
  meter: ['min', 'max', 'low', 'high', 'optimum', 'value'],
  svg: ['width', 'height', 'viewbox'],
  canvas: ['width', 'height'],
  video: ['src', 'width', 'height', 'controls', 'autoplay', 'loop', 'muted', 'poster'],
  iframe: ['src', 'width', 'height', 'name', 'allow', 'loading'],
};

/** Block elements that still honour the legacy `align` attribute. */
const LEGACY_ALIGN = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'header', 'footer', 'article', 'aside', 'nav', 'main', 'caption', 'legend'];

// Attribute names are compared lower-cased: SVG elements keep the case they
// were written in (`viewBox`, `pxlGlyph`), HTML elements lower-case them.

function meaningful(element: Element, attribute: string): boolean {
  const name = attribute.toLowerCase();
  if (name.startsWith('aria-') || name.startsWith('data-') || GLOBAL_MEANINGFUL.has(name)) return true;
  const tag = element.tagName.toLowerCase();
  if (name === 'align' && LEGACY_ALIGN.includes(tag)) return true;
  return ELEMENT_MEANINGFUL[tag]?.includes(name) ?? false;
}

function hasAttribute(element: Element, name: string): boolean {
  return Array.from(element.attributes).some((attribute) => attribute.name.toLowerCase() === name);
}

interface DefinitionLike {
  inputs?: Record<string, unknown>;
  /** `[tag, attribute, value, attribute, value, …]` per selector; `''` matches any tag. */
  selectors?: unknown[][];
}

interface KitDirective {
  selectors: Array<{ tag: string; attributes: string[] }>;
  /** Lower-cased input and selector-attribute names. */
  names: Set<string>;
}

/**
 * Internal directives the kit's own templates put on elements (every export
 * of an `_internal` folder) — not exported from the package, but their
 * selector and input attributes land in the DOM all the same.
 */
const INTERNAL_DIRECTIVES: unknown[] = Object.values(
  import.meta.glob<Record<string, unknown>>(['../lib/_internal/*.ts', '../lib/*/_internal/*.ts'], { eager: true }),
).flatMap((module) => Object.values(module));

/** Every component and directive the kit renders, with its selectors and inputs. */
const directives: KitDirective[] = [...Object.values(kit), ...INTERNAL_DIRECTIVES].flatMap((value) => {
  if (typeof value !== 'function') return [];
  const type = value as { ɵcmp?: DefinitionLike; ɵdir?: DefinitionLike };
  let definition: DefinitionLike | undefined;
  try {
    // Reading the definition JIT-compiles the class. A component whose
    // template does not compile fails its own tests, not everyone's.
    definition = type.ɵcmp ?? type.ɵdir;
  } catch {
    return [];
  }
  if (!definition?.selectors) return [];
  const selectors = definition.selectors
    // Plain `tag[attr]` selectors only — the kit uses no class or :not() selectors.
    .filter((selector) => selector.every((part) => typeof part === 'string'))
    .map((selector) => ({
      tag: (selector[0] as string).toLowerCase(),
      attributes: selector.filter((_, i) => i % 2 === 1).map((name) => (name as string).toLowerCase()),
    }));
  const names = new Set([
    ...Object.keys(definition.inputs ?? {}).map((name) => name.toLowerCase()),
    ...selectors.flatMap((selector) => selector.attributes),
  ]);
  return [{ selectors, names }];
});

/** Names bound by the kit's directives that match an element (live or parsed DOM). */
function boundNames(element: Element): Set<string> {
  const tag = element.tagName.toLowerCase();
  const names = new Set<string>();
  for (const directive of directives) {
    const matches = directive.selectors.some(
      (selector) =>
        (selector.tag === '' || selector.tag === tag) && selector.attributes.every((name) => hasAttribute(element, name)),
    );
    if (matches) for (const name of directive.names) names.add(name);
  }
  return names;
}

const cache = new WeakMap<Element, Set<string>>();

/** Leaves out the static attributes Angular keeps for inputs and selectors. */
export function ignoreAttribute(element: Element, name: string): boolean {
  if (meaningful(element, name)) return false;
  let names = cache.get(element);
  if (!names) {
    names = boundNames(element);
    cache.set(element, names);
  }
  return names.has(name.toLowerCase());
}

/** The layout of a `<pxl-icon>` box, which React's PxlKitIcon sets on its `<img>`. */
const ICON_BOX_LAYOUT = ['display', 'vertical-align', 'flex-shrink'];

/**
 * `@pxlkit/angular`'s `<pxl-icon>` draws a box around the `<img>` React's
 * PxlKitIcon renders bare, the one structural difference between the icon
 * packages (their own parity suite compares box by box): read the box as
 * that image. The image keeps its attributes and its `image-rendering`, and
 * takes the box's layout and the box's own meaningful attributes; the box's
 * size is the image's `width` and `height`, and is kept only where it is not.
 */
export function substitute(element: Element): Element | undefined {
  if (element.tagName.toLowerCase() !== 'pxl-icon' || element.children.length !== 1) return undefined;
  const box = element as HTMLElement;
  const image = box.firstElementChild as HTMLElement;
  if (image.tagName.toLowerCase() !== 'img') return undefined;
  const bare = image.cloneNode() as HTMLElement;
  bare.removeAttribute('style');
  for (const { name, value } of Array.from(box.attributes)) {
    if (name !== 'style' && meaningful(box, name)) bare.setAttribute(name, value);
  }
  for (const property of ICON_BOX_LAYOUT) bare.style.setProperty(property, box.style.getPropertyValue(property));
  bare.style.setProperty('image-rendering', image.style.getPropertyValue('image-rendering'));
  for (const side of ['width', 'height'] as const) {
    if (box.style[side] !== `${image.getAttribute(side)}px`) bare.style[side] = box.style[side];
  }
  return bare;
}

export const angularDomRules: CanonicalOptions = { hostTags: HOST_TAGS, ignoreAttribute, substitute };
