import { describe, expect, it } from 'vitest';
import {
  compareVersions,
  kitReleaseSection,
  parseVersion,
  publishedPackageDirs,
  releaseNotes,
  rootReleaseSection,
} from '../github-release.mjs';

const ROOT_CHANGELOG = `# Changelog

## [ui-kit 2.2.0 / core 1.4.0 / vue 0.1.0] - 2026-10-06 — The UI kit in Vue and Angular

### Added

- Vue and Angular.

## [ui-kit 2.1.1] - 2026-08-08 — Bordered surface-token fix

### Fixed

- Borders.

## [ui 1.2.5] - 2026-05-28 — UI pack refinement pass

- Icons.
`;

const KIT_CHANGELOG = `# @pxlkit/ui-kit — Changelog

## 2.0.1 — 2026-06-02

### Changed
- Version-only republish.

## 2.0.0 — 2026-05-31 (Ola 5 — Launch Ceremony)

- Launch.
`;

describe('versions', () => {
  it('reads plain x.y.z versions only', () => {
    expect(parseVersion('2.2.0')).toEqual([2, 2, 0]);
    expect(parseVersion('2.2.0-next.1')).toBeNull();
  });

  it('orders versions numerically', () => {
    expect(['2.10.0', '2.2.0', '2.0.1'].sort(compareVersions)).toEqual(['2.0.1', '2.2.0', '2.10.0']);
  });
});

describe('the packages publish.yml publishes', () => {
  it('reads the PACKAGES list in its order', () => {
    const workflow = `run: |\n  PACKAGES=(\n    "packages/core"\n    "packages/ui-kit/"\n  )\n`;
    expect(publishedPackageDirs(workflow)).toEqual(['packages/core', 'packages/ui-kit']);
  });

  it('fails without a list', () => {
    expect(() => publishedPackageDirs('run: npm publish')).toThrow(/PACKAGES/);
  });
});

describe('changelog sections', () => {
  it('finds a release whose heading names several packages', () => {
    const section = rootReleaseSection(ROOT_CHANGELOG, '2.2.0');
    expect(section).toMatchObject({ title: 'The UI kit in Vue and Angular', date: '2026-10-06' });
    expect(section.body).toBe('### Added\n\n- Vue and Angular.');
  });

  it('finds a release of the kit alone, and nothing for a version without a section', () => {
    expect(rootReleaseSection(ROOT_CHANGELOG, '2.1.1')).toMatchObject({ title: 'Bordered surface-token fix' });
    expect(rootReleaseSection(ROOT_CHANGELOG, '2.0.1')).toBeNull();
  });

  it('does not take another package of the same version for the kit', () => {
    expect(rootReleaseSection('## [ui-kit-core 2.2.0] - 2026-10-06 — Core\n\n- Core.\n', '2.2.0')).toBeNull();
    expect(rootReleaseSection('## [ui-kit 2.2.10] - 2026-10-06 — Later\n\n- Later.\n', '2.2.1')).toBeNull();
  });

  it("reads the kit's own changelog, with or without a title", () => {
    expect(kitReleaseSection(KIT_CHANGELOG, '2.0.1')).toEqual({
      title: null,
      date: '2026-06-02',
      body: '### Changed\n- Version-only republish.',
    });
    expect(kitReleaseSection(KIT_CHANGELOG, '2.0.0')).toMatchObject({ title: 'Ola 5 — Launch Ceremony' });
  });
});

describe('release notes', () => {
  const changelogUrl = 'https://github.com/owner/repo/blob/main/CHANGELOG.md';

  it('lists the packages, then the section, then the changelog link', () => {
    const notes = releaseNotes({
      packages: [{ name: '@pxlkit/ui-kit', version: '2.2.0' }],
      section: '### Added\n\n- Vue.',
      changelogUrl,
    });
    expect(notes).toBe(
      [
        '### Packages',
        '',
        '| Package | Version |',
        '| --- | --- |',
        '| [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit/v/2.2.0) | 2.2.0 |',
        '',
        '### Added',
        '',
        '- Vue.',
        '',
        `Full changelog: ${changelogUrl}`,
        '',
      ].join('\n'),
    );
  });

  it("stays within GitHub's limit, cut at a line break", () => {
    const section = Array.from({ length: 4000 }, (_, i) => `- change ${i} ${'x'.repeat(40)}`).join('\n');
    const notes = releaseNotes({ packages: [], section, changelogUrl });
    expect(notes.length).toBeLessThanOrEqual(120_000);
    expect(notes).toContain('…(continued in the changelog)');
    expect(notes.endsWith(`Full changelog: ${changelogUrl}\n`)).toBe(true);
  });
});
