import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  NgZone,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  DROPDOWN_TYPEAHEAD_RESET_MS,
  SPLIT_BUTTON_TOGGLE_LABEL,
  dropdownChevronClasses,
  dropdownMenuKeyAction,
  dropdownTriggerKeyAction,
  dropdownTypeaheadMatch,
  nextDropdownHighlight,
  splitButtonGroupClasses,
  splitButtonItemClasses,
  splitButtonItemId,
  splitButtonMenuAlignsRight,
  splitButtonMenuClasses,
  splitButtonPrimaryClasses,
  splitButtonRootClasses,
  splitButtonToggleClasses,
  type DropdownEdge,
  type DropdownMove,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PixelGlyph } from '../_internal/pixel-glyph';
import type { Option } from '../forms/option';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectClickOutside, injectEscape } from '../utilities/dom';
import { PixelButton } from './pixel-button';

/**
 * A primary action joined to a chevron button that opens a menu of related
 * actions. The menu follows the WAI-ARIA menu button pattern: it takes focus
 * as it opens and points `aria-activedescendant` at the highlighted option.
 * The arrows, Home and End move the highlight, Enter and Space choose it,
 * typing jumps to an option by its label; ArrowDown on the chevron opens the
 * menu on its first option, ArrowUp on its last. Escape, Tab and choosing
 * close it with focus back on the chevron; a press outside closes it and
 * focus follows the pointer.
 *
 * @example
 * <pxl-split-button label="Save" [options]="saveOptions" (primary)="save()" (selected)="saveAs($event)" />
 */
@Component({
  selector: 'pxl-split-button',
  imports: [PixelButton, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'rootClasses',
    // `disabled` goes to the two buttons; on the host it would only mislead
    // `[disabled]` selectors and form tooling.
    '[attr.disabled]': 'null',
  },
  template: `
    <div [class]="groupClasses()">
      <button
        pxlButton
        [tone]="tone()"
        [surface]="effectiveSurface()"
        [disabled]="disabled()"
        [class]="primaryClasses"
        (click)="onPrimaryClick()"
      >
        {{ label() }}
      </button>
      <button
        #toggle
        [attr.id]="toggleId"
        type="button"
        [attr.aria-label]="toggleLabel"
        aria-haspopup="menu"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="open() ? menuId : null"
        [disabled]="disabled()"
        [class]="toggleClasses()"
        (click)="onToggleClick()"
        (keydown)="onToggleKeydown($event)"
      >
        <svg pxlGlyph="chevronDown" [class]="chevronClasses()"></svg>
      </button>
    </div>
    @if (open()) {
      <div
        #menu
        [attr.id]="menuId"
        role="menu"
        tabindex="-1"
        aria-orientation="vertical"
        [attr.aria-labelledby]="toggleId"
        [attr.aria-activedescendant]="activeIndex() >= 0 ? itemId(activeIndex()) : null"
        [class]="menuClasses()"
        (keydown)="onMenuKeydown($event)"
      >
        @for (option of options(); track option.value; let index = $index) {
          <button
            [attr.id]="itemId(index)"
            type="button"
            role="menuitem"
            tabindex="-1"
            [attr.data-highlighted]="index === activeIndex() || null"
            [class]="itemClasses(index === activeIndex())"
            (mouseenter)="highlighted.set(option.value)"
            (click)="choose(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    }
  `,
})
export class PixelSplitButton {
  /** Text of the primary (left) button. */
  readonly label = input.required<string>();
  /** Options of the menu. */
  readonly options = input.required<Option[]>();
  /** Color tone (maps to `toneMap`). */
  readonly tone = input<Tone, Tone | undefined>('purple', { transform: withDefault<Tone>('purple') });
  /** Surface aesthetic override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Disables the primary button and the chevron. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** The primary (label) button was clicked. */
  readonly primary = output<void>();
  /** An option was chosen, with its `value`; the menu closes. */
  readonly selected = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly toggle = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');
  private readonly menu = viewChild<ElementRef<HTMLElement>>('menu');
  private readonly values = computed(() => this.options().map((option) => option.value));
  private readonly alignRight = signal(false);
  private typed = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly open = signal(false);
  /** @internal */
  protected readonly highlighted = signal<string | null>(null);
  /** @internal */
  protected readonly activeIndex = computed(() => {
    const value = this.highlighted();
    return value === null ? -1 : this.values().indexOf(value);
  });
  /** @internal */
  protected readonly toggleId = injectId();
  /** @internal */
  protected readonly menuId = injectId();
  /** @internal */
  protected readonly toggleLabel = SPLIT_BUTTON_TOGGLE_LABEL;
  /** @internal */
  protected readonly rootClasses = splitButtonRootClasses;
  /** @internal */
  protected readonly primaryClasses = splitButtonPrimaryClasses;
  /** @internal */
  protected readonly groupClasses = computed(() => splitButtonGroupClasses(this.effectiveSurface(), this.tone()));
  /** @internal */
  protected readonly toggleClasses = computed(() => splitButtonToggleClasses(this.effectiveSurface(), this.tone()));
  /** @internal */
  protected readonly chevronClasses = computed(() => dropdownChevronClasses(this.open()));
  /** @internal */
  protected readonly menuClasses = computed(() => splitButtonMenuClasses(this.effectiveSurface(), this.alignRight()));

