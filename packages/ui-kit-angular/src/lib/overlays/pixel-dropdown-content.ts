import {
  DestroyRef,
  Directive,
  NgZone,
  PLATFORM_ID,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal,
  untracked,
  type EmbeddedViewRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  DROPDOWN_PLACEMENT,
  anchorFloating,
  dropdownContentClasses,
  dropdownMiddleware,
  floatingStyles,
} from '@pxlkit/ui-kit-core';
import { injectDropdownContext } from './dropdown-context';

/** camelCase → kebab-case CSS property name. */
const cssProperty = (key: string) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * The menu of a dropdown: the element it is placed on is rendered while the
 * menu is open, anchored below the root, and becomes the `role="menu"` panel
 * — it keeps its own classes. It takes focus as it opens and handles the
 * keys while open. Put the items, headers and separators inside.
 *
 * @example
 * <div *pxlDropdownContent>
 *   <button pxlDropdownItem value="share" shortcut="Ctrl+E" (selected)="share()">Share</button>
 * </div>
 */
@Directive({ selector: '[pxlDropdownContent]' })
export class PixelDropdownContent {
  private readonly context = injectDropdownContext('PixelDropdownContent');
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly anchor = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly panel = signal<HTMLElement | null>(null);
  // Compared by value: re-measuring on a scroll that leaves the menu where it
  // was must not render again.
  private readonly coords = signal({ x: 0, y: 0 }, { equal: (a, b) => a.x === b.x && a.y === b.y });
  private view: EmbeddedViewRef<unknown> | null = null;
  private unlisten: (() => void) | null = null;
  /** Classes the panel declares itself, and the ones applied to it. */
  private own = new Set<string>();
  private applied = { classes: [] as string[], style: [] as string[] };

  constructor() {
    effect(() => {
      const open = this.context.open();
      untracked(() => (open ? this.show() : this.hide()));
    });
    effect(() => {
      const panel = this.panel();
      if (!panel) return;
      const { x, y } = this.coords();
      // Only positioned in the browser: the server renders the initial styles.
      this.decorate(panel, dropdownContentClasses(this.context.surface()), floatingStyles(this.browser ? panel : null, x, y));
    });
    effect(() => {
      const panel = this.panel();
      if (!panel) return;
      this.renderer.setAttribute(panel, 'aria-labelledby', this.context.triggerId());
      const active = this.context.activeId();
      if (active) this.renderer.setAttribute(panel, 'aria-activedescendant', active);
      else this.renderer.removeAttribute(panel, 'aria-activedescendant');
    });
    if (this.browser) {
      // Keep the menu anchored to the root while it is open. Its scroll and
      // resize listeners run outside the zone, so a zone.js application
      // renders only when the menu actually moves.
      const zone = inject(NgZone);
      effect((onCleanup) => {
        const panel = this.panel();
        if (!panel) return;
        const options = { placement: DROPDOWN_PLACEMENT, middleware: dropdownMiddleware() };
        onCleanup(
          zone.runOutsideAngular(() =>
            anchorFloating(this.context.root, panel, options, ({ x, y }) => this.coords.set({ x, y })),
          ),
        );
      });
    }
    inject(DestroyRef).onDestroy(() => this.hide());
  }

  private show(): void {
    if (this.view) return;
    this.view = this.anchor.createEmbeddedView(this.template);
    const panel = (this.view.rootNodes as Node[]).find((node): node is HTMLElement => node instanceof HTMLElement) ?? null;
    if (panel) {
      this.own = new Set(Array.from(panel.classList));
      this.applied = { classes: [], style: [] };
      this.renderer.setAttribute(panel, 'id', this.context.menuId);
      this.renderer.setAttribute(panel, 'role', 'menu');
      this.renderer.setAttribute(panel, 'tabindex', '-1');
      this.renderer.setAttribute(panel, 'aria-orientation', 'vertical');
      this.unlisten = this.renderer.listen(panel, 'keydown', (event: KeyboardEvent) => this.context.onMenuKeydown(event));
    }
    this.panel.set(panel);
    this.context.setMenu(panel);
  }

  private hide(): void {
    const view = this.view;
    if (!view) return;
    this.view = null;
    this.unlisten?.();
    this.unlisten = null;
    this.panel.set(null);
    // Still on the page here, so focus can be handed back once it is gone.
    this.context.setMenu(null);
    view.destroy();
  }

  private decorate(panel: HTMLElement, classes: string, styles: Record<string, string>): void {
    const next = classes.split(' ').filter(Boolean);
    for (const name of this.applied.classes) {
      if (!next.includes(name) && !this.own.has(name)) this.renderer.removeClass(panel, name);
    }
    for (const name of next) this.renderer.addClass(panel, name);
    this.applied.classes = next;

    const properties = Object.keys(styles).map(cssProperty);
    for (const property of this.applied.style) {
      if (!properties.includes(property)) panel.style.removeProperty(property);
    }
    for (const [key, value] of Object.entries(styles)) panel.style.setProperty(cssProperty(key), value);
    this.applied.style = properties;
  }
}
