'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from '../../components/ToastProvider';
import {
  PixelAccordion,
  PixelBadge,
  PixelButton,
  PixelCard,
  PixelCodeInline,
  PixelInput,
  PixelModal,
  PixelPricingCard,
  PixelTable,
} from '@pxlkit/ui-kit';
import { UI_COMPONENTS_COUNT, ICON_COUNT_LABEL, ICON_PACK_COUNT } from '@/lib/pxlkit-counts';

/* ─── Animation helpers ─── */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

/* ─── Pixel Check Icon (inline) ─── */
function PixelCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={className ?? 'w-3.5 h-3.5'} shapeRendering="crispEdges" fill="currentColor">
      <rect x="6" y="1" width="1" height="1" />
      <rect x="5" y="2" width="1" height="1" />
      <rect x="4" y="3" width="1" height="1" />
      <rect x="3" y="4" width="1" height="1" />
      <rect x="2" y="5" width="1" height="1" />
      <rect x="1" y="4" width="1" height="1" />
    </svg>
  );
}

/* ─── Pixel X Icon (inline) ─── */
function PixelX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={className ?? 'w-3 h-3'} shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="1" width="1" height="1" />
      <rect x="6" y="1" width="1" height="1" />
      <rect x="2" y="2" width="1" height="1" />
      <rect x="5" y="2" width="1" height="1" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="2" y="5" width="1" height="1" />
      <rect x="5" y="5" width="1" height="1" />
      <rect x="1" y="6" width="1" height="1" />
      <rect x="6" y="6" width="1" height="1" />
    </svg>
  );
}

/* ─── Plan data ─── */
interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  price: string;
  /** Original price before discount (shown with strikethrough) */
  originalPrice?: string;
  priceSuffix: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
  color: 'green' | 'gold' | 'cyan';
}

