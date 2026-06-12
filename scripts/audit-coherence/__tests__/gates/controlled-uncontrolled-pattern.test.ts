/**
 * Tests for Gate 25 — controlled-uncontrolled-pattern.
 *
 * Strategy: feed synthetic source strings into the gate via the `readFile`
 * override and a fake `discoverFiles` hook. We never touch the real filesystem
 * beyond a single tmpdir used for the AuditContext shell. The gate's contract
 * we verify:
 *
 *   - Identifies itself with id=25 and the canonical name.
 *   - Passes vacuously when no source files are discovered.
 *   - Skips non-form components (no value/onChange/defaultValue) silently.
 *   - Passes a fully-compliant form component (value + defaultValue + onChange
 *     value-typed + imports + calls useControllableState).
 *   - R1: flags MAJOR when value+onChange exist but defaultValue is missing
 *     (controlled-only API).
 *   - R1: flags MAJOR when defaultValue+onChange exist but value is missing
 *     (uncontrolled-only API).
 *   - R1: flags MAJOR when value+defaultValue exist but onChange is missing.
 *   - R2: flags MAJOR when the file does NOT import useControllableState.
 *   - R2: flags MAJOR when the file imports but never calls useControllableState.
 *   - R3: flags MAJOR when onChange has React.ChangeEvent signature.
 *   - R3: also catches FormEvent / KeyboardEvent / SyntheticEvent.
 *   - Multiple components per file are each evaluated.
 *   - All findings carry severity=major and an actionable suggestion.
 *   - Helper utilities (extractPropsBlocks, readPropType, isEventStyleOnChange)
 *     work as advertised.
 */

import * as os from 'node:os';
import * as path from 'node:path';

import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ControlledUncontrolledPatternGate,
  extractPropsBlocks,
  findMatchingBrace,
  isEventStyleOnChange,
  isFormLike,
  readPropType,
  readSlotSignature,
  scanSource,
  stripPropsSuffix,
} from '../../gates/25-controlled-uncontrolled-pattern.js';
import type { AuditContext, Logger } from '../../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function silentLogger(): Logger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

