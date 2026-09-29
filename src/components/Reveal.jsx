import { Suspense, lazy, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Dna, FlaskConical, Zap } from 'lucide-react';
import useMediaQuery, { hasWebGL } from '../hooks/useMediaQuery';

const RevealScene = lazy(() => import('../three/RevealScene'));

// Headline words and the scroll-progress window in which each one rises into place.
const LINE_1 = ['Inside', 'the', 'Fusion:'];
const LINE_2 = ['The', 'Complete', 'Meal', 'Revealed.'];

const CALLOUTS = [
  { icon: Dna, title: '30g plant protein', text: 'Complete amino profile', className: 'left-[4%] top-[42%] md:left-[8%]', at: 0.52 },
  { icon: FlaskConical, title: '27 micronutrients', text: '100% daily value', className: 'right-[4%] top-[34%] md:right-[8%]', at: 0.6 },
  { icon: Zap, title: '4h steady energy', text: 'Low-GI carbs + MCTs', className: 'right-[6%] bottom-[16%] md:right-[14%]', at: 0.68 },
];

function Word({ progress, index, total, children, accent }) {
  const start = 0.3 + (index / total) * 0.18;
  const opacity = useTransform(progress, [start, start + 0.06], [0, 1]);
  const y = useTransform(progress, [start, start + 0.08], ['0.6em', '0em']);
  const blur = useTransform(progress, [start, start + 0.08], ['blur(12px)', 'blur(0px)']);
  return (
    <motion.span style={{ opacity, y, filter: blur }} className={`inline-block ${accent ? 'text-gradient' : ''}`}>
      {children}
    </motion.span>
  );
}

function Callout({ progress, icon: Icon, title, text, className, at }) {
  const opacity = useTransform(progress, [at, at + 0.06, 0.95, 1], [0, 1, 1, 0.4]);
  const x = useTransform(progress, [at, at + 0.08], [className.includes('left') ? -30 : 30, 0]);
  return (
    <motion.div
      style={{ opacity, x }}
      className={`absolute hidden items-center gap-3 rounded-2xl border border-accent/25 bg-ink/60 px-4 py-3 backdrop-blur-md sm:flex ${className}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent"><Icon size={18} /></span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
    </motion.div>
  );
}

export default function Reveal() {
  const section = useRef(null);
  const stage = useRef(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [webgl] = useState(hasWebGL);
  const inView = useInView(stage, { margin: '200px 0px 200px 0px' });

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  // A spring gives the sequence weight, and keeps the 3D scene and the HTML overlay on one
  // JS-driven value (raw scroll progress can be handed to the browser's scroll timeline,
  // which doesn't account for the pinned stage).
  const smoothed = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0005 });
  // With reduced motion the scene holds a single, fully revealed frame.
  const staticProgress = useMotionValue(0.62);
  const progress = reduceMotion ? staticProgress : smoothed;

  const hintOpacity = useTransform(progress, [0, 0.1], [1, 0]);
  const eyebrowOpacity = useTransform(progress, [0.08, 0.2], [0, 1]);
  const glowScale = useTransform(progress, [0.2, 0.5], [0.4, 1.3]);
  const glowOpacity = useTransform(progress, [0.2, 0.5, 1], [0, 0.55, 0.35]);
  const total = LINE_1.length + LINE_2.length;

  const frameloop = !inView ? 'never' : reduceMotion ? 'demand' : 'always';

  return (
    <section ref={section} aria-labelledby="reveal-title" className={`relative ${reduceMotion ? 'h-screen' : 'h-[420vh]'}`}>
      <div ref={stage} className="sticky top-0 h-screen overflow-hidden">
        {/* Radial glow behind the eruption (cheap CSS, sells the bioluminescence) */}
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="pointer-events-none absolute top-1/2 left-1/2 -z-0 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40 blur-[120px]"
        />

        <div className="absolute inset-0">
          {webgl && (
            <Suspense fallback={null}>
              <RevealScene progress={progress} isMobile={isMobile} frameloop={frameloop} />
            </Suspense>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--color-ink)_100%)]" />

        {/* Headline over the action */}
        <div className="pointer-events-none absolute inset-x-0 top-[11%] px-5 text-center md:top-[9%]">
          <motion.p style={{ opacity: eyebrowOpacity }} className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
            The reveal
          </motion.p>
          <h2
            id="reveal-title"
            className="mx-auto mt-4 max-w-5xl text-4xl leading-[1.02] font-extrabold tracking-[-0.035em] [text-shadow:0_4px_40px_rgb(7_8_10/0.9)] sm:text-6xl lg:text-7xl"
          >
            <span className="block">
              {LINE_1.map((w, i) => (
                <span key={w}>
                  <Word progress={progress} index={i} total={total}>{w}</Word>{' '}
                </span>
              ))}
            </span>
            <span className="block">
              {LINE_2.map((w, i) => (
                <span key={w}>
                  <Word progress={progress} index={LINE_1.length + i} total={total} accent={w === 'Revealed.'}>{w}</Word>{' '}
                </span>
              ))}
            </span>
          </h2>
        </div>

        {CALLOUTS.map((c) => <Callout key={c.title} progress={progress} {...c} />)}

        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-3 text-[11px] tracking-[0.3em] text-white/50 uppercase"
        >
          Scroll to open
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-accent to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