const PLANS: Plan[] = [
  {
    name: 'Community',
    price: 'Free',
    priceSuffix: 'forever',
    description: 'Perfect for: side projects, OSS work, prototypes, and any commercial product happy to keep a small attribution credit. The kit + every icon pack, free.',
    color: 'green',
    cta: 'Get Started',
    ctaHref: '/docs',
    features: [
      { text: `${ICON_COUNT_LABEL} pixel art icons`, included: true },
      { text: `${ICON_PACK_COUNT} thematic icon packs`, included: true },
      { text: 'Static & animated icons', included: true },
      { text: 'MIT code packages', included: true },
      { text: 'Visual Icon Builder', included: true },
      { text: 'Toast notification system', included: true },
      { text: 'Commercial use for asset packs', included: true },
      { text: 'Asset attribution required', included: true, highlight: true },
      { text: 'Remove attribution', included: false },
    ],
  },
  {
    name: 'Indie',
    price: '$9.50',
    originalPrice: '$19',
    priceSuffix: 'one-time · 1 project',
    description: 'Perfect for: a solo dev shipping one paid product who needs a clean footer — no attribution credit on the icons. MIT code stays free either way.',
    color: 'gold',
    popular: true,
    cta: 'Buy Indie License',
    ctaHref: 'mailto:info@pxlkit.xyz?subject=Indie%20License%20Purchase',
    features: [
      { text: 'Everything in Community', included: true },
      { text: 'No asset attribution required', included: true, highlight: true },
      { text: '1 commercial project', included: true },
      { text: 'Lifetime license', included: true },
      { text: 'All current icon packs', included: true },
      { text: 'Updates at time of purchase', included: true },
      { text: 'Future icon packs', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Team',
    price: '$24.50',
    originalPrice: '$49',
    priceSuffix: 'one-time · unlimited projects',
    description: 'Perfect for: agencies and product teams shipping many things. Unlimited products, every future icon pack included, priority support — paid once.',
    color: 'cyan',
    cta: 'Buy Team License',
    ctaHref: 'mailto:info@pxlkit.xyz?subject=Team%20License%20Purchase',
    features: [
      { text: 'Everything in Indie', included: true },
      { text: 'No asset attribution required', included: true, highlight: true },
      { text: 'Unlimited projects', included: true, highlight: true },
      { text: 'Lifetime license', included: true },
      { text: 'All current & future packs', included: true },
      { text: 'Priority GitHub issues', included: true },
      { text: 'Logo in README sponsors', included: true },
      { text: 'Email support', included: true },
    ],
  },
];

/* ─── FAQ ─── */
const FAQ_ITEMS = [
  {
    q: 'What counts as "attribution"?',
    a: 'A visible "Powered by Pxlkit" or "Icons by Pxlkit" text with a link to pxlkit.xyz. Place it in your footer, about page, credits section, or README. It must be reasonably visible to end users.',
  },
  {
    q: 'Can I use the free version for commercial projects?',
    a: 'Yes. MIT code packages can be used commercially with no attribution. The icon packs are also allowed in commercial projects under the free Community asset terms, as long as you include the attribution credit.',
  },
  {
    q: 'What is a "project"?',
    a: 'A single deployed application, website, or product identified by a unique domain, app store listing, or product name. A staging/dev version of the same product does not count as a separate project.',
  },
  {
    q: 'Are the licenses one-time payments?',
    a: 'Yes. Both Indie and Team are one-time payments, not subscriptions. You pay once and get a lifetime license for the tier you choose.',
  },
  {
    q: 'Can I redistribute the icons as my own icon library?',
    a: 'No. You can use the icons in your applications and projects, but you cannot redistribute them as a standalone icon library or competing product. This protects the community and the creators.',
  },
  {
    q: 'What happens if I need to upgrade from Indie to Team?',
    a: 'Contact us at info@pxlkit.xyz and we\'ll credit your Indie purchase toward the Team license. You only pay the difference.',
  },
  {
    q: 'Do contributors get a free license?',
    a: 'Yes! Anyone who contributes accepted icons, code, or significant documentation to pxlkit receives a free Team license as a thank-you.',
  },
  {
    q: 'Is the source code still open?',
    a: 'Yes. The core code packages are MIT-licensed and fully available on GitHub. Attribution and paid tiers only apply to the icon and visual asset packages.',
  },
];

/* ──────────────────── MAIN PAGE ──────────────────── */
export default function PricingPage() {
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="relative overflow-x-hidden w-full max-w-[100vw]">
        <HeroSection />
        <PlansSection />
        <ComparisonTable />
        <FAQSection />
        <CTASection />
      </div>
    </PayPalScriptProvider>
  );
}

/* ──────────────── HERO ──────────────── */
function HeroSection() {
  return (
    <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 text-center px-4">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-retro-gold/6 rounded-full blur-[120px] pointer-events-none" />

      <motion.div className="relative z-10" {...fadeInUp}>
        <PixelBadge tone="red" className="mb-3 animate-pulse">
          <span aria-label="50% off launch special">🔥 50% OFF — Launch Special</span>
        </PixelBadge>
        <br />
        <PixelBadge
          tone="gold"
          variant="outline"
          className="mb-6 backdrop-blur-sm"
          iconLeft={<span className="w-2 h-2 bg-retro-gold rounded-full animate-pulse" />}
        >
          MIT Code · Licensed Assets
        </PixelBadge>
      </motion.div>

      <motion.h1
        className="font-pixel text-2xl sm:text-3xl md:text-4xl text-retro-text leading-relaxed mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <span className="text-retro-gold text-glow">LICENSING</span>
        {' & '}
        <span className="text-retro-green text-glow">PRICING</span>
      </motion.h1>

      <motion.p
        className="text-lg sm:text-xl text-retro-muted max-w-2xl mx-auto mb-4 font-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        Pay once if you need to. MIT code is free forever, icon packs are free with a credit — and a lifetime asset
        license drops the credit when you ship to a client.
        <br />
        <span className="text-retro-text/70">No subscriptions. No per-seat math. No surprise renewal email next December.</span>
      </motion.p>

      <motion.p
        className="text-sm text-retro-muted/60 max-w-xl mx-auto font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Same kit on every tier — pricing only changes the asset attribution rules
      </motion.p>
    </section>
  );
}

/* ──────────────── PLANS CARDS ──────────────── */
function PlansSection() {
  return (
    <section className="relative px-4 pb-20 sm:pb-28">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </motion.div>

        {/* Trust note */}
        <motion.p
          className="text-center text-retro-muted/50 text-xs font-mono mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          All prices in USD · Secure payment via PayPal · Instant license delivery · 14-day money-back guarantee
        </motion.p>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <motion.div variants={fadeInUp} className="flex">
      <PixelPricingCard
        tone={plan.color}
        highlight
        popular={plan.popular ? { label: 'MOST POPULAR', tone: plan.color } : undefined}
        name={plan.name}
        description={plan.description}
        descriptionLines="none"
        price={{ amount: plan.price, period: plan.priceSuffix, strikethrough: plan.originalPrice }}
        priceBadge={
          plan.originalPrice ? (
            <PixelBadge tone="red" size="sm">50% OFF — Launch Special</PixelBadge>
          ) : undefined
        }
        features={plan.features.map((f) => ({ label: f.text, included: f.included, highlight: f.highlight }))}
        cta={
          plan.price === 'Free' ? (
            <PixelButton asChild variant="outline" tone={plan.color} fullWidth>
              <Link href={plan.ctaHref}>{plan.cta}</Link>
            </PixelButton>
          ) : (
            <PurchaseCheckout plan={plan} />
          )
        }
        className="w-full"
      />
    </motion.div>
  );
}

function PurchaseCheckout({ plan }: { plan: Plan }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // States: 'form' -> 'payment' -> 'success'
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [buyerData, setBuyerData] = useState({ name: '', email: '', projectName: '' });
  const [licenseKey, setLicenseKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerData.name || !buyerData.email) {
      toast({ tone: 'error', title: 'REQUIRED FIELDS', message: 'Name and Email are required.', duration: 3000 });
      return;
    }
    setStep('payment');
  };

  const capturePayment = async (orderID: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID, planName: plan.name, buyerData })
      });
      const result = await response.json();

      if (result.success) {
        setLicenseKey(result.license);
        setStep('success');
      } else {
        throw new Error(result.error || 'Failed to capture payment');
      }
    } catch (error) {
       console.error(error);
       toast({ tone: 'error', title: 'PAYMENT FAILED', message: 'There was an error processing your payment.', duration: 5000 });
       setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <PixelButton
        variant={plan.popular ? 'soft' : 'outline'}
        tone={plan.color}
        fullWidth
        onClick={() => setIsOpen(true)}
      >
        {plan.cta}
      </PixelButton>

      <PixelModal
        open={isOpen}
        title={`${plan.name} Checkout`}
        description="Complete your details to secure your license."
        onClose={() => { if (!isProcessing) setIsOpen(false); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {isProcessing && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-retro-surface/80 backdrop-blur-sm font-pixel text-retro-cyan">
              PROCESSING...
            </div>
          )}

          <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {step === 'form' && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <PixelInput
                  required
                  type="text"
                  label="Full Name *"
                  tone="cyan"
                  value={buyerData.name}
                  onChange={e => setBuyerData({...buyerData, name: e.target.value})}
                  placeholder="John Doe"
                />
                <PixelInput
                  required
                  type="email"
                  label="Email Address (for License) *"
                  tone="cyan"
                  value={buyerData.email}
                  onChange={e => setBuyerData({...buyerData, email: e.target.value})}
                  placeholder="you@company.com"
                />
                <PixelInput
                  type="text"
                  label="Project/Company Name (Optional)"
                  tone="cyan"
                  value={buyerData.projectName}
                  onChange={e => setBuyerData({...buyerData, projectName: e.target.value})}
                  placeholder="Acme Corp App"
                />

                <PixelButton type="submit" tone="cyan" variant="soft" fullWidth>
                  CONTINUE TO PAYMENT
                </PixelButton>
              </form>
            )}

            {step === 'payment' && (
              <div className="space-y-4 pb-2">
                <div className="p-4 bg-retro-bg/50 border border-retro-border/30 rounded-md mb-6 font-mono text-xs text-retro-muted flex justify-between">
                  <span>Total due:</span>
                  <span className="font-bold text-retro-text">{plan.price} USD</span>
                </div>

                <PayPalButtons
                  style={{ layout: "vertical", height: 45, tagline: false }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [{
                        description: `Pxlkit ${plan.name} License`,
                        amount: { currency_code: "USD", value: plan.price.replace('$', '') },
                      }],
                    });
                  }}
                  onApprove={async (data) => {
                    await capturePayment(data.orderID);
                  }}
                  onError={(err) => {
                    console.error("PayPal Error:", err);
                    toast({ tone: 'error', title: 'PAYMENT ERROR', message: 'PayPal encountered an error. Please try again.', duration: 5000 });
                  }}
                />

                {process.env.NODE_ENV === 'development' && (
                  <PixelButton
                    size="sm"
                    tone="cyan"
                    variant="outline"
                    fullWidth
                    onClick={() => capturePayment('DEV_ORDER_ID')}
                  >
                    [ DEV SIMULATE SUCCESS ]
                  </PixelButton>
                )}

                <PixelButton size="sm" tone="neutral" variant="ghost" fullWidth onClick={() => setStep('form')}>
                  ← Back to details
                </PixelButton>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-retro-green/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-retro-green/50">
                  <PixelCheck className="w-8 h-8 text-retro-green" />
                </div>
                <h4 className="font-pixel text-retro-green text-lg mb-2">PAYMENT SUCCESSFUL!</h4>
                <p className="text-retro-muted font-body text-sm mb-6">Your license key has been securely emailed to <strong>{buyerData.email}</strong>.</p>

                <PixelCard title="Your License Key" className="mb-8 text-left">
                  <p className="font-mono text-retro-text text-lg tracking-widest break-all">{licenseKey}</p>
                </PixelCard>

                <PixelButton asChild variant="outline" tone="green" fullWidth>
                  <Link href="/docs">GET STARTED</Link>
                </PixelButton>
              </div>
            )}
          </div>
        </motion.div>
      </PixelModal>
    </>
  );
}

