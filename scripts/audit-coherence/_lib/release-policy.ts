/**
 * Shared release-policy helpers for the changelog-aware gates (31, 32, 34).
 *
 * Encodes the repo's release policy (docs/governance/VERSIONING.md +
 * DEPRECATION_POLICY.md + the keep-a-changelog-ish structure of
 * packages/ui-kit/CHANGELOG.md):
 *
 *   - Releases are `## <version> — <date>` (or bracketed `## [<slug>] - <date>`)
 *     sections; `## Unreleased*` sections accumulate work between releases.
 *   - A version-only republish (e.g. 2.0.1) legitimately has no `### Added`
 *     entries; marketing surfaces (WhatsNewStrip) advertise the most recent
 *     release that DOES have them.
 *   - A release that spans packages is written up once, in the root
 *     CHANGELOG.md, under a heading naming each package's version
 *     (`## [ui-kit 2.2.0 / core 1.4.0 / vue 0.1.0] - 2026-10-03 — …`); the
 *     package's own section may then list only its changes and fixes. Its
 *     `### Added` entries are the root section's.
 */

export interface ReleaseSection {
  /** Heading text after the `## ` marker (full line, trimmed). */
  heading: string;
  /** First x.y.z semver found in the heading, or null (e.g. Unreleased). */
  version: string | null;
  /** First YYYY-MM-DD date found in the heading, or null. */
  date: string | null;
  /** True when the heading starts with "Unreleased". */
  unreleased: boolean;
  /** Section body (everything until the next `## ` heading). */
  body: string;
}

const SECTION_HEADING_REGEX = /^##\s+(.+)$/gm;
const SEMVER_REGEX = /\b(\d+\.\d+\.\d+)\b/;
const DATE_REGEX = /\b(\d{4}-\d{2}-\d{2})\b/;

/**
 * Split a changelog into `## `-level sections. Handles both heading styles
 * used in this repo:
 *
 *   ## [ui 1.2.5] - 2026-05-28 — UI pack refinement pass   (root CHANGELOG.md)
 *   ## 2.0.1 — 2026-06-02                                  (packages/ui-kit)
 *   ## Unreleased                                          (accumulator)
 */
export function parseReleaseSections(changelog: string): ReleaseSection[] {
  const sections: ReleaseSection[] = [];
  const matches = Array.from(changelog.matchAll(SECTION_HEADING_REGEX));
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!;
    const heading = m[1]!.trim();
    const start = m.index! + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : changelog.length;
    sections.push({
      heading,
      version: SEMVER_REGEX.exec(heading)?.[1] ?? null,
      date: DATE_REGEX.exec(heading)?.[1] ?? null,
      unreleased: /^\[?unreleased\b/i.test(heading),
      body: changelog.slice(start, end),
    });
  }
  return sections;
}

/**
 * Collect component names from EVERY `### Added*` block in a section body
 * (releases here often have several, e.g. "### Added — Navigation"). A
 * component is the first backticked or bold identifier on each bullet line.
 */
export function extractAddedComponents(body: string): string[] {
  const out: string[] = [];
  let inAdded = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^#{2,}\s/.test(line)) {
      inAdded = /^###\s+Added\b/.test(line);
      continue;
    }
    if (!inAdded) continue;
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (!bullet) continue;
    const rest = bullet[1] ?? '';
    const tick = /`([^`]+)`/.exec(rest);
    if (tick?.[1]) {
      out.push(tick[1]);
      continue;
    }
    const bold = /\*\*([^*]+)\*\*/.exec(rest);
    if (bold?.[1]) out.push(bold[1]);
  }
  return dedupePreserveOrder(out);
}

export interface AdvertisedRelease {
  /** The version whose Added entries marketing surfaces should advertise. */
  version: string;
  /** Components listed under that version's `### Added*` blocks. */
  added: string[];
  /** True when we fell back past a version-only patch with no Added entries. */
  isFallback: boolean;
  /**
   * Where the Added entries come from: the package's CHANGELOG, the root
   * CHANGELOG's section of the release, or both.
   */
  source: 'package' | 'root' | 'both';
}

export interface RootChangelogOptions {
  /** The root CHANGELOG.md, whose bracketed headings name each package's version. */
  rootChangelog?: string | null;
  /** The package's short name in those headings — `ui-kit` for `@pxlkit/ui-kit`. */
  packageName?: string;
}

/**
 * The root CHANGELOG.md section of a package release: the one whose
 * bracketed heading lists `<packageName> <version>` among the released
 * packages, as in `## [ui-kit 2.2.0 / core 1.4.0] - 2026-10-03 — …`. Another
 * package whose name extends it (`ui-kit-core 2.2.0`) does not count.
 */
export function findRootReleaseSection(
  rootChangelog: string,
  packageName: string,
  version: string,
): ReleaseSection | null {
  const pattern = new RegExp(
    `(?<![\\w-])${escapeRegExp(packageName)}\\s+v?${escapeRegExp(version)}(?![\\w.-])`,
  );
  for (const section of parseReleaseSections(rootChangelog)) {
    if (section.unreleased) continue;
    const packages = /^\[([^\]]+)\]/.exec(section.heading)?.[1];
    if (packages && pattern.test(packages)) return section;
  }
  return null;
}

/**
 * Resolve which release a "what's new" surface should advertise:
 * the current package version if it has `### Added` entries — in its own
 * section, or else in the root CHANGELOG's section of the release —
 * otherwise the most recent (file-order) release that has them. A
 * version-only patch (republish) has none by definition — the strip
 * legitimately keeps advertising the last content-bearing release.
 */
export function resolveAdvertisedRelease(
  changelog: string,
  currentVersion: string,
  options: RootChangelogOptions = {},
): AdvertisedRelease | null {
  const sections = parseReleaseSections(changelog);

  // What the release added is written up in the package's section, in the
  // root CHANGELOG's section of the release, or in both — the package's
  // additions next to the release's headline ones. A surface advertising
  // either advertises the release.
  const current = sections.find((s) => !s.unreleased && s.version === currentVersion);
  const packageAdded = current ? extractAddedComponents(current.body) : [];
  const root = options.rootChangelog
    ? findRootReleaseSection(options.rootChangelog, options.packageName ?? 'ui-kit', currentVersion)
    : null;
  const rootAdded = root ? extractAddedComponents(root.body) : [];
  if (packageAdded.length > 0 || rootAdded.length > 0) {
    const source = rootAdded.length === 0 ? 'package' : packageAdded.length === 0 ? 'root' : 'both';
    const added = dedupePreserveOrder([...packageAdded, ...rootAdded]);
    return { version: currentVersion, added, isFallback: false, source };
  }

  for (const s of sections) {
    if (s.unreleased || !s.version) continue;
    const added = extractAddedComponents(s.body);
    if (added.length > 0) {
      return { version: s.version, added, isFallback: s.version !== currentVersion, source: 'package' };
    }
  }

  return null;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function dedupePreserveOrder(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of arr) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}
