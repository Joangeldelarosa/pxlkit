/**
 * <pxl-stat-group> beyond the parity examples: the group role that comes
 * with a name, and attribute inputs.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelStatGroup } from '../../public-api';

describe('PixelStatGroup', () => {
  it('is a group once it is named, and keeps a role of its own', async () => {
    @Component({
      imports: [PixelStatGroup],
      template: `
        <pxl-stat-group></pxl-stat-group>
        <pxl-stat-group aria-label="Metrics"></pxl-stat-group>
        <pxl-stat-group aria-labelledby="heading"></pxl-stat-group>
        <pxl-stat-group aria-label="Metrics" role="list"></pxl-stat-group>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const roles = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('pxl-stat-group'), (group) =>
      group.getAttribute('role'),
    );
    expect(roles).toEqual([null, 'group', 'group', 'list']);
  });

  it('reads its columns and gap from attributes, folding unknown counts to 3', async () => {
    @Component({
      imports: [PixelStatGroup],
      template: '<pxl-stat-group layout="grid" columns="5" gap="2"></pxl-stat-group><pxl-stat-group layout="grid" columns="12"></pxl-stat-group>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [five, twelve] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('pxl-stat-group'));
    expect(Array.from(five!.classList)).toEqual(expect.arrayContaining(['grid', 'grid-cols-2', 'sm:grid-cols-5', 'gap-2']));
    expect(Array.from(twelve!.classList)).toEqual(expect.arrayContaining(['grid-cols-1', 'sm:grid-cols-3']));
    expect(Array.from(twelve!.classList).some((name) => name.startsWith('gap-'))).toBe(false);
  });
});
