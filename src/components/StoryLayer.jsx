import { Suspense, lazy, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import useMediaQuery, { hasWebGL } from '../hooks/useMediaQuery';
import useStoryTracker from '../hooks/useStoryTracker';
import { PHOTOS, unsplash, unsplashSrcSet } from '../config';

// three.js + R3F load in their own chunk after first paint.
const StoryScene = lazy(() => import('../three/StoryScene'));

// Everything that lives *behind* the page: a cinematic backdrop and the fixed 3D canvas.
// Both sit below the content (negative z-index) and ignore the pointer entirely, so they
// can never block clicks, taps or text selection.
export default function StoryLayer() {
  useStoryTracker();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(max-width: 1023px)');
  const tier = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(hasWebGL);

  // The photo backdrop belongs to the hero; it fades as the story moves on.
  const { scrollY } = useScroll();
  const backdropOpacity = useTransform(scrollY, [0, 700], [1, 0]);

  return (
    <div aria-hidden="true" className="pointer-events-none">
      <motion.div style={{ opacity: backdropOpacity }} className="fixed inset-0 -z-20">
        <img
          src={unsplash(PHOTOS.heroLiquid, 1600)}
          srcSet={unsplashSrcSet(PHOTOS.heroLiquid)}
          sizes="100vw"
          alt=""
          className="h-full w-full scale-110 object-cover opacity-30 saturate-[1.2] blur-[2px]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,transparent_0%,var(--color-ink)_70%)]" />
      </motion.div>

      {/* On phones and tablets the can recedes into the background so the copy leads. */}
      <div className={`fixed inset-0 -z-10 ${tier === 'mobile' ? 'opacity-50' : tier === 'tablet' ? 'opacity-60' : ''}`}>
        {webgl && (
          <Suspense fallback={null}>
            <StoryScene tier={tier} reducedMotion={reducedMotion} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
