import type { Meta, StoryObj } from '@storybook/react';
import { PxlKitLocaleProvider, TURKISH_CHARACTERS } from './locale';
import { PixelButton } from './actions';
import { PixelAvatar } from './data/PixelAvatar';
import { PixelSection } from './layout';

const SURFACES = ['pixel', 'linear'] as const;

const meta: Meta = {
  title: 'UI Kit / Locale',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<any>;

/**
 * PxlKitLocaleProvider — wires locale-aware uppercase behaviour for components
 * that internally use the .upper() helper (PixelAvatar initials, PixelSection
 * title, PixelModal title…).
 *
 * Default English consumption works WITHOUT wrapping in the provider — these
 * stories show both sides side-by-side so the Turkish difference (`i → İ`)
 * is obvious.
 */
export const EnglishVsTurkish: Story = {
  render: (args: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div className="space-y-4">
        <h3 className="font-pixel text-[10px] text-retro-cyan">English (default — no provider required)</h3>
        <PixelSection title="istanbul guide" subtitle="Default locale uppercases naively" surface={args.surface}>
          <p className="text-sm text-retro-muted">Initials and titles use <code className="text-retro-cyan">toUpperCase()</code> as-is.</p>
          <div className="mt-3 flex items-center gap-3">
            <PixelAvatar name="ismail çağlar" tone="green" surface={args.surface} />
            <PixelButton size="sm" surface={args.surface}>istanbul</PixelButton>
          </div>
        </PixelSection>
      </div>
      <div className="space-y-4">
        <h3 className="font-pixel text-[10px] text-retro-purple">Turkish (wrapped in provider)</h3>
        <PxlKitLocaleProvider locale="tr">
          <PixelSection title="istanbul guide" subtitle="Locale-aware uppercase — i → İ" surface={args.surface}>
            <p className="text-sm text-retro-muted">Initials and titles produce <code className="text-retro-cyan">İSTANBUL</code> with the correct dotted capital I.</p>
            <div className="mt-3 flex items-center gap-3">
              <PixelAvatar name="ismail çağlar" tone="purple" surface={args.surface} />
              <PixelButton size="sm" tone="purple" surface={args.surface}>istanbul</PixelButton>
            </div>
            <div className="mt-4 text-xs text-retro-muted">
              <p>Sample: <span className="text-retro-text">{TURKISH_CHARACTERS.sample}</span></p>
              <p>Pangram: <span className="text-retro-text">{TURKISH_CHARACTERS.pangram}</span></p>
            </div>
          </PixelSection>
        </PxlKitLocaleProvider>
      </div>
    </div>
  ),
  argTypes: { surface: { control: 'inline-radio', options: SURFACES } },
  args: { surface: 'pixel' as const },
};

export const PxlKitLocaleProviderStory: Story = {
  name: 'PxlKitLocaleProvider',
  render: (args: any) => (
    <PxlKitLocaleProvider locale={args.locale as 'en' | 'tr'}>
      <PixelSection title="istanbul" subtitle={`Active locale: ${args.locale}`} surface={args.surface}>
        <div className="flex items-center gap-3">
          <PixelAvatar name="ismail çağlar" tone="purple" surface={args.surface} />
          <PixelButton size="sm" tone="purple" surface={args.surface}>preview</PixelButton>
        </div>
      </PixelSection>
    </PxlKitLocaleProvider>
  ),
  argTypes: {
    locale: { control: 'inline-radio', options: ['en', 'tr'] },
    surface: { control: 'inline-radio', options: SURFACES },
  },
  args: { locale: 'tr' as const, surface: 'pixel' as const },
};
