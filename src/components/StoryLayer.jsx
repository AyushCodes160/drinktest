import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import useMediaQuery, { hasWebGL } from '../hooks/useMediaQuery';
import useStoryTracker from '../hooks/useStoryTracker';
import SceneLoader from './SceneLoader';

// three.js + R3F load in their own chunk after first paint.
const StoryScene = lazy(() => import('../three/StoryScene'));

// Everything that lives *behind* the page: an ambient mesh-gradient backdrop and the fixed 3D canvas.
// Both sit below the content (negative z-index) and ignore the pointer entirely, so they
// can never block clicks, taps or text selection.
export default function StoryLayer() {
  useStoryTracker();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(max-width: 1023px)');
  const tier = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(hasWebGL);

  // Loading: creep toward 30% while the 3D code downloads, 30–90% follows asset loading, and
  // the scene itself flips to ready once it's compiled. Without WebGL there's nothing to wait for.
  const [creep, setCreep] = useState(0);
  const [assets, setAssets] = useState(0);
  const [ready, setReady] = useState(!webgl);
  const onProgress = useCallback((p) => setAssets(30 + p * 0.6), []);
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    if (ready) return undefined;
    const id = setInterval(() => setCreep((c) => Math.min(30, c + 1.5)), 60);
    const fallback = setTimeout(() => setReady(true), 9000); // never trap the page behind the loader
    return () => { clearInterval(id); clearTimeout(fallback); };
  }, [ready]);
  const progress = ready ? 100 : Math.max(creep, assets);


  return (
    <>
    <SceneLoader visible={!ready} progress={progress} />
    <div aria-hidden="true" className="pointer-events-none">
      {/* Ambient mesh gradient: large soft blobs of oat, faint matcha and caramel drifting
          slowly on warm paper (pure CSS, so it costs almost nothing). */}
      <div className="mesh fixed inset-0 -z-20 overflow-hidden bg-paper">
        <span className="mesh-a" />
        <span className="mesh-b" />
        <span className="mesh-c" />
        <span className="mesh-d" />
      </div>

      {/* Sized to the large viewport so mobile address-bar show/hide never resizes the canvas.
          On phones and tablets the scene places the bottle inside the page's open gaps
          (data-stage), so it never sits behind copy. The canvas stays invisible until the
          scene reports ready, then fades in, so nothing pops or flashes untextured.
          touch-none + pointer-events-none: taps and swipes always go to the page. */}
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh touch-none transition-opacity duration-700 ${
          ready ? (tier === 'desktop' ? 'opacity-100' : 'opacity-90') : 'opacity-0'
        }`}
      >
        {webgl && (
          <Suspense fallback={null}>
            <StoryScene tier={tier} reducedMotion={reducedMotion} onProgress={onProgress} onReady={onReady} />
          </Suspense>
        )}
      </div>
    </div>
    </>
  );
}
