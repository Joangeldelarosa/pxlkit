'use client';

import { PxlKitIcon } from '@pxlkit/core';
import {
  PixelBadge,
  PixelCodeInline,
  PixelDivider,
  PixelMouseParallax,
  PixelParallaxGroup,
  PixelParallaxLayer,
} from '@pxlkit/ui-kit';
import { Crown, Star, Trophy } from '@pxlkit/gamification';
import { CompLink, DocSection, type PropDef } from './_doc-section';

const PROP_CLASSNAME: PropDef = {
  name: 'className',
  type: 'string',
  default: '—',
  description: 'Extra CSS class names merged onto the outermost element.',
};
const PROP_STYLE: PropDef = {
  name: 'style',
  type: 'CSSProperties',
  default: '—',
  description: 'Inline styles forwarded to the outer element.',
};
const PROP_CHILDREN_REQUIRED: PropDef = {
  name: 'children',
  type: 'ReactNode',
  default: '—',
  description: 'Required — the content rendered inside the component.',
};
const COMMON_PARALLAX: PropDef[] = [PROP_CLASSNAME, PROP_STYLE, PROP_CHILDREN_REQUIRED];

export default function ParallaxDemos() {
  return (
    <>
      <PixelDivider label="Parallax" tone="gold" spacing="lg" />

      {/* ══════════════════ PIXELPARALLAXLAYER ══════════════════ */}
      <DocSection
        id="pixel-parallax-layer"
        title="PixelParallaxLayer"
        description={<>Scroll-based parallax layer. Translates children along Y (or X) proportionally to scroll position. Use <PixelCodeInline>speed</PixelCodeInline> to control the multiplier — 0 = static, 0.5 = half speed (far background), negative = reverse direction. GPU-composited via <PixelCodeInline>translate3d</PixelCodeInline>. Wrap inside <CompLink id="pixel-parallax-group">PixelParallaxGroup</CompLink> for clipped layouts.</>}
        props={[
          { name: 'speed', type: 'number', default: '0.5', description: 'Parallax multiplier. 0 = no movement, 1 = full scroll speed, negative = reverse.' },
          { name: 'axis', type: '"x" | "y" | "both"', default: '"y"', description: 'Which axis to translate on.' },
          { name: 'className', type: 'string', default: '—', description: 'Extra class names on wrapper div.' },
          { name: 'style', type: 'CSSProperties', default: '—', description: 'Inline styles on wrapper div.' },
          ...COMMON_PARALLAX,
        ]}
        code={`<PixelParallaxGroup className="h-[400px]">
  {/* Slow background layer */}
  <PixelParallaxLayer speed={0.3} className="absolute inset-0">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/bg-stars.png" alt="" className="w-full h-full object-cover" />
  </PixelParallaxLayer>

  {/* Foreground content */}
  <PixelParallaxLayer speed={-0.1}>
    <PixelCard title="Floating Card">I move slightly opposite to scroll</PixelCard>
  </PixelParallaxLayer>
</PixelParallaxGroup>`}
      >
        <div className="space-y-3">
          <p className="text-sm text-retro-muted">Scroll the page to see the parallax effect on these layers:</p>
          <div className="relative h-48 rounded-lg overflow-hidden border border-retro-border/30 bg-retro-bg/50">
            <PixelParallaxLayer speed={0.15} className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="grid grid-cols-8 gap-4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <PxlKitIcon key={i} icon={Star} size={20} />
                ))}
              </div>
            </PixelParallaxLayer>
            <PixelParallaxLayer speed={-0.08} className="absolute inset-0 flex items-center justify-center">
              <PixelBadge tone="gold">speed: -0.08 (floats up)</PixelBadge>
            </PixelParallaxLayer>
          </div>
        </div>
      </DocSection>

      {/* ══════════════════ PIXELPARALLAXGROUP ══════════════════ */}
      <DocSection
        id="pixel-parallax-group"
        title="PixelParallaxGroup"
        description={<>Container that establishes a clipped viewport area for parallax layers. Applies <PixelCodeInline>overflow: hidden</PixelCodeInline> and <PixelCodeInline>position: relative</PixelCodeInline> automatically. Wrap <CompLink id="pixel-parallax-layer">PixelParallaxLayer</CompLink> and <CompLink id="pixel-mouse-parallax">PixelMouseParallax</CompLink> elements inside.</>}
        props={[
          { name: 'as', type: '"div" | "section" | "header" | "main"', default: '"div"', description: 'HTML tag to render.' },
          { name: 'className', type: 'string', default: '—', description: 'Extra class names.' },
          { name: 'style', type: 'CSSProperties', default: '—', description: 'Inline styles.' },
          ...COMMON_PARALLAX,
        ]}
        code={`<PixelParallaxGroup as="section" className="h-[600px] bg-retro-bg">
  <PixelParallaxLayer speed={0.2}>
    {/* Background */}
  </PixelParallaxLayer>
  <PixelMouseParallax strength={15}>
    {/* Foreground that follows cursor */}
  </PixelMouseParallax>
</PixelParallaxGroup>`}
      >
        <PixelParallaxGroup className="h-40 rounded-lg border border-retro-border/30 bg-retro-bg/50">
          <PixelParallaxLayer speed={0.12} className="absolute inset-0 flex items-center justify-center opacity-15">
            <div className="font-pixel text-[80px] text-retro-green/20 select-none">BG</div>
          </PixelParallaxLayer>
          <div className="absolute inset-0 flex items-center justify-center">
            <PixelBadge tone="green">Clipped parallax group</PixelBadge>
          </div>
        </PixelParallaxGroup>
      </DocSection>

      {/* ══════════════════ PIXELMOUSEPARALLAX ══════════════════ */}
      <DocSection
        id="pixel-mouse-parallax"
        title="PixelMouseParallax"
        description={<>Cursor-tracking parallax. Translates children based on mouse position relative to the nearest parent container. Use <PixelCodeInline>strength</PixelCodeInline> to control max travel distance in px. Set <PixelCodeInline>invert</PixelCodeInline> to move away from cursor. Perfect for floating elements, hero backgrounds, and interactive depth effects.</>}
        props={[
          { name: 'strength', type: 'number', default: '20', description: 'Max travel distance in px.' },
          { name: 'invert', type: 'boolean', default: 'false', description: 'If true, moves away from cursor instead of towards.' },
          { name: 'className', type: 'string', default: '—', description: 'Extra class names.' },
          { name: 'style', type: 'CSSProperties', default: '—', description: 'Inline styles.' },
          ...COMMON_PARALLAX,
        ]}
        code={`{/* Follows cursor */}
<PixelMouseParallax strength={15}>
  <PxlKitIcon icon={Star} size={32} />
</PixelMouseParallax>

{/* Moves away from cursor (depth feel) */}
<PixelMouseParallax strength={25} invert>
  <PixelBadge tone="cyan">Background layer</PixelBadge>
</PixelMouseParallax>`}
      >
        <div className="space-y-3">
          <p className="text-sm text-retro-muted">Move your mouse over this area:</p>
          <div className="relative h-48 rounded-lg border border-retro-border/30 bg-retro-bg/50 flex items-center justify-center gap-8">
            <PixelMouseParallax strength={12}>
              <div className="text-center">
                <PxlKitIcon icon={Trophy} size={36} />
                <p className="font-mono text-[9px] text-retro-muted mt-1">follows (12px)</p>
              </div>
            </PixelMouseParallax>
            <PixelMouseParallax strength={25} invert>
              <div className="text-center">
                <PxlKitIcon icon={Crown} size={36} />
                <p className="font-mono text-[9px] text-retro-muted mt-1">inverted (25px)</p>
              </div>
            </PixelMouseParallax>
            <PixelMouseParallax strength={8}>
              <div className="text-center">
                <PxlKitIcon icon={Star} size={36} />
                <p className="font-mono text-[9px] text-retro-muted mt-1">subtle (8px)</p>
              </div>
            </PixelMouseParallax>
          </div>
        </div>
      </DocSection>
    </>
  );
}
