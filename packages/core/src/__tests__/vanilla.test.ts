import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import * as vanilla from '../vanilla';
import * as root from '../index';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Every module reachable from `entry` through imports and re-exports.
 * `ts.preProcessFile` reads real module specifiers only — never the ones
 * quoted in comments or in generated-code template strings.
 */
function moduleGraph(entry: string): { files: string[]; bare: string[] } {
  const files = new Set<string>();
  const bare = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (files.has(file)) continue;
    files.add(file);
    const { importedFiles } = ts.preProcessFile(readFileSync(file, 'utf8'), true, true);
    for (const { fileName: specifier } of importedFiles) {
      if (!specifier.startsWith('.')) {
        bare.add(specifier);
        continue;
      }
      const base = resolve(dirname(file), specifier);
      const target = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(existsSync);
      if (!target) throw new Error(`unresolved import ${specifier} in ${file}`);
      queue.push(target);
    }
  }
  return { files: [...files], bare: [...bare] };
}

describe('@pxlkit/core/vanilla', () => {
  it('never reaches React, directly or transitively', () => {
    const { files, bare } = moduleGraph(resolve(SRC, 'vanilla.ts'));
    expect(bare).toEqual([]);
    expect(files.some((f) => f.endsWith('.tsx'))).toBe(false);
    expect(files.some((f) => f.split(sep).includes('components'))).toBe(false);
  });

  it('exposes the framework-agnostic API', () => {
    const expected = [
      // guards + utilities
      'isAnimatedIcon',
      'isParallaxIcon',
      'gridToPixels',
      'pixelsToGrid',
      'parseHexColor',
      'encodeHexColor',
      'pixelsToSvg',
      'gridToSvg',
      'svgToDataUri',
      'svgToBase64',
      'validateIconData',
      'isValidIconData',
      'parseIconCode',
      'parseAnyIconCode',
      'generateIconCode',
      'adjustBrightness',
      'hexToRgb',
      'rgbToHex',
      'getPerceivedBrightness',
      'RETRO_PALETTES',
      'generateAnimatedSvg',
      'animatedToFrameIcons',
      // engine
      'renderIconSvg',
      'renderIconDataUri',
      'resolveIconLabel',
      'resolveIconContainerAria',
      'ICON_IMAGE_STYLE',
      'createAnimatedIconPlayer',
      'resolveAnimationTrigger',
      'resolveFrameDuration',
      'getAnimationFrame',
      'animatedIconWrapperStyle',
      'createParallaxController',
      'resolveParallaxGeometry',
      'parallaxContainerStyle',
      'parallaxSceneStyle',
      'parallaxLayerStyle',
      'parallaxParticleColors',
      'PARALLAX_CANVAS_STYLE',
      'resolvePixelToastView',
      'resolveToastAutoClose',
      'PIXEL_TOAST_DEFAULTS',
      'PIXEL_TOAST_CLOSE_LABEL',
      'PIXEL_TOAST_POSITION_CLASSES',
    ];
    expect(Object.keys(vanilla).sort()).toEqual([...expected].sort());
  });

  it('is a strict subset of the root entry, which adds the React components', () => {
    for (const name of Object.keys(vanilla)) {
      expect(root[name as keyof typeof root]).toBe(vanilla[name as keyof typeof vanilla]);
    }
    expect(Object.keys(root).filter((k) => !(k in vanilla)).sort()).toEqual([
      'AnimatedPxlKitIcon',
      'ParallaxPxlKitIcon',
      'PixelToast',
      'PxlKitIcon',
    ]);
  });
});
