import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useForm, useFormContext } from 'react-hook-form';
import { PixelForm } from '../../forms/PixelForm';

type LoginFields = { email: string; password: string };

function LoginForm({ onSubmit }: { onSubmit: (data: LoginFields) => void }) {
  const form = useForm<LoginFields>({ defaultValues: { email: '', password: '' } });
  return (
    <PixelForm.Root form={form} onSubmit={onSubmit}>
      <PixelForm.Field
        name="email"
        render={({ field, fieldState }) => (
          <PixelForm.Item>
            <PixelForm.Label>Email</PixelForm.Label>
            <PixelForm.Control>
              <input data-testid="email-input" {...field} />
            </PixelForm.Control>
            <PixelForm.Description>We never spam.</PixelForm.Description>
            <PixelForm.Message>{fieldState.error?.message}</PixelForm.Message>
          </PixelForm.Item>
        )}
      />
      <button type="submit">Submit</button>
    </PixelForm.Root>
  );
}

describe('PixelForm', () => {
  it('PixelForm.Root provides form context', () => {
    const form = (null as unknown) as ReturnType<typeof useForm>;
    let captured: unknown = null;
    function Probe() {
      captured = useFormContext();
      return <span data-testid="probe">probe</span>;
    }
    function Wrapper() {
      const f = useForm({ defaultValues: { x: '' } });
      return (
        <PixelForm.Root form={f} onSubmit={() => {}}>
          <Probe />
        </PixelForm.Root>
      );
    }
    render(<Wrapper />);
    expect(screen.getByTestId('probe')).toBeInTheDocument();
    expect(captured).not.toBeNull();
    // shape check — react-hook-form context exposes `register`
    expect(typeof (captured as { register: unknown }).register).toBe('function');
    void form;
  });

  it('PixelForm.Field renders via render prop with field + fieldState', () => {
    const renderSpy = vi.fn();
    function W() {
      const form = useForm({ defaultValues: { name: 'joangel' } });
      return (
        <PixelForm.Root form={form} onSubmit={() => {}}>
          <PixelForm.Field
            name="name"
            render={(args) => {
              renderSpy(args);
              return <input data-testid="name" value={args.field.value} onChange={args.field.onChange} />;
            }}
          />
        </PixelForm.Root>
      );
    }
    render(<W />);
    expect(screen.getByTestId('name')).toHaveValue('joangel');
    expect(renderSpy).toHaveBeenCalled();
    const arg = renderSpy.mock.calls[0][0];
    expect(arg.field).toBeDefined();
    expect(arg.fieldState).toBeDefined();
    expect(typeof arg.field.onChange).toBe('function');
  });

  it('PixelForm.Item generates linked IDs (Label htmlFor matches Control id) + aria-describedby', () => {
    render(<LoginForm onSubmit={() => {}} />);
    const input = screen.getByTestId('email-input');
    const label = screen.getByText('Email');
    expect(input.getAttribute('id')).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // description + message ids both referenced
    const desc = screen.getByText('We never spam.');
    expect(describedBy).toContain(desc.id);
  });

  it('PixelForm.Message renders error text when field has error and sets aria-invalid', async () => {
    function W() {
      const form = useForm<{ email: string }>({ defaultValues: { email: '' } });
      return (
        <PixelForm.Root
          form={form}
          onSubmit={() => {}}
        >
          <PixelForm.Field
            name="email"
            rules={{ required: 'Email is required' }}
            render={({ field, fieldState }) => (
              <PixelForm.Item>
                <PixelForm.Label>Email</PixelForm.Label>
                <PixelForm.Control>
                  <input data-testid="email" {...field} />
                </PixelForm.Control>
                <PixelForm.Message>{fieldState.error?.message}</PixelForm.Message>
              </PixelForm.Item>
            )}
          />
          <button type="submit">Go</button>
        </PixelForm.Root>
      );
    }
    render(<W />);
    fireEvent.click(screen.getByText('Go'));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    const input = screen.getByTestId('email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('Submitting calls onSubmit with form values', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    const input = screen.getByTestId('email-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'me@joangel.ai' } });
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'me@joangel.ai', password: '' });
  });
});