/* ──────────────── COMPARISON TABLE ──────────────── */
interface ComparisonRow {
  feature: string;
  community: boolean | string;
  indie: boolean | string;
  team: boolean | string;
}

function ComparisonTable() {
  const rows: ComparisonRow[] = [
    { feature: `${ICON_COUNT_LABEL} pixel art icons`, community: true, indie: true, team: true },
    { feature: `${UI_COMPONENTS_COUNT} React components & SVG export`, community: true, indie: true, team: true },
    { feature: 'Visual Icon Builder', community: true, indie: true, team: true },
    { feature: 'Toast notification system', community: true, indie: true, team: true },
    { feature: 'Static & animated icons', community: true, indie: true, team: true },
    { feature: 'Commercial use', community: true, indie: true, team: true },
    { feature: 'Asset attribution required', community: true, indie: false, team: false },
    { feature: 'Projects included', community: '∞', indie: '1', team: '∞' },
    { feature: 'Future icon packs', community: true, indie: false, team: true },
    { feature: 'Priority support', community: false, indie: false, team: true },
    { feature: 'README sponsor logo', community: false, indie: false, team: true },
    { feature: 'Email support', community: false, indie: false, team: true },
  ];

  return (
    <section className="px-4 pb-20 sm:pb-28">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="font-pixel text-lg sm:text-xl text-retro-text text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-retro-cyan">COMPARE</span> PLANS
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <PixelTable<ComparisonRow>
            data={rows}
            columns={[
              {
                key: 'feature',
                header: 'Feature',
                render: (row) => <span className="text-retro-text/80 text-xs sm:text-sm">{row.feature}</span>,
              },
              {
                key: 'community',
                header: <span className="font-pixel text-[10px] text-retro-green">COMMUNITY</span>,
                align: 'center',
                render: (row) => <CellValue value={row.community} row={row.feature} />,
              },
              {
                key: 'indie',
                header: <span className="font-pixel text-[10px] text-retro-gold">INDIE</span>,
                align: 'center',
                render: (row) => <CellValue value={row.indie} row={row.feature} />,
              },
              {
                key: 'team',
                header: <span className="font-pixel text-[10px] text-retro-cyan">TEAM</span>,
                align: 'center',
                render: (row) => <CellValue value={row.team} row={row.feature} />,
              },
            ]}
          />
        </motion.div>
      </div>
    </section>
  );
}

