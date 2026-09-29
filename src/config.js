// Central place for brand copy and imagery — swap these to rebrand the page.

export const BRAND = 'OMNIA';

// Which 3D product the hero shows:
//   'bottle'       – procedural OMNIA bottle (brand-safe default)
//   'textured-can' – product photo wrapped on a 3D can (public/textures/can-front.jpg)
//   'generated'    – mesh generated from the photo by TripoSR (public/models/monster-can.glb)
// The can photo and generated model use Monster Energy's trademarked design:
// local prototyping only — switch back to 'bottle' before deploying or sharing.
export const HERO_MODEL = 'textured-can';

// Unsplash photo IDs (images.unsplash.com/photo-<id>). source.unsplash.com was retired,
// so we reference specific photos and let Unsplash's CDN resize them.
export const PHOTOS = {
  heroLiquid: '1541701494587-cb58502866ab', // ink swirling in water
  ingredients: '1502741338009-cac2772e18bc', // blueberries, dark and moody
  strength: '1517836357463-d25dfeac3438', // barbell deadlift, dark gym
  sprint: '1461896836934-ffe607ba8211', // sprinter in starting blocks
};

export function unsplash(id, width = 1600) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export function unsplashSrcSet(id, widths = [640, 1024, 1600, 2400]) {
  return widths.map((w) => `${unsplash(id, w)} ${w}w`).join(', ');
}

export const NAV_LINKS = [
  { label: 'Nutrition', href: '#nutrition' },
  { label: 'Ingredients', href: '#ingredients' },
  { label: 'Reviews', href: '#reviews' },
];

export const INGREDIENTS = [
  { name: 'Pea & brown rice protein', amount: '30g', note: 'Complete amino acid profile, easy on digestion.' },
  { name: 'Gluten-free oats', amount: '32g', note: 'Slow-release carbs for steady, crash-free energy.' },
  { name: 'Flaxseed & MCT oil', amount: '14g', note: 'Omega-3s and fast-fuel fats for focus.' },
  { name: 'Wild blueberry powder', amount: '4g', note: 'Polyphenols and antioxidants, no added sugar.' },
  { name: '27 vitamins & minerals', amount: '100%', note: 'Your full daily value, in highly absorbable forms.' },
  { name: 'Prebiotic fiber blend', amount: '8g', note: 'Keeps you full for hours and supports gut health.' },
];

// Placeholder testimonials for the template — replace with real, attributable reviews before launch.
export const REVIEWS = [
  { name: 'Maya R.', role: 'Product designer', text: 'Replaced my 2pm sad desk lunch. Saves me 40 minutes a day and I actually like the taste.' },
  { name: 'Daniel K.', role: 'Marathon runner', text: 'No afternoon crash, even on double-training days. The chocolate one is dangerously good.' },
  { name: 'Priya S.', role: 'ER nurse', text: 'Twelve-hour shifts, zero time to eat. This is the first thing that has actually kept me going.' },
  { name: 'Tom W.', role: 'Founder', text: 'Breakfast went from 20 minutes to 20 seconds. Macros are dialed in, I stopped thinking about it.' },
  { name: 'Aisha B.', role: 'PhD student', text: 'Tastes like a real milkshake, not chalk. Stays full until dinner. Genuinely surprised.' },
  { name: 'Leo M.', role: 'Software engineer', text: 'One bottle, done. My grocery bill dropped and my focus in the afternoon went way up.' },
  { name: 'Hannah J.', role: 'Parent of three', text: 'I finally eat something real in the morning chaos. Ready before the kids find their shoes.' },
  { name: 'Carlos V.', role: 'Powerlifter', text: '30g protein, clean label, great texture. It lives in my gym bag permanently now.' },
];

// Pre-order packs shown in the checkout box. Placeholder prices — set your real ones.
export const PREORDER = {
  discount: 0.2,
  currency: 'USD',
  packs: [
    { id: '12', label: '12-pack', detail: '12 × 500ml', price: 39 },
    { id: '24', label: '24-pack', detail: '24 × 500ml', price: 72, tag: 'Best value' },
  ],
};
