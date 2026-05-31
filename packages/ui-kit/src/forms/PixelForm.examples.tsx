'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { PixelForm } from './PixelForm';
import { PixelInput } from '../inputs';

type DefaultValues = {
  username: string;
  email: string;
};

export function Default() {
  const form = useForm<DefaultValues>({
    defaultValues: { username: '', email: '' },
  });

  return (
    <PixelForm
      form={form}
      onSubmit={(data) => {
        // eslint-disable-next-line no-console
        console.log('submit', data);
      }}
    >
      <PixelForm.Field
        name="username"
        rules={{ required: 'Username is required' }}
        render={({ field }) => (
          <PixelForm.Item>
            <PixelForm.Label>Username</PixelForm.Label>
            <PixelForm.Control>
              <PixelInput placeholder="pxlhero" {...field} />
            </PixelForm.Control>
            <PixelForm.Description>Your retro alias.</PixelForm.Description>
            <PixelForm.Message />
          </PixelForm.Item>
        )}
      />

      <PixelForm.Field
        name="email"
        rules={{
          required: 'Email is required',
          pattern: { value: /.+@.+\..+/, message: 'Enter a valid email' },
        }}
        render={({ field }) => (
          <PixelForm.Item>
            <PixelForm.Label>Email</PixelForm.Label>
            <PixelForm.Control>
              <PixelInput type="email" placeholder="hero@pxlkit.xyz" {...field} />
            </PixelForm.Control>
            <PixelForm.Message />
          </PixelForm.Item>
        )}
      />
    </PixelForm>
  );
}
