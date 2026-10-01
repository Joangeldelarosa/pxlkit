/**
 * Canonical DOM serialisation for the cross-framework parity suites.
 *
 * The React kit is the reference implementation; the Vue and Angular kits
 * must render the same DOM for every example and after every scripted
 * interaction. Two renderings are identical when their canonical forms are
 * equal, where:
 *
 * - `class` is a sorted set of class names (an empty list is dropped);
 * - `style` is compared declaration by declaration, as parsed by the DOM;
 * - attribute order, comments and whitespace-only text are irrelevant, and
 *   text is compared with its whitespace collapsed and trimmed;
 * - form controls are compared by state (`value`, `checked`, `selected`,
 *   `indeterminate`), not by the attributes that may or may not mirror it;
 * - framework bookkeeping attributes (`data-v-*`, `_ngcontent-*`,
 *   `_nghost-*`, `ng-reflect-*`, `ng-version`, `ngh`, `ng-server-context`)
 *   are ignored;
 * - generated ids (React and Vue `useId`, the Angular kit's id generator)
 *   are replaced by their order of first appearance, in `id` and in every
 *   attribute that references ids (`for`, `aria-labelledby`, `#id` URLs, …);
 * - an Angular component host stands in for the root element the React
 *   component renders: `hostTags` maps its tag to that element's tag, and a
 *   `role` equal to that element's implicit role is dropped;
 * - the focused element carries a `:focus` marker, so focus management is
 *   compared too;
 * - `canonicalPage` adds the inline styles of `<html>` and `<body>`, so page
 *   effects such as a scroll lock are compared too.
 */

export interface CanonicalOptions {
  /**
   * Angular host tag → tag of the root element the React component renders,
   * or `null` for a component whose React render is a fragment: its host is
   * then serialised as its children — as long as it carries no attribute of
   * its own beyond `display: contents`.
   */
  hostTags?: Readonly<Record<string, string | null>>;
  /** Elements whose children are serialised in their place (mount containers). */
  unwrap?: (element: Element) => boolean;
  /**
   * Attributes to leave out — Angular keeps the static attributes that set a
   * component's inputs (`tone="cyan"`) and its selector (`pxlButton`) in the
   * DOM, where React and Vue consume props.
   */
  ignoreAttribute?: (element: Element, name: string) => boolean;
}

const FRAMEWORK_ATTRIBUTE = /^(data-v-|_ngcontent-|_nghost-|ng-reflect-|ng-version$|ngh$|ng-server-context$)/;

/** Attributes whose value is a (space-separated list of) element id(s). */
const ID_ATTRIBUTES = [
  'id',
  'for',
  'form',
  'list',
  'headers',
  'popovertarget',
  'aria-activedescendant',
  'aria-controls',
  'aria-describedby',
  'aria-details',
  'aria-errormessage',
  'aria-flowto',
  'aria-labelledby',
  'aria-owns',
] as const;
const ID_ATTRIBUTE_SET: ReadonlySet<string> = new Set(ID_ATTRIBUTES);

/** Implicit ARIA role of the elements an Angular host may stand in for. */
const IMPLICIT_ROLES: Readonly<Record<string, string>> = {
  article: 'article',
  aside: 'complementary',
  dialog: 'dialog',
  fieldset: 'group',
  footer: 'contentinfo',
  form: 'form',
  header: 'banner',
  hr: 'separator',
  li: 'listitem',
  main: 'main',
  nav: 'navigation',
  ol: 'list',
  section: 'region',
  table: 'table',
  ul: 'list',
};

/**
 * Vendor aliases browsers map onto the standard property. Vue writes `filter`
 * through `-webkit-filter` (see `autoPrefix` in @vue/runtime-dom); jsdom keeps
 * them apart, so they are folded back here.
 */
const PROPERTY_ALIASES: Readonly<Record<string, string>> = { '-webkit-filter': 'filter' };

