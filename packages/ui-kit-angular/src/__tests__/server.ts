/**
 * Server-rendering an Angular example the way an application does it:
 * `renderApplication` from @angular/platform-server, zoneless.
 */
import { NgComponentOutlet } from '@angular/common';
import { Component, provideZonelessChangeDetection, type Type } from '@angular/core';
import { bootstrapApplication, provideClientHydration, type BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';

/** The root tag every example page is rendered into. */
export const ROOT_TAG = 'parity-root';
export const PAGE = `<!doctype html><html><head></head><body><${ROOT_TAG}></${ROOT_TAG}></body></html>`;

/** A root component rendering `Example` — examples have no selector of their own. */
export function rootFor(Example: Type<unknown>): Type<unknown> {
  @Component({
    selector: ROOT_TAG,
    imports: [NgComponentOutlet],
    template: '<ng-container [ngComponentOutlet]="example" />',
  })
  class ParityRoot {
    readonly example = Example;
  }
  return ParityRoot;
}

/** The full server-rendered page of an example (with hydration annotations when asked). */
export function angularServerPage(Example: Type<unknown>, { hydration = false } = {}): Promise<string> {
  const Root = rootFor(Example);
  return renderApplication(
    (context: BootstrapContext) =>
      bootstrapApplication(
        Root,
        {
          providers: [
            provideServerRendering(),
            provideZonelessChangeDetection(),
            ...(hydration ? [provideClientHydration()] : []),
          ],
        },
        context,
      ),
    { document: PAGE, url: 'http://localhost/', allowedHosts: ['localhost'] },
  );
}
