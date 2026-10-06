import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  PixelForm,
  PixelFormControl,
  PixelFormDescription,
  PixelFormField,
  PixelFormItem,
  PixelFormLabel,
  PixelFormMessage,
  PixelInput,
} from '@pxlkit/ui-kit-angular';

interface DefaultValues {
  username: string;
  email: string;
}

@Component({
  imports: [
    PixelForm,
    PixelFormControl,
    PixelFormDescription,
    PixelFormField,
    PixelFormItem,
    PixelFormLabel,
    PixelFormMessage,
    PixelInput,
  ],
  template: `
    <form [pxlForm]="form" (submitted)="onSubmit($event)">
      <pxl-form-item pxlFormField="username" [messages]="{ required: 'Username is required' }">
        <label pxlFormLabel>Username</label>
        <pxl-input pxlFormControl name="username" placeholder="pxlhero" />
        <p pxlFormDescription>Your retro alias.</p>
        <pxl-form-message />
      </pxl-form-item>

      <pxl-form-item pxlFormField="email" [messages]="{ required: 'Email is required', pattern: 'Enter a valid email' }">
        <label pxlFormLabel>Email</label>
        <pxl-input pxlFormControl name="email" type="email" placeholder="hero@pxlkit.xyz" />
        <pxl-form-message />
      </pxl-form-item>
    </form>
  `,
})
export class Default {
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/.+@.+\..+/)] }),
  });

  onSubmit(data: Partial<DefaultValues>) {
    console.log('submit', data);
  }
}
