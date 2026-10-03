/**
 * The focus audit's side in the page, bundled with every example of the React
 * kit's manifests (see `page.ts`). It mounts an example on a surface, finds
 * its focusable elements and gives one of them keyboard focus, then reports
 * the elements whose computed style changed — the focus indicator may be
 * drawn on the element, an ancestor (`has-*`), a sibling (`peer-*`) or a
 * descendant (`group-*`) — and the clipping around them.
 */
import { createElement, type ComponentType, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

export type Surface = 'pixel' | 'linear';

/** A box in CSS pixels of the viewport. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** An example of a manifest, in the order the parity catalog lists them. */
export interface AuditExample {
  component: string;
  id: string;
}

/** A component manifest, as far as the audit reads it. */
export interface AuditManifest {
  name: string;
  examples?: Array<{ id: string; Component: ComponentType }>;
}

/** A focusable element of the mounted example. */
export interface ElementInfo {
  /** The kit components that rendered it, innermost first. */
  owners: string[];
  tag: string;
  role: string | null;
  tabindex: string | null;
  /** Its accessible name, roughly: enough to tell it from its neighbours. */
  name: string;
  classes: string;
}

/** An element whose computed style changed when the focused element took focus. */
export interface ChangedElement {
  relation: 'self' | 'ancestor' | 'descendant' | 'sibling' | 'other';
  tag: string;
  classes: string;
  properties: string[];
  box: Box;
  /** It has a clip-path of its own: a cut corner. */
  clipPath: boolean;
}

/** What focusing an element changed, and where to look for it. */
export interface FocusInfo {
  focused: boolean;
  focusVisible: boolean;
  box: Box;
  changed: ChangedElement[];
  /** The element and every changed element, with a margin, within the viewport. */
  region: Box;
  /** Border boxes of the clip-path elements around the indicator, whose edges anti-aliasing blurs. */
  clipEdges: Box[];
  /** The nearest ancestors that clip what the focused or a changed element paints, nearest first. */
  clippingAncestors: string[];
}

/**
 * Where Tab took focus: an element `collect()` found, another element of the
 * example, the button after the example (portals come after it), or out of
 * the page.
 */
export type TabStop = { index: number } | 'other' | 'end' | 'outside';

/** What the audit drives in the page, as `window.focusAudit`. */
export interface FocusAuditPage {
  examples(): AuditExample[];
  /** Mounts an example on a surface; the error it threw, if any. */
  mount(index: number, surface: Surface): string | null;
  unmount(): void;
  /** Errors React reported since the last mount. */
  errors(): string[];
  /** The focusable elements of the mounted example, in document order. */
  collect(): ElementInfo[];
  /** Moves focus to the start sentinel, records every computed style and watches the DOM. */
  prepare(): void;
  /** Focuses an element found by `collect()`, scrolled into view; whether it is still in the page. */
  focus(index: number): boolean;
  afterFocus(index: number): FocusInfo;
  /** Moves focus back to the start sentinel. */
  blur(): void;
  /** How many times the DOM changed since `prepare()`. */
  settle(): number;
  /** Starts a Tab walk before the example. */
  startTabWalk(): void;
  tabStop(): TabStop;
  /** Whether anything outlived the example: a portal, a scroll lock. */
  leaked(): boolean;
  contentHeight(): number;
}

declare global {
  interface Window {
    focusAudit: FocusAuditPage;
  }
}

/** The computed properties a focus indicator can change. */
const PROPERTIES = [
  'box-shadow',
  'outline-style',
  'outline-width',
  'outline-color',
  'outline-offset',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-top-width',
  'background-color',
  'background-image',
  'color',
  'text-decoration-line',
  'text-decoration-color',
  'opacity',
  'filter',
  'transform',
  'translate',
  'scale',
  'clip-path',
  'visibility',
  'fill',
  'stroke',
];

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'iframe',
  'summary',
  '[tabindex]',
  '[contenteditable]:not([contenteditable="false"])',
  'audio[controls]',
  'video[controls]',
].join(',');

/** Room around the changed elements in the screenshots. */
const MARGIN = 8;

interface Fiber {
  type: unknown;
  return: Fiber | null;
}

