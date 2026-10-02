/** PixelKbd — a keycap: framed, with a drop shadow per surface. */
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
    surface === 'pixel' ? 'shadow-[0_2px_0_0_rgba(0,0,0,0.25)]' : 'shadow-[0_1px_0_0_rgba(0,0,0,0.15)]',
  );
}
