/**
 * <pxl-skeleton>: its label, and the classes, attributes and style bindings
 * set on the host. Rendering is covered against React by the parity suite.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelSkeleton } from '../../public-api';

describe('PixelSkeleton', () => {
  it('is a status named "Loading" or by its label, keeping classes, attributes and style bindings set on it', () => {
    @Component({
      imports: [PixelSkeleton],
      template: `
        <pxl-skeleton id="default" />
        <pxl-skeleton
          id="custom"
          width="50%"
          ariaLabel="Loading avatar"
          class="custom"
          data-testid="skeleton"
          [style.width]="'10rem'"
          [style.opacity]="0.5"
          rounded
          surface="linear"
        />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const plain = root.querySelector<HTMLElement>('#default')!;
    expect(plain.getAttribute('role')).toBe('status');
    expect(plain.getAttribute('aria-label')).toBe('Loading');
    expect(plain.style.height).toBe('1rem');
    const custom = root.querySelector<HTMLElement>('#custom')!;
    expect(custom.getAttribute('aria-label')).toBe('Loading avatar');
    expect([custom.style.width, custom.style.height, custom.style.opacity]).toEqual(['10rem', '1rem', '0.5']);
    expect(custom.classList).toContain('custom');
    expect(custom.classList).toContain('rounded-full');
    expect(custom.getAttribute('data-testid')).toBe('skeleton');
  });
});
