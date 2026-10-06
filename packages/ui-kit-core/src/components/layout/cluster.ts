/** PixelCluster — a wrapping row of items: tags, chips, actions. */
import { cn, surfaceClasses, type Surface } from '../../common';
import { stackGap, type StackGapKey } from '../../tokens';
import { stackAlignClasses, stackJustifyClasses, type StackAlign, type StackJustify } from './stack';

export interface ClusterOptions {
  /** Gap token (`stackGap`). */
  gap: StackGapKey;
  /** Cross-axis alignment. */
  align: StackAlign;
  /** Main-axis distribution; packed at the start when left out. */
  justify?: StackJustify;
}

/** The wrapping row. */
export function clusterClasses(surface: Surface, { gap, align, justify }: ClusterOptions): string {
  return cn(
    'flex flex-row flex-wrap',
    stackGap[gap],
    stackAlignClasses[align],
    justify && stackJustifyClasses[justify],
    surfaceClasses(surface).transition,
  );
}
