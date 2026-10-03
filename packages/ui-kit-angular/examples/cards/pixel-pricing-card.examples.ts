import { Component } from '@angular/core';
import { PixelBadge, PixelPricingCard } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelPricingCard],
  template: `
    <pxl-pricing-card
      tone="cyan"
      name="Starter"
      description="Everything you need to ship your first project."
      [price]="{ amount: '$19', period: '/mo' }"
      [features]="[
        { label: '10 projects' },
        { label: 'Basic analytics' },
        { label: 'Email support' },
        { label: 'Priority support', included: false },
      ]"
    />
  `,
})
export class Default {}

@Component({
  imports: [PixelBadge, PixelPricingCard],
  template: `
    <pxl-pricing-card
      tone="green"
      name="Team"
      description="Annual billing with every collaboration feature unlocked, plus hands-on onboarding for larger workspaces — the description flows freely with descriptionLines set to 'none'."
      descriptionLines="none"
      [price]="{ amount: '$39', period: '/mo', strikethrough: '$59' }"
      [priceBadge]="discount"
      [features]="[{ label: 'Unlimited projects' }, { label: 'SSO + audit log', highlight: true }, { label: 'Priority support' }]"
    />
    <ng-template #discount><pxl-badge tone="green" size="sm">-33%</pxl-badge></ng-template>
  `,
})
export class WithPriceBadge {}

@Component({
  imports: [PixelPricingCard],
  template: `
    <pxl-pricing-card
      tone="gold"
      highlight
      name="Pro"
      description="For teams that want more power and priority."
      [price]="{ amount: '$49', period: '/mo', strikethrough: '$79' }"
      [popular]="{ label: 'POPULAR', tone: 'gold' }"
      [features]="[{ label: 'Unlimited projects' }, { label: 'Advanced analytics' }, { label: 'Priority support' }]"
    />
  `,
})
export class Popular {}
