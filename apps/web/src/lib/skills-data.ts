/**
 * Single source of truth for the /skills section.
 *
 * The page, the `llms.txt` route and the JSON-LD all read from here, so the
 * install command and the skill list can never disagree between them.
 *
 * Server-safe: no 'use client' anywhere in this import chain, so RSC metadata
 * can import it alongside the client sections.
 */

import type { Tone } from '@pxlkit/ui-kit';
import pluginManifest from '../../../../plugins/pxlkit/.claude-plugin/plugin.json';

/** GitHub owner/repo, with the capitalisation the remote actually uses. */
export const REPO_SLUG = 'Joangeldelarosa/pxlkit';

/**
 * The plugin's own version — deliberately not the kit's.
 *
 * The two release independently: a fix to a skill ships without the kit moving.
 * Showing the kit version here would tell a user their plugin is up to date when
 * it is a release behind.
 */
export const PLUGIN_VERSION: string = pluginManifest.version;

/**
 * The one command a user copies. Both halves matter: `marketplace add` registers
 * this repo as a marketplace, `install pxlkit@pxlkit` picks the plugin out of it —
 * the second `pxlkit` is the marketplace name declared in `.claude-plugin/marketplace.json`.
 */
export const INSTALL_COMMAND = `claude plugin marketplace add ${REPO_SLUG} && claude plugin install pxlkit@pxlkit`;

/** For users who would rather not clone the whole monorepo. */
export const INSTALL_COMMAND_SPARSE = `claude plugin marketplace add ${REPO_SLUG} --sparse plugins/pxlkit`;

export const UPDATE_COMMAND = 'claude plugin update pxlkit';

export interface SkillArg {
  flag: string;
  description: string;
}

export interface SkillPitfall {
  q: string;
  a: string;
}

export interface SkillEntry {
  slug: string;
  command: string;
  title: string;
  tagline: string;
  tone: Tone;
  /** What the skill does, in the order it does it. */
  steps: string[];
  args: SkillArg[];
  /** A prompt that actually produced a result in the demo run. */
  examplePrompt: string;
  pitfalls: SkillPitfall[];
}

