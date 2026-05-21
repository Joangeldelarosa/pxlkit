/* ═══════════════════════════════════════════════════════════════
 *  <CameraBridge> — exposes the R3F camera to non-Canvas debug code
 *
 *  Mounted as a tiny child of <Canvas>. Fills `apiRef` with two
 *  closures the DebugController calls:
 *    - getCamera() → CameraSnapshot
 *    - teleport(wx, worldY, wz, ry?)
 *
 *  Returns null — purely a side-effecting bridge.
 * ═══════════════════════════════════════════════════════════════ */

'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { CameraSnapshot } from './types';

export interface CameraBridgeApi {
  getCamera: () => CameraSnapshot;
  teleport: (wx: number, worldY: number, wz: number, ry?: number) => void;
}

interface CameraBridgeProps {
  apiRef: React.MutableRefObject<CameraBridgeApi | null>;
}

export function CameraBridge({ apiRef }: CameraBridgeProps) {
  const { camera } = useThree();

  useEffect(() => {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    apiRef.current = {
      getCamera(): CameraSnapshot {
        euler.setFromQuaternion(camera.quaternion);
        return {
          position: [camera.position.x, camera.position.y, camera.position.z],
          rotation: [euler.x, euler.y, euler.z],
        };
      },
      teleport(wx, worldY, wz, ry) {
        camera.position.set(wx, worldY, wz);
        if (typeof ry === 'number') {
          const e = new THREE.Euler(0, ry, 0, 'YXZ');
          camera.quaternion.setFromEuler(e);
        }
      },
    };
    return () => { apiRef.current = null; };
  }, [camera, apiRef]);

  return null;
}
