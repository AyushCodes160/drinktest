// Shared, mutable state between the DOM (which measures scroll) and the 3D scene (which
// reads it every frame). Kept outside React so scrolling never triggers re-renders.
//   s: story position — 0 hero, 1 nutrition, 2 ingredients, 3 pre-order (fractional between)
export const story = {
  s: 0,
  pointer: { x: 0, y: 0 },
  // Phones/tablets: the open gap (data-stage) nearest the middle of the screen, and where its
  // center is vertically in canvas space (+1 top .. -1 bottom; beyond that is off-screen).
  stage: { index: -1, ny: -2 },
};

// How far the lid's drinking opening is cut (0 sealed .. 1 open), shared as a shader uniform
// by every can instance.
export const lidHole = { value: 0 };

// Plain math (no three.js import) so the page's scroll tracker stays out of the 3D bundle.
export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const smoothstep = (x, lo, hi) => {
  const t = clamp((x - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
};

// Progress of s through [a, b], clamped to 0..1.
export const seg = (s, [a, b]) => clamp((s - a) / (b - a), 0, 1);

export const ease = {
  inOut: (x) => smoothstep(x, 0, 1),
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inCubic: (x) => x * x * x,
  outBack: (x) => {
    const c = 1.4;
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  },
  // 0 -> 1 -> 0 over the range, for one-off flashes and shakes.
  bell: (x) => Math.sin(Math.PI * clamp(x, 0, 1)),
};

// The storyline, in story units. It only moves forward: the second half is a new sequence
// (suck back, slam, spin), not the first half played in reverse.
export const BEATS = {
  frontal: [0.0, 0.1], //    hero: intact, seamless can, straight-on
  toTop: [0.1, 0.45], //     camera rises to look down on the lid
  crack: [0.45, 0.8], //     pull-tab cracks, panel pushes into the can
  lift: [1.05, 1.5], //      nutrition: seam appears, top half levitates, bottom stays
  erupt: [1.5, 2.1], //      ingredients: viscous fluid erupts between the halves
  suck: [2.55, 2.84], //     reviews: fluid spirals back into the bottom half
  slam: [2.84, 2.9], //      top half slams down and seals
  impact: [2.89, 2.97], //   shockwave + camera shake
  spin: [2.9, 3.0], //       triumphant spin, lands beside the checkout box
};

// The bottle storyline. Like the can's, it only moves forward: the reseal is its own
// sequence (funnel back, cap drops and twists shut), not the opening played backwards.
export const BOTTLE_BEATS = {
  intro: [0.0, 0.15], //      hero: intact bottle, slow turn
  twist: [0.42, 0.72], //     cap unscrews (two turns)
  pop: [0.68, 0.86], //       cap lifts clear of the neck
  popImpact: [0.68, 0.8], //  camera jolt as the seal breaks
  ribbon: [0.72, 1.55], //    cream ribbons rise out of the neck and wind around the bottle
  widen: [1.55, 2.15], //     the vortex opens up behind the copy
  retract: [2.25, 2.6], //    ribbons flow back into the neck before the bottle crosses the copy
  drop: [2.84, 2.9], //       cap drops onto the neck
  shut: [2.88, 2.96], //      and twists shut
  sealImpact: [2.89, 2.97],
  settle: [2.94, 3.0], //     small hop and settle beside the pre-order box
};

const BOTTLE_CAMERA = [
  { s: 0, polar: 1.5, azimuth: 0.0, radius: 9.2, focus: 0 }, //       frontal profile
  { s: 0.15, polar: 1.5, azimuth: 0.0, radius: 9.2, focus: 0 },
  { s: 0.5, polar: 1.2, azimuth: 0.18, radius: 9.4, focus: 0.7 }, //  angled down at the cap
  { s: 0.9, polar: 1.22, azimuth: 0.1, radius: 9.8, focus: 0.7 },
  { s: 1.4, polar: 1.42, azimuth: 0.0, radius: 11.5, focus: 0.4 }, // pull back for the geyser
  { s: 2.1, polar: 1.48, azimuth: -0.2, radius: 13.0, focus: 0.7 },
  { s: 2.6, polar: 1.4, azimuth: 0.2, radius: 12.0, focus: 0.5 },
  { s: 3.0, polar: 1.45, azimuth: 0.0, radius: 9.6, focus: 0 },
];

// Camera orbit around the can: polar angle from straight above (0 = top-down), azimuth
// around the can, distance, and focus (how high up the can to aim, 1 = the lid).
const CAMERA = [
  { s: 0, polar: 1.5, azimuth: 0.0, radius: 8.8, focus: 0 }, //       frontal profile
  { s: 0.1, polar: 1.48, azimuth: 0.0, radius: 8.8, focus: 0 },
  { s: 0.45, polar: 0.78, azimuth: 0.0, radius: 6.0, focus: 1 }, //   looking down at the lid (~45°)
  { s: 0.8, polar: 0.85, azimuth: 0.15, radius: 6.2, focus: 1 },
  { s: 1.2, polar: 1.42, azimuth: 0.2, radius: 11.2, focus: 0 }, //   sweep down to a profile
  { s: 2.0, polar: 1.5, azimuth: -0.25, radius: 11.8, focus: 0 },
  { s: 2.6, polar: 1.4, azimuth: 0.3, radius: 11.2, focus: 0 },
  { s: 3.0, polar: 1.4, azimuth: 0.0, radius: 8.8, focus: 0 },
];

// Where the can sits on screen, per device: nx/ny place it in normalized screen space
// (-1..1, via a lens shift) and scale sizes the model. Phones and tablets never shift the
// can sideways: it stays centered, docked toward the bottom and at half size or less, so it
// reads as a moving background behind the copy.
const LAYOUTS = {
  desktop: [
    { s: 0, nx: 0.42, ny: 0.0, scale: 1.0 },
    { s: 0.9, nx: 0.42, ny: 0.0, scale: 1.0 },
    { s: 1.3, nx: 0.5, ny: -0.05, scale: 1.0 },
    { s: 2.0, nx: -0.45, ny: -0.05, scale: 1.0 },
    { s: 2.6, nx: -0.45, ny: -0.05, scale: 1.0 },
    { s: 3.0, nx: 0.48, ny: -0.08, scale: 0.95 },
  ],
  // Low under the hero buttons, docked at the bottom through the story, then rising into
  // the open space above the footer to land.
  tablet: [
    { s: 0, nx: 0.0, ny: -0.8, scale: 0.55 },
    { s: 0.35, nx: 0.0, ny: -0.52, scale: 0.55 },
    { s: 2.9, nx: 0.0, ny: -0.52, scale: 0.55 },
    { s: 3.0, nx: 0.0, ny: 0.15, scale: 0.55 },
  ],
  mobile: [
    { s: 0, nx: 0.0, ny: -0.95, scale: 0.55 }, // peeks up from the bottom edge under the hero copy
    { s: 0.35, nx: 0.0, ny: -0.5, scale: 0.55 },
    { s: 2.9, nx: 0.0, ny: -0.5, scale: 0.55 },
    { s: 3.0, nx: 0.0, ny: 0.2, scale: 0.55 },
  ],
};

function interpolate(stops, s) {
  if (s <= stops[0].s) return stops[0];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (s <= b.s) {
      const t = ease.inOut((s - a.s) / (b.s - a.s));
      const out = {};
      for (const key of Object.keys(a)) out[key] = a[key] + (b[key] - a[key]) * t;
      return out;
    }
  }
  return stops[stops.length - 1];
}

export const cameraAt = (s, pack = 'can') => interpolate(pack === 'bottle' ? BOTTLE_CAMERA : CAMERA, s);
export const layoutAt = (tier, s) => interpolate(LAYOUTS[tier], s);
