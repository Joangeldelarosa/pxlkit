'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from '../../components/ToastProvider';
import { PxlKitIcon } from '@pxlkit/core';
import { Trophy, Lightning } from '@pxlkit/gamification';
import { Heart } from '@pxlkit/social';
import { CheckCircle } from '@pxlkit/feedback';
import { PixelButton, UI_KIT_COMPONENTS } from '@pxlkit/ui-kit';

const UI_COMPONENTS_COUNT = UI_KIT_COMPONENTS.length;

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
    description: 'Perfect for personal projects, learning, and open source. All icons included — just add attribution.',
    color: 'green',
    cta: 'Get Started',
    ctaHref: '/docs',
    features: [
      { text: '204+ pixel art icons', included: true },
      { text: '6 thematic icon packs', included: true },
      { text: 'Static & animated icons', included: true },
      { text: 'React UI kit components', included: true },
      { text: 'Visual Icon Builder', included: true },
      { text: 'Toast notification system', included: true },
      { text: 'Commercial use', included: true },
      { text: 'Attribution required', included: true, highlight: true },
      { text: 'Remove attribution', included: false },
    ],
  },
  {
    name: 'Indie',
    price: '$19',
    priceSuffix: 'one-time · 1 project',
    description: 'Ship your product without attribution. One project, lifetime license, all current icons.',
    color: 'gold',
    popular: true,
    cta: 'Buy Indie License',
    ctaHref: 'mailto:info@pxlkit.xyz?subject=Indie%20License%20Purchase',
    features: [
      { text: 'Everything in Community', included: true },
      { text: 'No attribution required', included: true, highlight: true },
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
    price: '$49',
    priceSuffix: 'one-time · unlimited projects',
    description: 'The ultimate license for agencies and teams. Unlimited projects, all future packs, priority support.',
    color: 'cyan',
    cta: 'Buy Team License',
    ctaHref: 'mailto:info@pxlkit.xyz?subject=Team%20License%20Purchase',
    features: [
      { text: 'Everything in Indie', included: true },
      { text: 'No attribution required', included: true, highlight: true },
      { text: 'Unlimited projects', included: true, highlight: true },
      { text: 'Lifetime license', included: true },
      { text: 'All current & future packs', included: true },
      { text: 'Priority GitHub issues', included: true },
      { text: 'Logo in README sponsors', included: true },
      { text: 'Email support', included: true },
    ],
  },
];

/* ─── Color helpers ─── */
function colorClasses(color: Plan['color']) {
  const map = {
    green: {
      border: 'border-retro-green/30 hover:border-retro-green/60',
      bg: 'bg-retro-green/5',
      text: 'text-retro-green',
      glow: 'shadow-[0_0_40px_rgba(var(--retro-green),0.08)]',
      btn: 'border-retro-green text-retro-green hover:bg-retro-green/10',
      badge: 'bg-retro-green/10 text-retro-green border-retro-green/30',
      ring: 'ring-retro-green/20',
    },
    gold: {
      border: 'border-retro-gold/30 hover:border-retro-gold/60',
      bg: 'bg-retro-gold/5',
      text: 'text-retro-gold',
      glow: 'shadow-[0_0_40px_rgba(var(--retro-gold),0.12)]',
      btn: 'border-retro-gold bg-retro-gold/10 text-retro-gold hover:bg-retro-gold/20',
      badge: 'bg-retro-gold/10 text-retro-gold border-retro-gold/30',
      ring: 'ring-retro-gold/20',
    },
    cyan: {
      border: 'border-retro-cyan/30 hover:border-retro-cyan/60',
      bg: 'bg-retro-cyan/5',
      text: 'text-retro-cyan',
      glow: 'shadow-[0_0_40px_rgba(var(--retro-cyan),0.08)]',
      btn: 'border-retro-cyan text-retro-cyan hover:bg-retro-cyan/10',
      badge: 'bg-retro-cyan/10 text-retro-cyan border-retro-cyan/30',
      ring: 'ring-retro-cyan/20',
    },
  };
  return map[color];
}