function makeCtx(repoRoot: string): AuditContext {
  return {
    repoRoot,
    manifests: [],
    uiKitSrcDir: path.join(repoRoot, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(repoRoot, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(repoRoot, 'packages/ui-kit/src/registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger: silentLogger(),
  };
}

/**
 * Build a gate wired to in-memory sources. `files` maps absolute path → text.
 */
function gateWith(files: Record<string, string>) {
  return new ControlledUncontrolledPatternGate({
    discoverFiles: async () => Object.keys(files).sort(),
    readFile: async (p: string) => {
      const src = files[p];
      if (src === undefined) {
        throw new Error(`unexpected read: ${p}`);
      }
      return src;
    },
  });
}

const COMPLIANT_SOURCE = `
'use client';

import React, { forwardRef } from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelNumberInputProps {
  value?: number;
  defaultValue?: number;
  onChange?: (next: number) => void;
  min?: number;
  max?: number;
}

export const PixelNumberInput = forwardRef<HTMLInputElement, PixelNumberInputProps>(
  function PixelNumberInput({ value, defaultValue, onChange }, ref) {
    const [current, setCurrent] = useControllableState({ value, defaultValue, onChange });
    return <input ref={ref} value={current} onChange={(e) => setCurrent(Number(e.target.value))} />;
  },
);
`.trimStart();

const CONTROLLED_ONLY_SOURCE = `
import React from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelSliderProps {
  value?: number;
  onChange?: (next: number) => void;
}

export function PixelSlider(props: PixelSliderProps) {
  const [v, setV] = useControllableState({ value: props.value, defaultValue: 0, onChange: props.onChange });
  return <div>{v}</div>;
}
`.trimStart();

const UNCONTROLLED_ONLY_SOURCE = `
import React from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelSwitchProps {
  defaultValue?: boolean;
  onChange?: (next: boolean) => void;
}

export function PixelSwitch(props: PixelSwitchProps) {
  const [v, setV] = useControllableState({ defaultValue: props.defaultValue ?? false, onChange: props.onChange });
  return <button onClick={() => setV(!v)}>{String(v)}</button>;
}
`.trimStart();

const MISSING_ONCHANGE_SOURCE = `
import React from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelDisplayProps {
  value?: string;
  defaultValue?: string;
}

export function PixelDisplay(props: PixelDisplayProps) {
  const [v] = useControllableState({ value: props.value, defaultValue: props.defaultValue ?? '' });
  return <span>{v}</span>;
}
`.trimStart();

const NO_HOOK_IMPORT_SOURCE = `
import React, { useState } from 'react';

export interface PixelTextareaProps {
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
}

export function PixelTextarea(props: PixelTextareaProps) {
  // Hand-rolled fork — bad! Should use useControllableState.
  const [internal, setInternal] = useState(props.defaultValue ?? '');
  const current = props.value ?? internal;
  return <textarea value={current} onChange={(e) => { setInternal(e.target.value); props.onChange?.(e.target.value); }} />;
}
`.trimStart();

const IMPORTS_BUT_NEVER_CALLS_SOURCE = `
import React, { useState } from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelChipProps {
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
}

export function PixelChip(props: PixelChipProps) {
  // Imports but cheats by using plain useState.
  const [internal, setInternal] = useState(props.defaultValue ?? '');
  return <span>{props.value ?? internal}</span>;
}
`.trimStart();

const EVENT_STYLE_ONCHANGE_SOURCE = `
import React from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelLegacyInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PixelLegacyInput(props: PixelLegacyInputProps) {
  const [v, setV] = useControllableState({ value: props.value, defaultValue: props.defaultValue ?? '' });
  return <input value={v} onChange={(e) => { setV(e.target.value); props.onChange?.(e); }} />;
}
`.trimStart();

const FORM_EVENT_ONCHANGE_SOURCE = `
import React from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelFormishProps {
  value?: string;
  defaultValue?: string;
  onChange?: (e: FormEvent<HTMLInputElement>) => void;
}

export function PixelFormish(props: PixelFormishProps) {
  const [v] = useControllableState({ value: props.value, defaultValue: props.defaultValue ?? '' });
  return <input value={v} />;
}
`.trimStart();

const NON_FORM_SOURCE = `
import React from 'react';

export interface PixelButtonProps {
  label: string;
  variant?: 'solid' | 'ghost';
  onClick?: () => void;
}

export function PixelButton(props: PixelButtonProps) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
`.trimStart();

const GENERIC_CALL_SOURCE = `
import React, { forwardRef } from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelGenericInputProps {
  value?: number | undefined;
  defaultValue?: number | undefined;
  onChange?: (next: number | undefined) => void;
}

export const PixelGenericInput = forwardRef<HTMLInputElement, PixelGenericInputProps>(
  function PixelGenericInput({ value, defaultValue, onChange }, ref) {
    const [current, setCurrent] = useControllableState<number | undefined>({
      value,
      defaultValue,
      onChange,
    });
    return <input ref={ref} value={current ?? ''} onChange={(e) => setCurrent(Number(e.target.value))} />;
  },
);
`.trimStart();

const CHECKBOX_CONVENTION_SOURCE = `
import React, { forwardRef } from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelCheckboxProps {
  label: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  /** HTML form value when checked. Defaults to 'on'. NOT a state slot. */
  value?: string;
  name?: string;
}

export const PixelCheckbox = forwardRef<HTMLButtonElement, PixelCheckboxProps>(
  function PixelCheckbox({ checked, defaultChecked, onChange, value = 'on' }, ref) {
    const [isChecked, setChecked] = useControllableState<boolean>({
      value: checked,
      defaultValue: defaultChecked ?? false,
      onChange,
    });
    return <button ref={ref} role="checkbox" aria-checked={isChecked} onClick={() => setChecked(!isChecked)} />;
  },
);
`.trimStart();

const CHECKBOX_MISSING_DEFAULT_SOURCE = `
import React from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelBrokenSwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
}

export function PixelBrokenSwitch(props: PixelBrokenSwitchProps) {
  const [v, setV] = useControllableState<boolean>({ value: props.checked, defaultValue: false, onChange: props.onChange });
  return <button onClick={() => setV(!v)}>{String(v)}</button>;
}
`.trimStart();

const IDENTITY_VALUE_SOURCE = `
import React, { forwardRef } from 'react';

export interface MenuItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onSelect'> {
  /** Item identity for highlight/typeahead registration (NOT form state). */
  value?: string;
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { value, children, onSelect },
  ref,
) {
  return <button ref={ref} role="menuitem" data-value={value} onClick={onSelect}>{children}</button>;
});
`.trimStart();

const MULTI_BLOCK_SOURCE = `
import React from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelTabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
}

export interface PixelTabsItemProps {
  value: string;
  children: React.ReactNode;
}

export function PixelTabs(props: PixelTabsProps) {
  const [v] = useControllableState({ value: props.value, defaultValue: props.defaultValue ?? '' });
  return <div data-value={v}>{props.children}</div>;
}
`.trimStart();

// ---------------------------------------------------------------------------
// Fixture root
// ---------------------------------------------------------------------------

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ctrl-uncl-gate-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot).catch(() => undefined);
});

