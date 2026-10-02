import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Button from './ui/Button';
import { DESCRIPTOR, TAGLINE } from '../config';

const stats = [
  { value: '35g', label: 'clean protein' },
  { value: '26', label: 'vitamins & minerals' },
  { value: '4h', label: 'steady satiety' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Hero() {
  const sectionRef = useRef(null);

  // Copy drifts up and fades as the hero scrolls away (the can itself lives in the story layer).
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      data-story="0"
      className="relative flex min-h-[100svh] items-start overflow-hidden pt-24 pb-10 md:pt-32 md:pb-28 lg:items-center"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 md:px-8 lg:grid-cols-[1.05fr_1fr]">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="text-legible relative z-10 text-center lg:text-left">
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {DESCRIPTOR} · Pre-orders open
          </motion.p>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="font-wide text-[2.6rem] leading-[0.98] font-extrabold tracking-[-0.03em] uppercase sm:text-6xl lg:text-[4.4rem] xl:text-[5.2rem]"
          >
            {TAGLINE[0]}
            <br />
            <span className="text-gradient">{TAGLINE[1]}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted lg:mx-0"
          >
            A complete meal in one 500 mL bottle: 35g of clean microfiltered protein, 26 bioavailable
            vitamins and minerals, low-glycemic carbs and zero refined sugar. Four hours of steady
            satiety, ready in the time it takes to unscrew the cap.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Button href="#waitlist" variant="primary">
              Pre-order · 20% off <ArrowRight size={16} strokeWidth={2.5} />
            </Button>
            <Button href="#nutrition" variant="outline">
              <Play size={14} fill="currentColor" /> See the formula
            </Button>
          </motion.div>

          <motion.dl
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="mt-12 flex justify-center gap-8 border-t border-line pt-8 sm:gap-12 lg:justify-start"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-wide text-2xl font-bold tracking-tight text-accent-2 sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-xs tracking-wide text-muted uppercase">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Stage for the 3D bottle (rendered in the fixed story layer behind): beside the copy
            on desktop, an open gap under the buttons on phones/tablets so it never sits behind
            text. */}
        <div aria-hidden="true" data-stage className="h-[34svh] lg:h-[620px]" />
      </div>
    </section>
  );
}
