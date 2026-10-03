import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { INGREDIENTS } from '../config';

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

export default function Ingredients() {
  return (
    <section id="ingredients" data-story="2" className="relative scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        {/* Stage for the bottle and its cream vortex: this whole column on desktop,
            an open gap above the panel on phones/tablets. */}
        <div aria-hidden="true" data-stage className="h-[60svh] lg:h-auto" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-[28px] p-7 md:p-10"
        >
          <SectionHeading
            align="left"
            eyebrow="The formula"
            title="Six ingredients. Zero filler."
            subtitle="Every input is chosen for absorption and digestion. This is exactly what goes into each 500 mL bottle."
          />

          <motion.ol
            variants={list}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-10 divide-y divide-line border-y border-line"
          >
            {INGREDIENTS.map((ing, i) => (
              <motion.li key={ing.name} variants={item} className="group flex gap-5 py-5 md:gap-7">
                <span className="pt-1 text-xs font-semibold text-ink/30 tabular-nums transition-colors group-hover:text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-lg font-semibold md:text-xl">{ing.name}</h3>
                    <span className="shrink-0 font-bold text-accent tabular-nums">{ing.amount}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{ing.note}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </div>
    </section>
  );
}