// ---------------------------------------------------------------------------
// Helper-function tests
// ---------------------------------------------------------------------------

describe('helpers', () => {
  it('stripPropsSuffix strips trailing Props', () => {
    expect(stripPropsSuffix('PixelNumberInputProps')).toBe('PixelNumberInput');
    expect(stripPropsSuffix('Props')).toBe('');
    expect(stripPropsSuffix('Foo')).toBe('Foo');
  });

  it('findMatchingBrace handles nesting and strings', () => {
    const src = `interface X { a: { b: '}' }; c: "}{"; d: \`\${1+1}\`; }`;
    const open = src.indexOf('{');
    const close = findMatchingBrace(src, open);
    expect(close).toBeGreaterThan(open);
    expect(src[close]).toBe('}');
    // The match should be the OUTERMOST close.
    expect(src.slice(close)).toBe('}');
  });

  it('extractPropsBlocks finds interface + type-alias Props blocks', () => {
    const src = `
      export interface AProps { value?: number; onChange?: (n: number) => void; defaultValue?: number; }
      export type BProps = { value?: string; defaultValue?: string; onChange?: (s: string) => void; };
      export interface JustAType { label: string; }
    `;
    const blocks = extractPropsBlocks(src);
    expect(blocks.map((b) => b.propsTypeName).sort()).toEqual(['AProps', 'BProps']);
    expect(blocks.map((b) => b.componentName).sort()).toEqual(['A', 'B']);
  });

  it('readPropType pulls each declared slot', () => {
    const body = `
      value?: number;
      defaultValue?: number;
      onChange?: (next: number) => void;
      min?: number;
    `;
    expect(readPropType(body, 'value')).toBe('number');
    expect(readPropType(body, 'defaultValue')).toBe('number');
    expect(readPropType(body, 'onChange')).toBe('(next: number) => void');
    expect(readPropType(body, 'missing')).toBeNull();
  });

  it('readSlotSignature reports presence of each slot', () => {
    const sig = readSlotSignature(
      'value?: string; defaultValue?: string; onChange?: (s: string) => void;',
    );
    expect(sig.hasValue).toBe(true);
    expect(sig.hasDefaultValue).toBe(true);
    expect(sig.hasOnChange).toBe(true);
    expect(sig.valueTypeText).toBe('string');
    expect(sig.onChangeTypeText).toBe('(s: string) => void');
  });

  it('isFormLike returns false for non-form blocks', () => {
    const sig = readSlotSignature('label: string; onClick?: () => void;');
    expect(isFormLike(sig)).toBe(false);
  });

  it('isFormLike returns false for identity-only value props (no onChange / defaultValue)', () => {
    // A lone `value?` with no change callback and no uncontrolled slot is an
    // identity/display prop (menu-item value, progress display) — not form state.
    const sig = readSlotSignature('value?: string; children: React.ReactNode; onSelect?: () => void;');
    expect(isFormLike(sig)).toBe(false);
  });

  it('isFormLike stays true for partial form APIs (genuine R1 candidates)', () => {
    expect(isFormLike(readSlotSignature('value?: number; onChange?: (n: number) => void;'))).toBe(true);
    expect(isFormLike(readSlotSignature('defaultValue?: string;'))).toBe(true);
    expect(isFormLike(readSlotSignature('value?: string; defaultValue?: string;'))).toBe(true);
  });

  it('readSlotSignature maps checked/defaultChecked to the controlled pair (checkbox convention)', () => {
    const sig = readSlotSignature(
      'checked?: boolean; defaultChecked?: boolean; onChange?: (next: boolean) => void; value?: string;',
    );
    expect(sig.hasValue).toBe(true);
    expect(sig.hasDefaultValue).toBe(true);
    expect(sig.hasOnChange).toBe(true);
    expect(sig.valueTypeText).toBe('boolean');
    expect(sig.valueSlotName).toBe('checked');
    expect(sig.defaultValueSlotName).toBe('defaultChecked');
  });

  it('readSlotSignature reports plain slot names outside the checkbox convention', () => {
    const sig = readSlotSignature('value?: string; defaultValue?: string; onChange?: (s: string) => void;');
    expect(sig.valueSlotName).toBe('value');
    expect(sig.defaultValueSlotName).toBe('defaultValue');
  });

  it('scanSource detects hook calls with explicit generic type arguments', () => {
    const scan = scanSource('/x/generic.tsx', GENERIC_CALL_SOURCE);
    expect(scan.importsUseControllableState).toBe(true);
    expect(scan.callsUseControllableState).toBe(true);
  });

  it('isEventStyleOnChange detects React.ChangeEvent and friends', () => {
    expect(isEventStyleOnChange('(e: React.ChangeEvent<HTMLInputElement>) => void')).toBe(true);
    expect(isEventStyleOnChange('(event: ChangeEvent<HTMLInputElement>) => void')).toBe(true);
    expect(isEventStyleOnChange('(e: FormEvent<HTMLInputElement>) => void')).toBe(true);
    expect(isEventStyleOnChange('(e: React.KeyboardEvent) => void')).toBe(true);
    expect(isEventStyleOnChange('(next: string) => void')).toBe(false);
    expect(isEventStyleOnChange('(next: number) => void')).toBe(false);
    expect(isEventStyleOnChange(null)).toBe(false);
  });

  it('scanSource detects useControllableState import + call', () => {
    const scan = scanSource('/x/foo.tsx', COMPLIANT_SOURCE);
    expect(scan.importsUseControllableState).toBe(true);
    expect(scan.callsUseControllableState).toBe(true);
    expect(scan.blocks).toHaveLength(1);
    expect(scan.blocks[0].propsTypeName).toBe('PixelNumberInputProps');
  });
});

