import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  commandClasses,
  commandLayerClasses,
  commandOptionClasses,
  commandOptionId,
  commandRows,
  matchesCommandShortcut,
  overlayBackdropClasses,
  parseCommandShortcut,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelPortal } from '../overlay-foundation/pixel-portal';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectEscape, injectEventListener, injectFocusTrap, injectScrollLock } from '../utilities/dom';
import { injectOpenState } from './_internal/open-state';

/** A command of the palette. An `icon` template receives the command as its context (`let-item`). */
export interface PixelCommandItem {
  id: string;
  label: string;
  icon?: PxlContent;
  /** Keyboard hint shown at the end of the row (display only). */
  shortcut?: string;
  /** Extra words the search matches. */
  keywords?: string[];
  /** Runs the command (click or Enter). Close the palette here if you want it to. */
  onSelect: () => void;
}

/** Commands under a heading. */
export interface PixelCommandGroup {
  heading: string;
  items: PixelCommandItem[];
}

/**
 * Command palette: a search field over grouped commands, with a global
 * shortcut (`mod+k` by default) that toggles it, keyboard navigation (arrows
 * wrap, Home / End, Enter runs the highlighted command), focus trap, scroll
 * lock and Escape / backdrop dismissal. Bind it with `[(open)]`. It shows what
 * its parent binds: the shortcut, Escape and the backdrop only ask for a
 * change, so a parent that keeps its value keeps the palette as it is.
 *
 * The host is layout-neutral (`display: contents`); the palette renders into
 * `document.body`.
 *
 * @example
 * <pxl-command [(open)]="open" [groups]="groups" shortcut="mod+shift+p" />
 */
@Component({
  selector: 'pxl-command',
  imports: [PixelPortal, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"' },
  template: `
    @if (open()) {
      <ng-template pxlPortal>
        <div [class]="layerClasses" aria-hidden="false">
          <div aria-hidden="true" data-pxl-overlay-backdrop="" [class]="backdropClasses" (click)="close()"></div>
          <div #panel role="dialog" aria-modal="true" aria-label="Command palette" [class]="classes().panel">
            <div [class]="classes().search">
              <span aria-hidden="true" [class]="classes().prompt">&gt;</span>
              <input
                #field
                type="text"
                role="combobox"
                [attr.aria-expanded]="list().items.length > 0"
                [attr.aria-controls]="list().items.length > 0 ? listboxId : null"
                aria-autocomplete="list"
                [attr.aria-activedescendant]="activeId()"
                [placeholder]="placeholder()"
                [value]="query()"
                [class]="classes().input"
                (input)="onInput($event)"
                (keydown)="onKeydown($event)"
              />
            </div>
            @if (list().items.length === 0) {
              <div [class]="classes().empty">{{ emptyMessage() }}</div>
            } @else {
              <!-- Options keep focus in the search field: mousedown would move it before the click lands. -->
              <ul [id]="listboxId" role="listbox" [class]="classes().listbox">
                @for (row of list().rows; track row.key) {
                  @if (row.kind === 'heading') {
                    <li role="presentation" [class]="classes().heading">{{ row.heading }}</li>
                  } @else {
                    <li
                      [id]="optionId(row.item.id)"
                      role="option"
                      [attr.aria-selected]="row.index === highlighted()"
                      [class]="optionClasses(row.index === highlighted())"
                      (mouseenter)="highlighted.set(row.index)"
                      (mousedown)="$event.preventDefault()"
                      (click)="row.item.onSelect()"
                    >
                      @if (row.item.icon) {
                        <span [class]="classes().icon">
                          <ng-container *pxlOutlet="row.item.icon; context: { $implicit: row.item }; let text">{{ text }}</ng-container>
                        </span>
                      }
                      <span [class]="classes().label">{{ row.item.label }}</span>
                      @if (row.item.shortcut) {
                        <kbd [class]="classes().shortcut">{{ row.item.shortcut }}</kbd>
                      }
                    </li>
                  }
                }
              </ul>
            }
          </div>
        </div>
      </ng-template>
    }
  `,
})
export class PixelCommand {
  /** Whether the palette is visible (`[(open)]`). */
  readonly open = input.required<boolean>();
  /** Global shortcut that toggles the palette, such as `mod+k` (Cmd or Ctrl + K). */
  readonly shortcut = input<string, string | undefined>('mod+k', { transform: withDefault('mod+k') });
  /** Placeholder of the search field. */
  readonly placeholder = input<string, string | undefined>('Type a command or search…', {
    transform: withDefault('Type a command or search…'),
  });
  /** Shown instead of the list when nothing matches. */
  readonly emptyMessage = input<string, string | undefined>('No results.', { transform: withDefault('No results.') });
  /** The commands, by group. */
  readonly groups = input.required<PixelCommandGroup[]>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** The open state the palette asks for: its shortcut toggles it; Escape and the backdrop close it. */
  readonly openChange = output<boolean>();

  private readonly state = injectOpenState(this.open, this.openChange);
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly parsedShortcut = computed(() => (this.shortcut() ? parseCommandShortcut(this.shortcut()) : null));

  /** @internal */
  protected readonly listboxId = injectId();
  /** @internal */
  protected readonly query = signal('');
  /** @internal */
  protected readonly highlighted = signal(0);
  /** @internal */
  protected readonly list = computed(() => commandRows(this.groups(), this.query()));
  /** @internal */
  protected readonly activeId = computed(() => {
    const item = this.list().items[this.highlighted()];
    return item ? this.optionId(item.id) : null;
  });
  /** @internal */
  protected readonly layerClasses = commandLayerClasses;
  /** @internal */
  protected readonly backdropClasses = overlayBackdropClasses('fixed');
  /** @internal */
  protected readonly classes = computed(() => commandClasses(this.effectiveSurface()));

  constructor() {
    // Keep the highlight on a listed command when the list shrinks.
    effect(() => {
      const count = this.list().items.length;
      const current = this.highlighted();
      if (count === 0) {
        if (current !== 0) this.highlighted.set(0);
      } else if (current > count - 1) {
        this.highlighted.set(count - 1);
      }
    });
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    effect((onCleanup) => {
      if (!this.open()) return;
      // Every opening starts from an empty search.
      this.query.set('');
      this.highlighted.set(0);
      if (!browser) return;
      const timer = setTimeout(() => this.field()?.nativeElement.focus(), 0);
      onCleanup(() => clearTimeout(timer));
    });
    injectEventListener('keydown', (event) => {
      const shortcut = this.parsedShortcut();
      if (!shortcut || !matchesCommandShortcut(event, shortcut)) return;
      event.preventDefault();
      this.state.request(!this.open());
    });
    injectEscape(
      () => this.close(),
      () => this.open(),
    );
    injectScrollLock(() => this.open());
    injectFocusTrap(
      () => this.open(),
      () => this.panel()?.nativeElement,
    );
  }

  /** @internal */
  protected close(): void {
    this.state.request(false);
  }

  /** @internal */
  protected optionId(id: string): string {
    return commandOptionId(this.listboxId, id);
  }

  /** @internal */
  protected optionClasses(active: boolean): string {
    return commandOptionClasses(this.effectiveSurface(), active);
  }

  /** @internal */
  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.highlighted.set(0);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const items = this.list().items;
    if (items.length === 0) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlighted.update((current) => (current + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlighted.update((current) => (current - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        this.highlighted.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.highlighted.set(items.length - 1);
        break;
      case 'Enter':
        event.preventDefault();
        items[this.highlighted()]?.onSelect();
        break;
    }
  }
}
