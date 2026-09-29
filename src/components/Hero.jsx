import { Suspense, lazy, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Button from './ui/Button';
import useMediaQuery, { hasWebGL } from '../hooks/useMediaQuery';
import { PHOTOS, unsplash, unsplashSrcSet } from '../config';

// The 3D stack (three.js + R3F) is split into its own chunk and loaded after first paint.
const BottleScene = lazy(() => import('./BottleScene'));

// Optional ?model=bottle|textured-can|generated override, handy for comparing hero models.
const MODEL_OVERRIDE = new URLSearchParams(window.location.search).get('model') ?? undefined;

const stats = [
  { value: '400', label: 'kcal' },
  { value: '30g', label: 'protein' },
  { value: '27', label: 'vitamins & minerals' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] } }),
};

function BottleFallback() {
  // Static stand-in shown while the 3D chunk loads, or when WebGL isn't available.
  return (
    <div className="flex h-full items-center justify-center" aria-hidden="true">
      <div className="relative h-[70%] w-[28%] min-w-24 rounded-[40%_40%_18%_18%/22%_22%_6%_6%] bg-gradient-to-r from-[#0d0f12] via-[#3a3f47] to-[#0d0f12] shadow-[0_40px_80px_-20px_rgb(200_255_46/0.35)]">
        <div className="absolute inset-x-0 top-[48%] h-[26%] bg-accent/90" />
      </div>
    </div>
  );
}

export default function Hero() {
  const sceneRef = useRef(null);
  const inView = useInView(sceneRef, { margin: '0px 0px -10% 0px' });
  const reduceMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [webgl] = useState(hasWebGL);

  const frameloop = !inView ? 'never' : reduceMotion ? 'demand' : 'always';

  return (
    <section className="grain relative isolate overflow-hidden pt-28 pb-20 md:pt-32 md:pb-28">
      {/* Cinematic backdrop */}
      <img
        src={unsplash(PHOTOS.heroLiquid, 1600)}
        srcSet={unsplashSrcSet(PHOTOS.heroLiquid)}
        sizes="100vw"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-35 saturate-[1.2] blur-[2px]"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_45%,transparent_0%,var(--color-ink)_65%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-ink" />
      <div className="absolute top-1/3 right-[12%] -z-10 h-80 w-80 rounded-full bg-accent/20 blur-[120px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 md:px-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 text-center lg:text-left">
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Launching soon · Waitlist open
          </motion.p>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-5xl leading-[0.95] font-extrabold tracking-[-0.035em] sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            Complete Nutrition.
            <br />
            <span className="text-gradient">Zero Friction.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted lg:mx-0"
          >
            Everything you need in one meal. Perfect macros, 100% of your daily vitamins and
            hours of steady energy, in a bottle you can finish in two minutes.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Button href="#waitlist" variant="primary">
              Get 20% off at launch <ArrowRight size={16} strokeWidth={2.5} />
            </Button>
            <Button href="#nutrition" variant="outline">
              <Play size={14} fill="currentColor" /> See what's inside
            </Button>
          </motion.div>

          <motion.dl
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="mt-12 flex justify-center gap-8 border-t border-line pt-8 sm:gap-12 lg:justify-start"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-xs tracking-wide text-muted uppercase">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          ref={sceneRef}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[380px] cursor-grab touch-pan-y active:cursor-grabbing sm:h-[460px] lg:h-[620px]"
        >
          {webgl ? (
            <Suspense fallback={<BottleFallback />}>
              <BottleScene isMobile={isMobile} frameloop={frameloop} model={MODEL_OVERRIDE} />
            </Suspense>
          ) : (
            <BottleFallback />
          )}
          <p className="pointer-events-none absolute -bottom-3 w-full text-center text-[11px] tracking-[0.2em] text-white/35 uppercase">
            {isMobile ? 'Drag to rotate' : 'Drag or move your cursor'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
