import {
  DOCUMENT,
  DestroyRef,
  Directive,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  type EmbeddedViewRef,
} from '@angular/core';
import { POPOVER_Z_INDEX, popoverContentClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectPopoverContext } from './popover-context';

/** camelCase → kebab-case CSS property name. */
const cssProperty = (key: string) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * The floating panel of a `<pxl-popover>`: the element it is placed on is
 * rendered into `<body>` while the popover is open, anchored to the trigger,
 * and receives the panel classes and the dialog role (an own `role` wins).
 * Its own inline style keys win over the positioning. Pair it with
 * `aria-labelledby` for its accessible name; pass a surface to override the
 * popover's.
 *
 * @example
 * <div *pxlPopoverContent aria-labelledby="details-title">…</div>
 * <div *pxlPopoverContent="'linear'">…</div>
 */
@Directive({ selector: '[pxlPopoverContent]' })
export class PixelPopoverContent {
  /** Surface override; defaults to the popover's. */
  readonly pxlPopoverContent = input<Surface | undefined, Surface | '' | null | undefined>(undefined, {
    // A bare `pxlPopoverContent` attribute keeps the popover's surface.
    transform: (value) => value || undefined,
  });

  private readonly context = injectPopoverContext('PixelPopoverContent');
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly anchor = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  // Only rendered in the browser after the first render, so the server and
  // hydration markup never contain the panel.
  private readonly rendered = signal(false);
  private readonly panel = signal<HTMLElement | null>(null);
  private view: EmbeddedViewRef<unknown> | null = null;
  /** Classes, inline style properties and role the panel element declares itself. */
  private own = { classes: new Set<string>(), style: new Set<string>(), role: false };
  private applied = { classes: [] as string[], style: new Set<string>() };

  private readonly classes = computed(() => popoverContentClasses(this.pxlPopoverContent() ?? this.context.surface()));

  constructor() {
    afterNextRender(() => this.rendered.set(true));
    effect(() => {
      const visible = this.context.open() && this.rendered();
      untracked(() => (visible ? this.show() : this.hide()));
    });
    effect(() => {
      const panel = this.panel();
      if (!panel) return;
      this.decorate(panel, this.classes(), this.context.role(), this.context.floatingStyles());
    });
    inject(DestroyRef).onDestroy(() => this.hide());
  }

  private show(): void {
    if (this.view) return;
    const view = this.anchor.createEmbeddedView(this.template);
    const panel = (view.rootNodes as Node[]).find((node): node is HTMLElement => node instanceof HTMLElement) ?? null;
    for (const node of view.rootNodes as Node[]) this.document.body.appendChild(node);
    this.view = view;
    this.own = {
      classes: new Set(panel ? Array.from(panel.classList) : []),
      style: new Set(panel ? Array.from(panel.style) : []),
      role: !!panel?.hasAttribute('role'),
    };
    this.applied = { classes: [], style: new Set() };
    this.panel.set(panel);
    this.context.setContent(panel);
  }

  private hide(): void {
    const view = this.view;
    if (!view) return;
    this.view = null;
    this.panel.set(null);
    // Still on the page here, so focus can be handed back once it is gone.
    this.context.setContent(null);
    // Destroying the view removes its nodes wherever they are.
    view.destroy();
  }

  private decorate(panel: HTMLElement, classes: string, role: string, styles: Record<string, string>): void {
    const next = classes.split(' ').filter(Boolean);
    for (const name of this.applied.classes) {
      if (!next.includes(name) && !this.own.classes.has(name)) this.renderer.removeClass(panel, name);
    }
    for (const name of next) this.renderer.addClass(panel, name);
    this.applied.classes = next;

    if (!this.own.role) {
      if (role === 'none') this.renderer.removeAttribute(panel, 'role');
      else this.renderer.setAttribute(panel, 'role', role);
    }

    const style: Record<string, string> = { ...styles, zIndex: String(POPOVER_Z_INDEX) };
    const keys = new Set(Object.keys(style).map(cssProperty));
    for (const key of this.applied.style) if (!keys.has(key)) panel.style.removeProperty(key);
    this.applied.style = new Set();
    for (const [key, value] of Object.entries(style)) {
      const property = cssProperty(key);
      if (this.own.style.has(property)) continue;
      panel.style.setProperty(property, value);
      this.applied.style.add(property);
    }
  }
}
