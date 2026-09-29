// Shared, mutable state between the DOM (which measures scroll) and the 3D scene (which
// reads it every frame). Kept outside React so scrolling never triggers re-renders.
//   s: story position — 0 hero, 1 nutrition, 2 ingredients, 3 pre-order (fractional between)
export const story = {
  s: 0,
  pointer: { x: 0, y: 0 },
};

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
  crack: [0.12, 0.7], //   hero: pull-tab cracks open
  fizz: [0.35, 0.95], //   hero: a little spray from the opening
  lift: [0.95, 1.5], //    nutrition: top half levitates, bottom stays grounded
  erupt: [1.45, 2.1], //   ingredients: viscous fluid erupts between the halves
  suck: [2.55, 2.84], //   reviews: fluid spirals back into the bottom half
  slam: [2.84, 2.9], //    top half slams down and seals
  impact: [2.89, 2.97], // shockwave + camera shake
  spin: [2.9, 3.0], //     triumphant spin, lands beside the checkout box
};

// Camera orbit around the can: polar angle from straight above (0 = top-down),
// azimuth around the can, distance.
const CAMERA = [
  { s: 0, polar: 0.38, azimuth: 0.0, radius: 7.4 },
  { s: 0.6, polar: 0.62, azimuth: 0.55, radius: 7.8 }, // slight orbit as the tab cracks
  { s: 1.15, polar: 1.42, azimuth: 0.2, radius: 11.2 }, // sweep down to a side profile
  { s: 2.0, polar: 1.5, azimuth: -0.25, radius: 11.8 },
  { s: 2.6, polar: 1.4, azimuth: 0.3, radius: 11.2 },
  { s: 3.0, polar: 1.33, azimuth: 0.0, radius: 8.8 },
];

// Where the can sits on screen, per device: nx/ny place it in normalized screen space
// (-1..1, via a lens shift) and scale sizes the model. Phones and tablets keep it at least
// 50% smaller, low and centered, behind the copy.
const LAYOUTS = {
  desktop: [
    { s: 0, nx: 0.42, ny: 0.0, scale: 1.15 },
    { s: 0.9, nx: 0.42, ny: 0.0, scale: 1.05 },
    { s: 1.3, nx: 0.5, ny: -0.05, scale: 1.0 },
    { s: 2.0, nx: -0.45, ny: -0.05, scale: 1.0 },
    { s: 2.6, nx: -0.45, ny: -0.05, scale: 1.0 },
    { s: 3.0, nx: 0.48, ny: -0.08, scale: 0.95 },
  ],
  tablet: [
    { s: 0, nx: 0.0, ny: -0.5, scale: 0.55 },
    { s: 3.0, nx: 0.0, ny: -0.5, scale: 0.55 },
  ],
  mobile: [
    { s: 0, nx: 0.0, ny: -0.55, scale: 0.45 },
    { s: 3.0, nx: 0.0, ny: -0.55, scale: 0.45 },
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

export const cameraAt = (s) => interpolate(CAMERA, s);
export const layoutAt = (tier, s) => interpolate(LAYOUTS[tier], s);
