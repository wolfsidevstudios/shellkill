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
  const addScore = useStore((state) => state.addScore);

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
         // Check if we hit an enemy
         // We interact with enemies via a global event or simpler collision logic
         // Since Rapier handles physics, we can check user data on rigidbodies or just use the event system
         // For simplicity in this demo, we'll dispatch a custom event that bots listen to
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
      // Simple ground check via raycast down would be better, but strict physics check is okay for demo
      if (Math.abs(velocity.y) < 0.1) {
        rigidBody.current.setLinvel({ x: velocity.x, y: JUMP_FORCE, z: velocity.z }, true);
      }
    }

    // Camera sync
    const pos = rigidBody.current.translation();
    camera.position.copy(new THREE.Vector3(pos.x, pos.y + 0.8, pos.z));
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
      
      {/* Weapon is attached to camera via portal or just rendered in scene and synced? 
          Actually, let's put it in the camera group if possible, or just sync it manually.
          R3F makes it easier to just parent it to the camera if the camera wasn't controlled by orbit controls.
          Since we manually update camera, we can use createPortal or just rely on the HUD view.
          However, usually in FPS, we create a separate scene for the gun to prevent clipping, 
          but for this MVP, we will parent it to the camera object using a helper component.
      */}
      <group position={camera.position} rotation={camera.rotation}>
        <Weapon isShooting={shootAnim} />
      </group>
    </group>
  );
};