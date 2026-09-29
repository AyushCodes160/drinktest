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
      <Lightformer intensity={1.2} color="#c8ff2e" position={[3, -2, 3]} rotation-y={-Math.PI / 3} scale={[4, 4, 1]} />
      <Lightformer intensity={1} color="#7cf5ff" position={[-3, -1, 3]} rotation-y={Math.PI / 3} scale={[4, 4, 1]} />
    </Environment>
  );
}
