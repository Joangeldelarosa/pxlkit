/**
 * <pxl-empty-state>: the title heading, kept off the host, and the icon /
 * action inputs. Rendering is covered against React by the parity suite.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelEmptyState } from '../../public-api';

describe('PixelEmptyState', () => {
  it('titles the placeholder with a heading, hides the icon from assistive tech and renders the action', () => {
    @Component({
      imports: [PixelEmptyState],
      template: `
        <pxl-empty-state id="full" title="No results" description="Try another search." [icon]="icon" [action]="create" />
        <pxl-empty-state id="bare" title="t" description="d" />
        <ng-template #icon><svg data-testid="icon"></svg></ng-template>
        <ng-template #create><button type="button">Create</button></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const full = root.querySelector('#full')!;
    expect(full.querySelector('h4')!.textContent).toBe('No results');
    expect(full.querySelector('p')!.textContent).toBe('Try another search.');
    expect(full.hasAttribute('title')).toBe(false);
    expect(full.querySelector('[aria-hidden="true"] [data-testid="icon"]')).not.toBeNull();
    expect(full.querySelector('.mt-5 button')!.textContent).toBe('Create');
    expect(root.querySelector('#bare .mt-5')).toBeNull();
    expect(root.querySelector('#bare [aria-hidden]')).toBeNull();
  });
});
