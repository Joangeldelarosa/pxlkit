/**
 * Canonical DOM serialisation for cross-framework parity tests.
 *
 * Two renderings are considered identical when they produce the same element
 * tree with the same attributes, where:
 * - `class` is compared as a sorted set of class names (empty lists dropped);
 * - `style` is compared declaration by declaration, as parsed by the DOM;
 * - attribute order, comments and whitespace-only text are irrelevant;
 * - framework bookkeeping attributes (`_ngcontent-*`, `_nghost-*`,
 *   `ng-reflect-*`, `ng-version`, `ngh`, `ng-server-context`) are ignored;
 * - an Angular component host takes the place of the root element the React
 *   component renders, so its tag is read as that element's tag.
 */

const FRAMEWORK_ATTRIBUTE = /^(_ngcontent-|_nghost-|ng-reflect-|ng-version$|ngh$|ng-server-context$)/;

/** Root element React renders for each component whose host is its root. */
const HOST_TAGS: Readonly<Record<string, string>> = {
  'pxl-animated-icon': 'div',
  'pxl-parallax-icon': 'div',
  'pxl-toast': 'div',
};

function canonicalStyle(element: Element): string {
  const style = (element as HTMLElement).style;
  const declarations: string[] = [];
  for (let i = 0; i < style.length; i++) {
    const property = style[i]!;
    declarations.push(`${property}: ${style.getPropertyValue(property)}`);
  }
  return declarations.sort().join('; ');
}

function canonicalNode(node: Node): unknown {
  if (node.nodeType === 3 /* TEXT_NODE */) {
    const text = node.textContent?.trim() ?? '';
    return text === '' ? null : text;
  }
  if (node.nodeType !== 1 /* ELEMENT_NODE */) return null;

  const element = node as Element;
  const attributes: Array<[string, string]> = [];
  for (const { name, value } of Array.from(element.attributes)) {
    if (FRAMEWORK_ATTRIBUTE.test(name)) continue;
    if (name === 'class') {
      const classes = value.split(/\s+/).filter(Boolean).sort().join(' ');
      if (classes) attributes.push(['class', classes]);
    } else if (name === 'style') {
      const style = canonicalStyle(element);
      if (style) attributes.push(['style', style]);
    } else {
      attributes.push([name, value]);
    }
  }
  attributes.sort(([a], [b]) => a.localeCompare(b));

  const children = Array.from(element.childNodes)
    .map(canonicalNode)
    .filter((child) => child !== null);

  const tag = element.tagName.toLowerCase();
  return { tag: HOST_TAGS[tag] ?? tag, attributes, children };
}

/** Canonical form of every top-level node in `root`. */
export function canonicalDom(root: Element | DocumentFragment): string {
  return JSON.stringify(
    Array.from(root.childNodes)
      .map(canonicalNode)
      .filter((node) => node !== null),
    null,
    1,
  );
}

/** Canonical form of an HTML string, parsed with `document` (e.g. server-rendered markup). */
export function canonicalHtml(html: string, document: Document = globalThis.document): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  return canonicalDom(template.content);
}