// ---------------------------------------------------------------------------
// Gate-level tests
// ---------------------------------------------------------------------------

describe('ControlledUncontrolledPatternGate', () => {
  it('identifies itself with id=25 and the canonical name', () => {
    const gate = new ControlledUncontrolledPatternGate();
    expect(gate.id).toBe(25);
    expect(gate.name).toBe('controlled-uncontrolled-pattern');
    expect(gate.description.length).toBeGreaterThan(40);
  });

  it('passes vacuously when no source files are discovered', async () => {
    const ctx = makeCtx(tmpRoot);
    const gate = new ControlledUncontrolledPatternGate({
      discoverFiles: async () => [],
      readFile: async () => '',
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.name).toBe('controlled-uncontrolled-pattern');
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('silently skips non-form components', async () => {
    const file = path.join(tmpRoot, 'PixelButton.tsx');
    const gate = gateWith({ [file]: NON_FORM_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('passes a fully-compliant form component', async () => {
    const file = path.join(tmpRoot, 'PixelNumberInput.tsx');
    const gate = gateWith({ [file]: COMPLIANT_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  // ----- R1: missing slots -----

  it('flags MAJOR when defaultValue is missing (controlled-only)', async () => {
    const file = path.join(tmpRoot, 'PixelSlider.tsx');
    const gate = gateWith({ [file]: CONTROLLED_ONLY_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    const missing = result.findings.find((f) => f.message.includes('defaultValue?'));
    expect(missing).toBeDefined();
    expect(missing!.severity).toBe('major');
    expect(missing!.component).toBe('PixelSlider');
    expect(missing!.file).toContain('PixelSlider.tsx');
    expect(missing!.suggestion).toMatch(/defaultValue\?: number/);
  });

  it('flags MAJOR when value is missing (uncontrolled-only)', async () => {
    const file = path.join(tmpRoot, 'PixelSwitch.tsx');
    const gate = gateWith({ [file]: UNCONTROLLED_ONLY_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    const missing = result.findings.find((f) => f.message.includes('value?'));
    expect(missing).toBeDefined();
    expect(missing!.severity).toBe('major');
    expect(missing!.component).toBe('PixelSwitch');
    expect(missing!.suggestion).toMatch(/value\?: boolean/);
  });

  it('flags MAJOR when onChange is missing', async () => {
    const file = path.join(tmpRoot, 'PixelDisplay.tsx');
    const gate = gateWith({ [file]: MISSING_ONCHANGE_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    const missing = result.findings.find((f) => f.message.includes('onChange?'));
    expect(missing).toBeDefined();
    expect(missing!.severity).toBe('major');
    expect(missing!.suggestion).toMatch(/onChange\?: \(next: string\) => void/);
  });

  // ----- R2: missing hook usage -----

  it('flags MAJOR when the file does not import useControllableState', async () => {
    const file = path.join(tmpRoot, 'PixelTextarea.tsx');
    const gate = gateWith({ [file]: NO_HOOK_IMPORT_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    const hookFinding = result.findings.find((f) =>
      f.message.includes('does not import useControllableState'),
    );
    expect(hookFinding).toBeDefined();
    expect(hookFinding!.severity).toBe('major');
    expect(hookFinding!.component).toBe('PixelTextarea');
    expect(hookFinding!.suggestion).toMatch(/import \{ useControllableState/);
    expect(hookFinding!.suggestion).toMatch(/useControllableState\(\{/);
  });

  it('flags MAJOR when the file imports but never calls useControllableState', async () => {
    const file = path.join(tmpRoot, 'PixelChip.tsx');
    const gate = gateWith({ [file]: IMPORTS_BUT_NEVER_CALLS_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    const hookFinding = result.findings.find((f) =>
      f.message.includes('does not call useControllableState'),
    );
    expect(hookFinding).toBeDefined();
    expect(hookFinding!.severity).toBe('major');
    expect(hookFinding!.component).toBe('PixelChip');
  });

  // ----- R3: event-style onChange -----

  it('flags MAJOR when onChange uses React.ChangeEvent', async () => {
    const file = path.join(tmpRoot, 'PixelLegacyInput.tsx');
    const gate = gateWith({ [file]: EVENT_STYLE_ONCHANGE_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    const eventFinding = result.findings.find((f) =>
      f.message.includes('event-style'),
    );
    expect(eventFinding).toBeDefined();
    expect(eventFinding!.severity).toBe('major');
    expect(eventFinding!.component).toBe('PixelLegacyInput');
    expect(eventFinding!.message).toMatch(/React\.ChangeEvent/);
    expect(eventFinding!.suggestion).toMatch(/onChange\?: \(next: string\) => void/);
    expect(eventFinding!.suggestion).toMatch(/onChange\?\.\(next\)/);
  });

  it('also catches FormEvent / KeyboardEvent / SyntheticEvent in onChange param', async () => {
    const file = path.join(tmpRoot, 'PixelFormish.tsx');
    const gate = gateWith({ [file]: FORM_EVENT_ONCHANGE_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    const eventFinding = result.findings.find((f) =>
      f.message.includes('event-style'),
    );
    expect(eventFinding).toBeDefined();
    expect(eventFinding!.severity).toBe('major');
  });

  // ----- Detector calibration: generic call syntax (R2) -----

  it('passes when useControllableState is called with explicit generic type arguments', async () => {
    const file = path.join(tmpRoot, 'PixelGenericInput.tsx');
    const gate = gateWith({ [file]: GENERIC_CALL_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  // ----- Detector calibration: checkbox convention (R1) -----

  it('passes checkbox-convention components (checked/defaultChecked + HTML form value)', async () => {
    const file = path.join(tmpRoot, 'PixelCheckbox.tsx');
    const gate = gateWith({ [file]: CHECKBOX_CONVENTION_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('still flags checkbox-convention components missing defaultChecked', async () => {
    const file = path.join(tmpRoot, 'PixelBrokenSwitch.tsx');
    const gate = gateWith({ [file]: CHECKBOX_MISSING_DEFAULT_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    const missing = result.findings.find((f) => f.message.includes('defaultChecked?'));
    expect(missing).toBeDefined();
    expect(missing!.severity).toBe('major');
    expect(missing!.component).toBe('PixelBrokenSwitch');
    expect(missing!.suggestion).toMatch(/defaultChecked\?: boolean/);
  });

  // ----- Detector calibration: value-as-identity (form-likeness) -----

  it('skips blocks whose only slot is an identity value (no onChange / defaultValue)', async () => {
    const file = path.join(tmpRoot, 'MenuItem.tsx');
    const gate = gateWith({ [file]: IDENTITY_VALUE_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  // ----- Multi-block files -----

  it('evaluates each Props block in a multi-component file', async () => {
    const file = path.join(tmpRoot, 'PixelTabs.tsx');
    const gate = gateWith({ [file]: MULTI_BLOCK_SOURCE });
    const result = await gate.run(makeCtx(tmpRoot));
    // PixelTabsProps is fully compliant; PixelTabsItemProps has no slots so is
    // ignored. Net: should pass.
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('aggregates findings across multiple files', async () => {
    const files = {
      [path.join(tmpRoot, 'a.tsx')]: CONTROLLED_ONLY_SOURCE,
      [path.join(tmpRoot, 'b.tsx')]: COMPLIANT_SOURCE,
      [path.join(tmpRoot, 'c.tsx')]: EVENT_STYLE_ONCHANGE_SOURCE,
    };
    const gate = gateWith(files);
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    // a → missing defaultValue (1) ; b → 0 ; c → event-style onChange (1).
    expect(result.findings.length).toBeGreaterThanOrEqual(2);
    const components = new Set(result.findings.map((f) => f.component));
    expect(components.has('PixelSlider')).toBe(true);
    expect(components.has('PixelLegacyInput')).toBe(true);
    expect(components.has('PixelNumberInput')).toBe(false);
  });

  it('every finding carries severity=major and an actionable suggestion', async () => {
    const files = {
      [path.join(tmpRoot, 'a.tsx')]: CONTROLLED_ONLY_SOURCE,
      [path.join(tmpRoot, 'b.tsx')]: UNCONTROLLED_ONLY_SOURCE,
      [path.join(tmpRoot, 'c.tsx')]: NO_HOOK_IMPORT_SOURCE,
      [path.join(tmpRoot, 'd.tsx')]: EVENT_STYLE_ONCHANGE_SOURCE,
    };
    const gate = gateWith(files);
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.passed).toBe(false);
    for (const f of result.findings) {
      expect(f.severity).toBe('major');
      expect(f.suggestion?.length ?? 0).toBeGreaterThan(20);
      expect(f.file).toBeTruthy();
      expect(f.component).toBeTruthy();
    }
  });

  it('returns a non-negative duration_ms', async () => {
    const gate = new ControlledUncontrolledPatternGate({
      discoverFiles: async () => [],
      readFile: async () => '',
    });
    const result = await gate.run(makeCtx(tmpRoot));
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration_ms).toBe('number');
  });
});
