/**
 * <pxl-color-swatch> follows its inputs.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelColorSwatch } from '../../public-api';

describe('PixelColorSwatch', () => {
  it('fills the sample from the variable and follows changes to it', async () => {
    @Component({ imports: [PixelColorSwatch], template: '<pxl-color-swatch [name]="name()" [cssVar]="cssVar()" />' })
    class Host {
      readonly name = signal('Gold');
      readonly cssVar = signal('--retro-gold');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const sample = () => root.querySelector<HTMLElement>('.h-8')!;
    expect(sample().style.backgroundColor).toBe('var(--retro-gold)');
    fixture.componentInstance.name.set('Cyan');
    fixture.componentInstance.cssVar.set('--retro-cyan');
    await fixture.whenStable();
    expect(sample().style.backgroundColor).toBe('var(--retro-cyan)');
    expect(root.textContent!.replace(/\s+/g, '')).toBe('Cyan--retro-cyan');
  });
});
