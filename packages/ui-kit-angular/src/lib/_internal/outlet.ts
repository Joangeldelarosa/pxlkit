import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  type EmbeddedViewRef,
  type OnChanges,
} from '@angular/core';

/**
 * Content an input accepts where the React kit takes a `ReactNode`: plain
 * text, or an `<ng-template>` for any markup. Like `ngTemplateOutlet`, any
 * template is accepted; the component documents the context it passes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PxlContent<C = any> = string | TemplateRef<C>;

/**
 * Renders a {@link PxlContent}: a template is instantiated (with
 * `pxlOutletContext`), a string through the directive's own template.
 * Nothing renders for `null`, `undefined` or `''`.
 *
 * @example
 * <ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container>
 */
@Directive({ selector: '[pxlOutlet]' })
export class PxlOutlet<C = unknown> implements OnChanges {
  readonly pxlOutlet = input<PxlContent<C> | null | undefined>();
  readonly pxlOutletContext = input<C>();

  private readonly container = inject(ViewContainerRef);
  private readonly text = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);
  private view: EmbeddedViewRef<unknown> | null = null;
  private rendered: PxlContent<C> | null = null;

  ngOnChanges(): void {
    const content = this.pxlOutlet() ?? null;
    const context = this.pxlOutletContext();
    if (content instanceof TemplateRef) {
      if (this.rendered !== content) {
        this.render(() => this.container.createEmbeddedView(content, context as C));
      } else if (this.view && context !== undefined) {
        Object.assign(this.view.context as object, context);
      }
    } else if (content) {
      if (this.rendered instanceof TemplateRef || this.view === null) {
        this.render(() => this.container.createEmbeddedView(this.text, { $implicit: content }));
      } else {
        (this.view.context as { $implicit: string }).$implicit = content;
      }
    } else {
      this.render(() => null);
    }
    this.rendered = content;
  }

  private render(create: () => EmbeddedViewRef<unknown> | null): void {
    this.container.clear();
    this.view = create();
  }
}
