import React from 'react';
import { PxlKitLocaleProvider } from './PxlKitLocaleProvider';

export function Default() {
  return (
    <PxlKitLocaleProvider locale="en">
      <p>Hello, world!</p>
    </PxlKitLocaleProvider>
  );
}

export function Turkish() {
  return (
    <PxlKitLocaleProvider locale="tr">
      <p>İstanbul güneşli bir şehirdir</p>
    </PxlKitLocaleProvider>
  );
}
