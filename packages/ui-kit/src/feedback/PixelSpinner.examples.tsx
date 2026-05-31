import React from 'react'
import { PixelSpinner } from './PixelSpinner'

export function Default() {
  return <PixelSpinner />
}

export function Sizes() {
  return (
    <div className="flex items-center gap-4">
      <PixelSpinner size="xs" />
      <PixelSpinner size="sm" />
      <PixelSpinner size="md" />
      <PixelSpinner size="lg" />
    </div>
  )
}

export function Tones() {
  return (
    <div className="flex items-center gap-4">
      <PixelSpinner tone="neutral" />
      <PixelSpinner tone="green" />
      <PixelSpinner tone="cyan" />
      <PixelSpinner tone="gold" />
      <PixelSpinner tone="red" />
      <PixelSpinner tone="purple" />
      <PixelSpinner tone="pink" />
    </div>
  )
}

export function PixelSurface() {
  return <PixelSpinner surface="pixel" size="lg" tone="cyan" />
}

export function Decorative() {
  return (
    <button type="button" aria-busy="true" className="inline-flex items-center gap-2">
      <PixelSpinner decorative size="sm" />
      <span>Saving…</span>
    </button>
  )
}
