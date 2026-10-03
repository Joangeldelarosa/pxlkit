import { InjectionToken, inject, type Signal } from '@angular/core';
import type { AbstractControl, FormGroup } from '@angular/forms';
import type { FormItemIds } from '@pxlkit/ui-kit-core';

/** A field of a `form[pxlForm]`, in the order the fields were set up. */
export interface PixelFormFieldEntry {
  readonly control: Signal<AbstractControl | null>;
  /** Focuses the field's control; `false` when it has none. */
  focus(): boolean;
}

/** What a `form[pxlForm]` shares with its fields. */
export interface PixelFormContext {
  readonly group: Signal<FormGroup>;
  /** The form was submitted since it was set up or reset: its fields show their errors. */
  readonly submitted: Signal<boolean>;
  /** Adds a field; returns the call that removes it. */
  register(field: PixelFormFieldEntry): () => void;
}

/** What a `[pxlFormField]` shares with the item parts inside it. */
export interface PixelFormFieldContext {
  readonly control: Signal<AbstractControl | null>;
  /** The field shows an error: the form was submitted and the control is invalid. */
  readonly invalid: Signal<boolean>;
  /** The message of the error the field shows, if `messages` has one for it. */
  readonly message: Signal<string | undefined>;
  /** Tells the field the element its control is, or that it has none (`null`). */
  setControl(element: HTMLElement | null): void;
}

export const PIXEL_FORM = new InjectionToken<PixelFormContext>('PIXEL_FORM');
export const PIXEL_FORM_FIELD = new InjectionToken<PixelFormFieldContext>('PIXEL_FORM_FIELD');
export const PIXEL_FORM_ITEM = new InjectionToken<FormItemIds>('PIXEL_FORM_ITEM');

/** The ids of the enclosing `<pxl-form-item>`; its parts are meaningless without one. */
export function injectFormItem(part: string): FormItemIds {
  const item = inject(PIXEL_FORM_ITEM, { optional: true });
  if (!item) throw new Error(`${part} must be used inside a <pxl-form-item>.`);
  return item;
}
