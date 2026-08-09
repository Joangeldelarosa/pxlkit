import { describe, expect, it } from 'vitest';
import { INSTALL_COMMAND, OUT_OF_SCOPE, REPO_SLUG, SKILLS } from './skills-data';

describe('skills data', () => {
  it('documents every skill shipped by the plugin', () => {
    expect(SKILLS.map((s) => s.slug).sort()).toEqual(['audit', 'icon', 'imagine', 'pixelate', 'start']);
  });

  it('uses the real repository owner in the install command', () => {
    // The most expensive possible mistake on this page is publishing a command
    // that does not work. The remote is Joangeldelarosa/pxlkit, with that casing.
    expect(REPO_SLUG).toBe('Joangeldelarosa/pxlkit');
    expect(INSTALL_COMMAND).toContain('Joangeldelarosa/pxlkit');
    expect(INSTALL_COMMAND).toContain('pxlkit@pxlkit');
  });

  it('gives every skill a distinct tone', () => {
    expect(new Set(SKILLS.map((s) => s.tone)).size).toBe(SKILLS.length);
  });

  it('gives every skill a command matching its slug', () => {
    for (const skill of SKILLS) {
      expect(skill.command).toBe(`/pxlkit:${skill.slug}`);
    }
  });

  it('gives every skill an example prompt that invokes it', () => {
    for (const skill of SKILLS) {
      expect(skill.examplePrompt).toContain(skill.command);
    }
  });

  it('gives every skill steps and pitfalls worth reading', () => {
    for (const skill of SKILLS) {
      expect(skill.steps.length).toBeGreaterThanOrEqual(3);
      expect(skill.pitfalls.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('states what the suite does not cover', () => {
    expect(OUT_OF_SCOPE.length).toBeGreaterThan(0);
  });
});
