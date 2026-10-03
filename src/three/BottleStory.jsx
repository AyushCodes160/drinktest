import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { easing } from 'maath';
import { BOTTLE_BEATS as B, bottleTurnAt, cameraAt, ease, layoutAt, seg, story } from './story';
import { placeCamera } from './cameraRig';
import CreamVortex from './CreamVortex';

const TAU = Math.PI * 2;

// ALXR 500 mL bottle (scene units, centered near the origin). Ergonomic silhouette: full
// base, a gentle grip waist, broad shoulder and a short neck under a metal collar.
const SILHOUETTE = [
  [0.0, -1.75], [0.42, -1.75], [0.56, -1.72], [0.625, -1.64], [0.645, -1.5], [0.645, -1.1],
  [0.6, -0.35], [0.598, 0.1], [0.645, 0.75], [0.64, 1.0], [0.6, 1.15], [0.5, 1.29],
  [0.4, 1.37], [0.33, 1.42], [0.3, 1.47], [0.3, 1.62],
];
const BASE_Y = -1.75;
const TOP_Y = 1.62; // neck lip
const COLLAR = { y0: 1.42, y1: 1.52, r: 0.345 };
const CAP = { seat: 1.5, h: 0.48, r: 0.4 };

// --- Textures drawn at runtime (fonts load first, then the canvas is redrawn) ---------

const BODY_W = 2048;
const BODY_H = 1844; // keeps texels square on the body (circumference ≈ 4 units, height ≈ 3.6)

let grain;
function grainTile() {
  if (grain) return grain;
  grain = document.createElement('canvas');
  grain.width = grain.height = 128;
  const g = grain.getContext('2d');
  const img = g.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return grain;
}

function drawBody(ctx) {
  const W = BODY_W, H = BODY_H;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1d2026'); bg.addColorStop(0.55, '#15171c'); bg.addColorStop(1, '#101216');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // Fine soft-touch grain: a small noise tile, repeated (cheap, no full-size pixel loop).
  ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
  ctx.globalAlpha = 0.06;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  const cx = W / 2; // front of the bottle
  // Vertical wordmark, reading bottom to top.
  ctx.save();
  ctx.translate(cx, H * 0.47);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '900 expanded 300px Archivo, "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const g = ctx.createLinearGradient(-500, 0, 500, 0);
  g.addColorStop(0, '#c9d1dc'); g.addColorStop(0.5, '#eef2f7'); g.addColorStop(1, '#c9d1dc');
  ctx.fillStyle = g;
  ctx.fillText('ALXR', 0, 0);
  // Golden-cream hairline and descriptor alongside the wordmark
  ctx.fillStyle = '#e8c37e';
  ctx.fillRect(-520, 190, 1040, 4);
  ctx.font = '700 46px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(232,195,126,0.95)';
  ctx.fillText('VANILLA CREAM  ·  500 mL', 0, 250);
  ctx.fillStyle = 'rgba(226,232,240,0.55)';
  ctx.fillText('35G PROTEIN  ·  26 VITAMINS & MINERALS  ·  ZERO REFINED SUGAR', 0, -205);
  ctx.restore();

  // Back: quiet descriptor and a golden band
  ctx.textAlign = 'center';
  ctx.font = '800 40px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(226,232,240,0.6)';
  ctx.fillText('ALL-IN-ONE LIQUID NUTRITION', 160, H * 0.72);
  ctx.fillText('ALL-IN-ONE LIQUID NUTRITION', W - 160, H * 0.72);
  ctx.fillStyle = 'rgba(232,195,126,0.7)';
  ctx.fillRect(0, H * 0.18, W, 3);
}

function drawCapTop(ctx) {
  const S = 512, c = S / 2;
  ctx.fillStyle = '#23262c'; ctx.fillRect(0, 0, S, S);
  for (let r = 0; r < c; r += 3) {
    ctx.strokeStyle = `rgba(255,255,255,${0.015 + (r % 9 === 0 ? 0.025 : 0)})`;
    ctx.beginPath(); ctx.arc(c, c, r, 0, TAU); ctx.stroke();
  }
  ctx.strokeStyle = '#e8c37e'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(c, c, c * 0.78, 0, TAU); ctx.stroke();
  ctx.font = '900 expanded 92px Archivo, "Arial Black", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#dfe5ee';
  ctx.fillText('ALXR', c, c + 4);
}

