import { Environment, Lightformer } from '@react-three/drei';

// Studio lighting built from light panels, so no HDR file needs to download.
export default function Studio() {
  return (
    <Environment resolution={256}>
      <Lightformer intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} />
      {/* Tall front strips create the vertical specular highlights that read as polished metal */}
      <Lightformer intensity={4} position={[-2.2, 0, 4]} scale={[0.6, 8, 1]} />
      <Lightformer intensity={1.5} position={[2.6, 0, 4]} scale={[0.3, 8, 1]} />
      <Lightformer intensity={2.2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} />
      <Lightformer intensity={2.2} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 1.2, 1]} />
      <Lightformer intensity={1.1} color="#e8c37e" position={[3, -2, 3]} rotation-y={-Math.PI / 3} scale={[4, 4, 1]} />
      <Lightformer intensity={0.8} color="#9fb4c8" position={[-3, -1, 3]} rotation-y={Math.PI / 3} scale={[4, 4, 1]} />
    </Environment>
  );
}

// Product studio for the ALXR bottle: no direct lights, only light panels baked into the
// environment. A soft overhead box and a dim front fill keep the matte graphite readable;
// two tall strips behind the bottle give it a clean rim; warm gold and cool slate kickers
// add depth to the metal collar and cap.
export function BottleStudio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} />
      <Lightformer form="rect" intensity={0.55} position={[0, 0.5, 6]} rotation-y={Math.PI} scale={[9, 6, 1]} />
      <Lightformer form="rect" intensity={6} position={[-2.6, 0.4, -3]} scale={[0.5, 7, 1]} />
      <Lightformer form="rect" intensity={5} position={[2.6, 0.4, -3]} scale={[0.4, 7, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#e8c37e" position={[-4, -1.5, 2]} rotation-y={Math.PI / 2.6} scale={[3, 3, 1]} />
      <Lightformer form="rect" intensity={0.7} color="#9fb4c8" position={[4, -1, 2]} rotation-y={-Math.PI / 2.6} scale={[3, 3, 1]} />
    </Environment>
  );
}
