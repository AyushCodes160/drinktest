import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { randomArray } from './random';

// Slow, glowing specks drifting upward around the product, like carbonation in the air.

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute vec4 aSeed;
  varying float vAlpha;

  void main() {
    float height = 5.5;
    float speed = mix(0.08, 0.3, aSeed.x);
    float y = mod(aSeed.y * height + uTime * speed, height) - height * 0.5;
    float angle = aSeed.z * 6.2831853 + uTime * 0.06 * (aSeed.w - 0.5);
    float r = mix(1.0, 3.4, aSeed.w);
    vec3 pos = vec3(
      cos(angle) * r + sin(uTime * 0.7 + aSeed.x * 12.0) * 0.08,
      y,
      sin(angle) * r * 0.55 - 0.4
    );
    vAlpha = smoothstep(-2.75, -1.6, y) * (1.0 - smoothstep(1.6, 2.75, y)) * mix(0.25, 1.0, aSeed.x);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * mix(0.4, 1.4, aSeed.w) * uPixelRatio / -mvPosition.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, pow(1.0 - d * 2.0, 2.0) * vAlpha);
  }
`;

export default function FloatingMotes({ count = 260, size = 55, color = '#c8ff2e' }) {
  const material = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seed = randomArray(count * 4);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 }, uSize: { value: size }, uColor: { value: new THREE.Color(color) } }),
    [size, color],
  );

  useFrame((state) => {
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
    material.current.uniforms.uPixelRatio.value = state.viewport.dpr;
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