const FORM_STATE_ATTRIBUTES: Readonly<Record<string, readonly string[]>> = {
  input: ['value', 'checked'],
  textarea: ['value'],
  select: ['value'],
  option: ['selected'],
};

type CanonicalNode =
  | string
  | { tag: string; attributes: Array<[string, string]>; state?: Record<string, string | boolean>; children: CanonicalNode[] };

interface Context {
  ids: Map<string, string>;
  options: CanonicalOptions;
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

function* elementsOf(root: Node): Generator<Element> {
  for (const child of Array.from(root.childNodes)) {
    if (!isElement(child)) continue;
    yield child;
    yield* elementsOf(child);
    if (child.tagName.toLowerCase() === 'template') yield* elementsOf((child as HTMLTemplateElement).content);
  }
}

/** Every id and id reference, numbered in document order of first appearance. */
function collectIds(roots: Node[], options: CanonicalOptions): Map<string, string> {
  const ids = new Map<string, string>();
  for (const root of roots) {
    for (const element of elementsOf(root)) {
      // An unwrapped element is not serialised, so neither are its ids.
      if (options.unwrap?.(element)) continue;
      for (const name of ID_ATTRIBUTES) {
        if (options.ignoreAttribute?.(element, name)) continue;
        const value = element.getAttribute(name);
        if (!value) continue;
        for (const token of value.split(/\s+/).filter(Boolean)) {
          if (!ids.has(token)) ids.set(token, `#id${ids.size}`);
        }
      }
    }
  }
  return ids;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Replace `#<id>` references (URLs, fragments) inside a free-form value. */
function replaceFragmentIds(value: string, ids: Map<string, string>): string {
  if (!value.includes('#') || ids.size === 0) return value;
  let out = value;
  const known = [...ids.keys()].sort((a, b) => b.length - a.length);
  for (const id of known) {
    out = out.replace(new RegExp(`#${escapeRegExp(id)}(?![\\w-])`, 'g'), ids.get(id)!);
  }
  return out;
}

function canonicalStyle(element: Element): string {
  const style = (element as HTMLElement).style;
  const declarations: string[] = [];
  for (let i = 0; i < style.length; i++) {
    const property = style[i]!;
    const name = PROPERTY_ALIASES[property] ?? property;
    const priority = style.getPropertyPriority(property);
    declarations.push(`${name}: ${style.getPropertyValue(property)}${priority ? ` !${priority}` : ''}`);
  }
  return [...new Set(declarations)].sort().join('; ');
}

function formState(element: Element, tag: string): Record<string, string | boolean> | undefined {
  switch (tag) {
    case 'input': {
      const input = element as HTMLInputElement;
      const type = (input.getAttribute('type') ?? 'text').toLowerCase();
      if (type === 'checkbox' || type === 'radio') {
        return { checked: input.checked, indeterminate: input.indeterminate, value: input.value };
      }
      if (type === 'file') return {};
      return { value: input.value };
    }
    case 'textarea':
      return { value: (element as HTMLTextAreaElement).value };
    case 'select':
      return { value: (element as HTMLSelectElement).value };
    case 'option':
      return { selected: (element as HTMLOptionElement).selected };
    default:
      return undefined;
  }
}

function canonicalChildren(parent: Node, ctx: Context): CanonicalNode[] {
  const out: CanonicalNode[] = [];
  let text = '';
  const flushText = () => {
    const collapsed = text.replace(/\s+/g, ' ').trim();
    if (collapsed) out.push(collapsed);
    text = '';
  };
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === 3) {
      text += child.textContent ?? '';
      continue;
    }
    if (!isElement(child)) continue;
    if (ctx.options.unwrap?.(child) || isBareFragmentHost(child, ctx)) {
      // The children of an unwrapped element continue the parent's flow.
      flushText();
      out.push(...canonicalChildren(child, ctx));
      continue;
    }
    flushText();
    out.push(canonicalElement(child, ctx));
  }
  flushText();
  return out;
}

