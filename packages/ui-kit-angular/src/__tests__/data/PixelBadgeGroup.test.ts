/**
 * <pxl-badge-group> beyond the parity examples: the group role, and the
 * overflow popover following the items and `max`.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { PixelBadge, PixelBadgeGroup, PixelBadgeGroupItem } from '../../public-api';

const PARTS = [PixelBadge, PixelBadgeGroup, PixelBadgeGroupItem];
const panel = () => document.querySelector<HTMLElement>('[role="dialog"]');

async function render<T>(Host: Type<T>) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((done) => setTimeout(done, 0));
    await fixture.whenStable();
  };
  await settle();
  return { fixture, root: fixture.nativeElement as HTMLElement, host: fixture.componentInstance, settle };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('PixelBadgeGroup', () => {
  it('is a group only when named', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-badge-group data-testid="unnamed"><pxl-badge *pxlBadgeGroupItem>a</pxl-badge></pxl-badge-group>
        <pxl-badge-group data-testid="named" aria-labelledby="tags"><pxl-badge *pxlBadgeGroupItem>a</pxl-badge></pxl-badge-group>
      `,
    })
    class Host {}
    const { root } = await render(Host);
    expect(root.querySelector('[data-testid="unnamed"]')!.hasAttribute('role')).toBe(false);
    expect(root.querySelector('[data-testid="named"]')!.getAttribute('role')).toBe('group');
  });

  it('opens the badges beyond max in a popover from the "+N" button', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-badge-group [max]="2" surface="linear">
          <pxl-badge *pxlBadgeGroupItem>a</pxl-badge>
          <pxl-badge *pxlBadgeGroupItem>b</pxl-badge>
          <pxl-badge *pxlBadgeGroupItem>c</pxl-badge>
        </pxl-badge-group>
      `,
    })
    class Host {}
    const { root, settle } = await render(Host);
    const trigger = root.querySelector('button')!;
    expect(trigger.getAttribute('aria-label')).toBe('Show 2 more');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.textContent).toBe('+2');
    expect(root.textContent!.replace(/\s+/g, '')).toBe('a+2');

    trigger.click();
    await settle();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel()!.textContent!.replace(/\s+/g, '')).toBe('bc');
    expect(panel()!.className).toContain('rounded-xl');
    // The button names the popover, and controls it while it is open.
    expect(panel()!.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(trigger.getAttribute('aria-controls')).toBe(panel()!.id);
    trigger.click();
    await settle();
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
  });

  it('recounts the overflow as items and max change', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-badge-group [max]="max()">
          @for (tag of tags(); track tag) {
            <pxl-badge *pxlBadgeGroupItem>{{ tag }}</pxl-badge>
          }
        </pxl-badge-group>
      `,
    })
    class Host {
      readonly tags = signal(['a', 'b']);
      readonly max = signal(2);
    }
    const { root, host, settle } = await render(Host);
    expect(root.querySelector('button')).toBeNull();
    host.tags.set(['a', 'b', 'c', 'd']);
    await settle();
    expect(root.querySelector('button')!.textContent).toBe('+3');
    host.max.set(4);
    await settle();
    expect(root.querySelector('button')).toBeNull();
    expect(root.textContent!.replace(/\s+/g, '')).toBe('abcd');
  });
});
