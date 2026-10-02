import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  isDevMode,
  ViewEncapsulation,
} from '@angular/core';
import {
  INPUT_GROUP_UNNAMED_WARNING,
  inputGroupClasses,
  inputGroupItemClasses,
  inputGroupRole,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * A control joined into a `<pxl-input-group>`: it loses its own border and
 * corners and gains a divider unless it is the last. Put it on each element
 * of the group.
 */
@Directive({
  selector: '[pxlInputGroupItem]',
  host: {
    '[class]': 'classes()',
  },
})
export class PixelInputGroupItem {
  private readonly group = inject(PixelInputGroup);

  /** @internal */
  protected readonly classes = computed(() =>
    inputGroupItemClasses(this.group.effectiveSurface(), this.group.isLast(this)),
  );
}

/**
 * Joins form controls (inputs, buttons, selects) into one shell. Mark each
 * control with `pxlInputGroupItem`, and name the group with `aria-label` or
 * `aria-labelledby` — it is a `group` only then. The host is the shell.
 *
 * @example
 * <pxl-input-group aria-label="Phone number">
 *   <input pxlInputGroupItem aria-label="Country code" value="+58" />
 *   <input pxlInputGroupItem aria-label="Number" />
 * </pxl-input-group>
 */
@Component({
  selector: 'pxl-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-input-group { display: block; } }',
  host: {
    '[attr.role]': 'groupRole() ?? null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class PixelInputGroup {
  /** Height of the shell. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Role of the shell; `group` when named and left out. */
  readonly role = input<string>();
  /** Accessible name of the group — strongly recommended. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Id of the element that names the group. */
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /** @internal */
  readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly items = contentChildren(PixelInputGroupItem);
  private readonly named = computed(() => !!(this.ariaLabel() || this.ariaLabelledby()));
  /** @internal */
  protected readonly groupRole = computed(() => inputGroupRole(this.role(), this.named()));
  /** @internal */
  protected readonly classes = computed(() => inputGroupClasses(this.effectiveSurface(), this.size()));

  constructor() {
    if (isDevMode()) {
      effect(() => {
        if (this.items().length > 1 && !this.named()) console.warn(INPUT_GROUP_UNNAMED_WARNING);
      });
    }
  }

  /** @internal Whether `item` is the group's last control. */
  isLast(item: PixelInputGroupItem): boolean {
    return this.items().at(-1) === item;
  }
}
