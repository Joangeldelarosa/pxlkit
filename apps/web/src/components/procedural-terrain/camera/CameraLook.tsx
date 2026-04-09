/* ═══════════════════════════════════════════════════════════════
 *  Camera Look — desktop mouse + mobile touch
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function CameraLook({ isLocked, isMobile }: { isLocked: boolean; isMobile: boolean }) {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const touchIdRef = useRef<number | null>(null);
  const lastTouchRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isLocked) return;
    euler.current.setFromQuaternion(camera.quaternion);
    const canvas = gl.domElement;

    const rotate = (dx: number, dy: number, sens: number) => {
      euler.current.y -= dx * sens;
      euler.current.x -= dy * sens;
      euler.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    const onMouse = (e: MouseEvent) => rotate(e.movementX, e.movementY, 0.002);

    const onTouchStart = (e: TouchEvent) => {
      if (touchIdRef.current !== null) return;
      const t = e.changedTouches[0];
      touchIdRef.current = t.identifier;
      lastTouchRef.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchIdRef.current) {
          rotate(t.clientX - lastTouchRef.current.x, t.clientY - lastTouchRef.current.y, 0.004);
          lastTouchRef.current = { x: t.clientX, y: t.clientY };
          break;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) { touchIdRef.current = null; break; }
      }
    };

    if (isMobile) {
      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      canvas.addEventListener('touchmove', onTouchMove, { passive: true });
      canvas.addEventListener('touchend', onTouchEnd, { passive: true });
      canvas.addEventListener('touchcancel', onTouchEnd, { passive: true });
    } else {
      canvas.addEventListener('mousemove', onMouse);
    }
    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isLocked, isMobile, camera, gl]);

  return null;
}