/** The name of a component type, as React's development tools read it. */
function componentName(type: unknown): string | undefined {
  if (!type || (typeof type !== 'object' && typeof type !== 'function')) return undefined;
  const named = type as { displayName?: string; name?: string; render?: { displayName?: string; name?: string }; type?: { displayName?: string; name?: string } };
  return named.displayName ?? named.name ?? named.render?.displayName ?? named.render?.name ?? named.type?.displayName ?? named.type?.name;
}

/** The kit components that rendered an element, innermost first, read from React's fiber tree. */
function owners(element: Element): string[] {
  const key = Object.keys(element).find((name) => name.startsWith('__reactFiber$'));
  const out: string[] = [];
  for (let fiber = key ? (element as unknown as Record<string, Fiber>)[key] : null; fiber; fiber = fiber.return) {
    // The bundler numbers a name it has given already (`PixelInput2`).
    const name = componentName(fiber.type)?.replace(/\d+$/, '');
    if (name && /^(Pixel|Pxl)/.test(name) && name !== 'PxlKitSurfaceProvider' && out[out.length - 1] !== name) out.push(name);
    if (out.length === 3) break;
  }
  return out;
}

const boxOf = (element: Element): Box => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
};

function describe(element: Element): ElementInfo {
  const name = element.getAttribute('aria-label') || element.textContent || element.getAttribute('placeholder') || element.getAttribute('title') || '';
  return {
    owners: owners(element),
    tag: element.tagName.toLowerCase(),
    role: element.getAttribute('role'),
    tabindex: element.getAttribute('tabindex'),
    name: name.trim().replace(/\s+/g, ' ').slice(0, 48),
    classes: element.getAttribute('class') ?? '',
  };
}

function relation(other: Element, element: Element): ChangedElement['relation'] {
  if (other === element) return 'self';
  if (other.contains(element)) return 'ancestor';
  if (element.contains(other)) return 'descendant';
  if (element.parentElement?.contains(other)) return 'sibling';
  return 'other';
}

