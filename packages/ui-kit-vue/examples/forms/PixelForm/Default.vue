<script setup lang="ts">
import { useForm } from 'vee-validate';
import {
  PixelForm,
  PixelFormControl,
  PixelFormDescription,
  PixelFormField,
  PixelFormItem,
  PixelFormLabel,
  PixelFormMessage,
  PixelInput,
} from '@pxlkit/ui-kit-vue';

interface DefaultValues {
  username: string;
  email: string;
}

const form = useForm<DefaultValues>({
  initialValues: { username: '', email: '' },
});

const rules = {
  username: [(value: string) => !!value || 'Username is required'],
  email: [
    (value: string) => !!value || 'Email is required',
    (value: string) => /.+@.+\..+/.test(value) || 'Enter a valid email',
  ],
};

function onSubmit(data: DefaultValues) {
  console.log('submit', data);
}
</script>

<template>
  <PixelForm :form="form" @submit="onSubmit">
    <PixelFormField v-slot="{ field }" name="username" :rules="rules.username">
      <PixelFormItem>
        <PixelFormLabel>Username</PixelFormLabel>
        <PixelFormControl>
          <PixelInput placeholder="pxlhero" v-bind="field" />
        </PixelFormControl>
        <PixelFormDescription>Your retro alias.</PixelFormDescription>
        <PixelFormMessage />
      </PixelFormItem>
    </PixelFormField>

    <PixelFormField v-slot="{ field }" name="email" :rules="rules.email">
      <PixelFormItem>
        <PixelFormLabel>Email</PixelFormLabel>
        <PixelFormControl>
          <PixelInput type="email" placeholder="hero@pxlkit.xyz" v-bind="field" />
        </PixelFormControl>
        <PixelFormMessage />
      </PixelFormItem>
    </PixelFormField>
  </PixelForm>
</template>
