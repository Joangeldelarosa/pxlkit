import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyProject, parseVersionFloor } from '../preflight.mjs';

test('flags a project without React as a blocker', () => {
  const r = classifyProject({ dependencies: {} });
  assert.equal(r.exitCode, 2);
  assert.match(r.blockers.join(' '), /react/i);
});

test('flags Tailwind v3 as a blocker that needs a separate migration', () => {
  const r = classifyProject({ dependencies: { react: '^18.2.0', tailwindcss: '^3.4.0' } });
  assert.equal(r.exitCode, 2);
  assert.match(r.blockers.join(' '), /v4/);
  // The message must not promise an inline fix — migrating v3→v4 is the user's call.
  assert.match(r.blockers.join(' '), /separately/i);
});

test('reports missing setup as repairable when Tailwind v4 is present', () => {
  const r = classifyProject({ dependencies: { react: '^19.0.0', tailwindcss: '^4.0.0' } });
  assert.equal(r.exitCode, 1);
  assert.equal(r.blockers.length, 0);
});

test('detects React 17 as incompatible', () => {
  const r = classifyProject({ dependencies: { react: '^17.0.2', tailwindcss: '^4.0.0' } });
  assert.equal(r.exitCode, 2);
  assert.match(r.blockers.join(' '), /18\.2/);
});

test('accepts React 18.2 exactly, the documented floor', () => {
  const r = classifyProject({ dependencies: { react: '^18.2.0', tailwindcss: '^4.0.0' } });
  assert.equal(r.blockers.length, 0);
});

test('rejects React 18.0, below the floor', () => {
  const r = classifyProject({ dependencies: { react: '18.0.0', tailwindcss: '^4.0.0' } });
  assert.equal(r.exitCode, 2);
});

test('reports ready when the kit is installed alongside compatible peers', () => {
  const r = classifyProject({
    dependencies: { react: '^19.0.0', tailwindcss: '^4.0.0', '@pxlkit/ui-kit': '^2.1.1' },
  });
  assert.equal(r.exitCode, 0);
  assert.equal(r.missing.length, 0);
  assert.equal(r.uiKitRange, '^2.1.1');
});

test('missing Tailwind is a blocker because styles.css is not self-contained', () => {
  const r = classifyProject({ dependencies: { react: '^19.0.0' } });
  assert.equal(r.exitCode, 2);
  assert.match(r.blockers.join(' '), /tailwind/i);
});

test('parses version floors out of the range syntaxes npm actually produces', () => {
  assert.deepEqual(parseVersionFloor('^18.2.0'), { major: 18, minor: 2 });
  assert.deepEqual(parseVersionFloor('~4.0.0-beta.1'), { major: 4, minor: 0 });
  assert.deepEqual(parseVersionFloor('>=19'), { major: 19, minor: 0 });
  assert.deepEqual(parseVersionFloor('19.x'), { major: 19, minor: 0 });
  assert.equal(parseVersionFloor('workspace:*'), null);
  assert.equal(parseVersionFloor(undefined), null);
});

test('an unreadable version range does not manufacture a blocker', () => {
  // `workspace:*` is legitimate in a monorepo; refusing to run on it would be wrong.
  const r = classifyProject({ dependencies: { react: 'workspace:*', tailwindcss: '^4.0.0' } });
  assert.equal(r.blockers.length, 0);
});
