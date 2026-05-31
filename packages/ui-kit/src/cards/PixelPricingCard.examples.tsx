import React from 'react';
import { PixelPricingCard } from './PixelPricingCard';

export function Default() {
  return (
    <PixelPricingCard
      tone="cyan"
      name="Starter"
      description="Everything you need to ship your first project."
      price={{ amount: '$19', period: '/mo' }}
      features={[
        { label: '10 projects' },
        { label: 'Basic analytics' },
        { label: 'Email support' },
        { label: 'Priority support', included: false },
      ]}
    />
  );
}

export function Popular() {
  return (
    <PixelPricingCard
      tone="gold"
      highlight
      name="Pro"
      description="For teams that want more power and priority."
      price={{ amount: '$49', period: '/mo', strikethrough: '$79' }}
      popular={{ label: 'POPULAR', tone: 'gold' }}
      features={[
        { label: 'Unlimited projects' },
        { label: 'Advanced analytics' },
        { label: 'Priority support' },
      ]}
    />
  );
}
