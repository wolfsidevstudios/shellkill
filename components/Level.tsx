import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { MAP_SIZE, COLORS, WALL_HEIGHT } from '../constants';

const Box: React.FC<{ position: [number, number, number], size: [number, number, number], color: string }> = ({ position, size, color }) => (
  <RigidBody type="fixed" position={position}>
    <mesh receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  </RigidBody>
);

export const Level: React.FC = () => {
  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" friction={2}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
          <meshStandardMaterial color={COLORS.floor} />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <Box position={[0, WALL_HEIGHT / 2 - 1, -MAP_SIZE / 2]} size={[MAP_SIZE, WALL_HEIGHT, 1]} color="#aaa" />
      <Box position={[0, WALL_HEIGHT / 2 - 1, MAP_SIZE / 2]} size={[MAP_SIZE, WALL_HEIGHT, 1]} color="#aaa" />
      <Box position={[-MAP_SIZE / 2, WALL_HEIGHT / 2 - 1, 0]} size={[1, WALL_HEIGHT, MAP_SIZE]} color="#aaa" />
      <Box position={[MAP_SIZE / 2, WALL_HEIGHT / 2 - 1, 0]} size={[1, WALL_HEIGHT, MAP_SIZE]} color="#aaa" />

      {/* Obstacles - Random-ish Layout */}
      <Box position={[5, 1, 5]} size={[4, 4, 4]} color={COLORS.obstacle} />
      <Box position={[-10, 1, -5]} size={[2, 6, 2]} color={COLORS.obstacle} />
      <Box position={[10, 0.5, -10]} size={[6, 3, 2]} color={COLORS.obstacle} />
      <Box position={[-8, 0, 10]} size={[8, 2, 8]} color="#ffadad" />
      
      {/* Ramps / Platforms */}
      <RigidBody type="fixed" position={[0, 1, 0]}>
         <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[4, 1, 4]} />
            <meshStandardMaterial color="#88ccff" />
         </mesh>
      </RigidBody>
    </group>
  );
};