function useCanvasTexture(width, height, draw) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    draw(canvas.getContext('2d'));
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [width, height, draw]);
  useEffect(() => {
    let alive = true;
    // Redraw once the display font is ready so the wordmark uses Archivo, not a fallback.
    Promise.all([
      document.fonts.load('900 expanded 100px Archivo'),
      document.fonts.load('700 40px "Plus Jakarta Sans"'),
    ]).then(() => {
      if (!alive) return;
      draw(texture.image.getContext('2d'));
      texture.needsUpdate = true;
    }).catch(() => {});
    return () => { alive = false; texture.dispose(); };
  }, [texture, draw]);
  return texture;
}

// --- Geometry ------------------------------------------------------------------------

function bodyGeometry() {
  const curve = new THREE.SplineCurve(SILHOUETTE.map(([r, y]) => new THREE.Vector2(r, y)));
  const g = new THREE.LatheGeometry(curve.getPoints(180), 160, -Math.PI, TAU); // u = 0.5 faces +Z
  // Map V by height so the wordmark isn't stretched by the curved profile.
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setY(i, (pos.getY(i) - BASE_Y) / (TOP_Y - BASE_Y));
  g.computeVertexNormals();
  return g;
}

// Industrial cap: 36 flat-topped grip ridges around the side, softened top edge.
function capGeometry() {
  const g = new THREE.CylinderGeometry(CAP.r, CAP.r, CAP.h, 216, 8, true);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const c = Math.cos(36 * Math.atan2(x, z));
    const ridge = 1 + 0.045 * Math.sign(c) * Math.pow(Math.abs(c), 0.35);
    const edge = y > CAP.h / 2 - 0.05 ? 0.96 : 1; // bevel the top rim slightly
    pos.setXYZ(i, x * ridge * edge, y, z * ridge * edge);
  }
  g.translate(0, CAP.h / 2, 0);
  g.computeVertexNormals();
  return g;
}

