/** PixelCodeInline — inline code, framed and tinted in a tone. */
import { cn, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

/** The `<code>` element. */
export function codeInlineClasses(surface: Surface, tone: Tone): string {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return cn('px-1.5 py-0.5 text-xs break-words box-decoration-clone', s.border, s.radius, s.font, t.border, t.soft, t.text);
}
