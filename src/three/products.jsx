import { useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { lidHole } from './story';

// Every product model is sized to fit this height, centered on the origin.
const PRODUCT_HEIGHT = 3.3;

// ---------------------------------------------------------------------------
// 1. Procedural brand bottle
// ---------------------------------------------------------------------------

// Half-profile of the bottle (x = radius, y = height), revolved around Y by LatheGeometry.
const BODY_PROFILE = [
  [0, -1.6], [0.52, -1.6], [0.6, -1.54], [0.62, -1.4], [0.62, 0.55],
  [0.6, 0.72], [0.5, 0.95], [0.36, 1.12], [0.27, 1.22], [0.26, 1.34], [0, 1.34],
];

export function Bottle() {
  const bodyGeometry = useMemo(() => {
    const points = BODY_PROFILE.map(([x, y]) => new THREE.Vector2(x, y));
    // Resample the profile with a spline so the silhouette is smooth, not faceted.
    const curve = new THREE.SplineCurve(points);
    return new THREE.LatheGeometry(curve.getPoints(120), 128);
  }, []);

  return (
    <group>
      {/* Brushed-metal body */}
      <mesh geometry={bodyGeometry}>
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
// 2. Can with the product photo wrapped around it
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

// The drinking opening is cut into the lid texture in the shader, so the lid really has a
// hole once the tab cracks. Every can instance (intact and both halves) shares `lidHole`;
// the story scene drives it from 0 (sealed) to 1 (fully open).
// Opening position/size in the lid's top-down UV space (measured from the reference photo:
// the scored panel sits just in front of the rivet, toward +Z).
const HOLE_CENTER_Z = 0.19;
const HOLE_HALF = [0.105, 0.078]; // x, z
const holeUniforms = {
  uHole: lidHole,
  uHoleCenter: { value: new THREE.Vector2(0.5, 0.5 - HOLE_CENTER_Z / (2 * CAN_RADIUS)) },
  uHoleRadius: { value: new THREE.Vector2(HOLE_HALF[0] / (2 * CAN_RADIUS), HOLE_HALF[1] / (2 * CAN_RADIUS)) },
};

function cutLidOpening(shader) {
  Object.assign(shader.uniforms, holeUniforms);
  shader.fragmentShader = shader.fragmentShader
    .replace(
      'void main() {',
      `uniform float uHole;
      uniform vec2 uHoleCenter;
      uniform vec2 uHoleRadius;
      void main() {`,
    )
    .replace(
      '#include <clipping_planes_fragment>',
      `#include <clipping_planes_fragment>
      if (uHole > 0.001) {
        vec2 d = (vMapUv - uHoleCenter) / (uHoleRadius * uHole);
        if (dot(d, d) < 1.0) discard;
      }`,
    );
}

// Replace a lathe's UVs with a straight-down planar projection, so a top-view photo lands
// on the lid exactly as it looks from above (image top toward -Z, the far side).
function topDownMapped(geometry) {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, 0.5 + pos.getX(i) / (2 * CAN_RADIUS), 0.5 - pos.getZ(i) / (2 * CAN_RADIUS));
  }
  return geometry;
}

export function TexturedCan() {
  const texture = useTexture('/textures/can-front.jpg', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  // Both halves carry the artwork, so a logo faces the viewer through the whole rotation.
  const front = useMemo(() => wrappedHalf(-Math.PI / 2), []);
  const back = useMemo(() => wrappedHalf(Math.PI / 2), []);
  const lid = useTexture('/textures/lid-top.jpg', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
  const top = useMemo(() => topDownMapped(lathe(CAN_TOP_PROFILE)), []);
  const base = useMemo(() => lathe(CAN_BASE_PROFILE), []);

  const half = CAN_BODY_HEIGHT / 2;
  // Center the whole can (base bottom ≈ -half-0.1, lid top ≈ half+0.25) on the origin.
  const offset = -0.075;

  return (
    <group position={[0, offset, 0]}>
      {[front, back].map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial map={texture} metalness={0.25} roughness={0.28} envMapIntensity={0.7} />
        </mesh>
      ))}
      {/* Lid and shoulder carry the top-down reference photo (tab painted out; the 3D tab sits on top) */}
      <mesh geometry={top} position={[0, half, 0]}>
        <meshStandardMaterial
          map={lid}
          metalness={0.45}
          roughness={0.3}
          envMapIntensity={0.8}
          side={THREE.DoubleSide}
          onBeforeCompile={cutLidOpening}
          customProgramCacheKey={() => 'lid-with-opening'}
        />
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

export function GeneratedModel() {
  const { scene } = useGLTF(GENERATED_MODEL_URL);

  // Center the mesh and scale it to the shared product height.
  const { scale, position } = useMemo(() => {
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
    return { scale: s, position: center.multiplyScalar(-s) };
  }, [scene]);

  return <primitive object={scene} scale={scale} position={position} />;
}

// ---------------------------------------------------------------------------
// Pull-tab cut from the top-down reference photo, hinged at the rivet (lid center).
// Cracking it (positive rotation on `hingeRef`) lifts the logo/finger end up and away while
// the short nose drives down through the opening, pushing the scored panel (`flapRef`)
// into the can, as in a real opened can.
// ---------------------------------------------------------------------------

// Measured from the reference: the lid is 317px across (= can diameter), the tab crop is
// 81 × 125px and the rivet sits at 55% across / 69% down that crop.
const PX = (CAN_RADIUS * 2) / 317;
const TAB_W = 81 * PX;
const TAB_H = 125 * PX;
const TAB_CENTER = [(0.5 - 0.549) * TAB_W, -(0.692 - 0.5) * TAB_H]; // x, z relative to the rivet

export function PullTab({ hingeRef, flapRef, liquidRef, lidY }) {
  const texture = useTexture('/textures/lid-tab.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
  const hingeZ = HOLE_CENTER_Z - HOLE_HALF[1]; // the panel stays attached on the rivet side
  return (
    <group position={[0, lidY, 0]}>
      {/* Inside the can, seen through the opening */}
      <mesh position={[0, -0.2, HOLE_CENTER_Z]}>
        <cylinderGeometry args={[HOLE_HALF[0] * 1.05, HOLE_HALF[0] * 1.05, 0.4, 32, 1, true]} />
        <meshStandardMaterial color="#030303" roughness={1} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, -0.34, HOLE_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[HOLE_HALF[0] * 1.05, 32]} />
        <meshStandardMaterial ref={liquidRef} color="#020302" emissive="#c8ff2e" emissiveIntensity={0} />
      </mesh>

      {/* Scored panel, hinged on its rivet-side edge; it bends down into the can */}
      <group ref={flapRef} position={[0, -0.004, hingeZ]}>
        <mesh position={[0, 0, HOLE_HALF[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, HOLE_HALF[1] / HOLE_HALF[0], 1]}>
          <circleGeometry args={[HOLE_HALF[0] * 0.98, 32]} />
          <meshStandardMaterial color="#9da1a6" metalness={1} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* The tab: photo cut-out, lying flat with its logo end toward -Z */}
      <group ref={hingeRef} position={[0, 0.014, 0]}>
        <mesh position={[TAB_CENTER[0], 0.002, TAB_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[TAB_W, TAB_H]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.4}
            metalness={0.5}
            roughness={0.28}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
