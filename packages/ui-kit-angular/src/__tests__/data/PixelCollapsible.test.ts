/**
 * <pxl-collapsible> beyond the parity examples: a bound defaultOpen, ids
 * unique per instance, and the frame.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelCollapsible } from '../../public-api';

describe('PixelCollapsible', () => {
  it('opens from a bound defaultOpen and toggles from the header', async () => {
    @Component({
      imports: [PixelCollapsible],
      template: '<pxl-collapsible label="Details" [defaultOpen]="true"><p>body</p></pxl-collapsible>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector('button')!;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector(`#${trigger.getAttribute('aria-controls')}`)!.textContent).toBe('body');
    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelector('p')).toBeNull();
  });

  it('wires every instance to its own body', async () => {
    @Component({
      imports: [PixelCollapsible],
      template: `
        <pxl-collapsible label="One" defaultOpen>first</pxl-collapsible>
        <pxl-collapsible label="Two" defaultOpen>second</pxl-collapsible>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const [one, two] = Array.from(root.querySelectorAll('button'));
    expect(one!.getAttribute('aria-controls')).not.toBe(two!.getAttribute('aria-controls'));
    for (const [trigger, text] of [[one!, 'first'], [two!, 'second']] as const) {
      const body = root.querySelector(`#${trigger.getAttribute('aria-controls')}`)!;
      expect(body.textContent).toBe(text);
      expect(body.hasAttribute('aria-labelledby')).toBe(false);
    }
  });

  // Regression: the header was a small pxlButton with `px-1.5` added, and
  // Tailwind emits the button's own `px-3` after it, so it kept its padding.
  it('keeps its header compact, with no button size left over', async () => {
    @Component({ imports: [PixelCollapsible], template: '<pxl-collapsible label="Details" />' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const classes = (fixture.nativeElement as HTMLElement).querySelector('button')!.classList;
    expect(Array.from(classes)).toEqual(expect.arrayContaining(['px-1.5', 'py-0.5', 'text-xs']));
    expect(classes).not.toContain('px-3');
    expect(classes).not.toContain('h-8');
  });

  it('frames itself when bordered', async () => {
    @Component({
      imports: [PixelCollapsible],
      template: '<pxl-collapsible label="Details" bordered surface="linear" />',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('pxl-collapsible')!;
    expect(host.className).toContain('rounded-md');
    expect(host.className).toContain('border-retro-border');
    expect(host.querySelector('button')!.className).toContain('font-sans');
  });
});
