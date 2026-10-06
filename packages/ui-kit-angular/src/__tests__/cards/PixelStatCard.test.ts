/**
 * <pxl-stat-card> beyond the parity examples: where each icon position puts
 * the icon (text or a template), the trend line, and attribute inputs.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelStatCard, type PixelStatCardIconPosition } from '../../public-api';

describe('PixelStatCard', () => {
  it('puts the icon beside the label on top, after or before the text, or in the bottom-left corner', async () => {
    @Component({
      imports: [PixelStatCard],
      template: `
        <pxl-stat-card label="Users" value="12" [icon]="icon" [iconPosition]="position()" />
        <ng-template #icon><i>icon</i></ng-template>
      `,
    })
    class Host {
      readonly position = signal<PixelStatCardIconPosition>('top');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const card = (fixture.nativeElement as HTMLElement).querySelector('pxl-stat-card')!;
    expect(card.firstElementChild!.lastElementChild!.textContent).toBe('icon');

    fixture.componentInstance.position.set('right');
    await fixture.whenStable();
    expect(card.lastElementChild!.textContent).toBe('icon');
    expect(card.querySelector('.min-w-0')!.textContent).toBe('Users12');

    fixture.componentInstance.position.set('left');
    await fixture.whenStable();
    expect(card.firstElementChild!.textContent).toBe('icon');

    fixture.componentInstance.position.set('bottom-left');
    await fixture.whenStable();
    const corner = card.lastElementChild!;
    expect(corner.textContent).toBe('icon');
    expect(Array.from(corner.classList)).toEqual(expect.arrayContaining(['absolute', 'bottom-0', 'left-0', 'p-4']));
  });

  it('renders the trend line only with a trend, a text icon, and attribute inputs', async () => {
    @Component({
      imports: [PixelStatCard],
      template: `
        <pxl-stat-card label="Users" value="12" />
        <pxl-stat-card label="Uptime" value="99%" trend="+1%" icon="▲" size="lg" tone="green" valueTone align="center" />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [plain, uptime] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('pxl-stat-card'));
    expect(Array.from(plain!.querySelectorAll('p'), (p) => p.textContent)).toEqual(['Users', '12']);
    expect(plain!.querySelector('span')).toBeNull();
    expect(Array.from(uptime!.querySelectorAll('p'), (p) => p.textContent)).toEqual(['Uptime', '99%', '+1%']);
    expect(uptime!.querySelector('span')!.textContent).toBe('▲');
    expect(Array.from(uptime!.classList)).toEqual(expect.arrayContaining(['p-6', 'text-center']));
    expect(uptime!.querySelectorAll('p')[1]!.classList.contains('text-retro-green')).toBe(true);
  });
});
