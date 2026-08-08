import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareSemver, shouldNotify } from '../check-updates.mjs';

test('compares semver numerically, not as strings', () => {
  assert.equal(compareSemver('2.10.0', '2.9.0'), 1);
  assert.equal(compareSemver('2.9.0', '2.10.0'), -1);
  assert.equal(compareSemver('2.1.1', '2.1.1'), 0);
});

test('notifies only when the available version is greater', () => {
  assert.equal(shouldNotify('2.1.1', '2.2.0'), true);
  assert.equal(shouldNotify('2.1.1', '2.1.1'), false);
  assert.equal(shouldNotify('2.2.0', '2.1.1'), false);
});

test('never notifies on a malformed remote version', () => {
  // A corrupt response or an HTML error page must not read as "update available".
  assert.equal(shouldNotify('2.1.1', 'latest'), false);
  assert.equal(shouldNotify('2.1.1', ''), false);
  assert.equal(shouldNotify('2.1.1', null), false);
  assert.equal(shouldNotify('2.1.1', undefined), false);
  assert.equal(shouldNotify('2.1.1', '<!DOCTYPE html>'), false);
});

test('never notifies when the local version is unreadable', () => {
  assert.equal(shouldNotify(null, '3.0.0'), false);
  assert.equal(shouldNotify('unknown', '3.0.0'), false);
});

test('tolerates a v prefix on either side', () => {
  assert.equal(shouldNotify('v2.1.1', 'v2.2.0'), true);
  assert.equal(compareSemver('v3.0.0', '3.0.0'), 0);
});

test('a major bump notifies', () => {
  assert.equal(shouldNotify('2.1.1', '3.0.0'), true);
});

test('a patch bump notifies', () => {
  assert.equal(shouldNotify('2.1.1', '2.1.2'), true);
});
