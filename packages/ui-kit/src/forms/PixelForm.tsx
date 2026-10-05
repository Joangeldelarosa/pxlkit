'use client';

import React, { createContext, forwardRef, useContext, useId, useMemo } from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  type UseControllerProps,
  type UseFormReturn,
} from 'react-hook-form';
import {
  formClasses,
  formControlDescribedBy,
  formDescriptionClasses,
  formItemClasses,
  formItemIds,
  formLabelClasses,
  formMessageClasses,
  type FormItemIds,
} from '@pxlkit/ui-kit-core';
import {
  Surface, cn,
  useEffectiveSurface,
} from '../common';
import { elementRef } from '../utils/element-ref';

export type { UseFormReturn, FieldValues } from 'react-hook-form';
export type { FieldPath as Path } from 'react-hook-form';

/* ──────────────────────────────────────────────────────────────────────────
   PixelForm — shadcn-style wrapper around react-hook-form.
   Composable surface for: Root / Field / Item / Label / Control / Description / Message.
   Item generates linked ids + aria-* automatically.
   ────────────────────────────────────────────────────────────────────────── */

/** The ids of the Control, the Description and the Message (the latter two may not be rendered). */
type PixelFormItemCtxValue = FormItemIds;
const PixelFormItemContext = createContext<PixelFormItemCtxValue | null>(null);

function useItemCtx(): PixelFormItemCtxValue {
  const ctx = useContext(PixelFormItemContext);
  if (!ctx) {
    throw new Error('PixelForm.Label/Control/Description/Message must be used inside PixelForm.Item');
  }
  return ctx;
}

interface PixelFormFieldCtxValue {
  name: string;
}
const PixelFormFieldContext = createContext<PixelFormFieldCtxValue | null>(null);

function useFieldName(): string | null {
  return useContext(PixelFormFieldContext)?.name ?? null;
}

/* ── Root ─────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelFormRoot}. */
export interface PixelFormRootProps<T extends FieldValues> {
  /** The form: what React Hook Form's `useForm` returns. */
  form: UseFormReturn<T>;
  /** Called with the form's values, once a submission finds no error. */
  onSubmit: (data: T) => void | Promise<void>;
  /** The fields. */
  children: React.ReactNode;
  /** Extra classes on the `<form>`. */
  className?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

function PixelFormRootInner<T extends FieldValues>(
  { form, onSubmit, children, className, surface: surfaceProp }: PixelFormRootProps<T>,
  ref: React.Ref<HTMLFormElement>,
) {
  const surface = useEffectiveSurface(surfaceProp);
  return (
    <FormProvider {...form}>
      <form
        ref={ref}
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(formClasses(surface), className)}
      >
        {children}
      </form>
    </FormProvider>
  );
}
type PixelFormRootGeneric = (<T extends FieldValues>(
  props: PixelFormRootProps<T> & { ref?: React.Ref<HTMLFormElement> },
) => React.ReactElement) & { displayName?: string };
export const PixelFormRoot = forwardRef(PixelFormRootInner) as PixelFormRootGeneric;
PixelFormRoot.displayName = 'PixelForm.Root';

/* ── Field ────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelFormField}. */
export interface PixelFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /** Path of the field in the form's values. */
  name: TName;
  /**
   * Validation rules: React Hook Form's `rules` (`required`, `min`, `max`, `minLength`,
   * `maxLength`, `pattern`, `validate`).
   */
  rules?: Omit<RegisterOptions<TFieldValues, TName>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  /** Initial value, where the form's `defaultValues` have none. */
  defaultValue?: UseControllerProps<TFieldValues, TName>['defaultValue'];
  /** Drops the field's value from the form when it unmounts; by default the value stays. */
  shouldUnregister?: boolean;
  /**
   * Renders the control: gets the field's props (`field`: its value, change and blur handlers, name
   * and ref) and its state (`fieldState`).
   */
  render: (args: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
  }) => React.ReactElement;
}

export function PixelFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, rules, defaultValue, shouldUnregister, render }: PixelFormFieldProps<TFieldValues, TName>) {
  const ctx = useMemo(() => ({ name: name as string }), [name]);
  return (
    <PixelFormFieldContext.Provider value={ctx}>
      <Controller<TFieldValues, TName>
        name={name}
        rules={rules}
        defaultValue={defaultValue}
        shouldUnregister={shouldUnregister}
        render={render}
      />
    </PixelFormFieldContext.Provider>
  );
}
(PixelFormField as React.FC & { displayName?: string }).displayName = 'PixelForm.Field';

/* ── Item ─────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelFormItem}. */
export interface PixelFormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `PixelForm.Label`, `PixelForm.Control`, `PixelForm.Description` and `PixelForm.Message`. */
  children: React.ReactNode;
}

export const PixelFormItem = forwardRef<HTMLDivElement, PixelFormItemProps>(function PixelFormItem(
  { children, className, ...rest },
  ref,
) {
  const baseId = useId();
  const value = useMemo<PixelFormItemCtxValue>(() => formItemIds(baseId), [baseId]);
  return (
    <PixelFormItemContext.Provider value={value}>
      <div ref={ref} className={cn(formItemClasses, className)} {...rest}>
        {children}
      </div>
    </PixelFormItemContext.Provider>
  );
});
PixelFormItem.displayName = 'PixelForm.Item';

