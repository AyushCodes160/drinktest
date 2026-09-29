import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  PresentationControls,
  useGLTF,
  useTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import { HERO_MODEL } from '../config';

// Every product model is sized to fit this height, centered on the origin.
const PRODUCT_HEIGHT = 3.3;

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

// ---------------------------------------------------------------------------
// 1. Procedural brand bottle
// ---------------------------------------------------------------------------

// Half-profile of the bottle (x = radius, y = height), revolved around Y by LatheGeometry.
const BODY_PROFILE = [
  [0, -1.6], [0.52, -1.6], [0.6, -1.54], [0.62, -1.4], [0.62, 0.55],
  [0.6, 0.72], [0.5, 0.95], [0.36, 1.12], [0.27, 1.22], [0.26, 1.34], [0, 1.34],
];

function Bottle() {
  const bodyGeometry = useMemo(() => {
    const points = BODY_PROFILE.map(([x, y]) => new THREE.Vector2(x, y));
    // Resample the profile with a spline so the silhouette is smooth, not faceted.
    const curve = new THREE.SplineCurve(points);
    return new THREE.LatheGeometry(curve.getPoints(120), 128);
  }, []);

  return (
    <group>
      {/* Brushed-metal body */}
      <mesh geometry={bodyGeometry} castShadow>
        <meshStandardMaterial color="#5d6570" metalness={1} roughness={0.2} envMapIntensity={1.6} />
      </mesh>

      {/* Glowing accent label band */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.626, 0.626, 0.9, 128, 1, true]} />
        <meshStandardMaterial
          color="#c8ff2e"
          emissive="#c8ff2e"
          emissiveIntensity={0.08}
          metalness={0.55}
          roughness={0.28}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Thin chrome rings framing the label */}
      {[0.12, -0.82].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.628, 0.012, 16, 128]} />
          <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.08} />
        </mesh>
      ))}

      {/* Ribbed cap */}
      <mesh position={[0, 1.52, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.38, 48]} />
        <meshStandardMaterial color="#0b0c0e" metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.715, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.02, 48]} />
        <meshStandardMaterial color="#c8ff2e" emissive="#c8ff2e" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 2. Can with the product photo wrapped around its front half
// ---------------------------------------------------------------------------

const CAN_RADIUS = 0.56;
const CAN_BODY_HEIGHT = 2.95; // matches the photo's height/width ratio (2.63 × diameter)
const CAN_SEGMENTS = 128;

// Aluminium shoulder and base, revolved like the bottle.
const CAN_TOP_PROFILE = [[0.56, 0], [0.55, 0.05], [0.49, 0.16], [0.47, 0.2], [0.485, 0.23], [0.47, 0.25], [0.44, 0.24], [0, 0.22]];
const CAN_BASE_PROFILE = [[0, 0.06], [0.36, 0.04], [0.44, -0.06], [0.52, -0.1], [0.56, 0]];

function lathe(profile) {
  return new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), CAN_SEGMENTS);
}

// Half of the can's body (π radians starting at thetaStart), with the photo mapped onto it.
function wrappedHalf(thetaStart) {
  const g = new THREE.CylinderGeometry(CAN_RADIUS, CAN_RADIUS, CAN_BODY_HEIGHT, CAN_SEGMENTS, 1, true, thetaStart, Math.PI);
  // The photo is a near-orthographic view of the can, so a point at angle θ from the
  // half's center appears at x = sin θ. Remap U so the logo isn't stretched when wrapped.
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const theta = -Math.PI / 2 + uv.getX(i) * Math.PI;
    uv.setX(i, (Math.sin(theta) + 1) / 2);
  }
  return g;
}

function TexturedCan() {
  const texture = useTexture('/textures/can-front.jpg', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  // Both halves carry the artwork, so a logo faces the viewer through the whole rotation.
  const front = useMemo(() => wrappedHalf(-Math.PI / 2), []);
  const back = useMemo(() => wrappedHalf(Math.PI / 2), []);
  const top = useMemo(() => lathe(CAN_TOP_PROFILE), []);
  const base = useMemo(() => lathe(CAN_BASE_PROFILE), []);

  const half = CAN_BODY_HEIGHT / 2;
  // Center the whole can (base bottom ≈ -half-0.1, lid top ≈ half+0.25) on the origin.
  const offset = -0.075;

  return (
    <group position={[0, offset, 0]}>
      <mesh geometry={front}>
        <meshStandardMaterial map={texture} metalness={0.25} roughness={0.28} envMapIntensity={0.7} />
      </mesh>
      <mesh geometry={back}>
        <meshStandardMaterial map={texture} metalness={0.25} roughness={0.28} envMapIntensity={0.7} />
      </mesh>
      <mesh geometry={top} position={[0, half, 0]}>
        <meshStandardMaterial color="#b9bdc3" metalness={1} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={base} position={[0, -half, 0]}>
        <meshStandardMaterial color="#9ea2a8" metalness={1} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. Model generated from a photo by the image-to-3D pipeline (TripoSR)
// ---------------------------------------------------------------------------

const GENERATED_MODEL_URL = '/models/monster-can.glb';

function GeneratedModel() {
  const { scene } = useGLTF(GENERATED_MODEL_URL);

  // Center the mesh and scale it to the shared product height.
  const { object, scale, position } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = PRODUCT_HEIGHT / size.y;
    scene.traverse((o) => {
      if (o.isMesh) {
        o.material.roughness = 0.45;
        o.material.metalness = 0.2;
      }
    });
    return { object: scene, scale: s, position: center.multiplyScalar(-s) };
  }, [scene]);

  return <primitive object={object} scale={scale} position={position} />;
}

const MODELS = { bottle: Bottle, 'textured-can': TexturedCan, generated: GeneratedModel };

// Studio lighting built from light panels, so no HDR file needs to download.
function Studio() {
  return (
    <Environment resolution={256}>
      <Lightformer intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} />
      {/* Tall front strips create the vertical specular highlights that read as polished metal */}
      <Lightformer intensity={4} position={[-2.2, 0, 4]} scale={[0.6, 8, 1]} />
      <Lightformer intensity={1.5} position={[2.6, 0, 4]} scale={[0.3, 8, 1]} />
      <Lightformer intensity={2.2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} />
      <Lightformer intensity={2.2} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 1.2, 1]} />
      <Lightformer intensity={1.2} color="#c8ff2e" position={[3, -2, 3]} rotation-y={-Math.PI / 3} scale={[4, 4, 1]} />
      <Lightformer intensity={1} color="#7cf5ff" position={[-3, -1, 3]} rotation-y={Math.PI / 3} scale={[4, 4, 1]} />
    </Environment>
  );
}

export default function BottleScene({ isMobile = false, frameloop = 'always', model = HERO_MODEL }) {
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
      <ContactShadows position={[0, -1.75, 0]} opacity={0.55} scale={6} blur={2.6} far={3} />
      <Studio />
    </Canvas>
  );
}
