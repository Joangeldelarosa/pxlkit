/**
 * <pxl-avatar-group> beyond the parity examples: the group role, and a row
 * that follows its items and `max`.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelAvatar, PixelAvatarGroup, PixelAvatarGroupItem } from '../../public-api';

const PARTS = [PixelAvatar, PixelAvatarGroup, PixelAvatarGroupItem];

describe('PixelAvatarGroup', () => {
  it('is a group only when named, and keeps an own role', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-avatar-group data-testid="unnamed"><pxl-avatar *pxlAvatarGroupItem name="Ana" /></pxl-avatar-group>
        <pxl-avatar-group data-testid="labelled" aria-labelledby="team"><pxl-avatar *pxlAvatarGroupItem name="Ana" /></pxl-avatar-group>
        <pxl-avatar-group data-testid="own" aria-label="Team" role="list"><pxl-avatar *pxlAvatarGroupItem name="Ana" /></pxl-avatar-group>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const group = (id: string) => (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${id}"]`)!;
    expect(group('unnamed').hasAttribute('role')).toBe(false);
    expect(group('labelled').getAttribute('role')).toBe('group');
    expect(group('own').getAttribute('role')).toBe('list');
  });

  it('recounts the "+N" tile as items and max change', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-avatar-group [max]="max()">
          @for (name of names(); track name) {
            <pxl-avatar *pxlAvatarGroupItem [name]="name" />
          }
        </pxl-avatar-group>
      `,
    })
    class Host {
      readonly names = signal(['Ana', 'Bob', 'Cy']);
      readonly max = signal(3);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const said = () => root.querySelector('.sr-only')?.textContent;
    const shown = () => root.querySelector('.sr-only')!.parentElement!.querySelector('[aria-hidden="true"]')!.textContent;
    expect(said()).toBeUndefined();
    expect(root.querySelectorAll('[data-shape]')).toHaveLength(3);

    fixture.componentInstance.names.update((names) => [...names, 'Dee']);
    await fixture.whenStable();
    expect(said()).toBe('2 more users');
    expect(shown()).toBe('+2');
    expect(root.querySelectorAll('[data-shape]')).toHaveLength(2);

    fixture.componentInstance.max.set(1);
    await fixture.whenStable();
    expect(said()).toBe('4 more users');
    expect(shown()).toBe('+4');
    expect(root.querySelector('.sr-only')!.parentElement!.hasAttribute('aria-label')).toBe(false);
    expect(root.querySelectorAll('[data-shape]')).toHaveLength(0);
  });
});
