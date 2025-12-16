import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, PointerLockControls, Stars } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Player } from './Player';
import { Bot } from './Bot';
import { Level } from './Level';
import { BOT_NAMES } from '../constants';
import * as THREE from 'three';

const PlayerTracker = ({ playerRef }: { playerRef: React.MutableRefObject<THREE.Vector3> }) => {
    useFrame((state) => {
        playerRef.current.copy(state.camera.position);
    });
    return null;
}

export const GameScene: React.FC = () => {
  const playerRef = useRef(new THREE.Vector3(0, 0, 0));

  return (
    <Canvas shadows camera={{ fov: 75 }}>
      <Sky sunPosition={[100, 20, 100]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      
      <Physics gravity={[0, -20, 0]}>
        <Player />
        <PlayerTracker playerRef={playerRef} />
        <Level />
        
        {/* Spawn Bots */}
        {BOT_NAMES.map((name, i) => (
            <Bot 
                key={i} 
                id={`bot-${i}`} 
                name={name} 
                startPos={[
                    (Math.random() - 0.5) * 30,
                    2,
                    (Math.random() - 0.5) * 30
                ]}
                playerRef={playerRef}
            />
        ))}
      </Physics>
      
      <PointerLockControls />
    </Canvas>
  );
};