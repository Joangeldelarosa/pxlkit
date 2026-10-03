import {
  StatusChangeEvent,
  ValueChangeEvent,
  type AbstractControl,
  type ControlValueAccessor,
} from '@angular/forms';

/**
 * Connects a form control and a value accessor both ways, as `[formControl]`
 * does on change: the accessor shows the control's value and disabled
 * state, and what the user enters or leaves updates the control. Returns the
 * call that disconnects them.
 */
export function bindValueAccessor(control: AbstractControl, accessor: ControlValueAccessor): () => void {
  let fromView = false;
  let disabled = control.disabled;
  accessor.writeValue(control.value);
  accessor.setDisabledState?.(disabled);
  accessor.registerOnChange((value: unknown) => {
    fromView = true;
    control.markAsDirty();
    control.setValue(value);
    fromView = false;
  });
  accessor.registerOnTouched(() => control.markAsTouched());
  const subscription = control.events.subscribe((event) => {
    if (event instanceof ValueChangeEvent && !fromView) accessor.writeValue(control.value);
    if (event instanceof StatusChangeEvent && control.disabled !== disabled) {
      disabled = control.disabled;
      accessor.setDisabledState?.(disabled);
    }
  });
  return () => subscription.unsubscribe();
}