/* ─── FAQ ─── */
const FAQ_ITEMS = [
  {
    q: 'What counts as "attribution"?',
    a: 'A visible "Powered by Pxlkit" or "Icons by Pxlkit" text with a link to pxlkit.xyz. Place it in your footer, about page, credits section, or README. It must be reasonably visible to end users.',
  },
  {
    q: 'Can I use the free version for commercial projects?',
    a: 'Yes! The Community license allows full commercial use. The only requirement is that you include the attribution credit. You can build SaaS products, client sites, apps — anything.',
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
    a: 'Absolutely. The full source code is on GitHub. You can read it, learn from it, fork it for personal use, and contribute. The license simply requires attribution for usage in shipped products (or a paid license to remove it).',
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
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-retro-gold/30 bg-retro-bg/80 backdrop-blur-sm text-retro-gold font-mono text-xs mb-6">
          <span className="w-2 h-2 bg-retro-gold rounded-full animate-pulse" />
          Open Source · Fair Pricing
        </span>
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
        Free forever with attribution. Pay once to remove it.
        <br />
        <span className="text-retro-text/70">The full UI kit + icon library. No subscriptions. No gotchas.</span>
      </motion.p>

      <motion.p
        className="text-sm text-retro-muted/60 max-w-xl mx-auto font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {UI_COMPONENTS_COUNT} React components · 204+ pixel icons · 6 packs · Lifetime licenses
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
  const c = colorClasses(plan.color);

  return (
    <motion.div
      variants={fadeInUp}
      className={`relative rounded-xl border-2 ${c.border} ${c.bg} ${c.glow} p-6 sm:p-8 flex flex-col transition-all duration-300 ${
        plan.popular ? `ring-2 ${c.ring}` : ''
      }`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border text-[10px] font-pixel ${c.badge}`}>
          MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className={`font-pixel text-sm sm:text-base ${c.text} mb-3`}>
          {plan.name.toUpperCase()}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl sm:text-5xl font-bold ${c.text} font-mono`}>
            {plan.price}
          </span>
        </div>
        <p className="text-retro-muted/60 text-xs font-mono mt-1">
          {plan.priceSuffix}
        </p>
        <p className="text-retro-muted text-sm font-body mt-3 leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5">
            {f.included ? (
              <PixelCheck className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${f.highlight ? c.text : 'text-retro-green/70'}`} />
            ) : (
              <PixelX className="w-3 h-3 mt-0.5 flex-shrink-0 text-retro-muted/30" />
            )}
            <span
              className={`text-sm font-mono ${
                f.included
                  ? f.highlight
                    ? `${c.text} font-medium`
                    : 'text-retro-text/80'
                  : 'text-retro-muted/40 line-through'
              }`}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {plan.price === 'Free' ? (
        <a
          href={plan.ctaHref}
          className={`block w-full text-center btn-retro text-[10px] sm:text-xs ${c.btn} py-3`}
        >
          {plan.cta}
        </a>
      ) : (
        <div className="mt-2 w-full relative z-20">
          <PurchaseCheckout plan={plan} buttonClass={`block w-full text-center btn-retro text-[10px] sm:text-xs ${c.btn} py-3 cursor-pointer`} />
        </div>
      )}
    </motion.div>
  );
}

function PurchaseCheckout({ plan, buttonClass }: { plan: Plan, buttonClass: string }) {
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
      <button onClick={() => setIsOpen(true)} className={buttonClass}>
        {plan.cta}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-retro-bg/90 backdrop-blur-sm" onClick={() => !isProcessing && setIsOpen(false)} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-retro-surface border-2 border-retro-border p-6 sm:p-8 rounded-xl w-full max-w-md shadow-2xl z-10 max-h-[90vh] flex flex-col"
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-retro-surface/80 backdrop-blur-sm z-30 flex items-center justify-center font-pixel text-retro-cyan rounded-xl">
                PROCESSING...
              </div>
            )}

            {!isProcessing && <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-retro-muted hover:text-retro-text text-xl">&times;</button>}
            
            <div className="flex-shrink-0">
              <h3 className="font-pixel text-lg text-retro-text mb-2 tracking-wide uppercase">{plan.name} CHECKOUT</h3>
              <p className="text-retro-muted font-mono text-xs mb-6">Complete your details to secure your license.</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {step === 'form' && (
                <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-sm">
                  <div>
                    <label className="block text-retro-muted/80 text-xs mb-1">Full Name *</label>
                    <input required type="text" value={buyerData.name} onChange={e => setBuyerData({...buyerData, name: e.target.value})} className="w-full bg-retro-bg border border-retro-border/50 rounded-md px-3 py-2 text-retro-text focus:border-retro-cyan focus:outline-none" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-retro-muted/80 text-xs mb-1">Email Address (for License) *</label>
                    <input required type="email" value={buyerData.email} onChange={e => setBuyerData({...buyerData, email: e.target.value})} className="w-full bg-retro-bg border border-retro-border/50 rounded-md px-3 py-2 text-retro-text focus:border-retro-cyan focus:outline-none" placeholder="you@company.com" />
                  </div>
                  <div>
                    <label className="block text-retro-muted/80 text-xs mb-1">Project/Company Name (Optional)</label>
                    <input type="text" value={buyerData.projectName} onChange={e => setBuyerData({...buyerData, projectName: e.target.value})} className="w-full bg-retro-bg border border-retro-border/50 rounded-md px-3 py-2 text-retro-text focus:border-retro-cyan focus:outline-none" placeholder="Acme Corp App" />
                  </div>
                  
                  <button type="submit" className="w-full btn-retro border-retro-cyan bg-retro-cyan/10 text-retro-cyan hover:bg-retro-cyan/20 py-3 mt-4">
                    CONTINUE TO PAYMENT
                  </button>
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
                    onApprove={async (data, actions) => {
                      await capturePayment(data.orderID);
                    }}
                    onError={(err) => {
                      console.error("PayPal Error:", err);
                      toast({ tone: 'error', title: 'PAYMENT ERROR', message: 'PayPal encountered an error. Please try again.', duration: 5000 });
                    }}
                  />

                  {process.env.NODE_ENV === 'development' && (
                    <button onClick={() => capturePayment('DEV_ORDER_ID')} className="w-full text-[10px] font-mono text-retro-cyan border border-retro-cyan/30 rounded py-2 mt-2 hover:bg-retro-cyan/10">
                      [ DEV SIMULATE SUCCESS ]
                    </button>
                  )}

                  <button onClick={() => setStep('form')} className="w-full text-xs font-mono text-retro-muted hover:text-retro-text mt-4 py-2">
                    ← Back to details
                  </button>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-retro-green/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-retro-green/50">
                    <PixelCheck className="w-8 h-8 text-retro-green" />
                  </div>
                  <h4 className="font-pixel text-retro-green text-lg mb-2">PAYMENT SUCCESSFUL!</h4>
                  <p className="text-retro-muted font-body text-sm mb-6">Your license key has been securely emailed to <strong>{buyerData.email}</strong>.</p>
                  
                  <div className="bg-retro-bg border border-retro-border/50 rounded-lg p-4 mb-8">
                    <p className="text-retro-muted text-[10px] font-mono mb-1 uppercase tracking-wider">Your License Key</p>
                    <p className="font-mono text-retro-text text-lg tracking-widest">{licenseKey}</p>
                  </div>

                  <Link href="/docs" className="inline-block w-full btn-retro border-retro-green text-retro-green hover:bg-retro-green/10 py-3">
                    GET STARTED
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

/* ──────────────── COMPARISON TABLE ──────────────── */
function ComparisonTable() {
  const rows = [
    { feature: '204+ pixel art icons', community: true, indie: true, team: true },
    { feature: 'React components & SVG export', community: true, indie: true, team: true },
    { feature: 'Visual Icon Builder', community: true, indie: true, team: true },
    { feature: 'Toast notification system', community: true, indie: true, team: true },
    { feature: 'Static & animated icons', community: true, indie: true, team: true },
    { feature: 'Commercial use', community: true, indie: true, team: true },
    { feature: 'Attribution required', community: true, indie: false, team: false },
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
          className="overflow-x-auto rounded-xl border-2 border-retro-border/30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b-2 border-retro-border/30 bg-retro-surface/50">
                <th className="text-left px-4 sm:px-6 py-4 text-retro-muted font-medium text-xs">Feature</th>
                <th className="text-center px-3 sm:px-6 py-4 text-retro-green font-pixel text-[10px]">COMMUNITY</th>
                <th className="text-center px-3 sm:px-6 py-4 text-retro-gold font-pixel text-[10px]">INDIE</th>
                <th className="text-center px-3 sm:px-6 py-4 text-retro-cyan font-pixel text-[10px]">TEAM</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-retro-border/15 ${i % 2 === 0 ? '' : 'bg-retro-surface/20'}`}
                >
                  <td className="px-4 sm:px-6 py-3 text-retro-text/80 text-xs sm:text-sm">{row.feature}</td>
                  <td className="text-center px-3 sm:px-6 py-3">
                    <CellValue value={row.community} row={row.feature} />
                  </td>
                  <td className="text-center px-3 sm:px-6 py-3">
                    <CellValue value={row.indie} row={row.feature} />
                  </td>
                  <td className="text-center px-3 sm:px-6 py-3">
                    <CellValue value={row.team} row={row.feature} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

function CellValue({ value, row }: { value: boolean | string; row: string }) {
  if (typeof value === 'string') {
    return <span className="text-retro-text/70 text-xs sm:text-sm font-medium">{value}</span>;
  }
  // "Attribution required" row: true = required (bad/neutral), false = not required (good)
  if (row === 'Attribution required') {
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
          className="space-y-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-30px' }}
        >
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      className="border border-retro-border/30 rounded-lg overflow-hidden bg-retro-surface/20 hover:border-retro-border/50 transition-colors"
    >
      <PixelButton
        onClick={() => setOpen(!open)}
        tone="neutral"
        variant="ghost"
        size="sm"
        className="h-auto w-full justify-between px-5 sm:px-6 py-4 text-left"
      >
        <span className="text-sm sm:text-base text-retro-text font-mono pr-4">{question}</span>
        <span
          className={`text-retro-muted font-pixel text-xs flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </PixelButton>
      {open && (
        <div className="px-5 sm:px-6 pb-4">
          <p className="text-retro-muted text-sm font-body leading-relaxed">{answer}</p>
        </div>
      )}
    </motion.div>
  );
}

/* ──────────────── CTA ──────────────── */
function CTASection() {
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
          START BUILDING
        </h2>
        <p className="text-retro-muted text-base sm:text-lg font-body mb-8 max-w-lg mx-auto">
          Get started for free in seconds. Add pixel art icons to your project today — no sign-up required.
        </p>

        {/* Install command */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border border-retro-border/30 bg-retro-bg/80 backdrop-blur-sm mb-8">
          <span className="text-retro-green font-mono text-xs sm:text-sm">$</span>
          <code className="text-retro-text font-mono text-xs sm:text-sm">
            npm install @pxlkit/core @pxlkit/ui
          </code>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/docs"
            className="btn-retro border-retro-green text-retro-green hover:bg-retro-green/10 text-[10px] sm:text-xs px-8 py-3"
          >
            READ THE DOCS
          </Link>
          <Link
            href="/icons"
            className="btn-retro border-retro-cyan text-retro-cyan hover:bg-retro-cyan/10 text-[10px] sm:text-xs px-8 py-3"
          >
            BROWSE ICONS
          </Link>
        </div>

        {/* License summary */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-lg border border-retro-green/20 bg-retro-green/5">
            <p className="font-pixel text-[10px] text-retro-green mb-1">COMMUNITY</p>
            <p className="text-retro-muted text-xs font-mono">Free with attribution</p>
          </div>
          <div className="p-4 rounded-lg border border-retro-gold/20 bg-retro-gold/5">
            <p className="font-pixel text-[10px] text-retro-gold mb-1">INDIE — $19</p>
            <p className="text-retro-muted text-xs font-mono">1 project, no attribution</p>
          </div>
          <div className="p-4 rounded-lg border border-retro-cyan/20 bg-retro-cyan/5">
            <p className="font-pixel text-[10px] text-retro-cyan mb-1">TEAM — $49</p>
            <p className="text-retro-muted text-xs font-mono">Unlimited, no attribution</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
