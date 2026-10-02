import * as THREE from 'three';
import { story } from './story';

const { damp } = THREE.MathUtils;

// Flies the camera for one frame of the scroll story, shared by the can and bottle scenes.
//  - orbits `targetY` (world units) using the story's camera stop `cam`
//  - phones/tablets: pulls back by screen shape and docks the product inside the nearest open
//    gap in the page (data-stage); desktop: places it with the layout's lens shift
//  - `shake` (0..1) adds a short positional jitter for impacts
//  - `state` is a per-scene ref object ({ stage, ny }) that keeps the docking smooth
//  - `anchorBlend` (0..1, desktop only) moves the product onto the pre-order stage so it lands
//    beside the checkout card and scrolls away with it, never over the footer
export function placeCamera({ camera, size, tier, layout, cam, targetY, shake = 0, t, d, state, target, anchorBlend = 0 }) {
  const aspect = size.width / size.height;
  const compact = tier !== 'desktop' || size.width < 768;
  const pullBack = compact ? 1.05 + Math.max(0, 1 - aspect) * 0.45 : 1;
  const radius = cam.radius * pullBack;

  target.set(0, targetY, 0);
  const jitter = shake * 0.09;
  const sinP = Math.sin(cam.polar);
  camera.position.set(
    target.x + radius * sinP * Math.sin(cam.azimuth) + Math.sin(t * 71) * jitter,
    target.y + radius * Math.cos(cam.polar) + Math.cos(t * 63) * jitter,
    target.z + radius * sinP * Math.cos(cam.azimuth),
  );
  camera.lookAt(target);

  let nx;
  let ny;
  if (compact) {
    // Sit centered inside the nearest open gap and scroll with it. Moving to a new gap glides;
    // if both are off-screen it jumps there directly instead of sweeping across the copy.
    const st = story.stage;
    if (st.index !== state.stage) {
      if (Math.abs(st.ny - state.ny) > 1.2 && Math.abs(state.ny) > 0.9) state.ny = st.ny;
      state.stage = st.index;
    }
    state.ny = damp(state.ny, st.ny, 14, d);
    nx = 0;
    // Leave the screen faster than the gap so the product never pokes out around it.
    const a = Math.abs(state.ny);
    ny = a <= 0.6 ? state.ny : Math.sign(state.ny) * (0.6 + (a - 0.6) * 2);
  } else {
    const lean = 0.03 * (1 - anchorBlend);
    state.anchorNy = state.anchorNy === undefined ? story.anchor.ny : damp(state.anchorNy, story.anchor.ny, 16, d);
    nx = layout.nx + story.pointer.x * lean;
    ny = THREE.MathUtils.lerp(layout.ny, state.anchorNy, anchorBlend) + story.pointer.y * lean;
  }
  camera.setViewOffset(size.width, size.height, (-nx * size.width) / 2, (ny * size.height) / 2, size.width, size.height);
  camera.updateProjectionMatrix();
}
