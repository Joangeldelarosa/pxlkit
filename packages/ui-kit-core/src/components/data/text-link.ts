/** PixelTextLink — an anchor or button drawn as a tone-coloured underlined link. */
import { cn, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

/** The link; the default cyan turns green on hover, other tones fade. */
export function textLinkClasses(surface: Surface, tone: Tone): string {
  const t = toneMap[tone];
  return cn(
    'underline underline-offset-2 decoration-current/40 transition-colors cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
    t.ring,
    surfaceClasses(surface).font,
    t.text,
    tone === 'cyan' ? 'hover:text-retro-green' : 'hover:opacity-80',
  );
}
