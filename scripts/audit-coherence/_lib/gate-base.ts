import type { AuditContext } from './load-context.js';

export type GateSeverity = 'blocker' | 'major' | 'minor' | 'info';

export interface GateFinding {
  severity: GateSeverity;
  file?: string;
  component?: string;
  message: string;
  suggestion?: string;
}

export interface GateResult {
  name: string;
  passed: boolean;
  findings: GateFinding[];
  duration_ms: number;
}

export abstract class Gate {
  abstract id: number;
  abstract name: string;
  abstract description: string;
  abstract run(ctx: AuditContext): Promise<GateResult>;
}

export function gateOk(name: string, duration_ms: number): GateResult {
  return { name, passed: true, findings: [], duration_ms };
}

export function gateFail(
  name: string,
  findings: GateFinding[],
  duration_ms: number,
): GateResult {
  const blocking = findings.some(
    (f) => f.severity === 'blocker' || f.severity === 'major',
  );
  return { name, passed: !blocking, findings, duration_ms };
}

export type { AuditContext };
