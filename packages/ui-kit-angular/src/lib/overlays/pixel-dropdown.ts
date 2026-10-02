import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { dropdownRootClasses, type DropdownItemKind, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import type { PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PIXEL_DROPDOWN, createDropdownRoot } from './dropdown-context';
import { PixelDropdownContent } from './pixel-dropdown-content';
import { PixelDropdownHeader } from './pixel-dropdown-header';
import { PixelDropdownItem } from './pixel-dropdown-item';
import { PixelDropdownSeparator } from './pixel-dropdown-separator';
import { PixelDropdownTrigger } from './pixel-dropdown-trigger';

/** A row of the `items` shorthand: an item (the default kind), a separator, a header, … */
export interface DropdownOption {
  value: string;
  label: string;
  icon?: PxlContent;
  disabled?: boolean;
  tone?: Tone;
  kind?: DropdownItemKind;
  /** Keyboard hint shown at the end of the row (display only). */
  shortcut?: string;
  /** For `checkbox` and `radio` rows: the mark shown (display only). */
  checked?: boolean;
}

/**
 * A button that opens a menu of actions, keyboard navigable (arrows, Home /
 * End, Enter / Space, typeahead, Escape). Pass `items` and `label` for the
 * shorthand and listen to `(selected)`; when its content holds a
 * `<pxl-dropdown-trigger>`, that content replaces the shorthand. For a
 * controlled menu use `<pxl-dropdown-root>`.
 *
 * @example
 * <pxl-dropdown label="Actions" [items]="[{ value: 'edit', label: 'Edit' }]" (selected)="run($event)" />
 */
@Component({
  selector: 'pxl-dropdown',
  imports: [PixelDropdownTrigger, PixelDropdownContent, PixelDropdownItem, PixelDropdownSeparator, PixelDropdownHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-dropdown { display: block; } }',
  providers: [{ provide: PIXEL_DROPDOWN, useFactory: () => inject(PixelDropdown).context }],
  host: { '[class]': 'rootClasses' },
  template: `
    <div class="contents">
      @if (composed()) {
        <ng-content />
      } @else {
        <pxl-dropdown-trigger [tone]="tone()" [icon]="icon()" [disabled]="disabled()" [ariaLabel]="ariaLabel()">
          {{ label() }}
        </pxl-dropdown-trigger>
        <div *pxlDropdownContent>
          @for (item of items(); track $index) {
            @switch (item.kind) {
              @case ('separator') {
                <pxl-dropdown-separator />
              }
              @case ('header') {
                <pxl-dropdown-header>{{ item.label }}</pxl-dropdown-header>
              }
              @case ('checkbox') {
                <button
                  pxlDropdownCheckboxItem
                  [value]="item.value"
                  [disabled]="item.disabled"
                  [tone]="item.tone"
                  [shortcut]="item.shortcut"
                  [checked]="item.checked"
                  (selected)="selected.emit(item.value)"
                >
                  {{ item.label }}
                </button>
              }
              @case ('radio') {
                <button
                  pxlDropdownRadioItem
                  [value]="item.value"
                  [disabled]="item.disabled"
                  [tone]="item.tone"
                  [shortcut]="item.shortcut"
                  [checked]="item.checked"
                  (selected)="selected.emit(item.value)"
                >
                  {{ item.label }}
                </button>
              }
              @default {
                <button
                  pxlDropdownItem
                  [value]="item.value"
                  [disabled]="item.disabled"
                  [tone]="item.tone"
                  [shortcut]="item.shortcut"
                  [icon]="item.icon ?? (item.kind === 'submenu' ? submenuArrow : undefined)"
                  (selected)="selected.emit(item.value)"
                >
                  {{ item.label }}
                </button>
              }
            }
          }
        </div>
      }
    </div>
    <ng-template #submenuArrow><span aria-hidden="true">▸</span></ng-template>
  `,
})
export class PixelDropdown {
  /** Trigger label of the shorthand. */
  readonly label = input<string>();
  /** Rows of the shorthand. */
  readonly items = input<DropdownOption[], DropdownOption[] | undefined>([], { transform: withDefault<DropdownOption[]>([]) });
  /** Trigger tone. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Icon at the end of the trigger, in place of the chevron. */
  readonly icon = input<PxlContent>();
  /** Disables the trigger. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Accessible label of the trigger, for a label that is only decorative. */
  readonly ariaLabel = input<string>();
  /** The `value` of the row chosen from the shorthand. */
  readonly selected = output<string>();

  private readonly open = signal(false);
  private readonly projectedTrigger = contentChild(PixelDropdownTrigger);

  /** @internal */
  protected readonly composed = computed(() => this.projectedTrigger() !== undefined);
  /** @internal */
  protected readonly rootClasses = dropdownRootClasses;
  /** @internal Shared with the trigger, the menu and its items. */
  readonly context = createDropdownRoot({
    open: this.open.asReadonly(),
    setOpen: (open) => this.open.set(open),
    surface: injectEffectiveSurface(() => this.surface()),
  });
}
