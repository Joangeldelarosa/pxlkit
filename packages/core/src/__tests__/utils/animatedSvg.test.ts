import { describe, it, expect } from 'vitest';
import { generateAnimatedSvg, animatedToFrameIcons } from '../../utils/animatedSvg';
import { testAnimatedIcon } from '../fixtures';

describe('generateAnimatedSvg', () => {
  it('returns an SVG string', () => {
    const svg = generateAnimatedSvg(testAnimatedIcon);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('contains <style> with CSS keyframes', () => {
    const svg = generateAnimatedSvg(testAnimatedIcon);
    expect(svg).toContain('<style>');
    expect(svg).toContain('@keyframes pxf');
  });

  it('contains frame class styles .f0, .f1', () => {
    const svg = generateAnimatedSvg(testAnimatedIcon);
    expect(svg).toContain('.f0{');
    expect(svg).toContain('.f1{');
  });

  it('wraps each frame in a <g class="fN"> element', () => {
    const svg = generateAnimatedSvg(testAnimatedIcon);
    expect(svg).toContain('<g class="f0">');
    expect(svg).toContain('<g class="f1">');
  });

  it('returns empty string for empty frames array', () => {
    const emptyAnimated = { ...testAnimatedIcon, frames: [] };
    expect(generateAnimatedSvg(emptyAnimated)).toBe('');
  });

  it('uses colorful mode by default (pixel colors)', () => {
    const svg = generateAnimatedSvg(testAnimatedIcon, { colorful: true });
    expect(svg).toContain('fill="#FF0000"');
  });

  it('uses monoColor in monochrome mode', () => {
    const svg = generateAnimatedSvg(testAnimatedIcon, {
      colorful: false,
      monoColor: '#FFFFFF',
    });
    expect(svg).toContain('fill="#FFFFFF"');
    expect(svg).not.toContain('fill="#FF0000"');
  });

  it('includes XML declaration when xmlDeclaration is true', () => {
    const svg = generateAnimatedSvg(testAnimatedIcon, {
      xmlDeclaration: true,
    });
    expect(svg).toMatch(/^<\?xml/);
  });

  it('uses "infinite" in loop animation', () => {
    const svg = generateAnimatedSvg({ ...testAnimatedIcon, loop: true });
    expect(svg).toContain('infinite');
  });

  it('uses "1" (not infinite) when loop is false', () => {
    const svg = generateAnimatedSvg({ ...testAnimatedIcon, loop: false });
    // The animation-iteration-count should be 1, not infinite
    expect(svg).not.toContain('infinite');
  });

  it('contains shape-rendering="crispEdges"', () => {
    const svg = generateAnimatedSvg(testAnimatedIcon);
    expect(svg).toContain('shape-rendering="crispEdges"');
  });
});

describe('animatedToFrameIcons', () => {
  it('returns array with length equal to frames count', () => {
    const frames = animatedToFrameIcons(testAnimatedIcon);
    expect(frames).toHaveLength(testAnimatedIcon.frames.length);
  });

  it('names frames as iconname-frame-N', () => {
    const frames = animatedToFrameIcons(testAnimatedIcon);
    expect(frames[0].name).toBe(`${testAnimatedIcon.name}-frame-0`);
    expect(frames[1].name).toBe(`${testAnimatedIcon.name}-frame-1`);
  });

  it('uses base palette when frame has no palette override', () => {
    const frames = animatedToFrameIcons(testAnimatedIcon);
    // testAnimatedIcon frames have no palette override
    expect(frames[0].palette).toEqual(testAnimatedIcon.palette);
  });

  it('merges frame palette override with base palette', () => {
    const iconWithPaletteOverride = {
      ...testAnimatedIcon,
      frames: [
        {
          grid: testAnimatedIcon.frames[0].grid,
          palette: { A: '#0000FF' }, // Override A to blue
        },
        testAnimatedIcon.frames[1],
      ],
    };
    const frames = animatedToFrameIcons(iconWithPaletteOverride);
    // Frame 0 should have merged palette with A overridden
    expect(frames[0].palette.A).toBe('#0000FF');
    // B from base palette should still be present
    expect(frames[0].palette.B).toBe('#00FF00');
  });
});
