import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { INGREDIENTS, PHOTOS, unsplash, unsplashSrcSet } from '../config';

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

export default function Ingredients() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  // Subtle parallax: the photo drifts slower than the page and zooms gently.
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1.08, 1.2]);

  return (
    <section id="ingredients" ref={sectionRef} className="relative scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
          <motion.figure
            initial={{ opacity: 0, clipPath: 'inset(12% 12% 12% 12% round 28px)' }}
            whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[420px] overflow-hidden rounded-[28px] border border-line lg:h-full"
          >
            <motion.img
              style={{ y: imageY, scale: imageScale }}
              src={unsplash(PHOTOS.ingredients, 1400)}
              srcSet={unsplashSrcSet(PHOTOS.ingredients, [640, 1024, 1400, 2000])}
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt="Close-up of fresh wild blueberries"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover contrast-110 saturate-[1.15]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <figcaption className="absolute right-6 bottom-6 left-6 flex items-end justify-between">
              <div>
                <p className="text-xs tracking-[0.25em] text-accent uppercase">Sourced, not synthesized</p>
                <p className="mt-2 text-2xl font-bold">Real food, finely tuned.</p>
              </div>
              <p className="text-right text-4xl font-extrabold tracking-tight">
                6<span className="block text-xs font-medium tracking-wide text-muted uppercase">core ingredients</span>
              </p>
            </figcaption>
          </motion.figure>
        </div>

        <div className="py-4 lg:py-16">
          <SectionHeading
            align="left"
            eyebrow="What's inside"
            title="Short list. Serious results."
            subtitle="Every ingredient earns its place. Here is exactly what goes into each 500ml bottle."
          />

          <motion.ol
            variants={list}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-12 divide-y divide-line border-y border-line"
          >
            {INGREDIENTS.map((ing, i) => (
              <motion.li key={ing.name} variants={item} className="group flex gap-5 py-6 md:gap-7">
                <span className="pt-1 text-xs font-semibold text-white/30 tabular-nums transition-colors group-hover:text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-lg font-semibold md:text-xl">{ing.name}</h3>
                    <span className="shrink-0 font-bold text-accent tabular-nums">{ing.amount}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{ing.note}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
