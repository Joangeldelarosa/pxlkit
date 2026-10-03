/**
 * PxlKitButton, the deprecated name of PixelIconButton: the label naming the
 * button, text and template icons, the disabled state and both selectors.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelIconButton, PxlKitButton } from '../../public-api';

describe('PxlKitButton', () => {
  it('is PixelIconButton under its former name, on either attribute', async () => {
    expect(PxlKitButton).toBe(PixelIconButton);
    @Component({
      imports: [PxlKitButton],
      template: `
        <button pxlKitButton label="Old" icon="★"></button>
        <button pxlIconButton label="New" icon="★"></button>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.map((button) => button.className)).toEqual([buttons[0]!.className, buttons[0]!.className]);
    expect(buttons[0]!.className).toContain('h-10');
  });

  it('is named by its label, as aria-label and title, around a template icon', async () => {
    @Component({
      imports: [PxlKitButton],
      template: `
        <button pxlKitButton [label]="label()" [icon]="gear"></button>
        <ng-template #gear><svg data-testid="gear"></svg></ng-template>
      `,
    })
    class Host {
      readonly label = signal('Settings');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Settings');
    expect(button.getAttribute('title')).toBe('Settings');
    expect(button.querySelector('span > [data-testid="gear"]')).not.toBeNull();
    fixture.componentInstance.label.set('Preferences');
    await fixture.whenStable();
    expect(button.getAttribute('aria-label')).toBe('Preferences');
    expect(button.getAttribute('title')).toBe('Preferences');
  });

  it('falls back to its defaults for unset inputs, disables the button and drops its shadows', async () => {
    @Component({
      imports: [PxlKitButton],
      template: `
        <button pxlKitButton label="Go" icon="+" [tone]="undefined" [size]="undefined"></button>
        <button pxlKitButton label="Off" icon="+" tone="red" size="sm" disabled></button>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [enabled, disabled] = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(enabled!.classList).toContain('text-retro-cyan');
    expect(enabled!.classList).toContain('h-10');
    expect(enabled!.classList).toContain('pxl-shadow');
    expect(enabled!.disabled).toBe(false);
    expect(enabled!.textContent!.trim()).toBe('+');
    expect(disabled!.classList).toContain('text-retro-red');
    expect(disabled!.classList).toContain('h-8');
    expect(disabled!.classList).not.toContain('pxl-shadow');
    expect(disabled!.disabled).toBe(true);
  });

  it('emits native clicks', async () => {
    const clicked = vi.fn();
    @Component({
      imports: [PxlKitButton],
      template: '<button pxlKitButton label="Go" icon="+" (click)="clicked()"></button>',
    })
    class Host {
      readonly clicked = clicked;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(clicked).toHaveBeenCalledTimes(1);
  });
});