/** Starts the audit's side of the page, over the examples of `manifests` mounted in the kit's surface provider. */
export function startAudit(manifests: readonly AuditManifest[], Provider: ComponentType<{ surface: Surface; children?: ReactNode }>): void {
  const examples = manifests.flatMap((manifest) => (manifest.examples ?? []).map((example) => ({ component: manifest.name, ...example })));
  const host = document.getElementById('audit-root')!;
  const start = document.getElementById('audit-start')!;
  const initialBody = new Set(document.body.children);
  const reported: string[] = [];
  const report = (error: unknown) => reported.push(String((error as Error)?.stack ?? error).slice(0, 500));
  let root: Root | null = null;
  let candidates: Element[] = [];
  let before = new Map<Element, string[]>();
  let changedElements: Element[] = [];
  let mutations = 0;
  let observer: MutationObserver | null = null;

  /** The example's root and whatever it added to the body: portals, toasts. */
  const scopeRoots = () => [host, ...Array.from(document.body.children).filter((child) => !initialBody.has(child) && !['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName))];
  const scopeElements = () => scopeRoots().flatMap((scope) => [scope, ...Array.from(scope.querySelectorAll('*'))]);
  const scopeRootOf = (element: Element) => scopeRoots().find((scope) => scope.contains(element)) ?? null;
  const styleOf = (element: Element) => {
    const style = getComputedStyle(element);
    return PROPERTIES.map((property) => style.getPropertyValue(property));
  };
  const rendered = (element: Element) => {
    if (element.closest('[inert]') || element.matches(':disabled') || !element.checkVisibility({ checkVisibilityCSS: true })) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  };

  /** Ancestors up to the example's root that clip what `element` paints: a clip-path, or an overflow that is not visible. */
  const clippingAncestors = (element: Element) => {
    const out: Array<{ element: Element; clipPath: boolean; description: string }> = [];
    const scope = scopeRootOf(element);
    for (let ancestor = element.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const clipPath = style.clipPath !== 'none';
      if (clipPath || style.overflowX !== 'visible' || style.overflowY !== 'visible') {
        const corner = /pxl-corner-\w+/.exec(ancestor.getAttribute('class') ?? '')?.[0];
        out.push({
          element: ancestor,
          clipPath,
          description: `${ancestor.tagName.toLowerCase()}${corner ? `.${corner}` : ''} (${clipPath ? 'clip-path' : `overflow ${style.overflowX}/${style.overflowY}`})`,
        });
      }
      if (ancestor === scope) break;
    }
    return out;
  };

  const record = (records: MutationRecord[]) => {
    mutations += records.length;
  };

  window.focusAudit = {
    examples: () => examples.map(({ component, id }) => ({ component, id })),
    mount(index, surface) {
      reported.length = 0;
      try {
        root = createRoot(host, { onUncaughtError: report, onCaughtError: report, onRecoverableError: report });
        flushSync(() => root!.render(createElement(Provider, { surface }, createElement(examples[index]!.Component))));
        return null;
      } catch (error) {
        return String((error as Error)?.stack ?? error).slice(0, 500);
      }
    },
    unmount() {
      root?.unmount();
      root = null;
    },
    errors: () => reported.slice(),
    collect() {
      candidates = scopeElements().filter((element) => element.matches(FOCUSABLE) && rendered(element));
      return candidates.map(describe);
    },
    prepare() {
      start.focus({ preventScroll: true });
      before = new Map(scopeElements().map((element) => [element, styleOf(element)]));
      mutations = 0;
      observer?.disconnect();
      observer = new MutationObserver(record);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    },
    focus(index) {
      const element = candidates[index];
      if (!element?.isConnected) return false;
      // As the keyboard does, bring the element into view inside a scrolling
      // list; the page itself fits the viewport and stays put.
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      (element as HTMLElement).focus({ preventScroll: true });
      return true;
    },
    afterFocus(index) {
      const element = candidates[index]!;
      const changed: ChangedElement[] = [];
      changedElements = [];
      for (const other of scopeElements()) {
        const previous = before.get(other);
        if (!previous) continue;
        const now = styleOf(other);
        const properties = PROPERTIES.filter((_, i) => previous[i] !== now[i]);
        if (properties.length === 0) continue;
        changedElements.push(other);
        changed.push({
          relation: relation(other, element),
          tag: other.tagName.toLowerCase(),
          classes: other.getAttribute('class') ?? '',
          properties,
          box: boxOf(other),
          clipPath: getComputedStyle(other).clipPath !== 'none',
        });
      }
      const box = boxOf(element);
      let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
      for (const b of [box, ...changed.map((c) => c.box)]) {
        if (b.w === 0 && b.h === 0) continue;
        [x0, y0, x1, y1] = [Math.min(x0, b.x), Math.min(y0, b.y), Math.max(x1, b.x + b.w), Math.max(y1, b.y + b.h)];
      }
      const x = Math.max(0, Math.floor(x0 - MARGIN));
      const y = Math.max(0, Math.floor(y0 - MARGIN));
      const region = {
        x,
        y,
        w: Math.min(document.documentElement.clientWidth, Math.ceil(x1 + MARGIN)) - x,
        h: Math.min(window.innerHeight, Math.ceil(y1 + MARGIN)) - y,
      };
      const ancestors = [element, ...changedElements].flatMap(clippingAncestors);
      const clipEdges = [
        ...(getComputedStyle(element).clipPath !== 'none' ? [box] : []),
        ...changed.filter((c) => c.clipPath).map((c) => c.box),
        ...ancestors.filter((a) => a.clipPath).map((a) => boxOf(a.element)),
      ];
      return {
        focused: document.activeElement === element,
        focusVisible: element.matches(':focus-visible'),
        box,
        changed,
        region,
        clipEdges,
        clippingAncestors: [...new Set(ancestors.map((a) => a.description))],
      };
    },
    blur() {
      start.focus({ preventScroll: true });
    },
    settle() {
      if (observer) record(observer.takeRecords());
      observer?.disconnect();
      observer = null;
      return mutations;
    },
    startTabWalk() {
      start.focus({ preventScroll: true });
    },
    tabStop() {
      const active = document.activeElement;
      if (active?.id === 'audit-end') return 'end';
      if (!active || active === document.body || active === start) return 'outside';
      const index = candidates.indexOf(active);
      if (index >= 0) return { index };
      return scopeRootOf(active) ? 'other' : 'outside';
    },
    leaked() {
      return (
        Array.from(document.body.children).some((child) => !initialBody.has(child)) ||
        document.documentElement.hasAttribute('style') ||
        document.body.hasAttribute('style') ||
        host.childElementCount > 0
      );
    },
    contentHeight: () => Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)),
  };
}
