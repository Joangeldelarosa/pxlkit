import React from 'react'
import { PixelPortal } from './PixelPortal'

export function Default() {
  return (
    <PixelPortal>
      <div>Portaled content (renders into document.body after mount)</div>
    </PixelPortal>
  )
}

export function Disabled() {
  return (
    <PixelPortal disabled>
      <div>Rendered inline — portal disabled</div>
    </PixelPortal>
  )
}
