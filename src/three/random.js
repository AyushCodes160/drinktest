// Uniform random values in [0, 1), used to seed per-particle motion in the shaders.
export function randomArray(length) {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = Math.random();
  return out;
}
