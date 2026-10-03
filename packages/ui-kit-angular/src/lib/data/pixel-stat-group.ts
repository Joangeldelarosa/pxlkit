import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  statGroupClasses,
  statGroupRole,
  type StackGapKey,
  type StatGroupLayout,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Frames stat tiles (`<pxl-stat-card>`) together: a row divided by rules in
 * the tone, or a grid of 1 to 6 columns that folds on phones. A static
 * `aria-label` or `aria-labelledby` names it and makes it a `role="group"`.
 * The host is the group.
 *
 * @example
 * <pxl-stat-group layout="grid" [columns]="4" [gap]="3" aria-label="Key metrics">
 *   <pxl-stat-card label="Users" value="1,284" />
 *   <pxl-stat-card label="Revenue" value="$12.4k" />
 * </pxl-stat-group>
 */
@Component({
  selector: 'pxl-stat-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box. In the base layer, so the
  // flex row or grid of its classes still wins.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-stat-group { display: block; } }',
  host: {
    '[attr.role]': 'role',
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class PixelStatGroup {
  /** A divided row, or a grid. */
  readonly layout = input<StatGroupLayout, StatGroupLayout | undefined>('row', {
    transform: withDefault<StatGroupLayout>('row'),
  });
  /** Grid columns, 1 to 6. */
  readonly columns = input(3, { transform: numberOr(3) });
  /** Gap between grid cells (`stackGap`); flush cells when unset. */
  readonly gap = input<StackGapKey | undefined, StackGapKey | `${StackGapKey}` | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : (Number(value) as StackGapKey)),
  });
  /** Tone of the frame and the row's dividers. */
  readonly tone = input<ToneKey, ToneKey | undefined>('neutral', { transform: withDefault<ToneKey>('neutral') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border, radius and background. */
  readonly bordered = input(true, { transform: booleanOr(true) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly named = Boolean(
    inject(new HostAttributeToken('aria-label'), { optional: true }) ||
      inject(new HostAttributeToken('aria-labelledby'), { optional: true }),
  );

  /** @internal An own `role` wins. */
  protected readonly role = inject(new HostAttributeToken('role'), { optional: true }) ?? statGroupRole(this.named) ?? null;
  /** @internal */
  protected readonly classes = computed(() =>
    statGroupClasses(this.effectiveSurface(), {
      layout: this.layout(),
      columns: this.columns(),
      gap: this.gap(),
      tone: this.tone(),
      bordered: this.bordered(),
    }),
  );
}
