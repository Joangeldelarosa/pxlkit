import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLogger } from '../_lib/load-context.js';

describe('createLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prints info and debug lines on stdout by default', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = createLogger(true);
    logger.info('found');
    logger.debug('detail');
    expect(log).toHaveBeenCalledTimes(2);
    expect(error).not.toHaveBeenCalled();
  });

  it('keeps stdout for the report with `stderr` (JSON mode)', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = createLogger(true, { stderr: true });
    logger.info('found');
    logger.debug('detail');
    logger.warn('odd');
    logger.error('bad');
    expect(log).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('drops debug lines unless verbose', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    createLogger().debug('detail');
    expect(log).not.toHaveBeenCalled();
  });
});