  constructor() {
    injectClickOutside(
      () => this.host,
      () => this.close(false),
    );
    injectEscape(
      () => this.close(),
      () => this.open(),
    );
    // Focus moves into the menu as it opens.
    afterRenderEffect(() => this.menu()?.nativeElement.focus({ preventScroll: true }));
    inject(DestroyRef).onDestroy(() => clearTimeout(this.typeaheadTimer));
  }

  /** @internal */
  protected itemId(index: number): string {
    return splitButtonItemId(this.menuId, index);
  }

  /** @internal */
  protected itemClasses(highlighted: boolean): string {
    return splitButtonItemClasses(this.effectiveSurface(), highlighted);
  }

  // A disabled button gets no clicks in a browser; synthetic ones are ignored too.
  /** @internal */
  protected onPrimaryClick(): void {
    if (!this.disabled()) this.primary.emit();
  }

  /** @internal */
  protected onToggleClick(): void {
    if (this.disabled()) return;
    if (this.open()) this.close();
    else this.show();
  }

  /** @internal */
  protected choose(value: string): void {
    this.selected.emit(value);
    this.close();
  }

  // ArrowDown on the chevron opens the menu on its first option and ArrowUp
  // on its last; either moves into the menu when it is already open. Enter
  // and Space stay the button's own click, which toggles the menu.
  /** @internal */
  protected onToggleKeydown(event: KeyboardEvent): void {
    const edge = dropdownTriggerKeyAction(event.key);
    if (!edge) return;
    event.preventDefault();
    if (!this.open()) {
      this.show(edge);
      return;
    }
    this.menu()?.nativeElement.focus({ preventScroll: true });
    this.move(event.key === 'ArrowDown' ? 1 : -1);
  }

  // The menu holds focus while open; Escape closes it from anywhere.
  /** @internal */
  protected onMenuKeydown(event: KeyboardEvent): void {
    const action = dropdownMenuKeyAction(event.key);
    if (action === undefined) return;
    if (action === 'typeahead') {
      this.typeahead(event.key);
      return;
    }
    if (action === 'leave') {
      // Focus is back on the chevron before the browser's own Tab, which
      // then moves on from there.
      this.close();
      return;
    }
    event.preventDefault();
    const highlighted = this.highlighted();
    if (action !== 'select') this.move(action);
    else if (highlighted !== null) this.choose(highlighted);
  }

  // Opened from the keyboard, the menu starts on its first or last option.
  private show(edge?: DropdownEdge): void {
    const viewport = this.document.defaultView?.innerWidth ?? 0;
    this.alignRight.set(splitButtonMenuAlignsRight(this.host.getBoundingClientRect().left, viewport));
    this.highlighted.set(edge ? (nextDropdownHighlight(this.values(), null, edge) ?? null) : null);
    this.open.set(true);
  }

  // Focus the menu holds goes back to the chevron — but not after a press
  // outside, where it follows the pointer.
  private close(returnFocus = true): void {
    if (returnFocus && this.menu()?.nativeElement.contains(this.document.activeElement)) {
      this.toggle().nativeElement.focus();
    }
    this.open.set(false);
    this.highlighted.set(null);
  }

  private move(to: DropdownMove): void {
    const next = nextDropdownHighlight(this.values(), this.highlighted(), to);
    if (next) this.highlighted.set(next);
  }

  private typeahead(key: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typed = (this.typed + key).toLowerCase();
    const options = this.options();
    const match = dropdownTypeaheadMatch(
      this.values(),
      (value) => options.find((option) => option.value === value)?.label,
      this.typed,
    );
    if (match) this.highlighted.set(match);
    // Letters typed before a pause add up into one search. The pause only
    // forgets them: its timer runs outside the zone, so a zone.js
    // application stays stable meanwhile and checks nothing when it ends.
    this.typeaheadTimer = this.zone.runOutsideAngular(() =>
      setTimeout(() => {
        this.typed = '';
      }, DROPDOWN_TYPEAHEAD_RESET_MS),
    );
  }
}
