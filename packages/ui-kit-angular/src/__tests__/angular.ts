/**
 * Mounting Angular examples the way the parity harness mounts React ones.
 */
import type { Type } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import type { Mounted } from '../../../../scripts/parity/react';

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise((done) => setTimeout(done, 0));
  fixture.detectChanges();
  await fixture.whenStable();
}

/** Mount an Angular example (in the current TestBed) into the document. */
export async function mountAngular(Example: Type<unknown>): Promise<Mounted> {
  const fixture = TestBed.createComponent(Example);
  const host = fixture.nativeElement as HTMLElement;
  // The example's host stands for React's mount container.
  host.setAttribute('data-parity-root', '');
  await settle(fixture);
  return {
    container: host,
    flush: () => settle(fixture),
    unmount: async () => {
      fixture.destroy();
      host.remove();
    },
  };
}
