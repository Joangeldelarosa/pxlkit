import { inject, type InjectionKey, type Ref } from 'vue';
import type { FormItemIds } from '@pxlkit/ui-kit-core';

/** A field of a `PixelForm`, in the order the fields were set up. */
export interface PixelFormFieldEntry {
  /** Path of the field in the form's values. */
  name: () => string;
  /** Id of the field's control, if it has one (a `PixelFormControl`). */
  controlId: () => string | undefined;
}

/** What a `PixelForm` shares with its fields. */
export interface PixelFormContext {
  /** Adds a field; returns the call that removes it. */
  register(field: PixelFormFieldEntry): () => void;
}

/** What a `PixelFormField` shares with the item parts inside it. */
export interface PixelFormFieldContext {
  /** The field's error message while it shows one. */
  error: Readonly<Ref<string | undefined>>;
  /** Tells the field the id of its control, or that it has none (`undefined`). */
  setControl(id: string | undefined): void;
}

export const PIXEL_FORM: InjectionKey<PixelFormContext> = Symbol('pixel-form');
export const PIXEL_FORM_FIELD: InjectionKey<PixelFormFieldContext> = Symbol('pixel-form-field');
export const PIXEL_FORM_ITEM: InjectionKey<FormItemIds> = Symbol('pixel-form-item');

/** The ids of the enclosing `PixelFormItem`; its parts are meaningless without one. */
export function useFormItem(part: string): FormItemIds {
  const item = inject(PIXEL_FORM_ITEM, null);
  if (!item) throw new Error(`${part} must be used inside a PixelFormItem.`);
  return item;
}

/** The enclosing `PixelFormField`, or `null` for a part used without one. */
export function useFormField(): PixelFormFieldContext | null {
  return inject(PIXEL_FORM_FIELD, null);
}
