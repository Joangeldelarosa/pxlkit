import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { KIT_PORTS, portComponents, type PortedComponent } from '../../../build-docs/_lib/ports';
import { portFindings, type ReactComponentExamples } from '../../gates/37-port-examples';

const [vue, angular] = KIT_PORTS as [(typeof KIT_PORTS)[number], (typeof KIT_PORTS)[number]];

const REACT: ReactComponentExamples[] = [
  { name: 'PixelButton', category: 'actions', examples: ['Default', 'Loading'] },
  { name: 'PixelCard', category: 'cards', examples: ['Default'] },
];

const ported = (category: string, exports: string[], path = `examples/${category}`): PortedComponent => ({
  category,
  exports: new Set(exports),
  path,
});

describe('gate 37 — port-examples', () => {
  it('finds nothing when a port implements every example of every component', () => {
    const components = new Map([
      ['PixelButton', ported('actions', ['Default', 'Loading'])],
      ['PixelCard', ported('cards', ['Default'])],
    ]);
    expect(portFindings(REACT, '2.2.0', { port: vue, version: '2.2.0', components })).toEqual([]);
  });

  it('keys Angular examples by the kebab-case component name', () => {
    const components = new Map([
      ['pixel-button', ported('actions', ['Default', 'Loading'])],
      ['pixel-card', ported('cards', ['Default'])],
    ]);
    expect(portFindings(REACT, '2.2.0', { port: angular, version: '2.2.0', components })).toEqual([]);
  });

  it('fails a component the port covers only in part, naming the missing examples', () => {
    const components = new Map([
      ['PixelButton', ported('actions', ['Default'], 'packages/ui-kit-vue/examples/actions/PixelButton')],
      ['PixelCard', ported('cards', ['Default'])],
    ]);
    const [finding] = portFindings(REACT, '2.2.0', { port: vue, version: '2.2.0', components });
    expect(finding).toMatchObject({
      severity: 'major',
      component: 'PixelButton',
      file: 'packages/ui-kit-vue/examples/actions/PixelButton',
    });
    expect(finding!.message).toContain('lacks 1 of the 2 examples of PixelButton: Loading');
  });

  it('fails examples that no manifest example matches, and components React does not have', () => {
    const components = new Map([
      ['PixelButton', ported('actions', ['Default', 'Loading', 'Legacy'])],
      ['PixelCard', ported('cards', ['Default'])],
      ['PixelGadget', ported('cards', ['Default'], 'packages/ui-kit-vue/examples/cards/PixelGadget')],
    ]);
    const findings = portFindings(REACT, '2.2.0', { port: vue, version: '2.2.0', components });
    expect(findings.map((finding) => finding.severity)).toEqual(['major', 'major']);
    expect(findings[0]!.message).toContain('no manifest example matches: Legacy');
    expect(findings[1]).toMatchObject({ file: 'packages/ui-kit-vue/examples/cards/PixelGadget' });
    expect(findings[1]!.message).toContain('"PixelGadget", which is not a React kit component');
  });

  it("fails examples filed under another category than the manifest's", () => {
    const components = new Map([
      ['PixelButton', ported('actions', ['Default', 'Loading'])],
      ['PixelCard', ported('data', ['Default'])],
    ]);
    const [finding] = portFindings(REACT, '2.2.0', { port: vue, version: '2.2.0', components });
    expect(finding).toMatchObject({ severity: 'major', component: 'PixelCard' });
    expect(finding!.suggestion).toBe('Move them under examples/cards/.');
  });

  it("lists unported components while the port's version differs from React's, and fails them once it is the same", () => {
    const components = new Map([['PixelButton', ported('actions', ['Default', 'Loading'])]]);
    const [porting] = portFindings(REACT, '2.1.1', { port: vue, version: '2.2.0', components });
    expect(porting).toMatchObject({ severity: 'info' });
    expect(porting!.message).toBe(
      "@pxlkit/ui-kit-vue 2.2.0 does not implement 1 of the React kit's 2 components yet: PixelCard.",
    );
    const [released] = portFindings(REACT, '2.2.0', { port: vue, version: '2.2.0', components });
    expect(released).toMatchObject({ severity: 'major' });
  });
});

describe('portComponents', () => {
  const roots: string[] = [];
  afterAll(async () => {
    await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  });

  it('reads Vue example folders and Angular example classes, with their category and path', async () => {
    const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-37-'));
    roots.push(root);
    await mkdir(join(root, 'packages/ui-kit-vue/examples/actions/PixelButton'), { recursive: true });
    await writeFile(join(root, 'packages/ui-kit-vue/examples/actions/PixelButton/Default.vue'), '<template />');
    await writeFile(join(root, 'packages/ui-kit-vue/examples/actions/PixelButton/Loading.vue'), '<template />');
    await mkdir(join(root, 'packages/ui-kit-angular/examples/actions'), { recursive: true });
    await writeFile(
      join(root, 'packages/ui-kit-angular/examples/actions/pixel-button.examples.ts'),
      "export class Default {}\nclass Helper {}\nexport class Loading {}\n",
    );

    const vueComponents = await portComponents(root, vue);
    expect([...vueComponents.keys()]).toEqual(['PixelButton']);
    expect(vueComponents.get('PixelButton')).toEqual({
      category: 'actions',
      exports: new Set(['Default', 'Loading']),
      path: 'packages/ui-kit-vue/examples/actions/PixelButton',
    });
    const angularComponents = await portComponents(root, angular);
    expect(angularComponents.get('pixel-button')).toEqual({
      category: 'actions',
      exports: new Set(['Default', 'Loading']),
      path: 'packages/ui-kit-angular/examples/actions/pixel-button.examples.ts',
    });
  });
});
