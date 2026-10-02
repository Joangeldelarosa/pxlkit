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

/** The message a field shows under its control: the error, else the hint. */
export interface FieldMessage {
  hint?: string;
  error?: string;
}

/** Id of a field's hint / error text, derived from its control's id. */
export function fieldMessageId(controlId: string): string {
  return `${controlId}-msg`;
}

/**
 * `aria-describedby` of a field's control: the ids the consumer passed, then
 * the field's hint / error text while one is shown. Undefined when there is
 * neither, so the control never points at an element that is not rendered.
 */
export function fieldDescribedBy(
  controlId: string,
  { hint, error }: FieldMessage,
  describedBy?: string,
): string | undefined {
  const ids = [describedBy?.trim(), error || hint ? fieldMessageId(controlId) : undefined].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}
