import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BRAND } from '../config';

// Full-screen loader shown until the 3D scene is compiled and ready. A pulsing ALXR mark,
// a hairline progress bar and a percentage counter. Scrolling is held while it's up so the
// story starts from the top.
export default function SceneLoader({ visible, progress }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  // Count up smoothly toward the reported progress.
  useEffect(() => {
    let raf;
    const tick = () => {
      setShown((v) => {
        const next = v + (progress - v) * 0.12;
        return Math.abs(progress - next) < 0.3 ? progress : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('is-loading', visible);
    return () => root.classList.remove('is-loading');
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[90] grid place-items-center bg-paper"
          role="status"
          aria-live="polite"
          aria-label={`Loading ${BRAND}, ${Math.round(shown)} percent`}
        >
          <div className="flex flex-col items-center gap-7">
            <motion.div
              animate={reduce ? undefined : { opacity: [0.55, 1, 0.55], scale: [0.98, 1, 0.98] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="font-wide flex items-center gap-3 text-2xl font-extrabold tracking-[0.3em] text-ink"
            >
              <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9 24 L16 8 L23 24" fill="none" stroke="var(--color-accent)" strokeWidth="3.2" strokeLinejoin="round" />
                <path d="M12.2 18.5h7.6" stroke="var(--color-ink)" strokeWidth="2.4" />
              </svg>
              {BRAND}
            </motion.div>
            <div className="h-px w-48 overflow-hidden bg-ink/10">
              <div className="h-full bg-gradient-to-r from-caramel to-accent transition-[width] duration-150" style={{ width: `${shown}%` }} />
            </div>
            <span className="font-wide text-xs tracking-[0.3em] text-muted tabular-nums">{String(Math.round(shown)).padStart(3, '0')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
