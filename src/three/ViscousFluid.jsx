import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import { createBlobMaterial, createColumnMaterial } from './FluidMaterial';

// The glowing sludge that erupts between the two can halves:
//  - a continuous column (noise-displaced sphere) twisting from the bottom half into the top
//  - metaball blobs (marching cubes) that orbit, stretch and merge around it
//
// `fluid` is a ref the scene writes each frame:
//   erupt 0..1  how far the eruption has grown
//   suck  0..1  how far it has spiralled back into the bottom half
//   bottomY / topY  local Y of the bottom half's cut and the (levitating) top half's cut

const BLOB_BOX = 1.7; // half-size of the metaball volume, in can units

// `radius` sets the column's thickness; `splash` scales how far the blobs fly out from it.
export default function ViscousFluid({ fluid, segments = 128, blobs = 7, resolution = 36, glow = 1, radius = 0.46, splash = 1 }) {
  const column = useRef();
  const blobsRef = useRef();
  const columnMaterial = useMemo(() => createColumnMaterial(), []);
  const blobMaterial = useMemo(() => createBlobMaterial(), []);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, segments, segments), [segments]);

  const cubes = useMemo(() => {
    const mc = new MarchingCubes(resolution, blobMaterial, false, false, 30000);
    mc.scale.setScalar(BLOB_BOX);
    mc.frustumCulled = false;
    return mc;
  }, [resolution, blobMaterial]);

  // Per-blob orbit parameters, fixed per mount.
  const orbits = useMemo(
    () =>
      Array.from({ length: blobs }, (_, i) => ({
        phase: (i / blobs) * Math.PI * 2,
        speed: 0.5 + (i % 3) * 0.22,
        radius: 0.22 + (i % 4) * 0.08, // hug the column so the blobs fuse with it
        bob: 0.7 + (i % 5) * 0.18,
        strength: 0.42 + (i % 3) * 0.1,
      })),
    [blobs],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      columnMaterial.dispose();
      blobMaterial.dispose();
      cubes.geometry.dispose();
    },
    [geometry, columnMaterial, blobMaterial, cubes],
  );

  useFrame((state) => {
    const { erupt, suck, bottomY, topY } = fluid.current;
    const t = state.clock.elapsedTime;
    const mc = blobsRef.current;
    const visible = erupt > 0.002 && suck < 0.995;
    column.current.visible = visible;
    mc.visible = visible;
    if (!visible) return;

    // --- Column -----------------------------------------------------------
    // Grows up out of the bottom half, reaching into the top half; while being sucked back
    // it shortens toward the bottom, thins and winds up tighter and faster.
    const reach = topY - bottomY + 0.5;
    const height = reach * erupt * (1 - suck);
    const u = column.current.material.uniforms;
    u.uTime.value = t;
    u.uHeight.value = Math.max(height, 0.001);
    u.uCenterY.value = bottomY - 0.25 + height / 2;
    u.uRadius.value = radius * (0.35 + 0.65 * erupt) * (1 - 0.85 * suck);
    u.uTwist.value = 2.2 + suck * 16;
    u.uAmp.value = 0.1 + 0.06 * erupt + 0.12 * suck;
    u.uGlow.value = (1.5 + 0.6 * suck) * glow;

    // --- Metaballs ----------------------------------------------------------
    // Orbit the column in zero-g, then spiral inward and sink into the bottom half.
    const midY = (bottomY + topY) / 2;
    mc.position.set(0, midY, 0);
    mc.material.uniforms.uTime.value = t;
    mc.material.uniforms.uGlow.value = 1.5 * glow;
    mc.reset();
    const spin = 1 + suck * 9;
    const spread = erupt * (1 - suck);
    const sink = (bottomY - midY) / BLOB_BOX; // bottom cut, in the volume's -1..1 space
    for (const o of orbits) {
      const a = o.phase + t * o.speed * spin;
      const r = Math.min(0.85, (o.radius + 0.12 * Math.sin(t * 1.3 + o.phase)) * spread * splash);
      const yFloat = Math.sin(t * 0.8 * o.bob + o.phase) * 0.55 * spread;
      const y = THREE.MathUtils.lerp(yFloat, sink, suck);
      // addBall takes coordinates in 0..1 across the volume.
      mc.addBall(
        0.5 + (Math.cos(a) * r) / 2,
        0.5 + y / 2,
        0.5 + (Math.sin(a) * r) / 2,
        o.strength * (0.4 + 0.6 * erupt) * (1 - 0.7 * suck),
        9, // lower subtract = wider falloff, so neighbouring blobs melt together
      );
    }
    mc.update();
  });

  return (
    <group>
      <mesh ref={column} geometry={geometry} material={columnMaterial} frustumCulled={false} />
      <primitive ref={blobsRef} object={cubes} />
    </group>
  );
}
