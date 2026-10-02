import { useEffect } from 'react';
import Lenis from 'lenis';

// Inertial smooth scrolling for the whole page. It drives the native scroll position,
// so Framer Motion's useScroll and CSS position: sticky keep working unchanged.
export default function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.09,
      anchors: { offset: -72 },
      // Ignore input while the 3D scene is still loading (the page is held at the top).
      prevent: () => document.documentElement.classList.contains('is-loading'),
    });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}
