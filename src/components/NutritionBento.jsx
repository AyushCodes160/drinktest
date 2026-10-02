import { motion } from 'framer-motion';
import { Activity, Dumbbell, FlaskConical, ShieldCheck, Timer } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { BRAND, PHOTOS, unsplash } from '../config';

const card =
  'glass group relative overflow-hidden rounded-3xl p-7 md:p-8 ' +
  'transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-accent/35 ' +
  'hover:shadow-[0_24px_60px_-18px_rgb(232_195_126/0.28),0_0_0_1px_rgb(232_195_126/0.12)]';

const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

function Icon({ as: I }) {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-line bg-white/[0.04] text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-ink">
      <I size={20} strokeWidth={1.8} />
    </div>
  );
}

// Per 500 mL bottle. Calories: protein 140 + carbs 136 + fat 144 = 420 kcal.
const macros = [
  { label: 'Microfiltered protein', grams: 35, pct: 33 },
  { label: 'Low-GI carbohydrates', grams: 34, pct: 32 },
  { label: 'MCT & high-oleic fats', grams: 16, pct: 35 },
];

const micronutrients = ['Methyl-B12', 'L-5-MTHF folate', 'D3 + K2', 'Mg bisglycinate', 'Zinc picolinate', 'Iron bisglycinate', 'Iodine', 'Selenium', 'Vitamin C', 'Choline'];

const enzymes = ['Protease', 'Lactase', 'Amylase'];

const Stat = ({ children }) => <p className="font-wide mt-5 text-5xl font-extrabold tracking-[-0.03em] text-accent-2">{children}</p>;

export default function NutritionBento() {
  return (
    <section id="nutrition" data-story="1" className="relative scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Phones/tablets: open stage where the cap twists off, before the copy arrives */}
        <div aria-hidden="true" data-stage className="h-[50svh] lg:hidden" />
        {/* Desktop: cards take the left ~60%; the bottle opens in the space to the right. */}
        <div className="lg:w-[60%]">
          <SectionHeading
            eyebrow="Engineered nutrition"
            title="A complete meal, measured to the gram."
            subtitle="Clean macros, bioavailable micronutrients and a gut-friendly base, in the time it takes to unscrew a cap."
            align="left"
          />

          <div className="mt-14 grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-6 md:gap-5">
            {/* Clean macros */}
            <motion.article
              variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={0}
              className={`${card} md:col-span-4 md:row-span-2`}
            >
              <img
                src={unsplash(PHOTOS.strength, 1400)} alt="" loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/40" />
              <div className="relative flex h-full flex-col">
                <Icon as={Dumbbell} />
                <h3 className="font-wide mt-6 text-3xl font-bold tracking-tight md:text-4xl">Clean macros</h3>
                <p className="mt-3 max-w-md text-muted">
                  An even split of protein, slow carbs and clean fats: 420 kcal that eats like a real meal and trains like a recovery shake.
                </p>
                <div className="mt-auto space-y-5 pt-10">
                  {macros.map((m, i) => (
                    <div key={m.label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium">{m.label}</span>
                        <span className="font-wide text-accent-2 tabular-nums">{m.grams}g</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-accent-2/60 to-accent-2"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.pct * 2.4}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>

            {/* Micronutrients */}
            <motion.article
              variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={1}
              className={`${card} md:col-span-2`}
            >
              <Icon as={ShieldCheck} />
              <Stat>26</Stat>
              <h3 className="mt-1 text-lg font-bold">Bioavailable vitamins &amp; minerals</h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {micronutrients.map((v) => (
                  <span key={v} className="rounded-md border border-line bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/70">{v}</span>
                ))}
              </div>
            </motion.article>

            {/* Time saved */}
            <motion.article
              variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={2}
              className={`${card} md:col-span-2`}
            >
              <Icon as={Timer} />
              <Stat>28<span className="text-2xl">min</span></Stat>
              <h3 className="mt-1 text-lg font-bold">Saved per meal</h3>
              <p className="mt-2 text-sm text-muted">No shopping, prep or dishes. Swap one meal a day and that's over three hours back every week.</p>
            </motion.article>

            {/* Gut health */}
            <motion.article
              variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={3}
              className={`${card} md:col-span-3`}
            >
              <Icon as={FlaskConical} />
              <h3 className="font-wide mt-6 text-xl font-bold">Gut-first digestion</h3>
              <p className="mt-2 text-sm text-muted">A digestive enzyme blend breaks down protein, lactose and starch, while 9g of prebiotic fiber feeds your microbiome.</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {enzymes.map((e) => (
                  <li key={e} className="flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-3 py-1.5 text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-2" /> {e}
                  </li>
                ))}
                <li className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">9g prebiotic fiber</li>
              </ul>
            </motion.article>

            {/* Low-GI satiety */}
            <motion.article
              variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={4}
              className={`${card} md:col-span-3`}
            >
              <Icon as={Activity} />
              <h3 className="font-wide mt-6 text-xl font-bold">Four hours, no crash</h3>
              <p className="mt-2 text-sm text-muted">Zero refined sugar. Low-glycemic carbs release slowly for steady energy and satiety.</p>
              <svg viewBox="0 0 220 64" className="mt-5 w-full" role="img" aria-label="Blood sugar stays level over four hours with ALXR, while a sugary breakfast spikes and crashes">
                <path d="M0 54 C 18 8, 34 6, 52 46 S 86 60, 110 58" fill="none" stroke="rgb(255 255 255 / 0.28)" strokeWidth="2" strokeDasharray="4 4" />
                <motion.path
                  d="M0 54 C 30 30, 50 26, 80 26 S 170 26, 220 28"
                  fill="none" stroke="var(--color-accent-2)" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
                  transition={{ duration: 1.6, delay: 0.4, ease: 'easeInOut' }}
                />
                {[0, 55, 110, 165, 220].map((x, i) => (
                  <text key={x} x={Math.min(x, 212)} y="64" fontSize="7" fill="rgb(255 255 255 / 0.4)">{i}h</text>
                ))}
              </svg>
              <div className="mt-2 flex justify-between text-[11px] text-muted">
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-accent-2" />{BRAND}</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 border-t border-dashed border-white/40" />Sugary breakfast</span>
              </div>
            </motion.article>
          </div>
        </div>
      </div>
    </section>
  );
}
