import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Oversized kinetic type that slides sideways as you scroll past, in two opposing rows.
export default function ScrollBand({ words }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const forward = useTransform(scrollYProgress, [0, 1], ['5%', '-35%']);
  const backward = useTransform(scrollYProgress, [0, 1], ['-35%', '5%']);
  const line = Array.from({ length: 4 }, () => words).flat();

  return (
    <div ref={ref} aria-hidden="true" className="glass overflow-hidden border-x-0 py-8 select-none md:py-12">
      <motion.div style={{ x: forward }} className="flex w-max items-center gap-8 text-[13vw] leading-none font-extrabold tracking-[-0.04em] md:text-[8vw]">
        {line.map((w, i) => (
          <span key={i} className="flex items-center gap-8">
            {w}
            <span className="inline-block h-[0.18em] w-[0.18em] rounded-full bg-accent shadow-[0_0_24px_var(--color-accent)]" />
          </span>
        ))}
      </motion.div>
      <motion.div
        style={{ x: backward, WebkitTextStroke: '1px rgb(255 255 255 / 0.28)' }}
        className="mt-2 flex w-max gap-8 text-[13vw] leading-none font-extrabold tracking-[-0.04em] text-transparent md:text-[8vw]"
      >
        {line.map((w, i) => <span key={i}>{w}</span>)}
      </motion.div>
    </div>
  );
}
