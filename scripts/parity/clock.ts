/**
 * Simulated time for recordings. Every timer a recording can start —
 * timeouts, intervals, animation frames, `Date`, `performance.now()` — runs on
 * a fake clock that moves only when a step waits or the harness settles, so
 * the same delays fire at the same step in every framework however busy the
 * machine is: on a loaded CI runner, real timers fired hundreds of
 * milliseconds late, and one framework's tooltip was still open at a step
 * where the other's had closed.
 */
import { vi } from 'vitest';

/**
 * Where every recording's clock starts: the wall-clock time the harness was
 * loaded at, taken once per run. Starting each recording at the wall-clock
 * time of its own start, a run that crossed midnight between the React
 * recording of a date example and the port's saw two different days.
 */
const start = Date.now();

/** Starts the fake clock, at the run's start time (a plausible `Date`, the same for every recording). */
export function useSimulatedTime(): void {
  vi.useFakeTimers({
    now: start,
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'Date',
      'performance',
    ],
  });
}

/** Back to real timers. */
export function useRealTime(): void {
  vi.useRealTimers();
}

/**
 * Lets `ms` pass — on the fake clock while it runs, in real time otherwise —
 * running every timer due meanwhile and the promise chains they start.
 */
export async function elapse(ms: number): Promise<void> {
  if (vi.isFakeTimers()) await vi.advanceTimersByTimeAsync(ms);
  else await new Promise((done) => setTimeout(done, ms));
}
