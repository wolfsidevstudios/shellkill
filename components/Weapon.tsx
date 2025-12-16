import React, { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface WeaponProps {
  isShooting: boolean;
}

export const Weapon: React.FC<WeaponProps> = ({ isShooting }) => {
  const groupRef = useRef<Group>(null);
  const recoilRef = useRef(0);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Recoil logic
      if (isShooting) {
        recoilRef.current = 0.2;
      }
      
      // Smoothly return to position
      recoilRef.current = Math.max(0, recoilRef.current - delta * 5);
      groupRef.current.position.z = 0.5 + recoilRef.current;
      groupRef.current.position.y = -0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.02; // Idle sway
    }
  });

  return (
    <group ref={groupRef} position={[0.4, -0.4, 0.5]}>
      {/* Main Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.15, 0.6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Barrel */}
      <mesh position={[0, 0.05, -0.4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Magazine */}
      <mesh position={[0, -0.15, 0.1]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.08, 0.25, 0.1]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  );
};