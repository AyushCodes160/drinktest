import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, Loader2, ShieldCheck, Truck } from 'lucide-react';
import { PREORDER } from '../config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: PREORDER.currency });

// Replace with a real call to your checkout or email provider (Shopify, Stripe, Resend, etc.).
async function submitPreorder(order) {
  await new Promise((r) => setTimeout(r, 900));
  return { ok: true, order };
}

export default function FinalCTA() {
  const [pack, setPack] = useState(PREORDER.packs[0].id);
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const sectionRef = useRef(null);

  // The box grows to full size as it scrolls into view.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  const selected = PREORDER.packs.find((p) => p.id === pack);
  const total = selected.price * (1 - PREORDER.discount);

  async function onSubmit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setState('error');
      setError('Please enter a valid email address.');
      return;
    }
    setState('loading');
    try {
      await submitPreorder({ email: email.trim(), pack });
      setState('success');
    } catch {
      setState('error');
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <section ref={sectionRef} id="waitlist" data-story="3" className="relative scroll-mt-20 overflow-hidden px-5 py-24 md:px-8 md:py-32">
      {/* Full-width launch gradient, kept low so the can and copy stay readable over it */}
      <div aria-hidden="true" className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_30%_50%,rgb(232_195_126/0.12),transparent_55%),radial-gradient(ellipse_at_80%_60%,rgb(0_242_254/0.07),transparent_55%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <motion.div
          style={{ scale }}
          className="glass relative overflow-hidden rounded-[32px] p-6 shadow-[0_0_90px_-25px_rgb(232_195_126/0.35)] sm:p-8 md:p-10"
        >
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-accent to-titanium" />

          <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">First batch · Limited run</p>
          <h2 className="font-wide text-legible mt-3 text-4xl leading-[1] font-extrabold tracking-[-0.03em] uppercase sm:text-5xl">Pre-order now.</h2>
          <p className="mt-4 max-w-md text-white/70">
            The first batch ships at launch. Reserve a case today and get 20% off your first order.
          </p>

          <AnimatePresence mode="wait">
            {state === 'success' ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-5"
                role="status"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-ink"><Check size={15} strokeWidth={3} /></span>
                <span>
                  <span className="block font-semibold">You're on the list.</span>
                  <span className="mt-1 block text-sm text-white/70">
                    We've reserved a {selected.label} for {email.trim()}. Your 20% code arrives before launch.
                  </span>
                </span>
              </motion.div>
            ) : (
              <motion.form key="form" exit={{ opacity: 0, scale: 0.98 }} onSubmit={onSubmit} noValidate className="mt-8">
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-white/80">Choose your pack</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {PREORDER.packs.map((p) => (
                      <label
                        key={p.id}
                        className={`relative cursor-pointer rounded-2xl border p-4 transition-colors ${
                          pack === p.id ? 'border-accent bg-accent/10' : 'border-white/10 bg-black/30 hover:border-white/30'
                        }`}
                      >
                        <input type="radio" name="pack" value={p.id} checked={pack === p.id} onChange={() => setPack(p.id)} className="sr-only" />
                        {p.tag && (
                          <span className="absolute -top-2.5 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-ink">{p.tag}</span>
                        )}
                        <span className="block font-semibold">{p.label}</span>
                        <span className="block text-xs text-white/55">{p.detail}</span>
                        <span className="mt-2 block text-sm">
                          <span className="font-bold">{money.format(p.price * (1 - PREORDER.discount))}</span>{' '}
                          <span className="text-white/40 line-through">{money.format(p.price)}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-6 flex items-center justify-between border-t border-line pt-5 text-sm">
                  <span className="text-white/70">Early-bird total <span className="text-accent">(−20%)</span></span>
                  <span className="text-xl font-bold tabular-nums">{money.format(total)}</span>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                    aria-invalid={state === 'error'}
                    aria-describedby={state === 'error' ? 'email-error' : undefined}
                    className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/40 px-5 py-3.5 text-white placeholder:text-white/40 focus:border-accent focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="glow-accent inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-70"
                  >
                    {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <>Pre-order now <ArrowRight size={16} strokeWidth={2.5} /></>}
                  </button>
                </div>
                <p id="email-error" className="mt-3 min-h-5 text-sm font-semibold text-[#ff8a8a]" role="alert">
                  {state === 'error' ? error : ''}
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/55">
            <li className="flex items-center gap-1.5"><Truck size={14} /> Ships at launch</li>
            <li className="flex items-center gap-1.5"><ShieldCheck size={14} /> Cancel anytime before shipping</li>
          </ul>
        </motion.div>

        {/* Where the reformed can lands: beside the box on desktop, above it on phones/tablets
            (so the landing is in view while the box is, not pushed under the header by the footer). */}
        <div aria-hidden="true" data-stage className="order-first h-[40svh] lg:order-none lg:h-[520px]" />
      </div>
    </section>
  );
}