function CellValue({ value, row }: { value: boolean | string; row: string }) {
  if (typeof value === 'string') {
    return <span className="text-retro-text/70 text-xs sm:text-sm font-medium">{value}</span>;
  }
  // "Asset attribution required" row: true = required (bad/neutral), false = not required (good)
  if (row === 'Asset attribution required') {
    return value ? (
      <span className="text-retro-gold/70 text-xs">Required</span>
    ) : (
      <span className="text-retro-green text-xs font-medium">Not required</span>
    );
  }
  return value ? (
    <PixelCheck className="w-3.5 h-3.5 text-retro-green mx-auto" />
  ) : (
    <PixelX className="w-3 h-3 text-retro-muted/30 mx-auto" />
  );
}

/* ──────────────── FAQ ──────────────── */
function FAQSection() {
  return (
    <section className="px-4 pb-20 sm:pb-28">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          className="font-pixel text-lg sm:text-xl text-retro-text text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-retro-purple">FREQUENTLY</span> ASKED
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
        >
          <PixelAccordion
            items={FAQ_ITEMS.map((item, i) => ({
              id: `faq-${i}`,
              title: item.q,
              content: (
                <p className="text-retro-muted text-xs sm:text-sm leading-relaxed">
                  {item.a}
                </p>
              ),
            }))}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────── CTA ──────────────── */
function CTASection() {
  const [, indie, team] = PLANS;

  return (
    <section className="relative px-4 pb-20 sm:pb-28">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] bg-retro-green/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="relative z-10 max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-pixel text-xl sm:text-2xl text-retro-green text-glow mb-4">
          INSTALL FIRST. DECIDE LATER.
        </h2>
        <p className="text-retro-muted text-base sm:text-lg font-body mb-8 max-w-lg mx-auto">
          Code is MIT, icon packs are free with a credit. Build the whole product on the Community tier, then upgrade
          only if you need the credit removed before launch.
        </p>

        {/* Install command */}
        <div className="mb-8">
          <PixelCodeInline tone="green">
            <span className="text-xs sm:text-sm">$ npm install @pxlkit/core @pxlkit/ui-kit</span>
          </PixelCodeInline>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <PixelButton asChild variant="outline" tone="green" size="lg">
            <Link href="/docs">READ THE DOCS</Link>
          </PixelButton>
          <PixelButton asChild variant="outline" tone="cyan" size="lg">
            <Link href="/icons">BROWSE ICONS</Link>
          </PixelButton>
        </div>

        {/* License summary */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <PixelCard title="COMMUNITY" tone="green">
            <p className="text-xs font-mono">Icon packs free with attribution</p>
          </PixelCard>
          <PixelCard title={indie.name.toUpperCase()} tone={indie.color}>
            <p className="text-xs font-mono">
              <span className="font-bold text-retro-text">{indie.price}</span>
              {indie.originalPrice && (
                <>
                  {' '}
                  <s className="line-through text-retro-muted/50">
                    <span className="sr-only">Previous price </span>
                    {indie.originalPrice}
                  </s>
                </>
              )}
              {' · 1 product, no asset attribution'}
            </p>
          </PixelCard>
          <PixelCard title={team.name.toUpperCase()} tone={team.color}>
            <p className="text-xs font-mono">
              <span className="font-bold text-retro-text">{team.price}</span>
              {team.originalPrice && (
                <>
                  {' '}
                  <s className="line-through text-retro-muted/50">
                    <span className="sr-only">Previous price </span>
                    {team.originalPrice}
                  </s>
                </>
              )}
              {' · Unlimited, no asset attribution'}
            </p>
          </PixelCard>
        </div>
      </motion.div>
    </section>
  );
}
