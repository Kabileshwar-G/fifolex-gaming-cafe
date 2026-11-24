"use client";

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface HumanoidCharacterProps {
  id?: string;
  name?: string;
  neonColor: string; // e.g. '#CCFF00' (Acid Green), '#8A2BE2' (Ultraviolet), '#00F0FF' (Cyan), '#FF007F' (Magenta), '#FF5500' (Orange), '#FFE600' (Gold)
  pose?: 'seated' | 'walking' | 'standing';
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  walkSpeed?: number;
  waypoints?: [number, number, number][]; // Path waypoints for roaming
  onSeatReached?: () => void;
}

export const HumanoidCharacter: React.FC<HumanoidCharacterProps> = ({
  name,
  neonColor,
  pose = 'standing',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  waypoints,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftCalfRef = useRef<THREE.Group>(null);
  const rightCalfRef = useRef<THREE.Group>(null);

  // Roaming state
  const waypointIndex = useRef(0);
  const pauseTimer = useRef(0);
  const targetPos = useRef(new THREE.Vector3(...position));

  // Glowing translucent neon materials inspired by the reference art
  const { coreMaterial, rimGlowMaterial } = useMemo(() => {
    // Inner luminous translucent body
    const core = new THREE.MeshStandardMaterial({
      color: neonColor,
      emissive: neonColor,
      emissiveIntensity: 1.6,
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.86,
      depthWrite: true,
    });

    // Outer ethereal rim/fresnel glow aura
    const rim = new THREE.MeshBasicMaterial({
      color: neonColor,
      transparent: true,
      opacity: 0.32,
      side: THREE.BackSide,
      depthWrite: false,
    });

    return { coreMaterial: core, rimGlowMaterial: rim };
  }, [neonColor]);

  // Animation Loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    if (pose === 'seated') {
      // Believable seated gaming animation:
      // Subtle torso breathing, head micro-tilts, keyboard/mouse twitching
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.22 + Math.sin(t * 2) * 0.008;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 1.4) * 0.07;
        headRef.current.rotation.x = -0.05 + Math.sin(t * 2.2) * 0.025;
      }
      if (rightForearmRef.current) {
        // Fast mouse aim micro-twitches
        rightForearmRef.current.rotation.z = Math.sin(t * 9) * 0.035;
        rightForearmRef.current.rotation.y = Math.sin(t * 7) * 0.04;
      }
      if (leftForearmRef.current) {
        // WASD keystroke micro-twitches
        leftForearmRef.current.rotation.x = -0.65 + Math.sin(t * 6) * 0.025;
      }
      return;
    }

    if (pose === 'walking' && waypoints && waypoints.length > 0) {
      if (pauseTimer.current > 0) {
        pauseTimer.current -= delta;
        // Idle breathing when pausing at a waypoint
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.2) * 0.25;
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.05;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 1.5) * 0.05;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        return;
      }

      const currentWaypoint = waypoints[waypointIndex.current];
      targetPos.current.set(currentWaypoint[0], currentWaypoint[1], currentWaypoint[2]);

      const dir = new THREE.Vector3().subVectors(targetPos.current, groupRef.current.position);
      dir.y = 0;
      const dist = dir.length();

      if (dist < 0.3) {
        pauseTimer.current = 1.2 + Math.random() * 2.2;
        waypointIndex.current = (waypointIndex.current + 1) % waypoints.length;
      } else {
        dir.normalize();
        const moveSpeed = 1.35 * delta;
        groupRef.current.position.addScaledVector(dir, moveSpeed);

        const targetAngle = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, 0.12);

        // Fluid walking stride
        const walkCycle = t * 7;
        const legSwing = Math.sin(walkCycle) * 0.65;
        const armSwing = Math.sin(walkCycle) * 0.55;
        const hipBob = Math.abs(Math.sin(walkCycle * 2)) * 0.045;

        groupRef.current.position.y = position[1] + hipBob;

        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = legSwing;
          if (leftCalfRef.current) leftCalfRef.current.rotation.x = Math.max(0, -legSwing * 0.8);
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -legSwing;
          if (rightCalfRef.current) rightCalfRef.current.rotation.x = Math.max(0, legSwing * 0.8);
        }
        if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
        if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;
        if (headRef.current) headRef.current.rotation.y = Math.sin(walkCycle * 0.5) * 0.07;
      }
    } else if (pose === 'standing') {
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.5) * 0.12;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.03;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 1.5) * 0.03;
    }
  });

  const isSeated = pose === 'seated';

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      {/* Dynamic Point Light casting the avatar's neon aura onto surroundings */}
      <pointLight
        color={neonColor}
        intensity={1.2}
        distance={2.6}
        decay={2}
        position={[0, isSeated ? 0.65 : 1.1, isSeated ? 0.1 : 0]}
      />

      {/* PELVIS / HIPS ROOT */}
      <group position={[0, isSeated ? 0.48 : 0.88, isSeated ? 0.08 : 0]}>
        {/* Pelvis Core */}
        <mesh material={coreMaterial} castShadow>
          <sphereGeometry args={[0.13, 16, 12]} />
        </mesh>
        <mesh material={rimGlowMaterial} scale={1.06}>
          <sphereGeometry args={[0.13, 16, 12]} />
        </mesh>

        {/* TORSO & CHEST */}
        <group ref={torsoRef} position={[0, 0.22, isSeated ? 0.04 : 0]} rotation={isSeated ? [0.12, 0, 0] : [0, 0, 0]}>
          {/* Lower abdomen & waist */}
          <mesh position={[0, -0.06, 0]} material={coreMaterial} castShadow>
            <cylinderGeometry args={[0.11, 0.12, 0.16, 16]} />
          </mesh>
          <mesh position={[0, -0.06, 0]} material={rimGlowMaterial} scale={1.05}>
            <cylinderGeometry args={[0.11, 0.12, 0.16, 16]} />
          </mesh>

          {/* Upper Chest & Ribcage */}
          <mesh position={[0, 0.1, 0]} material={coreMaterial} castShadow>
            <cylinderGeometry args={[0.15, 0.11, 0.2, 16]} />
          </mesh>
          <mesh position={[0, 0.1, 0]} material={rimGlowMaterial} scale={1.06}>
            <cylinderGeometry args={[0.15, 0.11, 0.2, 16]} />
          </mesh>

          {/* Contoured Chest / Pectoral Curve */}
          <mesh position={[0, 0.11, 0.05]} material={coreMaterial}>
            <sphereGeometry args={[0.13, 16, 12]} />
          </mesh>

          {/* NECK & HEAD */}
          <group ref={headRef} position={[0, 0.24, 0]}>
            {/* Neck */}
            <mesh position={[0, 0.03, 0]} material={coreMaterial}>
              <cylinderGeometry args={[0.045, 0.055, 0.08, 12]} />
            </mesh>
            {/* Sculpted Cranium / Head */}
            <mesh position={[0, 0.16, 0.01]} material={coreMaterial} castShadow>
              <sphereGeometry args={[0.115, 20, 16]} />
            </mesh>
            <mesh position={[0, 0.16, 0.01]} material={rimGlowMaterial} scale={1.07}>
              <sphereGeometry args={[0.115, 20, 16]} />
            </mesh>

            {/* Subtle Facial / Jaw Contours */}
            <mesh position={[0, 0.12, 0.07]} rotation={[0.4, 0, 0]} material={coreMaterial}>
              <sphereGeometry args={[0.065, 12, 10]} />
            </mesh>

            {/* Glowing Cyber Headset / Visor Accents */}
            <mesh position={[0, 0.16, 0.08]} material={coreMaterial}>
              <boxGeometry args={[0.14, 0.03, 0.05]} />
            </mesh>
            <mesh position={[-0.12, 0.16, 0]} material={coreMaterial}>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
            </mesh>
            <mesh position={[0.12, 0.16, 0]} material={coreMaterial}>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
            </mesh>
          </group>

          {/* LEFT SHOULDER & ARM */}
          <group
            ref={leftArmRef}
            position={[-0.19, 0.16, 0]}
            rotation={isSeated ? [-Math.PI / 3.4, 0.2, -0.15] : [0, 0, -0.1]}
          >
            {/* Shoulder */}
            <mesh material={coreMaterial} castShadow>
              <sphereGeometry args={[0.065, 14, 12]} />
            </mesh>
            <mesh material={rimGlowMaterial} scale={1.07}>
              <sphereGeometry args={[0.065, 14, 12]} />
            </mesh>

            {/* Upper Arm Bicep */}
            <mesh position={[0, -0.1, 0]} material={coreMaterial} castShadow>
              <cylinderGeometry args={[0.042, 0.036, 0.18, 12]} />
            </mesh>
            <mesh position={[0, -0.1, 0]} material={rimGlowMaterial} scale={1.06}>
              <cylinderGeometry args={[0.042, 0.036, 0.18, 12]} />
            </mesh>

            {/* Elbow & Forearm */}
            <group
              ref={leftForearmRef}
              position={[0, -0.19, 0]}
              rotation={isSeated ? [-0.65, 0.25, 0] : [0, 0, 0]}
            >
              <mesh material={coreMaterial}>
                <sphereGeometry args={[0.038, 10, 10]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={coreMaterial} castShadow>
                <cylinderGeometry args={[0.036, 0.03, 0.16, 12]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={rimGlowMaterial} scale={1.06}>
                <cylinderGeometry args={[0.036, 0.03, 0.16, 12]} />
              </mesh>

              {/* Hand & Fingers (Gently extended on desk/keyboard) */}
              <group position={[0, -0.18, 0]} rotation={isSeated ? [0.25, 0, -0.1] : [0, 0, 0]}>
                <mesh material={coreMaterial}>
                  <boxGeometry args={[0.045, 0.06, 0.02]} />
                </mesh>
                <mesh position={[-0.015, -0.035, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.04, 6]} />
                </mesh>
                <mesh position={[0, -0.038, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.045, 6]} />
                </mesh>
                <mesh position={[0.015, -0.035, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.04, 6]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* RIGHT SHOULDER & ARM */}
          <group
            ref={rightArmRef}
            position={[0.19, 0.16, 0]}
            rotation={isSeated ? [-Math.PI / 3.4, -0.2, 0.15] : [0, 0, 0.1]}
          >
            {/* Shoulder */}
            <mesh material={coreMaterial} castShadow>
              <sphereGeometry args={[0.065, 14, 12]} />
            </mesh>
            <mesh material={rimGlowMaterial} scale={1.07}>
              <sphereGeometry args={[0.065, 14, 12]} />
            </mesh>

            {/* Upper Arm Bicep */}
            <mesh position={[0, -0.1, 0]} material={coreMaterial} castShadow>
              <cylinderGeometry args={[0.042, 0.036, 0.18, 12]} />
            </mesh>
            <mesh position={[0, -0.1, 0]} material={rimGlowMaterial} scale={1.06}>
              <cylinderGeometry args={[0.042, 0.036, 0.18, 12]} />
            </mesh>

            {/* Elbow & Forearm */}
            <group
              ref={rightForearmRef}
              position={[0, -0.19, 0]}
              rotation={isSeated ? [-0.65, -0.25, 0] : [0, 0, 0]}
            >
              <mesh material={coreMaterial}>
                <sphereGeometry args={[0.038, 10, 10]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={coreMaterial} castShadow>
                <cylinderGeometry args={[0.036, 0.03, 0.16, 12]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={rimGlowMaterial} scale={1.06}>
                <cylinderGeometry args={[0.036, 0.03, 0.16, 12]} />
              </mesh>

              {/* Hand & Fingers (Resting on mouse) */}
              <group position={[0, -0.18, 0]} rotation={isSeated ? [0.25, 0, 0.1] : [0, 0, 0]}>
                <mesh material={coreMaterial}>
                  <boxGeometry args={[0.045, 0.06, 0.02]} />
                </mesh>
                <mesh position={[-0.015, -0.035, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.04, 6]} />
                </mesh>
                <mesh position={[0, -0.038, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.045, 6]} />
                </mesh>
                <mesh position={[0.015, -0.035, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.04, 6]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* LEFT LEG */}
        <group
          ref={leftLegRef}
          position={[-0.1, -0.06, 0]}
          rotation={isSeated ? [-Math.PI / 2.1, 0.1, 0] : [0, 0, 0]}
        >
          {/* Hip Joint */}
          <mesh material={coreMaterial}>
            <sphereGeometry args={[0.065, 12, 10]} />
          </mesh>

          {/* Athletic Thigh */}
          <mesh position={[0, -0.17, 0]} material={coreMaterial} castShadow>
            <cylinderGeometry args={[0.06, 0.045, 0.32, 14]} />
          </mesh>
          <mesh position={[0, -0.17, 0]} material={rimGlowMaterial} scale={1.06}>
            <cylinderGeometry args={[0.06, 0.045, 0.32, 14]} />
          </mesh>

          {/* Knee & Calf */}
          <group
            ref={leftCalfRef}
            position={[0, -0.34, 0]}
            rotation={isSeated ? [Math.PI / 2.05, 0, 0] : [0, 0, 0]}
          >
            <mesh material={coreMaterial}>
              <sphereGeometry args={[0.048, 12, 10]} />
            </mesh>
            <mesh position={[0, -0.18, 0]} material={coreMaterial} castShadow>
              <cylinderGeometry args={[0.046, 0.034, 0.34, 14]} />
            </mesh>
            <mesh position={[0, -0.18, 0]} material={rimGlowMaterial} scale={1.06}>
              <cylinderGeometry args={[0.046, 0.034, 0.34, 14]} />
            </mesh>

            {/* Ankle & Arched Foot */}
            <group position={[0, -0.36, 0.04]}>
              <mesh material={coreMaterial} castShadow>
                <boxGeometry args={[0.065, 0.05, 0.16]} />
              </mesh>
              <mesh material={rimGlowMaterial} scale={1.08}>
                <boxGeometry args={[0.065, 0.05, 0.16]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* RIGHT LEG */}
        <group
          ref={rightLegRef}
          position={[0.1, -0.06, 0]}
          rotation={isSeated ? [-Math.PI / 2.1, -0.1, 0] : [0, 0, 0]}
        >
          {/* Hip Joint */}
          <mesh material={coreMaterial}>
            <sphereGeometry args={[0.065, 12, 10]} />
          </mesh>

          {/* Athletic Thigh */}
          <mesh position={[0, -0.17, 0]} material={coreMaterial} castShadow>
            <cylinderGeometry args={[0.06, 0.045, 0.32, 14]} />
          </mesh>
          <mesh position={[0, -0.17, 0]} material={rimGlowMaterial} scale={1.06}>
            <cylinderGeometry args={[0.06, 0.045, 0.32, 14]} />
          </mesh>

          {/* Knee & Calf */}
          <group
            ref={rightCalfRef}
            position={[0, -0.34, 0]}
            rotation={isSeated ? [Math.PI / 2.05, 0, 0] : [0, 0, 0]}
          >
            <mesh material={coreMaterial}>
              <sphereGeometry args={[0.048, 12, 10]} />
            </mesh>
            <mesh position={[0, -0.18, 0]} material={coreMaterial} castShadow>
              <cylinderGeometry args={[0.046, 0.034, 0.34, 14]} />
            </mesh>
            <mesh position={[0, -0.18, 0]} material={rimGlowMaterial} scale={1.06}>
              <cylinderGeometry args={[0.046, 0.034, 0.34, 14]} />
            </mesh>

            {/* Ankle & Arched Foot */}
            <group position={[0, -0.36, 0.04]}>
              <mesh material={coreMaterial} castShadow>
                <boxGeometry args={[0.065, 0.05, 0.16]} />
              </mesh>
              <mesh material={rimGlowMaterial} scale={1.08}>
                <boxGeometry args={[0.065, 0.05, 0.16]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
