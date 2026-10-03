import { Environment, Lightformer } from '@react-three/drei';

// Daylight product studio for the ALXR bottle: no direct lights, only large soft panels
// baked into the environment, like a bright photo studio with window light. Everything is
// broad and diffused, so the matte bottle is evenly lit with no harsh rims or hot spots.
export function BottleStudio() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Soft overhead skylight */}
      <Lightformer form="rect" intensity={2.4} color="#fffaf2" position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[14, 14, 1]} />
      {/* Big frontal window light, slightly to the left */}
      <Lightformer form="rect" intensity={2.2} color="#fff7ec" position={[-2.5, 1.5, 7]} rotation-y={Math.PI} scale={[10, 8, 1]} />
      {/* Broad side bounces (warm wall on one side, cooler daylight on the other) */}
      <Lightformer form="rect" intensity={1.4} color="#f6e6d0" position={[-7, 0.5, 0]} rotation-y={Math.PI / 2} scale={[12, 9, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#eef2f0" position={[7, 0.5, 0]} rotation-y={-Math.PI / 2} scale={[12, 9, 1]} />
      {/* Gentle back wall so edges never fall to black */}
      <Lightformer form="rect" intensity={0.9} color="#fbf4e9" position={[0, 1, -7]} scale={[14, 9, 1]} />
      {/* Warm floor bounce */}
      <Lightformer form="rect" intensity={0.6} color="#efdcc2" position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[14, 14, 1]} />
    </Environment>
  );
}
