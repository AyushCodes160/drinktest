import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { HERO_MODEL } from '../config';
import { Bottle } from './products';
import { MODELS } from './registry';
import Studio from './Studio';
import FloatingMotes from './FloatingMotes';

// Auto-rotates its children on Y and, on desktop, leans them toward the pointer.
function Turntable({ followPointer, children }) {
  const spin = useRef();
  const tilt = useRef();

  useFrame((state, delta) => {
    spin.current.rotation.y += delta * 0.35;
    if (followPointer) {
      const { x, y } = state.pointer;
      tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, x * 0.35, 3, delta);
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, -y * 0.18, 3, delta);
    }
  });

  return (
    <group ref={tilt}>
      <group ref={spin}>{children}</group>
    </group>
  );
}

export default function HeroScene({ isMobile = false, frameloop = 'always', model = HERO_MODEL }) {
  const Product = MODELS[model] ?? Bottle;
  return (
    <Canvas
      camera={{ position: [0, 0.15, 7.4], fov: 35 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      frameloop={frameloop}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-label="Rotating 3D model of the product"
      role="img"
    >
      <ambientLight intensity={0.2} />
      <spotLight position={[4, 6, 4]} angle={0.3} penumbra={1} intensity={60} color="#ffffff" />
      <PresentationControls
        global={!isMobile}
        snap
        polar={[-0.25, 0.25]}
        azimuth={[-0.6, 0.6]}
        speed={1.4}
      >
        <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.6}>
          <Turntable followPointer={!isMobile}>
            <Suspense fallback={null}>
              <Product />
            </Suspense>
          </Turntable>
        </Float>
      </PresentationControls>
      <FloatingMotes count={isMobile ? 110 : 260} />
      <ContactShadows position={[0, -1.75, 0]} opacity={0.55} scale={6} blur={2.6} far={3} />
      <Studio />
    </Canvas>
  );
}
