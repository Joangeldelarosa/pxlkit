/* ═══════════════════════════════════════════════════════════════
 *  Fly Camera — movement + collision
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData, WorldConfig } from '../types';
import { CHUNK_SIZE, VOXEL_SIZE, MAX_HEIGHT, PLAYER_HEIGHT } from '../constants';

function chunkKey(cx: number, cz: number): string { return `${cx},${cz}`; }

function getSolidHeight(cache: Map<string, ChunkVoxelData>, worldX: number, worldZ: number): number {
  const vx = worldX / VOXEL_SIZE, vz = worldZ / VOXEL_SIZE;
  const cx2 = Math.floor(vx / CHUNK_SIZE), cz2 = Math.floor(vz / CHUNK_SIZE);
  const data = cache.get(chunkKey(cx2, cz2));
  if (!data) return 0;
  const lx = Math.floor(vx - cx2 * CHUNK_SIZE), lz = Math.floor(vz - cz2 * CHUNK_SIZE);
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return 0;
  return data.solidHeightMap[lx * CHUNK_SIZE + lz];
}

export function FlyCamera({ keysRef, speedRef, chunkCacheRef, worldConfig, initialPos, initialRot }: {
  keysRef: React.RefObject<Set<string>>;
  speedRef: React.RefObject<number>;
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  worldConfig: WorldConfig;
  initialPos?: [number, number, number];
  initialRot?: [number, number, number];
}) {
  const { camera } = useThree();
  const _d = useMemo(() => new THREE.Vector3(), []);
  const _r = useMemo(() => new THREE.Vector3(), []);
  const _prev = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (initialPos) {
      camera.position.set(initialPos[0], initialPos[1], initialPos[2]);
      if (initialRot) {
        const euler = new THREE.Euler(initialRot[0], initialRot[1], initialRot[2], 'YXZ');
        camera.quaternion.setFromEuler(euler);
      }
    } else if (worldConfig.worldMode === 'finite') {
      const centre = worldConfig.worldSize * VOXEL_SIZE * 0.5;
      camera.position.set(centre, 12, centre + 10);
      camera.lookAt(centre, 6, centre);
    } else {
      camera.position.set(0, 12, 20);
      camera.lookAt(0, 6, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, worldConfig.worldMode, worldConfig.worldSize]);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    if (!keys || keys.size === 0) return;

    _prev.copy(camera.position);
    const spd = (speedRef.current ?? 12) * delta;
    camera.getWorldDirection(_d);
    _r.crossVectors(_d, camera.up).normalize();

    if (keys.has('w') || keys.has('arrowup'))    camera.position.addScaledVector(_d, spd);
    if (keys.has('s') || keys.has('arrowdown'))  camera.position.addScaledVector(_d, -spd);
    if (keys.has('a') || keys.has('arrowleft'))  camera.position.addScaledVector(_r, -spd);
    if (keys.has('d') || keys.has('arrowright')) camera.position.addScaledVector(_r, spd);
    if (keys.has(' '))     camera.position.addScaledVector(camera.up, spd);
    if (keys.has('shift')) camera.position.addScaledVector(camera.up, -spd);

    /* Boundary clamping for finite worlds */
    if (worldConfig.worldMode === 'finite') {
      const maxBound = worldConfig.worldSize * VOXEL_SIZE;
      const margin = Math.max(maxBound * 0.6, 20);
      const px = Math.max(-margin, Math.min(maxBound + margin, camera.position.x));
      const pz = Math.max(-margin, Math.min(maxBound + margin, camera.position.z));
      const py = Math.max(0.5, Math.min(MAX_HEIGHT * VOXEL_SIZE * 4, camera.position.y));
      camera.position.set(px, py, pz);
    }

    /* Collision resolution */
    const cache = chunkCacheRef.current;
    if (!cache || cache.size === 0) return;

    const th = getSolidHeight(cache, camera.position.x, camera.position.z);
    const minY = (th + PLAYER_HEIGHT) * VOXEL_SIZE;
    if (camera.position.y < minY) {
      const hOldX = getSolidHeight(cache, _prev.x, camera.position.z);
      const hOldZ = getSolidHeight(cache, camera.position.x, _prev.z);
      if ((hOldX + PLAYER_HEIGHT) * VOXEL_SIZE <= camera.position.y) {
        camera.position.set(_prev.x, camera.position.y, camera.position.z);
      } else if ((hOldZ + PLAYER_HEIGHT) * VOXEL_SIZE <= camera.position.y) {
        camera.position.set(camera.position.x, camera.position.y, _prev.z);
      } else {
        camera.position.set(camera.position.x, minY, camera.position.z);
      }
    }
  });
  return null;
}
