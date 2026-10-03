/**
 * <pxl-color-input> as an Angular form control, a two-way binding and an
 * uncontrolled input; formats, the hex draft, the presets' keys, focus moving
 * into the dialog and native attributes. Rendering and the shared
 * interactions are covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it } from 'vitest';
import { PixelColorInput } from '../../public-api';

const trigger = () => document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
const hexField = () => document.querySelector<HTMLInputElement>('[aria-label="Hex value"]')!;
const swatch = (hex: string) => document.querySelector<HTMLButtonElement>(`[aria-label="${hex}"]`)!;
const type = (input: HTMLInputElement, text: string) => {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

async function render<T>(Host: Type<T>) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((done) => setTimeout(done, 0));
    await fixture.whenStable();
  };
  await settle();
  return { fixture, host: fixture.componentInstance, settle };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('PixelColorInput', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelColorInput, ReactiveFormsModule],
      template: `<pxl-color-input label="Brand" format="rgb" [formControl]="control" />`,
    })
    class Host {
      readonly control = new FormControl('#06b6d4');
    }
    const { host, settle } = await render(Host);
    trigger().focus();
    trigger().click();
    await settle();
    expect(document.activeElement).toBe(document.querySelector('[aria-label="Native color picker"]'));
    expect(host.control.touched).toBe(true);
    swatch('#ef4444').click();
    await settle();
    expect(host.control.value).toBe('rgb(239, 68, 68)');
    host.control.setValue('#ffffff');
    await settle();
    expect(swatch('#ffffff').getAttribute('aria-pressed')).toBe('true');
    expect(hexField().value).toBe('#ffffff');
    host.control.disable();
    await settle();
    expect(trigger().disabled).toBe(true);
  });

  it('works with ngModel: commits a complete hex only, and discards a partial one on blur', async () => {
    @Component({
      imports: [PixelColorInput, FormsModule],
      template: `<pxl-color-input format="hsl" [(ngModel)]="color" />`,
    })
    class Host {
      color = '#112233';
    }
    const { host, settle } = await render(Host);
    trigger().click();
    await settle();
    type(hexField(), '#12');
    await settle();
    expect(host.color).toBe('#112233');
    expect(hexField().value).toBe('#12');
    type(hexField(), 'f00');
    await settle();
    expect(host.color).toBe('hsl(0, 100%, 50%)');
    type(hexField(), '#abcd');
    await settle();
    expect(hexField().value).toBe('#abcd');
    hexField().dispatchEvent(new FocusEvent('blur'));
    await settle();
    expect(hexField().value).toBe('hsl(0, 100%, 50%)');
  });

  it('follows a two-way bound signal and moves through its presets with the keyboard', async () => {
    @Component({
      imports: [PixelColorInput],
      template: `<pxl-color-input name="tone" [presets]="presets" [(value)]="value" />`,
    })
    class Host {
      readonly presets = ['#ef4444', '#f97316', '#eab308'];
      readonly value = signal<string | undefined>('#f97316');
    }
    const { host, settle } = await render(Host);
    expect((document.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('#f97316');
    trigger().click();
    await settle();
    swatch('#ef4444').focus();
    swatch('#ef4444').dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    await settle();
    expect(document.activeElement).toBe(swatch('#eab308'));
    expect(swatch('#eab308').getAttribute('tabindex')).toBe('0');
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await settle();
    expect(host.value()).toBe('#eab308');
    host.value.set('rgb(239, 68, 68)');
    await settle();
    expect(swatch('#ef4444').getAttribute('aria-pressed')).toBe('true');
  });

  it('puts native attributes on the trigger, not on its host, and names it after its label', async () => {
    @Component({
      imports: [PixelColorInput],
      template: `<pxl-color-input id="accent" name="accent" label="Accent" aria-describedby="help" hint="Used for links" />`,
    })
    class Host {}
    await render(Host);
    const host = document.querySelector('pxl-color-input')!;
    for (const name of ['id', 'name', 'aria-describedby']) expect(host.hasAttribute(name)).toBe(false);
    expect(trigger().id).toBe('accent');
    expect(trigger().getAttribute('aria-label')).toBe('Accent');
    expect(trigger().getAttribute('aria-describedby')).toBe('help accent-msg');
    expect(trigger().textContent).toContain('Pick a color');
  });
});
