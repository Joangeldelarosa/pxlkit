/** FieldShell — the label, control and hint / error stack of every form field. */
import { cn, surfaceClasses, type Surface } from '../../common';

/** The stack around a field's control. */
export const fieldShellClasses = 'block space-y-1.5';

export interface FieldShellTextClasses {
  label: string;
  hint: string;
  error: string;
}

/** The label, hint and error texts of a field. */
export function fieldShellTextClasses(surface: Surface): FieldShellTextClasses {
  const { font } = surfaceClasses(surface);
  return {
    label: cn('text-xs text-retro-muted', font),
    hint: cn('text-xs text-retro-muted', font),
    error: cn('text-xs text-retro-red', font),
  };
}
