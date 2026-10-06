import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn, focusRing, surfaceClasses } from '@pxlkit/ui-kit-core';
import { booleanOr, optionalBoolean } from '../_internal/coercion';
import { injectTabsContext } from './tabs-context';

/**
 * The panel (`role="tabpanel"`) of one tab. Only the active panel is in the
 * DOM unless `keepMounted` is set here or on the root. The host is
 * layout-neutral (`display: contents`).
 */
@Component({
  selector: 'pxl-tabs-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"' },
  template: `
    @if (mounted()) {
      <div
        role="tabpanel"
        [attr.id]="context.baseId + '-panel-' + value()"
        [attr.aria-labelledby]="context.baseId + '-tab-' + value()"
        [hidden]="!selected()"
        [attr.data-state]="selected() ? 'active' : 'inactive'"
        tabindex="0"
        [class]="classes()"
      >
        <ng-content />
      </div>
    }
  `,
})
export class PixelTabsPanel {
  /** Id of the tab — matches a trigger's value. */
  readonly value = input.required<string>();
  /** Override the root's `keepMounted` for this panel. */
  readonly keepMounted = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  /** Surface-aware border and radius chrome. */
  readonly bordered = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly context = injectTabsContext('PixelTabsPanel');
  /** @internal */
  protected readonly selected = computed(() => this.context.active() === this.value());
  /** @internal */
  protected readonly mounted = computed(() => (this.keepMounted() ?? this.context.keepMounted()) || this.selected());

  /** @internal */
  protected readonly classes = computed(() => {
    const s = surfaceClasses(this.context.surface());
    const bordered = this.bordered();
    return cn(
      'p-3 text-sm text-retro-muted focus-visible:outline-hidden',
      bordered && 'bg-retro-bg/50',
      bordered && s.border,
      bordered && s.radius,
      bordered && 'border-retro-border/40',
      focusRing,
      'focus-visible:ring-retro-cyan/30',
    );
  });
}
