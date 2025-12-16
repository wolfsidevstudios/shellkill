import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { useStore } from '../store';
import { Weapon } from './Weapon';
import { PLAYER_SPEED, JUMP_FORCE } from '../constants';

const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export const Player: React.FC = () => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const [shootAnim, setShootAnim] = useState(false);
  const { rapier, world } = useRapier();
  
  const shootAmmo = useStore((state) => state.shootAmmo);
  const reload = useStore((state) => state.reload);
  const isReloading = useStore((state) => state.isReloading);
  const gameMode = useStore((state) => state.gameMode);

  // Input state
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setKeys(k => ({ ...k, forward: true })); break;
        case 'KeyS': setKeys(k => ({ ...k, backward: true })); break;
        case 'KeyA': setKeys(k => ({ ...k, left: true })); break;
        case 'KeyD': setKeys(k => ({ ...k, right: true })); break;
        case 'Space': setKeys(k => ({ ...k, jump: true })); break;
        case 'KeyR': reload(); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setKeys(k => ({ ...k, forward: false })); break;
        case 'KeyS': setKeys(k => ({ ...k, backward: false })); break;
        case 'KeyA': setKeys(k => ({ ...k, left: false })); break;
        case 'KeyD': setKeys(k => ({ ...k, right: false })); break;
        case 'Space': setKeys(k => ({ ...k, jump: false })); break;
      }
    };
    const handleMouseDown = () => {
      if (document.pointerLockElement === document.body) {
        fireWeapon();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fireWeapon = () => {
    if (isReloading) return;
    
    if (shootAmmo()) {
      setShootAnim(true);
      setTimeout(() => setShootAnim(false), 50);

      // Raycast for shooting
      const rayOrigin = camera.position;
      const rayDir = new THREE.Vector3();
      camera.getWorldDirection(rayDir);
      
      const ray = new rapier.Ray(rayOrigin, rayDir);
      const hit = world.castRay(ray, 100, true);

      if (hit && hit.collider) {
         const event = new CustomEvent('player-shoot', { 
           detail: { 
             hitId: hit.collider.handle,
             point: ray.pointAt(hit.toi) 
            } 
          });
         window.dispatchEvent(event);
      }
    }
  };

  useFrame((state) => {
    if (!rigidBody.current) return;

    // Movement
    const velocity = rigidBody.current.linvel();
    
    frontVector.set(0, 0, Number(keys.backward) - Number(keys.forward));
    sideVector.set(Number(keys.left) - Number(keys.right), 0, 0);
    
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(PLAYER_SPEED)
      .applyEuler(camera.rotation);

    rigidBody.current.setLinvel(
      { x: direction.x, y: velocity.y, z: direction.z },
      true
    );

    // Jump
    if (keys.jump) {
      if (Math.abs(velocity.y) < 0.1) {
        rigidBody.current.setLinvel({ x: velocity.x, y: JUMP_FORCE, z: velocity.z }, true);
      }
    }

    // Camera sync
    const pos = rigidBody.current.translation();
    camera.position.copy(new THREE.Vector3(pos.x, pos.y + 0.8, pos.z));
    
    // Multiplayer Broadcast (throttled slightly or every frame)
    if (gameMode === 'MULTIPLAYER') {
        // We broadcast global events that NetworkManager picks up
        const event = new CustomEvent('local-player-move', {
            detail: {
                pos: [pos.x, pos.y, pos.z],
                rot: [camera.rotation.x, camera.rotation.y, camera.rotation.z]
            }
        });
        window.dispatchEvent(event);
    }
  });

  return (
    <group>
      <RigidBody 
        ref={rigidBody} 
        colliders={false} 
        mass={1} 
        type="dynamic" 
        position={[0, 5, 0]} 
        enabledRotations={[false, false, false]}
        userData={{ type: 'player' }}
      >
        <CapsuleCollider args={[0.5, 0.5]} />
      </RigidBody>
      
      <group position={camera.position} rotation={camera.rotation}>
        <Weapon isShooting={shootAnim} />
      </group>
    </group>
  );
};