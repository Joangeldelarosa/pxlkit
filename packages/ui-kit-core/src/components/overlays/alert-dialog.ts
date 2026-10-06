/**
 * PixelAlertDialog — the confirmation panel over the backdrop. The pixel
 * surface draws a window (title bar, then a body holding the description and
 * the buttons); the linear surface a card with an accent dot before the
 * texts. The accent is red for destructive actions, cyan otherwise.
 */
import { cn, surfaceClasses, toneMap, type Surface } from '../../common';
import { modalLayerClasses } from './modal';

/** The layer that centres the panel over the backdrop — the modal's. */
export const alertDialogLayerClasses = modalLayerClasses;

export interface AlertDialogClasses {
  panel: string;
  /** Title bar (pixel) or the row of accent dot and texts (linear). */
  header: string;
  /** Accent dot before the title. */
  accent: string;
  title: string;
  /** The window body around the description and the buttons (pixel). */
  body: string;
  /** The column of title and description next to the accent dot (linear). */
  texts: string;
  description: string;
  /** The row of buttons. */
  actions: string;
  cancel: string;
  action: string;
  /** Spinner in the action button while the action is pending. */
  spinner: string;
}

export interface AlertDialogState {
  /** The confirmed action is destructive: the accent turns red. */
  destructive: boolean;
  /** The user prefers reduced motion: the spinner does not spin. */
  reducedMotion: boolean;
}

/** Classes of every part of the alert dialog for a surface and state. */
export function alertDialogClasses(surface: Surface, { destructive, reducedMotion }: AlertDialogState): AlertDialogClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[destructive ? 'red' : 'cyan'];
  const pixel = surface === 'pixel';
  const button = (layout: string) =>
    cn(
      layout,
      'px-4 h-9',
      pixel ? 'text-xs' : 'text-sm',
      'font-medium focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed',
      s.border,
      s.radius,
      s.font,
      s.transition,
    );
  return {
    panel: cn(
      'relative w-full max-w-sm bg-retro-bg shadow-2xl',
      s.border,
      s.radiusLg,
      'border-retro-border',
      pixel ? 'p-0' : 'p-5',
    ),
    header: pixel ? 'flex items-center gap-2 border-b-2 border-retro-border bg-retro-surface/60 px-3 py-2' : 'flex items-start gap-3',
    accent: pixel ? cn('inline-block h-2 w-2', t.fill) : cn('mt-1 inline-block h-2 w-2 rounded-full', t.fill),
    title: pixel ? 'font-pixel text-[11px] text-retro-green' : cn('text-base font-semibold text-retro-text', s.fontDisplay),
    body: 'p-5',
    texts: 'flex-1',
    description: cn(pixel ? 'text-sm text-retro-muted' : 'mt-2 text-sm text-retro-muted', s.font),
    actions: 'mt-5 flex items-center justify-end gap-2',
    cancel: cn(
      button('inline-flex items-center justify-center'),
      'border-retro-border text-retro-muted hover:bg-retro-surface/70 hover:text-retro-text',
      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-border',
    ),
    action: cn(
      button('inline-flex items-center justify-center gap-2'),
      t.border,
      t.bg,
      t.text,
      t.hover,
      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
      t.ring,
    ),
    spinner: cn(
      'inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent',
      !reducedMotion && 'animate-spin',
    ),
  };
}