export const SKILLS: SkillEntry[] = [
  {
    slug: 'start',
    command: '/pxlkit:start',
    title: 'Set the project up',
    tagline: 'Checks whether this project can run pxlkit at all, then wires it up.',
    tone: 'cyan',
    steps: [
      'Classifies the project as ready, repairable or incompatible',
      'Detects the framework and package manager, because the setup genuinely differs',
      'Applies the matching recipe: stylesheet, @source directive, providers, fonts, dark mode',
      'Introduces the other four commands',
    ],
    args: [{ flag: '[project directory]', description: 'Defaults to the working directory.' }],
    examplePrompt: '/pxlkit:start',
    pitfalls: [
      {
        q: 'Why does it refuse to run on my Tailwind v3 project?',
        a: "The kit's stylesheet opens with `@import \"tailwindcss\"` and defines an `@theme`, so it needs a v4 pipeline to compile at all. Migrating v3 to v4 changes how every existing style in your project compiles — that is a decision with real consequences, so the skill explains it and stops rather than doing it as a side effect of adding a component library.",
      },
      {
        q: 'It says setup is missing but my components render.',
        a: 'They render, they just do not look like pxlkit. Without the `styles.css` import the staircase corners and offset shadows never apply, and nothing in the console reports it. It is the most common cause of "pxlkit looks broken".',
      },
    ],
  },
  {
    slug: 'imagine',
    command: '/pxlkit:imagine',
    title: 'Build something new',
    tagline: 'Composes a page from the real component API, then measures what it built.',
    tone: 'green',
    steps: [
      'Reads the kit version your project actually has installed',
      'Picks sections from recipes extracted from templates that ship',
      'Writes a component budget as a table before writing any code',
      'Generates, then runs the audit gates on its own output',
      'Reports the gate results, including anything still failing',
    ],
    args: [
      { flag: '[description]', description: 'What you want. Plain language.' },
      { flag: '--from <template>', description: 'landing · dashboard · ecommerce · portfolio · docs' },
      { flag: '--surface pixel|linear', description: 'Chunky retro, or the same components with soft edges.' },
    ],
    examplePrompt:
      '/pxlkit:imagine an operations dashboard for a data platform: pipeline health across regions, throughput and latency charts, a runs table with statuses, a command palette, and an inspect drawer. Dense, dark, cyan and green.',
    pitfalls: [
      {
        q: 'Why does it plan before it writes?',
        a: 'Composition decided while typing JSX converges on whatever is easiest to type. A page that names its sections and components up front reaches across the catalogue; one that does not uses the same eight components repeatedly.',
      },
      {
        q: 'What if my page cannot hit the diversity floor?',
        a: 'Then it says so and explains why. The floors are calibrated from the repo\'s own templates, so falling short usually means the page is genuinely thin — but padding a landing page with a date picker to clear a number makes it worse, and the skill is told not to.',
      },
    ],
  },
  {
    slug: 'pixelate',
    command: '/pxlkit:pixelate',
    title: 'Convert what exists',
    tagline: 'Swaps the presentation layer for pxlkit and leaves your logic alone.',
    tone: 'purple',
    steps: [
      'Records your test results as a baseline before touching anything',
      'Maps every source element to its pxlkit equivalent and shows you the table',
      'Converts incrementally, preserving routes, state, handlers and aria attributes',
      'Maps your brand palette to tones, or re-skins the tokens to keep your colours',
      'Verifies your behavioural tests still pass',
    ],
    args: [
      { flag: '[path]', description: 'A file, a directory, or the app root.' },
      { flag: '--scope page|component|app', description: 'How much to take on at once.' },
    ],
    examplePrompt: '/pxlkit:pixelate src/app/dashboard --scope page',
    pitfalls: [
      {
        q: 'Can it convert a site from a URL?',
        a: 'No, and that is deliberate. Fetching a page would pull untrusted content into an agent holding write and shell access, where instructions hidden in that content are indistinguishable from yours. It works on local code only.',
      },
      {
        q: 'What happens to my snapshot tests?',
        a: 'They will fail, because the DOM changed — that was the point. Behavioural tests must still pass and that is treated as a blocker. Snapshots get regenerated only after showing you the diff.',
      },
    ],
  },
  {
    slug: 'icon',
    command: '/pxlkit:icon',
    title: 'Draw an icon',
    tagline: 'Authors a 16×16 PxlKitData icon that passes both validators before it is written.',
    tone: 'gold',
    steps: [
      'Searches the 226 shipped icons by tag so you do not redraw one that exists',
      'Designs the grid, showing it as ASCII while it iterates',
      'Renders it to SVG and looks at it, because character grids lie',
      'Validates against a strict superset of both pxlkit validators',
      'Writes it, and in the monorepo registers it in the pack',
    ],
    args: [
      { flag: '[name] [description]', description: 'Kebab-case name and what it depicts.' },
      { flag: '--pack <pack>', description: 'ui · feedback · social · weather · gamification · effects · parallax' },
      { flag: '--animated', description: 'Multi-frame icon with a trigger.' },
    ],
    examplePrompt: '/pxlkit:icon habit-streak "a flame with a small counter badge"',
    pitfalls: [
      {
        q: 'Who owns an icon I create?',
        a: 'You do. The asset licence covers pxlkit\'s own icon packs; an icon you draw in your project is yours. Using pxlkit\'s existing icons is the thing that asks for visible attribution.',
      },
      {
        q: 'It warned that my icon looks like another one.',
        a: 'High silhouette overlap is only an error when the two icons also share a semantic tag. Arrows and faces overlap by design, so those come back as a warning worth a look rather than a block.',
      },
    ],
  },
  {
    slug: 'audit',
    command: '/pxlkit:audit',
    title: 'Check the result',
    tagline: 'Runs the gates the other skills validate against, and can apply the fixes.',
    tone: 'red',
    steps: [
      'Types, build and runtime — the checks that must pass',
      'Component diversity and token purity, measured by script',
      'Screenshots at three widths in light and dark, scored against a visual checklist',
      'axe-core per route',
      'A report of rule, file, line and fix',
    ],
    args: [
      { flag: '[path]', description: 'What to audit.' },
      { flag: '--fix', description: 'Apply the mechanical corrections, after showing the diff.' },
      { flag: '--visual', description: 'Include the screenshot pass.' },
    ],
    examplePrompt: '/pxlkit:audit src/app --fix --visual',
    pitfalls: [
      {
        q: 'What if a check cannot run here?',
        a: 'It is reported as SKIP, never counted as a pass. The browser gates need a browser, and installing 300 MB of them without asking is not something a skill should do quietly.',
      },
      {
        q: 'Does it ever declare something fixed that is not?',
        a: 'It is instructed not to. A gate still failing after three attempts is reported as failing — a false pass is worse than a failure, because you stop looking.',
      },
    ],
  },
];

/** Explicitly not covered, so nobody expects it and no skill improvises it. */
export const OUT_OF_SCOPE = [
  'The voxel engine and anything 3D',
  'The web icon builder',
  'Storybook generation',
  'Frameworks without React (Vue, Svelte, Astro without React)',
];

export const REQUIREMENTS = [
  'React 18.2 or 19',
  'Tailwind CSS v4 — the stylesheet is CSS-first and will not compile on v3',
  'Node 20 or newer',
  'Claude Code with the `claude plugin` CLI',
];
