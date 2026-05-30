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
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
} from '../common';

export type { UseFormReturn, FieldValues } from 'react-hook-form';
export type { FieldPath as Path } from 'react-hook-form';

/* ──────────────────────────────────────────────────────────────────────────
   PixelForm — shadcn-style wrapper around react-hook-form.
   Composable surface for: Root / Field / Item / Label / Control / Description / Message.
   Item generates linked ids + aria-* automatically.
   ────────────────────────────────────────────────────────────────────────── */

interface PixelFormItemCtxValue {
  /** id of the Control element */
  id: string;
  /** id of the Description element (may not be rendered) */
  descriptionId: string;
  /** id of the Message element (may not be rendered) */
  messageId: string;
}
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
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  surface?: Surface;
}

function PixelFormRootInner<T extends FieldValues>(
  { form, onSubmit, children, className, surface: surfaceProp }: PixelFormRootProps<T>,
  ref: React.Ref<HTMLFormElement>,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <FormProvider {...form}>
      <form
        ref={ref}
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', s.font, className)}
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
  name: TName;
  rules?: Omit<RegisterOptions<TFieldValues, TName>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  defaultValue?: UseControllerProps<TFieldValues, TName>['defaultValue'];
  shouldUnregister?: boolean;
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
  children: React.ReactNode;
}

export const PixelFormItem = forwardRef<HTMLDivElement, PixelFormItemProps>(function PixelFormItem(
  { children, className, ...rest },
  ref,
) {
  const baseId = useId();
  const value = useMemo<PixelFormItemCtxValue>(
    () => ({
      id: `${baseId}-control`,
      descriptionId: `${baseId}-description`,
      messageId: `${baseId}-message`,
    }),
    [baseId],
  );
  return (
    <PixelFormItemContext.Provider value={value}>
      <div ref={ref} className={cn('space-y-1.5', className)} {...rest}>
        {children}
      </div>
    </PixelFormItemContext.Provider>
  );
});
PixelFormItem.displayName = 'PixelForm.Item';

/* ── Label ────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelFormLabel}. */
export interface PixelFormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  surface?: Surface;
}

export const PixelFormLabel = forwardRef<HTMLLabelElement, PixelFormLabelProps>(function PixelFormLabel(
  { children, className, surface: surfaceProp, ...rest },
  ref,
) {
  const { id } = useItemCtx();
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <label
      ref={ref}
      htmlFor={id}
      className={cn('block text-xs text-retro-muted', s.font, className)}
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
  children: React.ReactElement;
}

interface ControlChildProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

export const PixelFormControl = forwardRef<HTMLElement, PixelFormControlProps>(function PixelFormControl(
  { children },
  ref,
) {
  const { id, descriptionId, messageId } = useItemCtx();
  const name = useFieldName();
  const formCtx = useFormContext();
  const error = name && formCtx ? (formCtx.getFieldState(name, formCtx.formState).error ?? undefined) : undefined;
  const hasError = !!error;
  const describedBy = [descriptionId, hasError ? messageId : null].filter(Boolean).join(' ');

  const child = React.Children.only(children) as React.ReactElement<ControlChildProps>;
  return React.cloneElement(child, {
    id,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': hasError ? 'true' : undefined,
    ref: ref as React.Ref<HTMLElement>,
  } as ControlChildProps & { ref?: React.Ref<HTMLElement> });
});
PixelFormControl.displayName = 'PixelForm.Control';

/* ── Description ─────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelFormDescription}. */
export interface PixelFormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  surface?: Surface;
}

export const PixelFormDescription = forwardRef<HTMLParagraphElement, PixelFormDescriptionProps>(function PixelFormDescription(
  { children, className, surface: surfaceProp, ...rest },
  ref,
) {
  const { descriptionId } = useItemCtx();
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cn('text-xs text-retro-muted', s.font, className)}
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
  const s = surfaceClasses(surface);
  if (body == null || body === false || body === '') return null;
  return (
    <p
      ref={ref}
      id={messageId}
      role={error ? 'alert' : undefined}
      className={cn('text-xs', error ? 'text-retro-red' : 'text-retro-muted', s.font, className)}
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
