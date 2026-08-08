import { describe, expect, it } from 'vitest';
import { renderDiversityMenu } from '../skill-refs/diversity';

const manifests = [
  { name: 'PixelButton', category: 'actions' },
  { name: 'PixelTimeline', category: 'data' },
] as never[];

const templates = {
  'landing-full-template.tsx': `import { PixelButton } from '@pxlkit/ui-kit';`,
};

describe('renderDiversityMenu', () => {
  it('marks a component absent from every template as underused', () => {
    const out = renderDiversityMenu(manifests, templates, '2.1.1');
    expect(out).toMatch(/PixelTimeline.*\[underused\]/);
  });

  it('does not mark a component that templates already use', () => {
    const out = renderDiversityMenu(manifests, templates, '2.1.1');
    expect(out).not.toMatch(/PixelButton.*\[underused\]/);
  });
});
