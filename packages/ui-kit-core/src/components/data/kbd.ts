/** PixelKbd — a keycap: framed, with depth per surface. */
import { cn, surfaceClasses, type Surface } from '../../common';

/** The `<kbd>` element. */
export function kbdClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn(
    'inline-flex h-5 min-w-[20px] items-center justify-center px-1.5 text-[10px] text-retro-muted',
    s.border,
    s.radius,
    s.font,
    'border-retro-border bg-retro-surface',
    // The pixel keycap's depth is a bottom edge twice as thick, in the stronger
    // border colour: a shadow could not show past its cut corners.
    surface === 'pixel' ? 'border-b-4 border-b-retro-border-strong' : 'shadow-[0_1px_0_0_rgba(0,0,0,0.15)]',
  );
}
