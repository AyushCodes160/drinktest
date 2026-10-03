import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Preload, useProgress } from '@react-three/drei';
import BottleStory from './BottleStory';
import { BottleStudio } from './Studio';

const QUALITY = {
  desktop: { bloom: true, dpr: [1, 1.75] },
  tablet: { bloom: false, dpr: [1, 1.5] },
  mobile: { bloom: false, dpr: [1, 1.5] },
};

// Reports texture/model loading (drei's loading manager hook) to the HTML loader.
function LoadProgress({ onProgress }) {
  const { progress, active } = useProgress();
  useEffect(() => {
    onProgress?.(active ? progress : 100);
  }, [progress, active, onProgress]);
  return null;
}

// Mounts only after everything above it in the same Suspense boundary has loaded. Waits for
// the display fonts (the bottle's artwork is drawn with them), pre-compiles every shader and
// uploads textures, lets two frames render, then tells the page the scene is ready to reveal.
function SceneReady({ onReady }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let alive = true;
    const fonts = document.fonts
      ? Promise.all([document.fonts.load('900 expanded 100px Archivo'), document.fonts.load('700 40px "Plus Jakarta Sans"')])
      : Promise.resolve();
    fonts
      .catch(() => {})
      .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
      .then(() => {
        if (!alive) return;
        gl.compile(scene, camera);
        requestAnimationFrame(() => alive && onReady?.());
      });
    return () => { alive = false; };
  }, [gl, scene, camera, onReady]);
  return null;
}

// The fixed 3D layer behind the page: the ALXR bottle story, lit only by a soft daylight environment.
export default function StoryScene({ tier = 'desktop', reducedMotion = false, onProgress, onReady }) {
  const q = QUALITY[tier];
  return (
    <Canvas
      // Near/far hug the scene (camera stays 6–20 units out) for depth precision without clipping.
      camera={{ position: [0, 6, 4], fov: 35, near: 0.5, far: 60 }}
      dpr={q.dpr}
      gl={{ alpha: true, antialias: tier !== 'mobile', powerPreference: 'high-performance' }}
      // Resize instantly (rotation, window drags) so the aspect never lags behind the canvas.
      resize={{ scroll: false, debounce: 0 }}
      style={{ pointerEvents: 'none' }}
    >
      <BottleStudio />
      <LoadProgress onProgress={onProgress} />
      <Suspense fallback={null}>
        <BottleStory tier={tier} reducedMotion={reducedMotion} />
        <Preload all />
        <SceneReady onReady={onReady} />
      </Suspense>
      {q.bloom && (
        <EffectComposer multisampling={0}>
          {/* Threshold above 1: only the cream ribbon's wet highlights (rendered brighter than
              white) get a soft sheen; the matte bottle never blooms. */}
          <Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.15} intensity={0.35} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
