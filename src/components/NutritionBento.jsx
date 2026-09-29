import { motion } from 'framer-motion';
import { Dumbbell, Leaf, ShieldCheck, Zap } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { BRAND, PHOTOS, unsplash } from '../config';

const card =
  'glass group relative overflow-hidden rounded-3xl p-7 md:p-8 ' +
  'transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-accent/40 ' +
  'hover:shadow-[0_20px_60px_-15px_rgb(200_255_46/0.35),0_0_0_1px_rgb(200_255_46/0.15)]';

const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

function Icon({ as: I }) {
  return (
    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white/5 text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-ink">
      <I size={22} strokeWidth={2} />
    </div>
  );
}

const macros = [
  { label: 'Protein', grams: 30, pct: 30 },
  { label: 'Carbs', grams: 42, pct: 42 },
  { label: 'Healthy fats', grams: 14, pct: 28 },
];

const vitamins = ['A', 'B1', 'B2', 'B3', 'B5', 'B6', 'B7', 'B9', 'B12', 'C', 'D3', 'E', 'K2', 'Ca', 'Fe', 'Mg', 'Zn', 'Se'];

export default function NutritionBento() {
  return (
    <section id="nutrition" data-story="1" className="relative scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* On desktop the cards take the left ~60%; the can splits open in the space to the right. */}
        <div className="lg:w-[60%]">
          <SectionHeading
            eyebrow="Everything, engineered"
            title="Four pillars. One bottle."
            subtitle="We started from what your body needs in a complete meal, then removed everything it doesn't."
            align="left"
          />

          <div className="mt-16 grid auto-rows-[minmax(240px,auto)] gap-4 md:grid-cols-6 md:gap-5">
            {/* Perfect Macros — hero card */}
            <motion.article
              variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={0}
              className={`${card} md:col-span-4 md:row-span-2`}
            >
              <img
                src={unsplash(PHOTOS.strength, 1400)} alt="" loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-25 transition-all duration-700 group-hover:scale-105 group-hover:opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/70 to-black/30" />
              <div className="relative flex h-full flex-col">
                <Icon as={Dumbbell} />
                <h3 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">Perfect macros</h3>
                <p className="mt-3 max-w-md text-muted">
                  A 30 / 42 / 28 split tuned for satiety and recovery, so every bottle counts as a real meal, not a snack.
                </p>
                <div className="mt-auto space-y-5 pt-10">
                  {macros.map((m, i) => (
                    <div key={m.label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium">{m.label}</span>
                        <span className="text-muted tabular-nums">{m.grams}g</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>

            {/* 100% Daily Vitamins */}
            <motion.article
              variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={1}
              className={`${card} md:col-span-2`}
            >
              <Icon as={ShieldCheck} />
              <p className="mt-6 text-6xl font-extrabold tracking-[-0.04em] text-gradient">100%</p>
              <h3 className="mt-1 text-xl font-bold">Daily vitamins & minerals</h3>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {vitamins.map((v) => (
                  <span key={v} className="rounded-md border border-line bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/70">{v}</span>
                ))}
              </div>
            </motion.article>

            {/* Sustained Energy */}
            <motion.article
              variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={2}
              className={`${card} md:col-span-2`}
            >
              <Icon as={Zap} />
              <h3 className="mt-6 text-xl font-bold">Sustained energy</h3>
              <p className="mt-2 text-sm text-muted">Low-GI carbs and MCTs release slowly. No spike, no 3pm crash.</p>
              <svg viewBox="0 0 200 60" className="mt-5 w-full" aria-label="Energy stays level over four hours" role="img">
                <path d="M0 50 C 20 10, 35 10, 50 48 S 80 55, 100 55" fill="none" stroke="rgb(255 255 255 / 0.25)" strokeWidth="2" strokeDasharray="4 4" />
                <motion.path
                  d="M0 50 C 25 22, 45 20, 70 20 S 150 20, 200 22"
                  fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
                  transition={{ duration: 1.6, delay: 0.4, ease: 'easeInOut' }}
                />
              </svg>
              <div className="mt-1 flex justify-between text-[11px] text-muted">
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-accent" />{BRAND}</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 border-t border-dashed border-white/40" />Sugary snack</span>
              </div>
            </motion.article>

            {/* Clean Ingredients — full-width strip */}
            <motion.article
              variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={3}
              className={`${card} md:col-span-6 md:flex md:items-center md:gap-10`}
            >
              <div className="md:w-1/2">
                <Icon as={Leaf} />
                <h3 className="mt-6 text-2xl font-bold">Clean ingredients</h3>
                <p className="mt-2 max-w-md text-muted">Plant-based, third-party tested, and nothing you'd need a chemistry degree to pronounce.</p>
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-3 md:mt-0 md:w-1/2 md:grid-cols-3">
                {['No added sugar', 'Vegan', 'Gluten-free', 'Non-GMO', 'No seed oils', 'Lab verified'].map((t) => (
                  <li key={t} className="flex items-center gap-2 rounded-xl border border-line bg-black/30 px-3 py-3 text-sm font-medium">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> {t}
                  </li>
                ))}
              </ul>
            </motion.article>
          </div>
        </div>
      </div>
    </section>
  );
}