/**
 * A fragment host (`hostTags` → `null`) with nothing on it but bookkeeping,
 * input attributes and `display: contents`. One that still carries a real
 * attribute is serialised as `#host:<tag>`, which matches nothing React
 * renders — the attribute leaked onto the host.
 */
function isBareFragmentHost(element: Element, ctx: Context): boolean {
  const tag = element.tagName.toLowerCase();
  if (ctx.options.hostTags?.[tag] !== null) return false;
  return Array.from(element.attributes).every(({ name }) => {
    if (FRAMEWORK_ATTRIBUTE.test(name) || ctx.options.ignoreAttribute?.(element, name)) return true;
    if (name !== 'style') return false;
    const style = (element as HTMLElement).style;
    return style.length === 1 && style.display === 'contents';
  });
}

function canonicalElement(element: Element, ctx: Context): CanonicalNode {
  const ownTag = element.tagName.toLowerCase();
  const mapped = ctx.options.hostTags?.[ownTag];
  const hostTag = mapped ?? undefined;
  const tag = mapped === null ? `#host:${ownTag}` : (hostTag ?? ownTag);
  const stateAttributes = FORM_STATE_ATTRIBUTES[tag] ?? [];

  const attributes: Array<[string, string]> = [];
  for (const { name, value } of Array.from(element.attributes)) {
    if (FRAMEWORK_ATTRIBUTE.test(name)) continue;
    if (stateAttributes.includes(name)) continue;
    if (ctx.options.ignoreAttribute?.(element, name)) continue;
    if (name === 'class') {
      const classes = [...new Set(value.split(/\s+/).filter(Boolean))].sort().join(' ');
      if (classes) attributes.push(['class', classes]);
    } else if (name === 'style') {
      const style = canonicalStyle(element);
      if (style) attributes.push(['style', style]);
    } else if (name === 'role' && hostTag && IMPLICIT_ROLES[hostTag] === value) {
      continue;
    } else if (ID_ATTRIBUTE_SET.has(name)) {
      const tokens = value.split(/\s+/).filter(Boolean).map((token) => ctx.ids.get(token) ?? token);
      attributes.push([name, tokens.join(' ')]);
    } else {
      attributes.push([name, replaceFragmentIds(value, ctx.ids)]);
    }
  }
  const doc = element.ownerDocument;
  if (doc && element === doc.activeElement && element !== doc.body) attributes.push([':focus', '']);
  attributes.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  const state = formState(element, tag);
  // A textarea's text children only seed its value, which `state` captures.
  const children =
    tag === 'textarea'
      ? []
      : canonicalChildren(tag === 'template' ? (element as HTMLTemplateElement).content : element, ctx);
  return state ? { tag, attributes, state, children } : { tag, attributes, children };
}

/** Canonical form of the child nodes of every root, in order. */
export function canonicalDom(roots: Node | Node[], options: CanonicalOptions = {}): string {
  const list = Array.isArray(roots) ? roots : [roots];
  const ctx: Context = { ids: collectIds(list, options), options };
  const nodes = list.flatMap((root) => canonicalChildren(root, ctx));
  return JSON.stringify(nodes, null, 1);
}

/**
 * Canonical form of the whole page around mounted examples: the inline styles
 * `<html>` and `<body>` carry (a modal's scroll lock sets them), then the
 * body's content.
 */
export function canonicalPage(doc: Document, options: CanonicalOptions = {}): string {
  const page = {
    html: canonicalStyle(doc.documentElement),
    body: canonicalStyle(doc.body),
    content: JSON.parse(canonicalDom(doc.body, options)) as CanonicalNode[],
  };
  return JSON.stringify(page, null, 1);
}

/** Canonical form of an HTML fragment (e.g. server-rendered markup). */
export function canonicalHtml(html: string, options: CanonicalOptions = {}, doc: Document = globalThis.document): string {
  const template = doc.createElement('template');
  template.innerHTML = html;
  return canonicalDom(template.content, options);
}
