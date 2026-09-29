import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Replace with a real call to your email provider (ConvertKit, Mailchimp, Resend, etc.).
async function joinWaitlist(email) {
  await new Promise((r) => setTimeout(r, 900));
  return { ok: true, email };
}

export default function FinalCTA() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const sectionRef = useRef(null);
  // The card grows to full size and the gradient drifts as it scrolls into view.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const bgPos = useTransform(scrollYProgress, [0, 1], ['0% 0%', '100% 100%']);

  async function onSubmit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setState('error');
      setError('Please enter a valid email address.');
      return;
    }
    setState('loading');
    try {
      await joinWaitlist(email.trim());
      setState('success');
    } catch {
      setState('error');
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <section ref={sectionRef} id="waitlist" className="scroll-mt-20 px-5 py-16 md:px-8 md:py-24">
      <motion.div
        style={{ scale, backgroundPosition: bgPos }}
        className="grain relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#c8ff2e_0%,#5ef0c5_30%,#2a6bff_60%,#c8ff2e_100%)] bg-[length:200%_200%] px-6 py-20 text-ink md:px-16 md:py-28"
      >
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#2a6bff]/50 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold tracking-[0.25em] uppercase opacity-70">First batch · Limited run</p>
          <h2 className="mt-4 text-4xl leading-[1] font-extrabold tracking-[-0.035em] sm:text-6xl">
            Your last<br />complicated meal.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg font-medium opacity-80">
            Join the waitlist to get 20% off your first order.
          </p>

          <div className="mx-auto mt-10 max-w-lg">
            <AnimatePresence mode="wait">
              {state === 'success' ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-4 font-semibold text-white"
                  role="status"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-ink"><Check size={14} strokeWidth={3} /></span>
                  You're on the list. Watch your inbox for your 20% code.
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  exit={{ opacity: 0, scale: 0.97 }}
                  onSubmit={onSubmit}
                  noValidate
                  className="flex flex-col gap-2 rounded-[28px] bg-ink p-2 shadow-2xl shadow-ink/30 sm:flex-row sm:rounded-full"
                >
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
                    className="min-w-0 flex-1 rounded-full bg-transparent px-5 py-3.5 text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-70"
                  >
                    {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <>Claim 20% off <ArrowRight size={16} strokeWidth={2.5} /></>}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            <p id="email-error" className="mt-3 min-h-5 text-sm font-semibold" role="alert">
              {state === 'error' ? error : ''}
            </p>
            <p className="text-xs font-medium opacity-60">No spam. Unsubscribe anytime.</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
