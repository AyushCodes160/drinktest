# ALXR landing page

Scroll-driven 3D landing page for ALXR, all-in-one liquid nutrition.
React 19 · Tailwind CSS v4 · Framer Motion · React Three Fiber + drei · postprocessing · Lenis.

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # production build in dist/
```

## Customize
- **Brand, copy, ingredients, reviews, pre-order packs:** `src/config.js`
- **Palette & type:** `@theme` block in `src/index.css` (obsidian/graphite canvas, Titanium Frost, golden-cream `--color-accent`, cyan `--color-accent-2` for nutrient stats; Archivo for display)
- **Bottle:** `src/three/BottleStory.jsx` (silhouette, soft-touch material, collar, ridged cap, wordmark texture drawn at runtime); lighting in `src/three/Studio.jsx`
- **Cream vortex:** `src/three/CreamVortex.jsx` (ribbon paths and the cream shader)
- **Scroll story:** sections marked `data-story="0..3"` are the waypoints. `BOTTLE_BEATS` (twist, pop, ribbon, widen, retract, drop, shut, settle), the camera path, the bottle's turn and per-device `LAYOUTS` live in `src/three/story.js`. On phones/tablets the bottle docks into the page's open gaps (`data-stage`); on desktop it lands beside the pre-order card.
- **Pre-order form:** replace `submitPreorder()` in `src/components/FinalCTA.jsx` with your checkout or email provider

## Before launch
- Testimonials in `config.js` are placeholders; replace them with real, attributable reviews.
- Nutrition numbers and claims are sample copy; have them checked against your actual formula and label rules.

## Deploy

It's a static site: `npm run build` outputs plain files to `dist/`.

**Vercel:** import this repo at vercel.com/new. It auto-detects Vite (build `npm run build`, output `dist`).
**Netlify:** import the repo; build command `npm run build`, publish directory `dist`.
