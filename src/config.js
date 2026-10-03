// Central place for brand copy and imagery — swap these to rebrand the page.

export const BRAND = 'ALXR';
export const TAGLINE = ['Total Sustenance.', 'Pure Velocity.'];
export const DESCRIPTOR = 'All-In-One Liquid Nutrition';

// Unsplash photo IDs (images.unsplash.com/photo-<id>). source.unsplash.com was retired,
// so we reference specific photos and let Unsplash's CDN resize them.
export const PHOTOS = {
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
  { name: 'Microfiltered milk protein isolate', amount: '35g', note: 'Cold-filtered whey and micellar casein: fast and slow amino acids in one pour.' },
  { name: 'Gluten-free oats & isomaltulose', amount: '34g', note: 'Low-glycemic carbohydrates that release slowly. Zero refined sugar.' },
  { name: 'MCT & high-oleic sunflower oil', amount: '16g', note: 'Clean fats for steady energy and fat-soluble vitamin uptake.' },
  { name: 'Digestive enzyme blend', amount: '250mg', note: 'Protease, lactase and amylase so every gram is easy to digest.' },
  { name: 'Prebiotic fiber (acacia & inulin)', amount: '9g', note: 'Feeds the gut microbiome and keeps you full for hours.' },
  { name: '26 bioavailable micronutrients', amount: '100%', note: 'Methylated B12 and folate, magnesium bisglycinate, D3 + K2 and more.' },
];

// Placeholder testimonials for the template — replace with real, attributable reviews before launch.
export const REVIEWS = [
  { name: 'Maya R.', role: 'Product designer', text: 'Tastes like a proper vanilla milkshake, and I am not hungry until dinner. It replaced my desk lunch.' },
  { name: 'Daniel K.', role: 'Marathon runner', text: 'Thirty-five grams of protein that actually sits well. No bloating on long-run days.' },
  { name: 'Priya S.', role: 'ER nurse', text: 'Twelve-hour shifts with no time to sit. One bottle carries me four hours, easily.' },
  { name: 'Tom W.', role: 'Founder', text: 'Breakfast went from twenty minutes to twenty seconds, and my macros are finally consistent.' },
  { name: 'Aisha B.', role: 'PhD student', text: 'Creamy, not chalky. No sugar crash at 3pm. I keep a few in the lab fridge.' },
  { name: 'Leo M.', role: 'Software engineer', text: 'I stopped thinking about lunch. Focus in the afternoon is noticeably better.' },
  { name: 'Hannah J.', role: 'Parent of three', text: 'The only breakfast I can finish before school drop-off. Clean label, too.' },
  { name: 'Carlos V.', role: 'Powerlifter', text: 'Microfiltered protein plus real carbs. It lives in my gym bag now.' },
];

export const PREORDER = {
  discount: 0.2,
  currency: 'USD',
  packs: [
    { id: '12', label: '12-pack', detail: '12 × 500 mL', price: 59 },
    { id: '24', label: '24-pack', detail: '24 × 500 mL', price: 108, tag: 'Best value' },
  ],
};
