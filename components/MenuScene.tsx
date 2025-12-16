import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, ContactShadows, Float, Environment } from '@react-three/drei';
import { EGG_SCALE } from '../constants';
import { Weapon } from './Weapon';

const HeroEgg: React.FC = () => {
    const meshRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group ref={meshRef}>
                <mesh castShadow receiveShadow scale={EGG_SCALE}>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
                </mesh>
                
                {/* Face */}
                <mesh position={[0.3, 0.3, 0.65]}>
                    <sphereGeometry args={[0.15]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[-0.3, 0.3, 0.65]}>
                    <sphereGeometry args={[0.15]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                
                {/* Hero Weapon attached */}
                <group position={[0.6, -0.2, 0.5]} scale={[1.5, 1.5, 1.5]}>
                    <mesh position={[0, 0, 0]} castShadow>
                        <boxGeometry args={[0.1, 0.15, 0.6]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[0, 0.05, -0.4]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.4]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                </group>
            </group>
        </Float>
    );
};

export const MenuScene: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <Sky sunPosition={[10, 10, 10]} />
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
      
      <HeroEgg />
      
      <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
    </Canvas>
  );
};