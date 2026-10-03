/**
 * A custom element is inline by default. A host that stands for a block
 * element of the React render — a `<div>`, a `<section>` — gives itself a
 * block box (docs/ui-kit-porting.md, "The host's box"), or the layout would
 * differ from React's where the parity suite cannot see it: transforms do not
 * apply to an inline box, and widths and margins behave differently. The rule
 * sits in the base layer, so display utilities on the host still win.
 */
import { ViewEncapsulation } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { PixelFieldShell } from '../lib/_internal/field-shell';
import * as kit from '../public-api';
import { HOST_TAGS } from './dom-rules';

/** Elements whose box is a block one by default (the HTML rendering section). */
const BLOCK_ELEMENTS = new Set([
  'address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'div', 'dl', 'fieldset', 'figure', 'footer',
  'form', 'header', 'hgroup', 'hr', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'search', 'section', 'ul',
]);

/**
 * Hosts that set their display themselves, as the React element does:
 * `PxlKitLocaleProvider`'s `<div lang>` is `display: contents`, and
 * `PixelSplitButton`'s root classes make its `<div>` `inline-flex`.
 */
const OWN_DISPLAY = new Set(['pxl-locale-provider', 'pxl-split-button']);

interface ComponentDefinition {
  selectors: unknown[][];
  styles: string[];
  encapsulation: ViewEncapsulation;
}

/** Element selector → the component definition (compiled on first read), the kit's and its internal ones. */
function componentsBySelector(): Map<string, ComponentDefinition> {
  const out = new Map<string, ComponentDefinition>();
  for (const value of [...Object.values(kit), PixelFieldShell]) {
    const definition = (value as { ɵcmp?: ComponentDefinition }).ɵcmp;
    for (const [tag] of definition?.selectors ?? []) {
      if (typeof tag === 'string' && tag) out.set(tag, definition!);
    }
  }
  return out;
}

const blockHosts = Object.entries(HOST_TAGS).filter(
  (entry): entry is [string, string] => entry[1] !== null && BLOCK_ELEMENTS.has(entry[1]) && !OWN_DISPLAY.has(entry[0]),
);

describe('Angular hosts standing for block elements', () => {
  const components = componentsBySelector();

  it.each(blockHosts)('<%s> (a <%s> in React) has a block box', (host) => {
    const component = components.get(host);
    expect(component, `no component of the kit is <${host}>`).toBeDefined();
    // Unencapsulated, so the tag selector reaches the host.
    expect(component!.encapsulation).toBe(ViewEncapsulation.None);
    const styles = component!.styles.join('\n').replace(/\s+/g, ' ');
    expect(styles).toContain(`@layer base { ${host} { display: block; } }`);
  });
});
