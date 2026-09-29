import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

// Each word slides up from behind a mask, one after another.
const word = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.8, ease: EASE } },
};

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  const alignment = align === 'center' ? 'mx-auto text-center' : 'text-left';
  const words = title.split(' ');
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={`text-legible max-w-2xl ${alignment}`}
    >
      <motion.p variants={rise} className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">{eyebrow}</motion.p>
      <h2 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-5xl" aria-label={title}>
        {words.map((w, i) => (
          <span key={i} aria-hidden="true">
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span variants={word} className="inline-block">{w}</motion.span>
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </h2>
      {subtitle && <motion.p variants={rise} className="mt-5 text-lg leading-relaxed text-muted">{subtitle}</motion.p>}
    </motion.div>
  );
}
