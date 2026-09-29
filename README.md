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
- **3D models:** `src/three/products.jsx` (bottle, textured can, generated GLB); lighting in `src/three/Studio.jsx`
- **Scroll story:** sections marked `data-story="0..3"` are the waypoints. `BEATS` (crack, lift, erupt, suck, slam, spin), the `CAMERA` path and per-device `LAYOUTS` live in `src/three/story.js`; `src/three/StoryScene.jsx` runs it. The liquid is `src/three/ViscousFluid.jsx` (noise-shader column + metaballs) with shaders in `src/three/FluidMaterial.js`
- **Lid artwork:** `public/textures/lid-top.jpg` (top-down photo, tab painted out) and `public/textures/lid-tab.png` (the tab cut-out)
- **Waitlist form:** replace `joinWaitlist()` in `src/components/FinalCTA.jsx` with your email provider

## Before launch
- Testimonials in `config.js` are placeholders; replace them with real, attributable reviews.
- Nutrition numbers and claims are sample copy; have them checked against your actual formula and label rules.

## Deploy

It's a static site: `npm run build` outputs plain files to `dist/`.

**Vercel:** import this repo at vercel.com/new. It auto-detects Vite (build `npm run build`, output `dist`).
**Netlify:** import the repo; build command `npm run build`, publish directory `dist`.
**GitHub Pages:** set `base: '/drinktest/'` in `vite.config.js`, then publish `dist/` (e.g. with the `gh-pages` package).