function GroundShadow({ y, radius }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(72,52,34,0.32)');
    grad.addColorStop(1, 'rgba(72,52,34,0)');
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

export default function BottleStory({ tier, reducedMotion }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const bodyTex = useCanvasTexture(BODY_W, BODY_H, drawBody);
  const capTex = useCanvasTexture(512, 512, drawCapTop);
  const bodyGeo = useMemo(() => bodyGeometry(), []);
  const capGeo = useMemo(() => capGeometry(), []);
  useEffect(() => () => { bodyGeo.dispose(); capGeo.dispose(); }, [bodyGeo, capGeo]);

  const model = useRef();
  const spin = useRef();
  const cap = useRef();
  const vortex = useRef({ progress: 0, widen: 0, spin: 1 });
  const k = useRef({ s: 0, stage: -1, ny: -2 });
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDelta) => {
    const d = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const cur = k.current;

    // The story position follows the scroll through a critically damped spring (maath's
    // smooth-damp): everything below trails the scrollbar slightly and eases to rest when
    // scrolling stops, instead of stopping dead.
    easing.damp(cur, 's', story.s, reducedMotion ? 0.12 : 0.38, d);
    const s = cur.s;

    // --- Beats --------------------------------------------------------------
    const twist = ease.inOut(seg(s, B.twist));
    const pop = ease.outBack(seg(s, B.pop));
    const ribbon = ease.inOut(seg(s, B.ribbon));
    const widen = ease.inOut(seg(s, B.widen));
    const retract = ease.inOut(seg(s, B.retract));
    const drop = ease.inCubic(seg(s, B.drop));
    const shut = ease.outCubic(seg(s, B.shut));
    const settle = ease.outCubic(seg(s, B.settle));
    const shake = Math.max(ease.bell(seg(s, B.popImpact)), ease.bell(seg(s, B.sealImpact)) * 0.8);

    // --- Cap: unscrews, lifts clear and hovers above the rising shake, then drops and seals ---
    // Position eases with damp3; rotations ease per axis. (dampE wraps angles to the shortest
    // path, which would undo the two-turn unscrew, so the twist axis uses plain damping.)
    const lift = twist * 0.1 + pop * 1.55;
    const bob = reducedMotion ? 0 : Math.sin(t * 1.2) * 0.05 * pop * (1 - drop);
    easing.damp3(cap.current.position, [0, CAP.seat + lift * (1 - drop) + bob, 0], 0.12, d);
    easing.damp(cap.current.rotation, 'y', -twist * 2 * TAU + shut * 2 * TAU, 0.14, d);
    easing.damp(cap.current.rotation, 'z', pop * 0.18 * (1 - drop), 0.2, d);
    easing.damp(cap.current.rotation, 'x', pop * -0.1 * (1 - drop), 0.2, d);

    // --- Cream vortex -----------------------------------------------------------
    vortex.current.progress = ribbon * (1 - retract);
    vortex.current.widen = widen * (1 - retract);
    vortex.current.spin = reducedMotion ? 0 : 1;

    // --- Rotation: keyframed by story position (front-on at the hero, a victory spin to land
    // front-on at the end), with a gentle sway so it's never static. ---
    const cam = cameraAt(s);
    // Absolute, not accumulated: the turn is a function of the (smoothed) story position plus
    // a small bounded sway, so scrolling up rewinds it exactly and the label returns to face
    // the viewer at the top. The damping makes the rewind glide instead of snap.
    const sway = reducedMotion ? 0 : Math.sin(t * 0.55) * 0.14;
    easing.damp(spin.current.rotation, 'y', bottleTurnAt(s) + sway, 0.35, d);
    easing.damp(spin.current.position, 'y', ease.bell(settle) * 0.3, 0.12, d);

    // --- Placement & camera ---------------------------------------------------
    // Desktop: for the final beat the bottle docks onto the pre-order stage, so it sits
    // vertically centered beside the card and scrolls away with it (never over the footer).
    const L = layoutAt(tier, s);
    easing.damp3(model.current.scale, L.scale, 0.3, d);
    placeCamera({
      camera, size, tier, layout: L, cam, t, d, target, shake, state: cur,
      targetY: cam.focus * (TOP_Y + 0.2) * L.scale,
      anchorBlend: tier === 'desktop' ? ease.inOut(seg(s, [2.78, 3.0])) : 0,
    });
  });

  return (
    <group ref={model}>
      <GroundShadow y={BASE_Y - 0.01} radius={0.65} />
      <group ref={spin}>
        {/* Soft-touch matte body with the vertical ALXR wordmark */}
        <mesh geometry={bodyGeo}>
          <meshPhysicalMaterial
            map={bodyTex}
            roughness={0.55}
            metalness={0.1}
            sheen={0.6}
            sheenRoughness={0.6}
            sheenColor="#3b4049"
            clearcoat={0.08}
            clearcoatRoughness={0.6}
          />
        </mesh>

        {/* Brushed titanium collar with a golden hairline */}
        <mesh position={[0, (COLLAR.y0 + COLLAR.y1) / 2, 0]}>
          <cylinderGeometry args={[COLLAR.r, COLLAR.r + 0.012, COLLAR.y1 - COLLAR.y0, 96]} />
          <meshStandardMaterial color="#c9ced6" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[0, COLLAR.y1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[COLLAR.r + 0.002, 0.008, 8, 96]} />
          <meshStandardMaterial color="#e8c37e" metalness={1} roughness={0.2} />
        </mesh>

        {/* Neck lip and the shake visible inside once the cap is off */}
        <mesh position={[0, TOP_Y - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.3, 48]} />
          <meshStandardMaterial color="#cfd4db" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, TOP_Y - 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.24, 48]} />
          <meshStandardMaterial color="#e8d9c5" roughness={0.4} />
        </mesh>

        {/* Industrial ridged twist cap (graphite anodized) with engraved top */}
        <group ref={cap} position={[0, CAP.seat, 0]}>
          <mesh geometry={capGeo}>
            <meshStandardMaterial color="#2b2f36" metalness={0.65} roughness={0.38} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, CAP.h, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[CAP.r * 0.97, 72]} />
            <meshStandardMaterial map={capTex} metalness={0.55} roughness={0.35} />
          </mesh>
        </group>

        {/* Cream ribbons from the neck */}
        <CreamVortex vortex={vortex} neckY={TOP_Y} baseY={BASE_Y} segments={tier === 'desktop' ? 420 : 260} />
      </group>
    </group>
  );
}
