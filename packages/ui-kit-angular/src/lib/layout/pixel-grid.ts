import { Directive, computed, input } from '@angular/core';
import {
  gridClasses,
  gridTemplateColumns,
  type GridAlign,
  type GridColumnCount,
  type GridJustify,
  type GridOptions,
  type GridResponsiveColumns,
  type GridRowCount,
  type StackGapKey,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, optionalNumber, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * The inputs and derived state `pxlGrid` shares with `pxlEqualHeightGrid`.
 *
 * @internal
 */
@Directive()
export abstract class PixelGridBase {
  /** Column count, or a count per breakpoint (`{ base: 1, md: 3 }`); ignored with `autoFit` / `autoFill`. */
  readonly cols = input<
    GridColumnCount | GridResponsiveColumns | undefined,
    GridColumnCount | `${GridColumnCount}` | GridResponsiveColumns | undefined
  >(undefined, { transform: (value) => (typeof value === 'string' ? (Number(value) as GridColumnCount) : value) });
  /** Row count. */
  readonly rows = input<GridRowCount | undefined, GridRowCount | `${GridRowCount}` | undefined>(undefined, {
    transform: (value) => optionalNumber(value) as GridRowCount | undefined,
  });
  /** Gap token (`stackGap`) between rows and columns. */
  readonly gap = input<StackGapKey, StackGapKey | `${StackGapKey}` | undefined>(4, {
    transform: (value) => (value === undefined ? 4 : (Number(value) as StackGapKey)),
  });
  /** Gap between columns; with `rowGap`, it replaces `gap`. */
  readonly colGap = input<StackGapKey | undefined, StackGapKey | `${StackGapKey}` | undefined>(undefined, {
    transform: (value) => optionalNumber(value) as StackGapKey | undefined,
  });
  /** Gap between rows; with `colGap`, it replaces `gap`. */
  readonly rowGap = input<StackGapKey | undefined, StackGapKey | `${StackGapKey}` | undefined>(undefined, {
    transform: (value) => optionalNumber(value) as StackGapKey | undefined,
  });
  /** As many columns as fit, empty tracks collapsed. */
  readonly autoFit = input(false, { transform: booleanOr(false) });
  /** As many columns as fit, empty tracks kept. */
  readonly autoFill = input(false, { transform: booleanOr(false) });
  /** Narrowest column with `autoFit` / `autoFill` (any CSS length). */
  readonly minColWidth = input<string, string | undefined>('16rem', { transform: withDefault('16rem') });
  /** Inline-axis alignment of the items. */
  readonly justify = input<GridJustify>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal Inline column template of an auto-fit / auto-fill grid. */
  protected readonly templateColumns = computed(
    () =>
      gridTemplateColumns({ autoFit: this.autoFit(), autoFill: this.autoFill(), minColWidth: this.minColWidth() }) ??
      null,
  );

  /** @internal */
  protected gridOptions(align: GridAlign | undefined): GridOptions {
    return {
      cols: this.cols(),
      rows: this.rows(),
      gap: this.gap(),
      colGap: this.colGap(),
      rowGap: this.rowGap(),
      autoFit: this.autoFit(),
      autoFill: this.autoFill(),
      align,
      justify: this.justify(),
    };
  }
}

/**
 * CSS grid: a column count (or one per breakpoint), or as many columns as
 * fit (`autoFit` / `autoFill`); row count, gap tokens and item alignment.
 * Put it on whichever element you need (the counterpart of the React kit's
 * `as` prop).
 *
 * @example
 * <div pxlGrid [cols]="{ base: 1, md: 3 }" [gap]="6">…</div>
 * <ul pxlGrid autoFit minColWidth="12rem">…</ul>
 */
@Directive({
  selector: '[pxlGrid]',
  host: {
    '[class]': 'classes()',
    '[style.grid-template-columns]': 'templateColumns()',
    // `align` is a legacy presentational attribute: left on a block element
    // it would still align the content.
    '[attr.align]': 'null',
  },
})
export class PixelGrid extends PixelGridBase {
  /** Block-axis alignment of the items. */
  readonly align = input<GridAlign>();

  /** @internal */
  protected readonly classes = computed(() => gridClasses(this.effectiveSurface(), this.gridOptions(this.align())));
}
