import { ChangeDetectionStrategy, Component, computed, inject, input, model, signal } from '@angular/core';
import { cn, type Surface } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PixelTabsList } from './pixel-tabs-list';
import { PixelTabsPanel } from './pixel-tabs-panel';
import { PixelTabsTrigger } from './pixel-tabs-trigger';
import { PIXEL_TABS, type PixelTabsContext, type TabsActivationMode, type TabsOrientation } from './tabs-context';

/**
 * One tab of the `items` shorthand. A `content` template receives the item
 * as its context (`let-item`).
 */
export interface TabItem {
  id: string;
  label: string;
  icon?: PxlContent;
  content?: PxlContent;
}

/**
 * Tabbed panels with roving tabindex and arrow-key navigation. Pass `items`
 * for the shorthand, or compose `<pxl-tabs-list>`, `button[pxlTabsTrigger]`
 * and `<pxl-tabs-panel>` inside. Bind the active tab with `[(value)]`.
 *
 * @example
 * <pxl-tabs [items]="items" [(value)]="active" />
 */
@Component({
  selector: 'pxl-tabs',
  imports: [PixelTabsList, PixelTabsTrigger, PixelTabsPanel, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PIXEL_TABS, useFactory: () => inject(PixelTabs).context }],
  host: {
    '[class]': 'orientation() === "horizontal" ? "space-y-3" : "flex gap-3"',
    '[attr.data-orientation]': 'orientation()',
  },
  template: `
    @if (sugar()) {
      <pxl-tabs-list [ariaLabel]="ariaLabel()" [scrollable]="scrollable()">
        @for (item of items(); track item.id) {
          <button pxlTabsTrigger [value]="item.id" [icon]="item.icon">{{ item.label }}</button>
        }
      </pxl-tabs-list>
      <div [class]="panelsClasses()">
        @for (item of items(); track item.id) {
          <pxl-tabs-panel [value]="item.id">
            <ng-container *pxlOutlet="item.content; context: { $implicit: item }; let text">{{ text }}</ng-container>
          </pxl-tabs-panel>
        }
      </div>
    } @else {
      <ng-content />
    }
  `,
})
export class PixelTabs {
  /** Shorthand; leave out to compose list, triggers and panels yourself. */
  readonly items = input<TabItem[]>();
  /** Active tab id (`[(value)]`); leave unset for uncontrolled tabs. */
  readonly value = model<string | undefined>(undefined);
  /** Initial active tab while uncontrolled. */
  readonly defaultValue = input<string>();
  /** @deprecated Use `defaultValue`. */
  readonly defaultTab = input<string>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Accessible label of the tablist. */
  readonly ariaLabel = input<string, string | undefined>('Tabs', { transform: withDefault('Tabs') });
  /** Layout direction of the tab list and of arrow-key navigation. */
  readonly orientation = input<TabsOrientation, TabsOrientation | undefined>('horizontal', {
    transform: withDefault<TabsOrientation>('horizontal'),
  });
  /** Keep every panel in the DOM (hidden) instead of only the active one. */
  readonly keepMounted = input(false, { transform: booleanOr(false) });
  /** Horizontal tab list scrolls with a fade mask (ignored when vertical). */
  readonly scrollable = input(false, { transform: booleanOr(false) });
  /** `automatic` selects on focus; `manual` waits for Enter / Space. */
  readonly activationMode = input<TabsActivationMode, TabsActivationMode | undefined>('automatic', {
    transform: withDefault<TabsActivationMode>('automatic'),
  });

  /** @internal */
  protected readonly sugar = computed(() => (this.items()?.length ?? 0) > 0);
  /** @internal */
  protected readonly panelsClasses = computed(() => cn(this.orientation() === 'vertical' && 'flex-1 min-w-0'));

  private readonly triggers = new Map<string, HTMLElement>();
  private readonly order = signal<string[]>([]);
  // Like React's uncontrolled state, the default is read once, then kept.
  private seed: string | undefined;
  private readonly active = computed(
    () => this.value() ?? (this.seed ??= this.defaultValue() ?? this.defaultTab() ?? this.items()?.[0]?.id),
  );

  /** @internal Shared with the list, triggers and panels. */
  readonly context: PixelTabsContext = {
    baseId: injectId(),
    active: this.active,
    orientation: this.orientation,
    activationMode: this.activationMode,
    keepMounted: this.keepMounted,
    surface: injectEffectiveSurface(() => this.surface()),
    select: (id) => this.value.set(id),
    registerTrigger: (id, element) => {
      this.triggers.set(id, element);
      if (!this.order().includes(id)) this.order.update((ids) => [...ids, id]);
      // Compositional tabs without a default: activate the first trigger so a
      // panel renders and the tablist is keyboard-reachable.
      if (!this.sugar() && this.active() === undefined && this.order()[0] === id) this.value.set(id);
    },
    unregisterTrigger: (id) => {
      this.triggers.delete(id);
      this.order.update((ids) => ids.filter((x) => x !== id));
    },
    focusByOffset: (currentId, offset) => {
      const ids = this.ids();
      if (!ids.length) return;
      const from = Math.max(0, ids.indexOf(currentId));
      this.triggers.get(ids[(((from + offset) % ids.length) + ids.length) % ids.length]!)?.focus();
    },
    focusEdge: (edge) => {
      const ids = this.ids();
      if (!ids.length) return;
      this.triggers.get(edge === 'first' ? ids[0]! : ids[ids.length - 1]!)?.focus();
    },
  };

  private ids(): string[] {
    return this.sugar() ? this.items()!.map((item) => item.id) : this.order();
  }
}
