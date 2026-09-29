import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { HERO_MODEL } from '../config';
import { MODELS, SPLIT_META } from './registry';
import Studio from './Studio';
import LiquidTorrent from './LiquidTorrent';
import FloatingMotes from './FloatingMotes';

const ACCENT = '#c8ff2e';
const { clamp, smoothstep } = THREE.MathUtils;

// Scroll-progress windows (0..1 across the pinned section) for each beat of the reveal.
const BEATS = {
  enter: [0.0, 0.16],
  split: [0.16, 0.4],
  flow: [0.24, 0.46],
  settle: [0.9, 1.0],
};
const beat = (p, [a, b]) => smoothstep(p, a, b);

function easeOutBack(x) {
  const c1 = 1.5;
  return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// Renders one half of the product: every mesh inside is clipped by a plane at the cut,
// and the plane follows the half through the scene so the cut stays clean while it moves.
function ClippedHalf({ side, cutY, groupRef, children }) {
  const content = useRef();
  const plane = useMemo(() => new THREE.Plane(), []);
  const localPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, side === 'top' ? 1 : -1, 0), side === 'top' ? -cutY : cutY),
    [side, cutY],
  );
  const planes = useMemo(() => [plane], [plane]);

  useFrame(() => {
    groupRef.current.updateWorldMatrix(true, false);
    plane.copy(localPlane).applyMatrix4(groupRef.current.matrixWorld);
    // Materials can appear later (textures suspend), so attach the plane every frame; it's a few meshes.
    content.current.traverse((o) => {
      if (o.isMesh && o.material.clippingPlanes !== planes) {
        o.material.clippingPlanes = planes;
        o.material.needsUpdate = true;
      }
    });
  });

  return <group ref={content}>{children}</group>;
}

function SplitProduct({ progress, isMobile }) {
  const { model, cutY, radius } = SPLIT_META[HERO_MODEL] ?? SPLIT_META.bottle;
  const Product = MODELS[model];

  const root = useRef();
  const top = useRef();
  const bottom = useRef();
  const liquid = useRef();
  const emit = useRef(0);

  useFrame((state, delta) => {
    const p = progress.get();
    const enter = beat(p, BEATS.enter);
    const split = easeOutBack(clamp(beat(p, BEATS.split), 0, 1));
    const flow = beat(p, BEATS.flow) * (1 - 0.35 * beat(p, BEATS.settle));

    // Spin slows as it opens, so the torrent reads clearly.
    root.current.rotation.y += delta * (0.5 - 0.3 * split);
    root.current.scale.setScalar(0.66 + 0.12 * enter);
    root.current.position.y = -0.95 + (1 - enter) * -0.6;

    top.current.position.y = split * 1.0;
    top.current.rotation.z = split * 0.16;
    top.current.rotation.x = split * 0.08;
    bottom.current.position.y = -split * 0.45;

    liquid.current.emissiveIntensity = 0.4 + 3.2 * flow + Math.sin(state.clock.elapsedTime * 6) * 0.25 * flow;
    emit.current = flow;
  });

  const inner = radius * 0.985;

  return (
    <group ref={root}>
      {/* Top half: lid and upper body, with a dark underside at the cut */}
      <group ref={top}>
        <ClippedHalf side="top" cutY={cutY} groupRef={top}>
          <Suspense fallback={null}><Product /></Suspense>
        </ClippedHalf>
        <mesh position={[0, cutY + 0.2, 0]}>
          <cylinderGeometry args={[inner, inner, 0.4, 64, 1, true]} />
          <meshStandardMaterial color="#0b0d0a" emissive={ACCENT} emissiveIntensity={0.15} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, cutY + 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[inner, 64]} />
          <meshStandardMaterial color="#050605" emissive={ACCENT} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, cutY, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.012, 12, 96]} />
          <meshStandardMaterial color="#e9ecef" metalness={1} roughness={0.15} />
        </mesh>
      </group>

      {/* Bottom half: glowing liquid surface where the formula erupts */}
      <group ref={bottom}>
        <ClippedHalf side="bottom" cutY={cutY} groupRef={bottom}>
          <Suspense fallback={null}><Product /></Suspense>
        </ClippedHalf>
        <mesh position={[0, cutY - 0.2, 0]}>
          <cylinderGeometry args={[inner, inner, 0.4, 64, 1, true]} />
          <meshStandardMaterial color="#0b0d0a" emissive={ACCENT} emissiveIntensity={0.35} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, cutY - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[inner, 64]} />
          <meshStandardMaterial ref={liquid} color={ACCENT} emissive={ACCENT} emissiveIntensity={0.4} toneMapped={false} />
        </mesh>
        <mesh position={[0, cutY, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.014, 12, 96]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <group position={[0, cutY - 0.04, 0]}>
          <LiquidTorrent count={isMobile ? 3500 : 9000} radius={inner} emit={emit} />
          {/* Softer, slower mist layer that gives the torrent volume */}
          <LiquidTorrent
            count={isMobile ? 350 : 900}
            radius={inner}
            emit={emit}
            size={380}
            up={[0.4, 1.4]}
            outward={[0.2, 1.0]}
            life={[1.8, 3.4]}
            gravity={-0.6}
            intensity={0.22}
          />
        </group>
      </group>
    </group>
  );
}

export default function RevealScene({ progress, isMobile = false, frameloop = 'always' }) {
  return (
    <Canvas
      camera={{ position: [0, 0.9, isMobile ? 11.5 : 8.6], fov: 35 }}
      dpr={isMobile ? [1, 1.5] : [1, 1.75]}
      frameloop={frameloop}
      gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
      onCreated={({ gl, camera }) => {
        gl.localClippingEnabled = true;
        camera.lookAt(0, 0.2, 0);
      }}
      aria-label="The bottle splits open and glowing formula bursts out"
      role="img"
    >
      <color attach="background" args={['#07080a']} />
      <ambientLight intensity={0.15} />
      <spotLight position={[4, 6, 4]} angle={0.35} penumbra={1} intensity={60} />
      <pointLight position={[0, 0.2, 0]} color={ACCENT} intensity={6} distance={5} />
      <SplitProduct progress={progress} isMobile={isMobile} />
      <FloatingMotes count={isMobile ? 90 : 200} size={45} />
      <Studio />
      {!isMobile && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={1.1} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
