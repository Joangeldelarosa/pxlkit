import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PxlKitSurfaceProvider, type Surface } from './common';
import { PixelButton, PxlKitButton } from './actions';
import { PixelInput } from './forms/PixelInput';
import { PixelCheckbox } from './forms/PixelCheckbox';
import { PixelSwitch } from './forms/PixelSwitch';
import { PixelSlider } from './forms/PixelSlider';
import { PixelSegmented } from './forms/PixelSegmented';
import { PixelCard, PixelStatCard, PixelBadge, PixelChip, PixelKbd, PixelCodeInline } from './data-display';
import { PixelAlert, PixelProgress } from './feedback';
import { PixelTabs } from './navigation';
import { PixelDivider, PixelSection } from './layout';

const meta: Meta = {
  title: 'Foundations / Surface',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

const PlayIcon = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" shapeRendering="crispEdges">
    <rect x="3" y="2" width="2" height="8" />
    <rect x="5" y="3" width="2" height="6" />
    <rect x="7" y="4" width="2" height="4" />
  </svg>
);

function ComponentZoo({ surface }: { surface: Surface }) {
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);
  const [vol, setVol] = useState(60);
  const [seg, setSeg] = useState('grid');
  return (
    <PxlKitSurfaceProvider surface={surface}>
      <div className="space-y-6">
        <PixelSection title={`Surface = "${surface}"`} subtitle="Every component inside this provider follows the chosen aesthetic.">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <PixelButton tone="green" iconLeft={PlayIcon}>Start render</PixelButton>
              <PixelButton tone="cyan" variant="ghost">Ghost</PixelButton>
              <PixelButton tone="red" loading>Working</PixelButton>
              <PxlKitButton label="Play" icon={PlayIcon} tone="gold" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <PixelStatCard label="Components" value="54" tone="green" trend="+12 this release" />
              <PixelStatCard label="Icons" value="226+" tone="gold" />
              <PixelStatCard label="Templates" value="29" tone="purple" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PixelInput label="Username" defaultValue="pixel-hero" hint="Your retro alias" />
              <PixelInput label="Email" type="email" placeholder="info@pxlkit.xyz" tone="cyan" error="Invalid email" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <PixelCheckbox label="Enable animations" checked={checked} onChange={setChecked} />
              <PixelSwitch label="Auto-refresh" checked={switched} onChange={setSwitched} tone="cyan" />
              <PixelBadge tone="green">stable</PixelBadge>
              <PixelBadge tone="pink">hot</PixelBadge>
              <PixelChip label="React" tone="cyan" />
              <PixelChip label="Tailwind" tone="green" onRemove={() => {}} />
            </div>

            <PixelSlider label="Volume" value={vol} onChange={setVol} tone="gold" showMinMax />

            <PixelSegmented
              label="Layout"
              value={seg}
              onChange={setSeg}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
                { value: 'kanban', label: 'Kanban' },
              ]}
            />

            <PixelProgress value={68} label="Generating chunks" tone="green" />

            <PixelTabs
              items={[
                { id: 'overview', label: 'Overview', content: <p className="text-sm text-retro-muted">Pxlkit ships 54 components with switchable surface.</p> },
                { id: 'usage', label: 'Usage', content: <p className="text-sm text-retro-muted">Wrap children in <PixelCodeInline>{'<PxlKitSurfaceProvider surface="linear">'}</PixelCodeInline> to flip aesthetics.</p> },
              ]}
            />

            <PixelAlert tone="cyan" title="Ready to ship" message="Both surfaces share the same API — only the look changes." />

            <PixelDivider label="THEME TOKENS" tone="purple" />

            <PixelCard title="PixelCard">
              <p>The same card auto-styles to match the active surface. Press <PixelKbd>S</PixelKbd> to flip.</p>
            </PixelCard>
          </div>
        </PixelSection>
      </div>
    </PxlKitSurfaceProvider>
  );
}

/** Both surfaces side by side — see them swap aesthetics instantly. */
export const SideBySide: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl">
      <ComponentZoo surface="pixel" />
      <ComponentZoo surface="linear" />
    </div>
  ),
};

/** Pixel — the default chunky retro look. */
export const PixelOnly: Story = {
  render: () => <ComponentZoo surface="pixel" />,
};

/** Linear — softer modern aesthetic with the same API. */
export const LinearOnly: Story = {
  render: () => <ComponentZoo surface="linear" />,
};
