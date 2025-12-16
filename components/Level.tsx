import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import { MAP_SIZE, WALL_HEIGHT } from '../constants';
import * as THREE from 'three';

const Box: React.FC<{ position: [number, number, number], size: [number, number, number], color?: string, texture?: THREE.Texture }> = ({ position, size, color, texture }) => (
  <RigidBody type="fixed" position={position}>
    <mesh receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={color || 'white'} 
        map={texture} 
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  </RigidBody>
);

export const Level: React.FC = () => {
  // Load some prototype textures for that "arena shooter" feel
  // Changed texture_13 to texture_10 as 13 does not exist in the source repo
  const textures = useTexture({
    grid: 'https://raw.githubusercontent.com/pmndrs/drei-assets/master/prototype/texture_09.png',
    darkGrid: 'https://raw.githubusercontent.com/pmndrs/drei-assets/master/prototype/texture_10.png',
    wall: 'https://raw.githubusercontent.com/pmndrs/drei-assets/master/prototype/texture_12.png',
  });

  // Adjust texture repeat to make them look correct on large surfaces
  React.useLayoutEffect(() => {
    Object.values(textures).forEach((t) => {
      const tex = t as THREE.Texture;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(0.5, 0.5);
    });
    (textures.grid as THREE.Texture).repeat.set(MAP_SIZE / 4, MAP_SIZE / 4);
    (textures.wall as THREE.Texture).repeat.set(2, 1);
  }, [textures]);

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" friction={2}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
          <meshStandardMaterial map={textures.grid} color="#ddd" />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <Box position={[0, WALL_HEIGHT / 2 - 1, -MAP_SIZE / 2]} size={[MAP_SIZE, WALL_HEIGHT, 1]} texture={textures.darkGrid} />
      <Box position={[0, WALL_HEIGHT / 2 - 1, MAP_SIZE / 2]} size={[MAP_SIZE, WALL_HEIGHT, 1]} texture={textures.darkGrid} />
      <Box position={[-MAP_SIZE / 2, WALL_HEIGHT / 2 - 1, 0]} size={[1, WALL_HEIGHT, MAP_SIZE]} texture={textures.darkGrid} />
      <Box position={[MAP_SIZE / 2, WALL_HEIGHT / 2 - 1, 0]} size={[1, WALL_HEIGHT, MAP_SIZE]} texture={textures.darkGrid} />

      {/* Obstacles - Texture mapped */}
      <Box position={[5, 1, 5]} size={[4, 4, 4]} texture={textures.wall} color="#ffcc00" />
      <Box position={[-10, 1, -5]} size={[2, 6, 2]} texture={textures.wall} color="#ffcc00" />
      <Box position={[10, 0.5, -10]} size={[6, 3, 2]} texture={textures.wall} color="#ffcc00" />
      <Box position={[-8, 0, 10]} size={[8, 2, 8]} texture={textures.wall} color="#ff6666" />
      
      {/* Ramps / Platforms */}
      <RigidBody type="fixed" position={[0, 1, 0]}>
         <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[4, 1, 4]} />
            <meshStandardMaterial map={textures.grid} color="#88ccff" />
         </mesh>
      </RigidBody>
    </group>
  );
};