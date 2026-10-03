/**
 * PixelForm — the parts of a validated form: the ids that link an item's
 * label, control, description and message, the control's description, and
 * the classes of each part.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

/** The ids of one form item's parts, derived from the item's own id. */
export interface FormItemIds {
  /** The control, which the label points at. */
  id: string;
  /** The description, rendered or not. */
  descriptionId: string;
  /** The message, rendered or not. */
  messageId: string;
}

/** The ids of a form item's parts. */
export function formItemIds(baseId: string): FormItemIds {
  return {
    id: `${baseId}-control`,
    descriptionId: `${baseId}-description`,
    messageId: `${baseId}-message`,
  };
}

/**
 * `aria-describedby` of an item's control: the description, then the message
 * while the field has an error.
 */
export function formControlDescribedBy({ descriptionId, messageId }: FormItemIds, invalid: boolean): string {
  return invalid ? `${descriptionId} ${messageId}` : descriptionId;
}

/** The form: a stack of items. */
export function formClasses(surface: Surface): string {
  return cn('space-y-4', surfaceClasses(surface).font);
}

/** One item: the stack of its label, control, description and message. */
export const formItemClasses = 'space-y-1.5';

/** The label above an item's control. */
export function formLabelClasses(surface: Surface): string {
  return cn('block text-xs text-retro-muted', surfaceClasses(surface).font);
}

/** The description under an item's control. */
export function formDescriptionClasses(surface: Surface): string {
  return cn('text-xs text-retro-muted', surfaceClasses(surface).font);
}

/** The message under an item's control: red while it reports an error. */
export function formMessageClasses(surface: Surface, error: boolean): string {
  return cn('text-xs', error ? 'text-retro-red' : 'text-retro-muted', surfaceClasses(surface).font);
}
