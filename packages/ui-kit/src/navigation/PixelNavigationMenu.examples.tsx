import React from 'react'
import { PixelNavigationMenu } from './PixelNavigationMenu'

export function Default() {
  return (
    <PixelNavigationMenu
      items={[
        { label: 'Home', href: '#home' },
        {
          label: 'Products',
          content: (
            <div className="grid gap-2 text-sm text-retro-text">
              <a href="#analytics" className="hover:underline">Analytics</a>
              <a href="#dashboard" className="hover:underline">Dashboard</a>
              <a href="#reports" className="hover:underline">Reports</a>
            </div>
          ),
        },
        { label: 'Docs', href: '#docs' },
        { label: 'Pricing', href: '#pricing' },
      ]}
    />
  )
}

export function Vertical() {
  return (
    <PixelNavigationMenu
      orientation="vertical"
      items={[
        { label: 'Overview', href: '#overview' },
        { label: 'Settings', href: '#settings' },
        { label: 'Billing', href: '#billing' },
      ]}
    />
  )
}

export function InlinePanels() {
  return (
    <PixelNavigationMenu
      viewport={false}
      items={[
        { label: 'Home', href: '#home' },
        {
          label: 'Resources',
          content: (
            <div className="grid gap-2 text-sm text-retro-text">
              <a href="#guides" className="hover:underline">Guides</a>
              <a href="#api" className="hover:underline">API Reference</a>
            </div>
          ),
        },
      ]}
    />
  )
}
