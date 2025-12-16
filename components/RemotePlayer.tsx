import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3Array } from '../types';
import * as THREE from 'three';
import { EGG_SCALE, COLORS } from '../constants';
import { Text } from '@react-three/drei';

interface RemotePlayerProps {
  id: string;
  position: Vector3Array;
  rotation: [number, number, number];
}

export const RemotePlayer: React.FC<RemotePlayerProps> = ({ id, position, rotation }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Lerp position for smoothness
      groupRef.current.position.lerp(new THREE.Vector3(...position), delta * 10);
      
      // Interpolate rotation (only Y usually matters for visual body)
      // Ideally use Quaternions, but Euler is what we're syncing for simplicity
      // groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
      // Actually, simple Y rotation set is stable enough for this demo
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation[1], delta * 10);
    }
  });

  return (
    <group ref={groupRef} position={new THREE.Vector3(...position)}>
      <mesh castShadow receiveShadow scale={EGG_SCALE}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={COLORS.enemy} roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Eye/Shell details */}
      <mesh position={[0.2, 0.2, 0.4]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="black" roughness={0} />
      </mesh>
      <mesh position={[-0.2, 0.2, 0.4]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="black" roughness={0} />
      </mesh>

      {/* Gun (Visual only) */}
      <mesh position={[0.4, -0.1, 0.4]}>
          <boxGeometry args={[0.1, 0.1, 0.6]} />
          <meshStandardMaterial color="#333" />
      </mesh>

      {/* Name Tag */}
      <Text 
          position={[0, 1.2, 0]} 
          fontSize={0.3} 
          color="white"
          anchorX="center" 
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
      >
          Player {id.substring(0, 4)}
      </Text>
    </group>
  );
};