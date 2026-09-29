import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { HERO_MODEL } from '../config';
import { PullTab } from './products';
import { MODELS, SPLIT_META } from './registry';
import { BEATS, ease, layoutAt, seg, story } from './story';
import ClippedHalf from './ClippedHalf';
import EnergyField, { EnergyOrbs } from './EnergyField';
import LiquidTorrent from './LiquidTorrent';
import FloatingMotes from './FloatingMotes';
import Studio from './Studio';

const ACCENT = '#c8ff2e';
const TAU = Math.PI * 2;
const CAMERA_Z = 8.6;
const { damp, clamp } = THREE.MathUtils;

// Optional ?model=bottle|textured-can|generated override, handy for comparing models.
const MODEL_KEY = new URLSearchParams(window.location.search).get('model') ?? HERO_MODEL;

const QUALITY = {
  desktop: { energy: 4000, orbs: 16, fizz: 500, motes: 220, bloom: true, dpr: [1, 1.75] },
  tablet: { energy: 2200, orbs: 10, fizz: 300, motes: 140, bloom: false, dpr: [1, 1.5] },
  mobile: { energy: 1200, orbs: 6, fizz: 200, motes: 90, bloom: false, dpr: [1, 1.5] },
};

// Glowing cross-section revealed where the can is cut.
function CutFace({ side, meta, materialRef }) {
  return (
    <mesh position={[side * 0.002, meta.faceY, 0]} rotation={[0, side * Math.PI / 2, 0]}>
      <planeGeometry args={[meta.radius * 1.94, meta.faceHeight * 0.985]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#0a0f06"
        emissive={ACCENT}
        emissiveIntensity={0}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// The storyline: reads scroll position from `story.s` every frame and poses the can.
function Scene({ tier, reducedMotion }) {
  const meta = SPLIT_META[MODEL_KEY] ?? SPLIT_META.bottle;
  const Product = MODELS[meta.model];
  const viewport = useThree((s) => s.viewport);
  const q = QUALITY[tier];

  const anchor = useRef();
  const tilt = useRef();
  const spin = useRef();
  const left = useRef();
  const right = useRef();
  const hinge = useRef();
  const opening = useRef();
  const faceL = useRef();
  const faceR = useRef();
  const burst = useRef(0);
  const fizz = useRef(0);
  const k = useRef({ s: 0, rotY: 0 });

  useFrame((state, rawDelta) => {
    const d = Math.min(rawDelta, 0.05);
    const cur = k.current;

    // Ease toward the scroll position so every transition glides.
    const prev = cur.s;
    cur.s = damp(cur.s, story.s, 5, d);
    const s = cur.s;
    const ds = s - prev;

    // Placement for this device and story position.
    const L = layoutAt(tier, s);
    anchor.current.position.set((L.x * viewport.width) / 2, L.y, 0);
    anchor.current.scale.setScalar(L.scale);

    // Beats.
    const crack = ease.outCubic(seg(s, ...BEATS.crack)) * (1 - seg(s, ...BEATS.close));
    const split = ease.outBack(seg(s, ...BEATS.split)) * (1 - ease.inOut(seg(s, ...BEATS.reform)));
    const flow = ease.outCubic(seg(s, ...BEATS.burst)) * (1 - ease.inOut(seg(s, ...BEATS.collapse)));
    const spray = seg(s, BEATS.fizz[0], BEATS.fizz[0] + 0.12) * (1 - seg(s, BEATS.fizz[1] - 0.3, BEATS.fizz[1]));

    left.current.position.x = -split * 0.62;
    right.current.position.x = split * 0.62;
    left.current.rotation.z = split * 0.07;
    right.current.rotation.z = -split * 0.07;
    // Open like a book so both glowing cut faces turn toward the viewer.
    left.current.rotation.y = -split * 0.45;
    right.current.rotation.y = split * 0.45;

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.12;
    const glow = clamp(split, 0, 1) * (1.4 + flow * 1.6) * pulse;
    faceL.current.emissiveIntensity = glow;
    faceR.current.emissiveIntensity = glow;

    if (hinge.current) {
      hinge.current.rotation.x = -crack * 1.15;
      opening.current.emissiveIntensity = crack * 2.2;
    }
    burst.current = flow;
    fizz.current = spray;

    // Rotation: slow idle spin plus a nudge from scrolling; it squares up to the camera
    // while split so both halves read clearly.
    // Start squaring up while the tab cracks, so the can faces front before it opens.
    const hold = clamp(Math.max(split * 1.4, crack), 0, 1);
    const idle = reducedMotion ? 0 : d * 0.35;
    cur.rotY += (idle + ds * 2.2) * (1 - hold);
    if (hold > 0) {
      // Face the camera from wherever the can sits on screen (offsets perspective).
      const facing = Math.atan2(-anchor.current.position.x, CAMERA_Z);
      cur.rotY = damp(cur.rotY, Math.round(cur.rotY / TAU) * TAU + facing, 6 * hold, d);
    }
    spin.current.rotation.y = cur.rotY;

    // Lean toward the cursor on desktop.
    if (tier === 'desktop') {
      tilt.current.rotation.y = damp(tilt.current.rotation.y, story.pointer.x * 0.3, 3, d);
      tilt.current.rotation.x = damp(tilt.current.rotation.x, -story.pointer.y * 0.15, 3, d);
    }
    // Gentle float.
    tilt.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.06;
  });

  const product = (
    <Suspense fallback={null}>
      <Product />
    </Suspense>
  );

  return (
    <group ref={anchor}>
      <group ref={tilt}>
        <group ref={spin}>
          <group ref={left}>
            <ClippedHalf normal={[-1, 0, 0]} groupRef={left}>{product}</ClippedHalf>
            <CutFace side={1} meta={meta} materialRef={faceL} />
          </group>
          <group ref={right}>
            <ClippedHalf normal={[1, 0, 0]} groupRef={right}>{product}</ClippedHalf>
            <CutFace side={-1} meta={meta} materialRef={faceR} />
            {meta.lidY != null && (
              <>
                <PullTab hingeRef={hinge} openingRef={opening} lidY={meta.lidY} />
                <group position={[0, meta.lidY + 0.01, 0.24]}>
                  <LiquidTorrent
                    count={q.fizz}
                    radius={0.06}
                    emit={fizz}
                    size={50}
                    up={[1.4, 2.6]}
                    outward={[0.05, 0.4]}
                    life={[0.5, 1.1]}
                    gravity={-3.5}
                  />
                </group>
              </>
            )}
          </group>
        </group>
      </group>
      <group position={[0, meta.faceY, 0]}>
        <EnergyField count={q.energy} burst={burst} height={meta.faceHeight * 0.85} />
        <EnergyOrbs count={q.orbs} burst={burst} />
      </group>
    </group>
  );
}

export default function StoryScene({ tier = 'desktop', reducedMotion = false }) {
  const q = QUALITY[tier];
  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA_Z], fov: 35 }}
      dpr={q.dpr}
      gl={{ alpha: true, antialias: tier !== 'mobile', powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.25} />
      <spotLight position={[4, 6, 5]} angle={0.35} penumbra={1} intensity={60} />
      <Scene tier={tier} reducedMotion={reducedMotion} />
      <FloatingMotes count={q.motes} />
      <Studio />
      {q.bloom && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.6} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
