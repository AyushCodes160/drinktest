import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { HERO_MODEL } from '../config';
import { PullTab } from './products';
import { MODELS, SPLIT_META } from './registry';
import { BEATS, cameraAt, clamp, ease, layoutAt, seg, story } from './story';
import ClippedHalf from './ClippedHalf';
import ViscousFluid from './ViscousFluid';
import LiquidTorrent from './LiquidTorrent';
import FloatingMotes from './FloatingMotes';
import Studio from './Studio';

const ACCENT = '#c8ff2e';
const TAU = Math.PI * 2;
const LIFT = 1.75; // how far the top half levitates (can units)
const UP = [0, 1, 0];
const DOWN = [0, -1, 0];
const { damp } = THREE.MathUtils;

// Optional ?model=bottle|textured-can|generated override, handy for comparing models.
const MODEL_KEY = new URLSearchParams(window.location.search).get('model') ?? HERO_MODEL;

const QUALITY = {
  desktop: { segments: 128, blobs: 7, cubes: 36, fizz: 450, motes: 200, bloom: true, dpr: [1, 1.75] },
  tablet: { segments: 96, blobs: 5, cubes: 28, fizz: 250, motes: 120, bloom: false, dpr: [1, 1.5] },
  mobile: { segments: 72, blobs: 4, cubes: 24, fizz: 160, motes: 80, bloom: false, dpr: [1, 1.5] },
};

