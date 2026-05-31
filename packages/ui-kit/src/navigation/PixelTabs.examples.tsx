import { useState } from 'react';
import { PixelTabs } from '../navigation';
import type { TabItem } from '../common';

const ITEMS: TabItem[] = [
  { id: 'overview', label: 'Overview', content: <p>High-level summary of the project.</p> },
  { id: 'activity', label: 'Activity', content: <p>Recent events and commits.</p> },
  { id: 'settings', label: 'Settings', content: <p>Configuration for this workspace.</p> },
];

export function Default() {
  return <PixelTabs items={ITEMS} defaultTab="overview" />;
}

export function Controlled() {
  const [active, setActive] = useState('activity');
  return (
    <div className="space-y-2">
      <PixelTabs items={ITEMS} value={active} onChange={setActive} />
      <p className="text-xs text-retro-muted">Active tab: {active}</p>
    </div>
  );
}

export function Vertical() {
  return <PixelTabs items={ITEMS} defaultTab="overview" orientation="vertical" />;
}

export function ManualActivation() {
  return (
    <PixelTabs
      items={ITEMS}
      defaultTab="overview"
      activationMode="manual"
      ariaLabel="Manual activation tabs"
    />
  );
}

export function Surfaces() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <PixelTabs items={ITEMS} defaultTab="overview" surface="pixel" ariaLabel="Pixel tabs" />
      <PixelTabs items={ITEMS} defaultTab="overview" surface="linear" ariaLabel="Linear tabs" />
    </div>
  );
}

const MANY: TabItem[] = Array.from({ length: 9 }, (_, i) => ({
  id: `tab-${i + 1}`,
  label: `Section ${i + 1}`,
  content: <p>Contents of section {i + 1}.</p>,
}));

export function Scrollable() {
  return (
    <div className="max-w-sm">
      <PixelTabs items={MANY} defaultTab="tab-1" scrollable ariaLabel="Scrollable tabs" />
    </div>
  );
}

export function KeepMounted() {
  return (
    <PixelTabs
      items={ITEMS}
      defaultTab="overview"
      keepMounted
      ariaLabel="Persistent panels"
    />
  );
}

export function Compositional() {
  return (
    <PixelTabs defaultTab="one">
      <PixelTabs.List ariaLabel="Compositional tabs">
        <PixelTabs.Trigger value="one">One</PixelTabs.Trigger>
        <PixelTabs.Trigger value="two">Two</PixelTabs.Trigger>
        <PixelTabs.Trigger value="three">Three</PixelTabs.Trigger>
      </PixelTabs.List>
      <PixelTabs.Panel value="one">First panel.</PixelTabs.Panel>
      <PixelTabs.Panel value="two">Second panel.</PixelTabs.Panel>
      <PixelTabs.Panel value="three">Third panel.</PixelTabs.Panel>
    </PixelTabs>
  );
}
