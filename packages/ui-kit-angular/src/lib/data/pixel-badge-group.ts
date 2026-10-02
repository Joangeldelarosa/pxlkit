import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  HostAttributeToken,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  badgeGroupClasses,
  badgeGroupOverflowClasses,
  badgeGroupTriggerClasses,
  badgeGroupTriggerLabel,
  groupOverflow,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { numberOr } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PixelPopover } from '../overlay-foundation/pixel-popover';
import { PixelPopoverContent } from '../overlay-foundation/pixel-popover-content';
import { PixelPopoverTrigger } from '../overlay-foundation/pixel-popover-trigger';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Marks one badge of a `<pxl-badge-group>`. The group renders it in its row,
 * or in the overflow popover once the row is full.
 *
 * @example
 * <pxl-badge *pxlBadgeGroupItem tone="cyan">react</pxl-badge>
 */
@Directive({ selector: '[pxlBadgeGroupItem]' })
export class PixelBadgeGroupItem {
  /** @internal */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Wrapping row of badges, each marked with `*pxlBadgeGroupItem`. Beyond
 * `max`, the rest move into a popover opened by a "+N" button (named
 * "Show N more"), which names the popover too. A static `aria-label` or
 * `aria-labelledby` names the row and makes it a `role="group"`.
 *
 * @example
 * <pxl-badge-group aria-label="Stack" [max]="3">
 *   @for (tag of tags; track tag) {
 *     <pxl-badge *pxlBadgeGroupItem>{{ tag }}</pxl-badge>
 *   }
 * </pxl-badge-group>
 */
@Component({
  selector: 'pxl-badge-group',
  imports: [NgTemplateOutlet, PixelPopover, PixelPopoverTrigger, PixelPopoverContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'role',
    '[class]': 'classes',
  },
  template: `
    @for (item of visible(); track item) {
      <ng-container [ngTemplateOutlet]="item.template" />
    }
    @if (overflow().hidden; as hidden) {
      <pxl-popover [(open)]="open" [surface]="effectiveSurface()" haspopup="dialog" role="dialog">
        <button
          type="button"
          pxlPopoverTrigger
          [id]="triggerId"
          [attr.aria-label]="triggerLabel()"
          [class]="triggerClasses()"
        >+{{ hidden }}</button>
        <div *pxlPopoverContent="effectiveSurface()" [attr.aria-labelledby]="triggerId">
          <div [class]="overflowClasses">
            @for (item of hiddenItems(); track item) {
              <ng-container [ngTemplateOutlet]="item.template" />
            }
          </div>
        </div>
      </pxl-popover>
    }
  `,
})
export class PixelBadgeGroup {
  /**
   * Most places the row shows; beyond it, the last place becomes a "+N"
   * button that opens a popover with the rest.
   */
  readonly max = input(5, { transform: numberOr(5) });
  /** Surface override, for the row and its popover; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly items = contentChildren(PixelBadgeGroupItem);
  // Unnamed, the row stays a plain element: an unnamed group is announced for nothing.
  private readonly named = Boolean(
    inject(new HostAttributeToken('aria-label'), { optional: true }) ||
      inject(new HostAttributeToken('aria-labelledby'), { optional: true }),
  );

  /** @internal An own `role` wins. */
  protected readonly role = inject(new HostAttributeToken('role'), { optional: true }) ?? (this.named ? 'group' : null);
  /** @internal */
  protected readonly classes = badgeGroupClasses;
  /** @internal */
  protected readonly overflowClasses = badgeGroupOverflowClasses;
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal Whether the overflow popover is open. */
  protected readonly open = signal(false);
  /** @internal The "+N" button names the popover it opens. */
  protected readonly triggerId = injectId();
  /** @internal */
  protected readonly overflow = computed(() => groupOverflow(this.items().length, this.max()));
  /** @internal */
  protected readonly visible = computed(() => this.items().slice(0, this.overflow().visible));
  /** @internal */
  protected readonly hiddenItems = computed(() => this.items().slice(this.overflow().visible));
  /** @internal */
  protected readonly triggerLabel = computed(() => badgeGroupTriggerLabel(this.overflow().hidden));
  /** @internal */
  protected readonly triggerClasses = computed(() => badgeGroupTriggerClasses(this.effectiveSurface()));
}
