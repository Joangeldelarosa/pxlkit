/* ═══════════════════════════════════════════════════════════════
 *  Surface Detail Layer — voxel subdivision for nearby surfaces
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { CHUNK_SIZE, VOXEL_SIZE } from '../constants';

export function SurfaceDetailLayer({
  chunkCacheRef,
  detail,
  detailDistance,
  detailHeightVariation,
  detailMaxInstances,
  detailGap,
  detailColorVariation,
}: {
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  detail: number;
  detailDistance: number;
  detailHeightVariation: number;
  detailMaxInstances: number;
  detailGap: number;
  detailColorVariation: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();
  const prevKey = useRef('');
  const DETAIL_RADIUS = detailDistance;

  const subSize = detail > 0 ? VOXEL_SIZE / detail : 0;
  const subGeo = useMemo(() => {
    if (detail <= 0) return null;
    return new THREE.BoxGeometry(subSize * 0.92, subSize * 0.92, subSize * 0.92);
  }, [subSize, detail]);

  const subMat = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.75, metalness: 0.0,
  }), []);

  /* Gap threshold: 0-100 integer, higher = more gaps */
  const gapThreshold = Math.round(detailGap * 100);

  useFrame(() => {
    if (detail <= 0 || !meshRef.current || !chunkCacheRef.current) return;
    const mesh = meshRef.current;
    const cache = chunkCacheRef.current;
    if (cache.size === 0) return;

    const cx = Math.round(camera.position.x * 2);
    const cz = Math.round(camera.position.z * 2);
    const newKey = `${cx},${cz}`;
    if (newKey === prevKey.current) return;
    prevKey.current = newKey;

    const maxInst = detailMaxInstances;
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    let count = 0;
    const camX = camera.position.x, camZ = camera.position.z;
    const detailRadSq = DETAIL_RADIUS * DETAIL_RADIUS;

    for (const [, data] of cache) {
      if (count >= maxInst) break;
      const chkBaseX = data.chunkX * CHUNK_SIZE * VOXEL_SIZE;
      const chkBaseZ = data.chunkZ * CHUNK_SIZE * VOXEL_SIZE;

      const closestX = Math.max(chkBaseX, Math.min(chkBaseX + CHUNK_SIZE * VOXEL_SIZE, camX));
      const closestZ = Math.max(chkBaseZ, Math.min(chkBaseZ + CHUNK_SIZE * VOXEL_SIZE, camZ));
      const cdx = camX - closestX, cdz = camZ - closestZ;
      if (cdx * cdx + cdz * cdz > detailRadSq * 4) continue;

      for (let i = 0; i < data.count && count < maxInst; i++) {
        const i3 = i * 3;
        const px = data.positions[i3], py = data.positions[i3 + 1], pz = data.positions[i3 + 2];

        const dx = px - camX, dz = pz - camZ;
        if (dx * dx + dz * dz > detailRadSq) continue;

        const baseColor = new THREE.Color(data.colors[i3], data.colors[i3 + 1], data.colors[i3 + 2]);
        const hsl = { h: 0, s: 0, l: 0 };
        baseColor.getHSL(hsl);

        for (let sx = 0; sx < detail && count < maxInst; sx++) {
          for (let sz = 0; sz < detail && count < maxInst; sz++) {
            const hash = (((px * 374761 + py * 668265 + pz * 1274126 + sx * 7919 + sz * 6271) | 0) >>> 0) % 100;
            if (hash < gapThreshold) continue;

            const reliefHash = (((px * 9349 + py * 1993 + pz * 4159 + sx * 3571 + sz * 8237) | 0) >>> 0) % 1000;
            const relief = (reliefHash / 1000 - 0.5) * subSize * detailHeightVariation * 2.5;

            const subX = px - VOXEL_SIZE * 0.5 + (sx + 0.5) * subSize;
            const subY = py + VOXEL_SIZE * 0.5 + relief;
            const subZ = pz - VOXEL_SIZE * 0.5 + (sz + 0.5) * subSize;

            m.identity();
            m.elements[12] = subX; m.elements[13] = subY; m.elements[14] = subZ;
            mesh.setMatrixAt(count, m);

            const colHash = (((sx * 1117 + sz * 2237 + reliefHash) | 0) >>> 0) % 1000;
            const litShift = (colHash / 1000 - 0.5) * detailColorVariation;
            c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + litShift)));
            mesh.setColorAt(count, c);
            count++;
          }
        }
      }
    }

    mesh.count = count;
    if (count > 0) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  });

  if (detail <= 0 || !subGeo) return null;
  return (
    <instancedMesh ref={meshRef} args={[subGeo, subMat, detailMaxInstances]} frustumCulled={false} />
  );
}
