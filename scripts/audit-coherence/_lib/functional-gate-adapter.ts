/**
 * Adapter between the two gate contracts that grew in this audit suite:
 *
 *   - Class contract (`_lib/gate-base.ts`): `Gate` instances with
 *     `{ id, name, description, run(ctx) }` returning
 *     `{ name, passed, findings, duration_ms }`. This is what the
 *     orchestrator (`run.ts`) discovers and executes.
 *   - Functional contract (`../types.ts`): `(ctx: { repoRoot }) =>
 *     { gateId, description, drift: DriftItem[] }`. Gates 30-34 were
 *     authored against this shape; their unit tests call them directly.
 *
 * Wrapping the functional gate keeps its pure core (and tests) untouched
 * while making it a first-class citizen of the audit run. Before this
 * adapter existed those gates were silently skipped — and probing them as
 * zero-arg factories crashed the whole audit with a floating rejection.
 */

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from './gate-base.js';
import type { Gate as FunctionalGate } from '../types';

export interface FunctionalGateAdapterOptions {
  /** Numeric gate id (unique across `gates/*.ts`, mirrors the file prefix). */
  id: number;
  /** Gate name as reported in findings and the coherence report. */
  name: string;
  /** One-line description shown in the report. */
  description: string;
  /** The functional gate implementation to wrap. */
  fn: FunctionalGate;
}

class AdaptedFunctionalGate extends Gate {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  private readonly fn: FunctionalGate;

  constructor(options: FunctionalGateAdapterOptions) {
    super();
    this.id = options.id;
    this.name = options.name;
    this.description = options.description;
    this.fn = options.fn;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const result = await this.fn({ repoRoot: ctx.repoRoot });
    if (result.drift.length === 0) {
      return gateOk(this.name, Date.now() - started);
    }
    const findings: GateFinding[] = result.drift.map((d) => ({
      severity: d.severity,
      file: d.artifact,
      message: `${d.artifact}: expected ${d.expected}, actual ${d.actual}`,
    }));
    return gateFail(this.name, findings, Date.now() - started);
  }
}

export function adaptFunctionalGate(
  options: FunctionalGateAdapterOptions,
): Gate {
  return new AdaptedFunctionalGate(options);
}
