// Shared, mutable state between the DOM (which measures scroll) and the 3D scene (which
// reads it every frame). Kept outside React so scrolling never triggers re-renders.
//   s: story position — 0 hero, 1 nutrition, 2 ingredients, 3 pre-order (fractional between)
export const story = {
  s: 0,
  pointer: { x: 0, y: 0 },
};

// Plain math (no three.js import) so the page's scroll tracker stays out of the 3D bundle.
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const smoothstep = (x, lo, hi) => {
  const t = clamp((x - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
};

// Progress of s through [a, b], clamped to 0..1.
export const seg = (s, a, b) => clamp((s - a) / (b - a), 0, 1);

export const ease = {
  inOut: (x) => smoothstep(x, 0, 1),
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  outBack: (x) => {
    const c = 1.4;
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  },
};

// Beats of the storyline, in story units.
export const BEATS = {
  crack: [0.55, 0.95], // pull-tab lifts
  fizz: [0.7, 1.3], // spray from the opening
  split: [0.95, 1.5], // can separates into halves
  burst: [1.45, 2.2], // energy floats outward
  collapse: [2.5, 2.9], // energy is drawn back in
  reform: [2.55, 2.95], // halves rejoin
  close: [2.85, 3.0], // tab settles back down
};

// Where the can sits on screen at each story position, per device tier.
// x is a fraction of the half-viewport width (so it adapts to any aspect ratio); y is in
// world units; scale multiplies the model.
const LAYOUTS = {
  desktop: [
    { s: 0, x: 0.42, y: -0.05, scale: 1 },
    { s: 0.9, x: 0.42, y: 0, scale: 0.95 },
    { s: 1.3, x: 0.6, y: 0, scale: 0.82 },
    { s: 2.0, x: -0.48, y: -0.1, scale: 0.9 },
    { s: 2.5, x: -0.48, y: -0.1, scale: 0.9 },
    { s: 3.0, x: 0.5, y: -0.15, scale: 0.85 },
  ],
  tablet: [
    { s: 0, x: 0.3, y: -1.15, scale: 0.6 },
    { s: 1.0, x: 0, y: -1.4, scale: 0.55 },
    { s: 3.0, x: 0, y: -1.4, scale: 0.55 },
  ],
  mobile: [
    { s: 0, x: 0, y: -1.35, scale: 0.5 },
    { s: 3.0, x: 0, y: -1.35, scale: 0.5 },
  ],
};

export function layoutAt(tier, s) {
  const stops = LAYOUTS[tier];
  if (s <= stops[0].s) return stops[0];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (s <= b.s) {
      const t = ease.inOut((s - a.s) / (b.s - a.s));
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        scale: a.scale + (b.scale - a.scale) * t,
      };
    }
  }
  return stops[stops.length - 1];
}
