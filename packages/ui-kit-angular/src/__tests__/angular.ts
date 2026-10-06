/**
 * Mounting Angular examples the way the parity harness mounts React ones.
 */
import type { Type } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { elapse } from '../../../../scripts/parity/clock';
import type { Mounted } from '../../../../scripts/parity/react';

/**
 * Waits for the application to be stable. On simulated time, change
 * detection that Angular scheduled on a timer runs only as the clock moves:
 * run what is due until nothing is pending.
 */
async function stable(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let round = 0; round < 100 && !fixture.isStable(); round++) await elapse(0);
  await fixture.whenStable();
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await stable(fixture);
  await elapse(0);
  fixture.detectChanges();
  await stable(fixture);
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
