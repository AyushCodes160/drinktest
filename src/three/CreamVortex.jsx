import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Silky protein-shake ribbons: tubes that rise out of the bottle neck and wind around the
// bottle in a slow vortex. `progress` (0..1, from scroll) reveals each ribbon from the neck
// outward, so lowering it draws the shake back into the neck. The shader thins the leading
// edge into a soft tip, adds a slow peristaltic swell, and lights it as an opaque, creamy
// liquid with caramel marbling, a soft wrap-around diffuse and a velvety highlight.

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uRadius;
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float s = uv.x;
    // 1 behind the leading edge, tapering to 0 at it; a soft start where it leaves the neck.
    float tip = smoothstep(uProgress, uProgress - 0.07, s);
    float swell = 0.78 + 0.22 * sin(s * 46.0 - uTime * 2.0) + 0.08 * sin(s * 13.0 + uTime * 0.7);
    float thickness = tip * swell;
    vec3 center = position - normal * uRadius;
    vec3 pos = center + normal * uRadius * thickness;
    // A slow, viscous ripple across the surface.
    pos += normal * uRadius * 0.12 * sin(uv.y * 12.566 + uTime * 1.4 + s * 24.0) * tip;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = mv.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uCream;
  uniform vec3 uCaramel;
  uniform vec3 uGold;
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  varying vec2 vUv;

  void main() {
    if (vUv.x > uProgress) discard;
    vec3 N = normalize(vNormalV);
    vec3 V = normalize(-vViewPos);

    // Marbling that flows along the ribbon.
    float marble = 0.5 + 0.5 * sin(vUv.x * 28.0 - uTime * 1.1 + sin(vUv.y * 6.2832 + vUv.x * 9.0) * 1.6);
    vec3 base = mix(uCream, uCaramel, marble * 0.22);

    // Soft wrap lighting from a warm key above, plus a cool fill.
    vec3 L = normalize(vec3(0.4, 0.9, 0.55));
    float wrap = dot(N, L) * 0.5 + 0.5;
    float fill = max(dot(N, normalize(vec3(-0.6, 0.2, 0.4))), 0.0);
    vec3 col = base * (0.38 + 0.58 * wrap) + base * fill * 0.12;

    // Velvety highlight (broad) and a small wet glint. The glint and the golden rim go past
    // 1.0 (this material isn't tone mapped), which is what the bloom pass keys on: only the
    // ribbon's highlights glow, never the matte bottle.
    vec3 H = normalize(L + V);
    float nh = max(dot(N, H), 0.0);
    col += vec3(1.0, 0.96, 0.88) * (pow(nh, 18.0) * 0.16 + pow(nh, 90.0) * 1.1);

    // Golden rim, like light through the edge of a thick shake.
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    col += uGold * fres * 0.75;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// Path for one ribbon: up out of the neck, curling over, then spiralling down around the
// bottle. `phase` rotates it; `reach` sets how far out it winds.
function ribbonCurve({ neckY, baseY, phase = 0, reach = 1.25, turns = 2.2, lift = 1.0 }) {
  const pts = [];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let x, y, z;
    if (t < 0.16) {
      const k = t / 0.16;
      const r = 0.05 + 0.32 * k * k;
      const a = phase + k * 1.2;
      x = Math.sin(a) * r;
      z = Math.cos(a) * r;
      y = neckY - 0.25 + (lift + 0.25) * Math.sin((k * Math.PI) / 2);
    } else {
      const k = (t - 0.16) / 0.84;
      const a = phase + 1.2 + k * turns * Math.PI * 2;
      const r = 0.37 + (reach - 0.37) * Math.min(1, k / 0.25) - 0.08 * Math.sin(k * Math.PI);
      x = Math.sin(a) * r;
      z = Math.cos(a) * r;
      y = neckY + lift - (neckY + lift - (baseY + 0.45)) * k;
    }
    pts.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
}

function useRibbon(opts, radius, segments) {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(ribbonCurve(opts), segments, radius, 28, false),
    // Shape options are fixed per instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [radius, segments],
  );
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uRadius: { value: radius },
          uCream: { value: new THREE.Color('#e8d9c5').convertSRGBToLinear() },
          uCaramel: { value: new THREE.Color('#b98d5c').convertSRGBToLinear() },
          uGold: { value: new THREE.Color('#e8c37e').convertSRGBToLinear() },
        },
      }),
    [radius],
  );
  return { geometry, material };
}

export default function CreamVortex({ vortex, neckY, baseY, segments = 420 }) {
  const group = useRef();
  const main = useRef();
  const second = useRef();
  const a = useRibbon({ neckY, baseY, phase: 0, reach: 1.22, turns: 2.1, lift: 1.05 }, 0.16, segments);
  const b = useRibbon({ neckY, baseY, phase: Math.PI, reach: 1.02, turns: 1.8, lift: 0.8 }, 0.075, Math.round(segments * 0.7));

  useFrame((state, delta) => {
    const { progress, widen, spin } = vortex.current;
    const t = state.clock.elapsedTime;
    group.current.visible = progress > 0.002;
    if (!group.current.visible) return;
    // Slow, elegant rotation of the whole vortex; it opens up a little as it widens.
    group.current.rotation.y += Math.min(delta, 0.05) * (0.22 + 0.35 * widen) * spin;
    group.current.scale.set(1 + 0.22 * widen, 1 + 0.06 * widen, 1 + 0.22 * widen);
    for (const [mesh, lag] of [[main, 0], [second, 0.08]]) {
      const u = mesh.current.material.uniforms;
      u.uTime.value = t;
      u.uProgress.value = Math.max(0, progress - lag) / (1 - lag);
    }
  });

  return (
    <group ref={group}>
      <mesh ref={main} geometry={a.geometry} material={a.material} frustumCulled={false} />
      <mesh ref={second} geometry={b.geometry} material={b.material} frustumCulled={false} />
    </group>
  );
}
