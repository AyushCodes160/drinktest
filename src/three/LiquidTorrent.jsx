import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { randomArray } from './random';

// A fountain of glowing droplets erupting from a disc (the opened can) and falling under
// gravity. Motion is computed analytically in the vertex shader from each particle's random
// seed and the clock, so thousands of particles cost almost nothing on the CPU.

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uEmit;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uGravity;
  uniform float uRadius;
  uniform vec2 uUp;
  uniform vec2 uOut;
  uniform vec2 uLife;
  attribute vec4 aSeed;
  attribute vec3 aSeed2;
  varying float vAlpha;
  varying float vHeat;

  void main() {
    float life = mix(uLife.x, uLife.y, aSeed.x);
    float phase = fract(uTime / life + aSeed.y);
    float age = phase * life;

    float angle = aSeed.z * 6.2831853;
    vec2 dir = vec2(cos(angle), sin(angle));
    float spread = sqrt(aSeed.w);
    vec3 pos = vec3(dir.x, 0.0, dir.y) * uRadius * spread * 0.95;

    // Particles near the rim fly further out; those near the center shoot higher.
    float up = mix(uUp.x, uUp.y, aSeed2.x) * (1.15 - 0.4 * spread);
    float outward = mix(uOut.x, uOut.y, aSeed2.y) * (0.3 + 0.7 * spread);
    vec3 vel = vec3(dir.x * outward, up, dir.y * outward);
    // A little swirl so the torrent twists instead of spraying in straight lines.
    vel.xz += vec2(-dir.y, dir.x) * 0.35 * (aSeed2.y - 0.5);

    pos += vel * age + vec3(0.0, 0.5 * uGravity * age * age, 0.0);

    float isOn = step(aSeed2.z, uEmit);
    vAlpha = isOn * smoothstep(0.0, 0.05, phase) * (1.0 - smoothstep(0.5, 1.0, phase));
    vHeat = 1.0 - phase;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * mix(0.45, 1.5, aSeed.x) * uPixelRatio * (0.55 + 0.45 * vHeat) * isOn / -mvPosition.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uHot;
  uniform vec3 uCool;
  uniform float uIntensity;
  varying float vAlpha;
  varying float vHeat;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = pow(1.0 - d * 2.0, 1.7);
    vec3 color = mix(uCool, uHot, vHeat);
    color += vec3(0.7) * pow(glow, 8.0) * vHeat; // white-hot core on fresh droplets
    gl_FragColor = vec4(color * uIntensity, glow * vAlpha);
  }
`;

export default function LiquidTorrent({
  count = 8000,
  radius = 0.55,
  emit, // ref holding 0..1: the fraction of particles currently flowing
  size = 70,
  up = [2.2, 4.4],
  outward = [0.6, 2.6],
  life = [1.0, 2.1],
  gravity = -6,
  intensity = 1.6,
  hot = '#eaff9c',
  cool = '#39ff6a',
}) {
  const material = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seed = randomArray(count * 4);
    const seed2 = randomArray(count * 3);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    g.setAttribute('aSeed2', new THREE.BufferAttribute(seed2, 3));
    // Positions are computed in the shader, so give the frustum check a generous box.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 12);
    return g;
  }, [count]);

  // Tuning props are read once per instance; per-frame values are written in useFrame.
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uEmit: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: size },
    uGravity: { value: gravity },
    uRadius: { value: radius },
    uUp: { value: new THREE.Vector2(...up) },
    uOut: { value: new THREE.Vector2(...outward) },
    uLife: { value: new THREE.Vector2(...life) },
    uHot: { value: new THREE.Color(hot) },
    uCool: { value: new THREE.Color(cool) },
    uIntensity: { value: intensity },
  }));

  useFrame((state) => {
    const u = material.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uEmit.value = emit.current;
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
