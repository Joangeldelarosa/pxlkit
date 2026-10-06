import { describe, expect, it } from 'vitest';
import { fieldDescribedBy, fieldMessageId } from '../../../index';

describe('field message wiring', () => {
  it("derives the message id from the control's id", () => {
    expect(fieldMessageId('email')).toBe('email-msg');
  });

  it('points at the message only while a hint or an error is shown', () => {
    expect(fieldDescribedBy('email', {})).toBeUndefined();
    expect(fieldDescribedBy('email', { hint: '', error: '' })).toBeUndefined();
    expect(fieldDescribedBy('email', { hint: 'We never share it' })).toBe('email-msg');
    expect(fieldDescribedBy('email', { error: 'Required' })).toBe('email-msg');
    expect(fieldDescribedBy('email', { hint: 'hint', error: 'Required' })).toBe('email-msg');
  });

  it("keeps the consumer's ids first and adds the message after them", () => {
    expect(fieldDescribedBy('email', {}, 'rules')).toBe('rules');
    expect(fieldDescribedBy('email', { hint: 'hint' }, 'rules')).toBe('rules email-msg');
    expect(fieldDescribedBy('email', { error: 'Required' }, ' rules extra ')).toBe('rules extra email-msg');
    expect(fieldDescribedBy('email', {}, '  ')).toBeUndefined();
    expect(fieldDescribedBy('email', { hint: 'hint' }, '')).toBe('email-msg');
  });
});
