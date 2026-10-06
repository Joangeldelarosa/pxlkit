'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

const subscribeNever = () => () => {};
const inBrowser = () => true;
const onServer = () => false;

/**
 * Renders `children` in the browser only. The server, and the render that
 * hydrates its markup, show `fallback` — give it the size of the children so
 * nothing shifts when they replace it. A client-side mount renders the
 * children at once.
 *
 * For demos whose markup depends on the reader's clock, such as a calendar of
 * the current month: a page built on one day and read on another would
 * otherwise fail to hydrate.
 */
export function ClientOnly({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const browser = useSyncExternalStore(subscribeNever, inBrowser, onServer);
  return <>{browser ? children : fallback}</>;
}
