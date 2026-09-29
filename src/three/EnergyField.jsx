import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { randomArray } from './random';

// Glowing "soda" that drifts out of the opened can. Each particle's distance from the can
// is driven directly by `burst` (0..1, tied to scroll), so scrolling pushes the cloud
// outward and scrolling back pulls it home. Time only adds a gentle float on top.

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBurst;
  uniform float uSpread;
  uniform float uHeight;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute vec4 aSeed;
  attribute vec4 aSeed2;
  varying float vAlpha;
  varying float vOrb;
  varying float vTint;

  void main() {
    // Start somewhere inside the can's liquid column.
    vec3 start = vec3(0.0, (aSeed.x - 0.5) * uHeight, 0.0);

    // Random direction, flattened in depth so the cloud spreads across the screen.
    float theta = aSeed.y * 6.2831853;
    float phi = acos(2.0 * aSeed.z - 1.0);
    vec3 dir = vec3(sin(phi) * cos(theta), cos(phi) * 0.8, sin(phi) * sin(theta) * 0.55);

    // Staggered release: outer particles leave a little later, so it blooms rather than pops.
    float release = clamp((uBurst - aSeed2.x * 0.35) / 0.65, 0.0, 1.0);
    float eased = 1.0 - pow(1.0 - release, 3.0);
    float dist = eased * uSpread * mix(0.2, 1.0, pow(aSeed.w, 0.7));

    vec3 pos = start * (1.0 - eased * 0.4) + dir * dist;

    // Slow orbit and bobbing once released.
    float a = uTime * 0.12 * (aSeed2.y - 0.5) * eased;
    pos.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * pos.xz;
    pos += vec3(
      sin(uTime * 0.7 + aSeed2.z * 20.0),
      cos(uTime * 0.5 + aSeed2.w * 20.0),
      sin(uTime * 0.6 + aSeed.x * 20.0)
    ) * 0.12 * eased;

    vOrb = step(0.96, aSeed2.w);          // ~4% are big soft orbs, the rest sparkles
    vTint = aSeed2.z;
    float twinkle = 0.65 + 0.35 * sin(uTime * 3.0 + aSeed.y * 40.0);
    vAlpha = smoothstep(0.0, 0.12, release) * mix(twinkle * 0.85, 0.18, vOrb);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float size = uSize * mix(mix(0.45, 1.25, aSeed.w), 5.0, vOrb);
    gl_PointSize = size * uPixelRatio * step(0.001, release) / -mvPosition.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  varying float vOrb;
  varying float vTint;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = pow(1.0 - d * 2.0, mix(1.8, 2.6, vOrb));
    vec3 color = mix(uColorA, uColorB, vTint * 0.6);
    color += vec3(0.5) * pow(glow, 10.0) * (1.0 - vOrb); // bright cores on sparkles
    gl_FragColor = vec4(color, glow * vAlpha);
  }
`;

export default function EnergyField({ count = 4000, burst, spread = 4.2, height = 2.6, size = 50 }) {
  const material = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(randomArray(count * 4), 4));
    g.setAttribute('aSeed2', new THREE.BufferAttribute(randomArray(count * 4), 4));
    return g;
  }, [count]);

  // Tuning props are read once per instance; per-frame values are written in useFrame.
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uBurst: { value: 0 },
    uSpread: { value: spread },
    uHeight: { value: height },
    uPixelRatio: { value: 1 },
    uSize: { value: size },
    uColorA: { value: new THREE.Color('#c8ff2e') },
    uColorB: { value: new THREE.Color('#3dffa8') },
  }));

  useFrame((state) => {
    const u = material.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uBurst.value = burst.current;
    u.uPixelRatio.value = state.viewport.dpr;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// A handful of real, lit 3D spheres riding the same burst, for depth and specular glints.
export function EnergyOrbs({ count = 24, burst, spread = 3.6 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [seeds] = useState(() =>
    Array.from({ length: count }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      return {
        dir: new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi) * 0.8, Math.sin(phi) * Math.sin(theta) * 0.6),
        dist: 0.35 + Math.random() * 0.65,
        size: 0.03 + Math.random() * 0.07,
        phase: Math.random() * 100,
        y: (Math.random() - 0.5) * 2,
      };
    }),
  );

  useFrame((state) => {
    const b = burst.current;
    const t = state.clock.elapsedTime;
    const eased = 1 - Math.pow(1 - b, 3);
    seeds.forEach((sd, i) => {
      dummy.position
        .copy(sd.dir)
        .multiplyScalar(eased * spread * sd.dist)
        .add({ x: 0, y: sd.y * (1 - eased * 0.4), z: 0 });
      dummy.position.y += Math.sin(t * 0.8 + sd.phase) * 0.1 * eased;
      dummy.scale.setScalar(sd.size * THREE.MathUtils.smoothstep(b, 0.05, 0.3));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial
        color="#c8ff2e"
        emissive="#9dff3a"
        emissiveIntensity={0.7}
        roughness={0.15}
        metalness={0}
        transparent
        opacity={0.8}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