// Soft round shadow under the grounded bottom half (cheaper than real-time shadows).
function GroundShadow({ y, radius }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.65)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[radius * 5, radius * 5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

// The storyline: reads the scroll position (story.s) every frame, flies the camera and
// poses the can, its halves and the fluid.
function Scene({ tier, reducedMotion }) {
  const meta = SPLIT_META[MODEL_KEY] ?? SPLIT_META.bottle;
  const Product = MODELS[meta.model];
  const q = QUALITY[tier];
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const model = useRef();
  const spin = useRef();
  const top = useRef();
  const bottom = useRef();
  const hinge = useRef();
  const opening = useRef();
  const glowDisc = useRef();
  const topDisc = useRef();
  const shock = useRef();
  const shockMat = useRef();
  const fizz = useRef(0);
  const fluid = useRef({ erupt: 0, suck: 0, bottomY: meta.cutY, topY: meta.cutY });
  const k = useRef({ s: 0, rotY: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDelta) => {
    const d = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const cur = k.current;

    // Glide toward the scroll position so every beat is smooth.
    const prev = cur.s;
    cur.s = damp(cur.s, story.s, 5, d);
    const s = cur.s;
    const ds = s - prev;

    // --- Beats --------------------------------------------------------------
    const crack = ease.outCubic(seg(s, BEATS.crack));
    const lift = ease.outBack(seg(s, BEATS.lift));
    const erupt = ease.outCubic(seg(s, BEATS.erupt));
    const suck = ease.inCubic(seg(s, BEATS.suck));
    const slam = ease.inCubic(seg(s, BEATS.slam)); // accelerates into the impact
    const impact = seg(s, BEATS.impact);
    const spinT = ease.outCubic(seg(s, BEATS.spin));
    const spray = seg(s, [BEATS.fizz[0], BEATS.fizz[0] + 0.12]) * (1 - seg(s, [BEATS.fizz[1] - 0.3, BEATS.fizz[1]]));

    // Top half: levitates, hangs with a slow bob and tilt, then slams shut.
    const hover = lift * (1 - slam);
    const bob = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.06 * hover;
    const settle = ease.bell(seg(s, [2.9, 2.94])) * 0.05; // tiny rebound after the slam
    top.current.position.y = hover * LIFT + bob + settle;
    top.current.rotation.z = hover * 0.12 + (reducedMotion ? 0 : Math.sin(t * 0.7) * 0.03 * hover);
    top.current.rotation.x = hover * -0.08;

    if (hinge.current) {
      // The tab snaps back flat as the can seals.
      hinge.current.rotation.x = -crack * 1.0 * (1 - slam);
      opening.current.emissiveIntensity = crack * 2.2 * (1 - slam);
    }
    fizz.current = spray;

    // Glowing cross-sections while open; dark once sealed.
    const open = lift * (1 - slam);
    glowDisc.current.emissiveIntensity = open * (1.2 + 2.2 * erupt * (1 - suck)) * (1 + Math.sin(t * 5) * 0.1);
    topDisc.current.emissiveIntensity = open * 0.6;

    // Fluid.
    const f = fluid.current;
    f.erupt = erupt;
    f.suck = suck;
    f.bottomY = meta.cutY;
    f.topY = meta.cutY + top.current.position.y;

    // Shockwave ring at the seam on impact.
    shock.current.visible = impact > 0 && impact < 1;
    shock.current.scale.setScalar(1 + impact * 3.2);
    shockMat.current.opacity = (1 - impact) * 0.9;

    // --- Rotation -------------------------------------------------------------
    // Idle turn (plus a nudge from scrolling) while intact; squared to the camera while
    // split; one quick full spin after the slam, landing facing front.
    const splitHold = clamp(lift * 1.3, 0, 1) * (1 - slam);
    const idle = reducedMotion ? 0 : d * 0.3;
    cur.rotY += (idle + ds * 2.0) * (1 - splitHold);
    const cam = cameraAt(s);
    const facing = Math.round(cur.rotY / TAU) * TAU + cam.azimuth;
    const landing = Math.max(splitHold, seg(s, [2.84, 2.9]));
    if (landing > 0) cur.rotY = damp(cur.rotY, facing, 5 * landing, d);
    spin.current.rotation.y = cur.rotY + spinT * TAU;
    // A little hop during the spin.
    spin.current.position.y = ease.bell(spinT) * 0.35;

    // --- Placement & camera ---------------------------------------------------
    const L = layoutAt(tier, s);
    model.current.scale.setScalar(L.scale);

    // Orbit around the middle of the (possibly split) can.
    target.set(0, (top.current.position.y / 2) * L.scale, 0);
    const shake = ease.bell(impact) * 0.09;
    const sinP = Math.sin(cam.polar);
    camera.position.set(
      target.x + cam.radius * sinP * Math.sin(cam.azimuth) + Math.sin(t * 71) * shake,
      target.y + cam.radius * Math.cos(cam.polar) + Math.cos(t * 63) * shake,
      target.z + cam.radius * sinP * Math.cos(cam.azimuth),
    );
    camera.lookAt(target);

    // Lens shift places the can left/right/low on screen without changing the orbit.
    // Desktop also leans slightly toward the cursor.
    const lean = tier === 'desktop' ? 0.03 : 0;
    const nx = L.nx + story.pointer.x * lean;
    const ny = L.ny + story.pointer.y * lean;
    camera.setViewOffset(size.width, size.height, (-nx * size.width) / 2, (ny * size.height) / 2, size.width, size.height);
    camera.updateProjectionMatrix();
  });

  const product = (
    <Suspense fallback={null}>
      <Product />
    </Suspense>
  );
  const inner = meta.radius * 0.985;

  return (
    <group ref={model}>
      <GroundShadow y={meta.baseY - 0.02} radius={meta.radius} />
      <group ref={spin}>
        {/* Bottom half: stays grounded; glowing liquid surface at the cut */}
        <group ref={bottom}>
          <ClippedHalf normal={DOWN} offset={-meta.cutY} groupRef={bottom}>{product}</ClippedHalf>
          <mesh position={[0, meta.cutY - 0.2, 0]}>
            <cylinderGeometry args={[inner, inner, 0.4, 64, 1, true]} />
            <meshStandardMaterial color="#0b0d0a" emissive={ACCENT} emissiveIntensity={0.3} side={THREE.BackSide} />
          </mesh>
          <mesh position={[0, meta.cutY - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[inner, 64]} />
            <meshStandardMaterial ref={glowDisc} color="#0a0f06" emissive={ACCENT} emissiveIntensity={0} toneMapped={false} />
          </mesh>
          <mesh position={[0, meta.cutY, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[meta.radius, 0.012, 12, 96]} />
            <meshStandardMaterial color="#e9ecef" metalness={1} roughness={0.15} />
          </mesh>
          <ViscousFluid fluid={fluid} segments={q.segments} blobs={q.blobs} resolution={q.cubes} />
          {/* Shockwave when the top slams down */}
          <mesh ref={shock} position={[0, meta.cutY, 0]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
            <torusGeometry args={[meta.radius * 1.02, 0.02, 8, 96]} />
            <meshBasicMaterial ref={shockMat} color={ACCENT} transparent toneMapped={false} depthWrite={false} />
          </mesh>
        </group>

        {/* Top half: lid, pull-tab and upper body; levitates and slams back */}
        <group ref={top}>
          <ClippedHalf normal={UP} offset={meta.cutY} groupRef={top}>{product}</ClippedHalf>
          <mesh position={[0, meta.cutY + 0.2, 0]}>
            <cylinderGeometry args={[inner, inner, 0.4, 64, 1, true]} />
            <meshStandardMaterial color="#0b0d0a" emissive={ACCENT} emissiveIntensity={0.15} side={THREE.BackSide} />
          </mesh>
          <mesh position={[0, meta.cutY + 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[inner, 64]} />
            <meshStandardMaterial ref={topDisc} color="#050605" emissive={ACCENT} emissiveIntensity={0} />
          </mesh>
          {meta.lidY != null && (
            <>
              <PullTab hingeRef={hinge} openingRef={opening} lidY={meta.lidY} />
              <group position={[0, meta.lidY + 0.01, -0.24]}>
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
  );
}

export default function StoryScene({ tier = 'desktop', reducedMotion = false }) {
  const q = QUALITY[tier];
  return (
    <Canvas
      camera={{ position: [0, 6, 4], fov: 35 }}
      dpr={q.dpr}
      gl={{ alpha: true, antialias: tier !== 'mobile', powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.25} />
      <spotLight position={[4, 7, 5]} angle={0.4} penumbra={1} intensity={70} />
      <pointLight position={[0, 0.3, 0]} color={ACCENT} intensity={3} distance={4} />
      <Scene tier={tier} reducedMotion={reducedMotion} />
      <FloatingMotes count={q.motes} />
      <Studio />
      {q.bloom && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.65} luminanceSmoothing={0.2} intensity={0.85} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
