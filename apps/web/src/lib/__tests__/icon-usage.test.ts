import { describe, expect, it } from 'vitest';
import type { IconPack } from '@pxlkit/core';
import * as effects from '@pxlkit/effects';
import * as feedback from '@pxlkit/feedback';
import * as gamification from '@pxlkit/gamification';
import * as social from '@pxlkit/social';
import * as ui from '@pxlkit/ui';
import * as weather from '@pxlkit/weather';
import { iconExportName, iconUsage } from '../icon-usage';

const PACKS: Array<[IconPack, Record<string, unknown>]> = [
  [gamification.GamificationPack, gamification],
  [feedback.FeedbackPack, feedback],
  [social.SocialPack, social],
  [weather.WeatherPack, weather],
  [ui.UiPack, ui],
  [effects.EffectsPack, effects],
];

describe('iconUsage', () => {
  it('imports every icon by the name its pack exports it under', () => {
    for (const [pack, exports] of PACKS) {
      for (const icon of pack.icons) {
        expect(exports[iconExportName(icon.name)], `${pack.id}/${icon.name}`).toBe(icon);
      }
    }
  });

  it('renders a static icon with each framework’s icon component', () => {
    const code = iconUsage(gamification.Trophy);
    expect(code.react).toBe(
      ["import { PxlKitIcon } from '@pxlkit/core';", "import { Trophy } from '@pxlkit/gamification';", '', '<PxlKitIcon icon={Trophy} size={32} />'].join('\n'),
    );
    expect(code.vue).toContain("import { PxlKitIcon } from '@pxlkit/vue';");
    expect(code.vue).toContain('<PxlKitIcon :icon="Trophy" :size="32" />');
    expect(code.angular).toContain("import { PxlKitIcon } from '@pxlkit/angular';");
    expect(code.angular).toContain('imports: [PxlKitIcon],');
    expect(code.angular).toContain('template: `<pxl-icon [icon]="trophy" [size]="32" />`,');
    expect(code.angular).toContain('export class TrophyIcon {\n  protected readonly trophy = Trophy;\n}');
  });

  it('renders an animated icon with the animated components', () => {
    const animated = gamification.GamificationPack.icons.find((icon) => 'frames' in icon)!;
    const name = iconExportName(animated.name);
    const field = name.charAt(0).toLowerCase() + name.slice(1);
    const code = iconUsage(animated);
    expect(code.react).toContain(`<AnimatedPxlKitIcon icon={${name}} size={32} />`);
    expect(code.vue).toContain(`<AnimatedPxlKitIcon :icon="${name}" :size="32" />`);
    expect(code.angular).toContain(`selector: 'app-${animated.name}',`);
    expect(code.angular).toContain(`<pxl-animated-icon [icon]="${field}" [size]="32" />`);
  });
});
