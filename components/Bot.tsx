import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import { useStore } from '../store';
import { BOT_SPEED, EGG_SCALE, COLORS } from '../constants';

interface BotProps {
  id: string;
  name: string;
  startPos: [number, number, number];
  playerRef: React.MutableRefObject<THREE.Vector3>;
}

export const Bot: React.FC<BotProps> = ({ id, name, startPos, playerRef }) => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const [health, setHealth] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const lastShot = useRef(0);
  
  const takePlayerDamage = useStore((state) => state.takeDamage);
  const addScore = useStore((state) => state.addScore);
  const triggerHitMarker = useStore((state) => state.triggerHitMarker);

  useEffect(() => {
    // Listen for shots
    const handleHit = (e: any) => {
      if (isDead) return;

      if (rigidBody.current && e.detail) {
          const botPos = rigidBody.current.translation();
          const hitPoint = e.detail.point; // Point where ray hit *something*
          
          if (hitPoint) {
            const dist = new THREE.Vector3(botPos.x, botPos.y, botPos.z).distanceTo(hitPoint);
            // Generous hit box for gameplay feel
            if (dist < 1.5) {
                // Hit!
                triggerHitMarker();
                setHealth(prev => {
                    const next = prev - 35;
                    if (next <= 0 && prev > 0) {
                        setIsDead(true);
                        addScore(100);
                        setTimeout(() => respawn(), 3000);
                    }
                    return next;
                });
            }
          }
      }
    };

    window.addEventListener('player-shoot', handleHit);
    return () => window.removeEventListener('player-shoot', handleHit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDead]);

  const respawn = () => {
    setIsDead(false);
    setHealth(100);
    if (rigidBody.current) {
        rigidBody.current.setTranslation({ 
            x: (Math.random() - 0.5) * 40, 
            y: 5, 
            z: (Math.random() - 0.5) * 40 
        }, true);
        rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  };

  useFrame((state, delta) => {
    if (!rigidBody.current || isDead) return;

    const botPos = rigidBody.current.translation();
    const playerPos = playerRef.current;
    
    // AI Logic: Look at player
    const vecToPlayer = new THREE.Vector3(playerPos.x - botPos.x, 0, playerPos.z - botPos.z);
    const distance = vecToPlayer.length();
    vecToPlayer.normalize();

    // Move towards player if far, strafe if close
    let moveDir = vecToPlayer.clone();
    
    if (distance < 5) {
        // Back up / strafe
        moveDir.negate();
    }
    
    const moveSpeed = BOT_SPEED;
    rigidBody.current.setLinvel({ 
        x: moveDir.x * moveSpeed, 
        y: rigidBody.current.linvel().y, 
        z: moveDir.z * moveSpeed 
    }, true);

    // Shooting logic
    if (state.clock.elapsedTime - lastShot.current > 1.5) {
        // Raycast check or just distance check for damage
        if (distance < 20 && !document.hidden) {
            // 70% chance to hit
            if (Math.random() > 0.3) {
                takePlayerDamage(10);
            }
            lastShot.current = state.clock.elapsedTime;
        }
    }
  });

  if (isDead) return null;

  return (
    <RigidBody 
      ref={rigidBody} 
      position={startPos} 
      type="dynamic" 
      enabledRotations={[false, false, false]}
      userData={{ type: 'bot', id }}
      colliders={false}
    >
        <CapsuleCollider args={[0.5, 0.5]} />
        <mesh castShadow receiveShadow scale={EGG_SCALE}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial 
              color={health < 50 ? '#ffcccc' : COLORS.player} 
              roughness={0.2}
              metalness={0.1}
            />
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

        {/* Gun */}
        <mesh position={[0.4, -0.1, 0.4]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.6]} />
            <meshStandardMaterial color="#333" />
        </mesh>

        {/* Health Bar / Name */}
        <Text 
            position={[0, 1.2, 0]} 
            fontSize={0.3} 
            color="black"
            anchorX="center" 
            anchorY="middle"
        >
            {name}
        </Text>
        <Text 
            position={[0, 0.9, 0]} 
            fontSize={0.2} 
            color={health > 50 ? "green" : "red"}
            anchorX="center" 
            anchorY="middle"
        >
            {health}%
        </Text>
    </RigidBody>
  );
};