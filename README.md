# OMNIA landing page

React 19 · Tailwind CSS v4 · Framer Motion · React Three Fiber + drei · Lucide icons.

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # production build in dist/
```

## Customize
- **Brand name, photos, ingredients, reviews:** `src/config.js`
- **Colors & font:** `@theme` block in `src/index.css` (`--color-accent` is the neon CTA color)
- **3D bottle:** `src/components/BottleScene.jsx` (profile points, materials, lighting)
- **Waitlist form:** replace `joinWaitlist()` in `src/components/FinalCTA.jsx` with your email provider

## Before launch
- Testimonials in `config.js` are placeholders; replace them with real, attributable reviews.
- Nutrition numbers and claims are sample copy; have them checked against your actual formula and label rules.

## Deploy

It's a static site: `npm run build` outputs plain files to `dist/`.

**Vercel:** import this repo at vercel.com/new. It auto-detects Vite (build `npm run build`, output `dist`).
**Netlify:** import the repo; build command `npm run build`, publish directory `dist`.
**GitHub Pages:** set `base: '/drinktest/'` in `vite.config.js`, then publish `dist/` (e.g. with the `gh-pages` package).
