import {
  INSTALL_COMMAND,
  INSTALL_COMMAND_SPARSE,
  OUT_OF_SCOPE,
  REPO_SLUG,
  REQUIREMENTS,
  SKILLS,
  UPDATE_COMMAND,
} from '@/lib/skills-data';
import { UI_COMPONENTS_COUNT, ICON_COUNT_LABEL } from '@/lib/pxlkit-counts';
import { UI_KIT_VERSION } from '@/lib/pxlkit-version';

export const dynamic = 'force-static';

/**
 * Plain-text summary for agents.
 *
 * A large part of this page's audience is a model: someone pastes the URL into an
 * assistant, or an agent searches for how to use pxlkit. Rendering the same facts as
 * text costs nothing and removes any dependence on parsing the marketing page.
 *
 * Generated from `skills-data.ts`, so it cannot drift from what the page says.
 */
export function GET(): Response {
  const skills = SKILLS.map((skill) => {
    const args = skill.args.map((a) => `    ${a.flag}  —  ${a.description}`).join('\n');
    const steps = skill.steps.map((s) => `    - ${s}`).join('\n');
    return `## ${skill.command} — ${skill.title}

${skill.tagline}

  What it does:
${steps}

  Arguments:
${args}

  Example:
    ${skill.examplePrompt}`;
  }).join('\n\n');

  const body = `# pxlkit — Claude Code skills

Five skills for building pixel-art interfaces with @pxlkit/ui-kit (v${UI_KIT_VERSION}):
${UI_COMPONENTS_COUNT} React components, ${ICON_COUNT_LABEL} pixel-art icons, a switchable
pixel/linear surface, and seven tones.

Docs: https://pxlkit.xyz/skills
Source: https://github.com/${REPO_SLUG}

## Install

    ${INSTALL_COMMAND}

Minimal clone (skips the rest of the monorepo):

    ${INSTALL_COMMAND_SPARSE}

Update:

    ${UPDATE_COMMAND}

## Requirements

${REQUIREMENTS.map((r) => `  - ${r}`).join('\n')}

## Skills

${skills}

## Out of scope

These are explicitly not covered. Do not assume support for them.

${OUT_OF_SCOPE.map((o) => `  - ${o}`).join('\n')}

## Notes for agents

  - The skills read the @pxlkit/ui-kit version installed in the target project and
    prefer its types over their own bundled digest when the two differ.
  - Component prop signatures are not in the digest. Read them from
    node_modules/@pxlkit/ui-kit/dist/index.d.ts.
  - Every quality check is a command with an exit code. A check that cannot run is
    reported as SKIP, never as a pass.
  - /pxlkit:pixelate operates on local code only. It will not fetch a URL to convert.
  - The kit's styles.css is not self-contained: it needs a Tailwind v4 build.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