/* ── Label ────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelFormLabel}. */
export interface PixelFormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

export const PixelFormLabel = forwardRef<HTMLLabelElement, PixelFormLabelProps>(function PixelFormLabel(
  { children, className, surface: surfaceProp, ...rest },
  ref,
) {
  const { id } = useItemCtx();
  const surface = useEffectiveSurface(surfaceProp);
  return (
    <label
      ref={ref}
      htmlFor={id}
      className={cn(formLabelClasses(surface), className)}
      {...rest}
    >
      {children}
    </label>
  );
});
PixelFormLabel.displayName = 'PixelForm.Label';

/* ── Control ──────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelFormControl}. Wraps a single child and clones aria-*/
export interface PixelFormControlProps {
  /**
   * The control: one element, which gets the field's `id`, `aria-describedby` and `aria-invalid`.
   */
  children: React.ReactElement;
}

interface ControlChildProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const r of refs) {
      if (typeof r === 'function') r(node);
      else if (r) (r as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export const PixelFormControl = forwardRef<HTMLElement, PixelFormControlProps>(function PixelFormControl(
  { children },
  ref,
) {
  const ids = useItemCtx();
  const name = useFieldName();
  const formCtx = useFormContext();
  const error = name && formCtx ? (formCtx.getFieldState(name, formCtx.formState).error ?? undefined) : undefined;
  const hasError = !!error;

  const child = React.Children.only(children) as React.ReactElement<ControlChildProps>;
  // The child keeps its own ref beside the Control's: with `{...field}` it is
  // React Hook Form's `field.ref`, through which the form focuses the first
  // invalid field on submit and serves `setFocus`. A Control given no ref
  // receives `null`, which alone would replace it.
  const childRef = elementRef<HTMLElement>(child);
  const mergedRef = React.useMemo(() => mergeRefs(ref as React.Ref<HTMLElement>, childRef), [ref, childRef]);
  return React.cloneElement(child, {
    id: ids.id,
    'aria-describedby': formControlDescribedBy(ids, hasError),
    'aria-invalid': hasError ? 'true' : undefined,
    ref: mergedRef,
  } as ControlChildProps & { ref?: React.Ref<HTMLElement> });
});
PixelFormControl.displayName = 'PixelForm.Control';

/* ── Description ─────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelFormDescription}. */
export interface PixelFormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

export const PixelFormDescription = forwardRef<HTMLParagraphElement, PixelFormDescriptionProps>(function PixelFormDescription(
  { children, className, surface: surfaceProp, ...rest },
  ref,
) {
  const { descriptionId } = useItemCtx();
  const surface = useEffectiveSurface(surfaceProp);
  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cn(formDescriptionClasses(surface), className)}
      {...rest}
    >
      {children}
    </p>
  );
});
PixelFormDescription.displayName = 'PixelForm.Description';

/* ── Message ─────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelFormMessage}. */
export interface PixelFormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

export const PixelFormMessage = forwardRef<HTMLParagraphElement, PixelFormMessageProps>(function PixelFormMessage(
  { children, className, surface: surfaceProp, ...rest },
  ref,
) {
  const { messageId } = useItemCtx();
  const name = useFieldName();
  const formCtx = useFormContext();
  const error = name && formCtx ? (formCtx.getFieldState(name, formCtx.formState).error ?? undefined) : undefined;
  const body = children ?? error?.message;
  const surface = useEffectiveSurface(surfaceProp);
  if (body == null || body === false || body === '') return null;
  return (
    <p
      ref={ref}
      id={messageId}
      role={error ? 'alert' : undefined}
      className={cn(formMessageClasses(surface, !!error), className)}
      {...rest}
    >
      {body}
    </p>
  );
});
PixelFormMessage.displayName = 'PixelForm.Message';

/* ── Namespace export ──────────────────────────────────────────────────
   Match PixelDrawer / PixelPopover dot-notation: each subcomponent is a
   distinct top-level named export above (tree-shakeable) AND attached to
   the Root for the `<PixelForm.Field />` ergonomics. */

type PixelFormNamespace = PixelFormRootGeneric & {
  Root: typeof PixelFormRoot;
  Field: typeof PixelFormField;
  Item: typeof PixelFormItem;
  Label: typeof PixelFormLabel;
  Control: typeof PixelFormControl;
  Description: typeof PixelFormDescription;
  Message: typeof PixelFormMessage;
};

const PixelFormBase = PixelFormRoot as PixelFormNamespace;
PixelFormBase.Root = PixelFormRoot;
PixelFormBase.Field = PixelFormField;
PixelFormBase.Item = PixelFormItem;
PixelFormBase.Label = PixelFormLabel;
PixelFormBase.Control = PixelFormControl;
PixelFormBase.Description = PixelFormDescription;
PixelFormBase.Message = PixelFormMessage;

export const PixelForm = PixelFormBase;
