import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostAttributeToken,
  afterNextRender,
  computed,
  inject,
  input,
  isDevMode,
  ViewEncapsulation,
} from '@angular/core';
import {
  scrollAreaClasses,
  scrollAreaNameWarning,
  scrollAreaStyle,
  type ScrollAreaVariant,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, optionalNumber } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Focusable scroll region (`role="region"`, `tabindex="0"`) with a styled
 * scrollbar: keyboard users can reach it and scroll it with the arrow and
 * page keys. Name it with `aria-label` or `aria-labelledby` — without either
 * (or a `tabindex` of your own) it warns in development. An own `role` or
 * `tabindex` replaces the default.
 *
 * @example
 * <pxl-scroll-area aria-label="Activity log" [maxHeight]="240">…</pxl-scroll-area>
 */
@Component({
  selector: 'pxl-scroll-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-scroll-area { display: block; } }',
  host: {
    // Defaults: the element's own attributes win over them.
    role: 'region',
    tabindex: '0',
    '[class]': 'classes()',
    '[attr.data-scrollbar]': 'resolvedVariant()',
    '[attr.data-surface]': 'effectiveSurface()',
    '[style.max-height]': 'style().maxHeight',
    '[style.--pxl-scrollbar-size]': "style()['--pxl-scrollbar-size']",
    '[style.scrollbar-gutter]': 'style().scrollbarGutter',
  },
  template: '<ng-content />',
})
export class PixelScrollArea {
  /** Height cap before the content scrolls: pixels, or any CSS length. */
  readonly maxHeight = input<string | number>();
  /** When the scrollbar shows. */
  readonly variant = input<ScrollAreaVariant>();
  /** @deprecated Use `variant`. */
  readonly type = input<ScrollAreaVariant>();
  /** Keep the scrollbar's room reserved, so content never shifts. */
  readonly offsetScrollbars = input(false, { transform: booleanOr(false) });
  /** Scrollbar thickness in pixels. */
  readonly scrollbarSize = input<number | undefined, number | `${number}` | undefined>(undefined, {
    transform: optionalNumber,
  });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border and radius. */
  readonly bordered = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly resolvedVariant = computed<ScrollAreaVariant>(() => this.variant() ?? this.type() ?? 'auto');
  /** @internal */
  protected readonly classes = computed(() =>
    scrollAreaClasses(this.effectiveSurface(), { variant: this.resolvedVariant(), bordered: this.bordered() }),
  );
  /** @internal */
  protected readonly style = computed(() =>
    scrollAreaStyle({
      maxHeight: this.maxHeight(),
      scrollbarSize: this.scrollbarSize(),
      offsetScrollbars: this.offsetScrollbars(),
    }),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const ownTabIndex = inject(new HostAttributeToken('tabindex'), { optional: true });
    afterNextRender(() => {
      if (!isDevMode()) return;
      const warning = scrollAreaNameWarning({
        label: host.getAttribute('aria-label'),
        labelledBy: host.getAttribute('aria-labelledby'),
        tabIndex: ownTabIndex ?? undefined,
      });
      if (warning) console.warn(warning);
    });
  }
}
