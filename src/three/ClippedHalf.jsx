import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Clips every mesh inside it to one side of a plane (in the local space of `groupRef`):
// the plane has the given normal and sits `offset` along it from the origin; geometry on the
// side the normal points to is kept. The plane follows that group each frame, so the cut
// stays clean while the half moves and turns.
export default function ClippedHalf({ normal, offset = 0, groupRef, children }) {
  const content = useRef();
  const plane = useMemo(() => new THREE.Plane(), []);
  const localPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(...normal), -offset), [normal, offset]);
  const planes = useMemo(() => [plane], [plane]);

  useFrame(() => {
    groupRef.current.updateWorldMatrix(true, false);
    plane.copy(localPlane).applyMatrix4(groupRef.current.matrixWorld);
    // Materials can appear later (textures suspend), so attach the plane every frame; it's a few meshes.
    content.current.traverse((o) => {
      if (o.isMesh && o.material.clippingPlanes !== planes) {
        o.material.clippingPlanes = planes;
        o.material.needsUpdate = true;
      }
    });
  });

  return <group ref={content}>{children}</group>;
}
