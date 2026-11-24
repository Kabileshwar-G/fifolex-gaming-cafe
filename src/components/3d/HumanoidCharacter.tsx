"use client";

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface HumanoidCharacterProps {
  id?: string;
  name?: string;
  neonColor: string; // e.g. '#00f0ff', '#ff007f', '#10b981', '#f59e0b'
  secondaryColor?: string;
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
  secondaryColor = '#121624',
  pose = 'standing',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  waypoints,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  // Roaming state
  const waypointIndex = useRef(0);
  const pauseTimer = useRef(0);
  const currentPos = useRef(new THREE.Vector3(...position));
  const targetPos = useRef(new THREE.Vector3(...position));

  // Materials with high quality cyber aesthetic
  const armorMaterial = new THREE.MeshStandardMaterial({
    color: secondaryColor,
    roughness: 0.35,
    metalness: 0.7,
  });

  const undersuitMaterial = new THREE.MeshStandardMaterial({
    color: '#080a10',
    roughness: 0.8,
    metalness: 0.2,
  });

  const neonGlowMaterial = new THREE.MeshStandardMaterial({
    color: neonColor,
    emissive: neonColor,
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });

  const skinToneMaterial = new THREE.MeshStandardMaterial({
    color: '#d4a373',
    roughness: 0.6,
  });

  // Animation Loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (!groupRef.current) return;

    if (pose === 'seated') {
      // Believable Seated Gaming Animation:
      // Subtle breathing on torso/head, slight rapid hand/wrist twitch for typing/aiming
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 1.5) * 0.08;
        headRef.current.rotation.x = 0.05 + Math.sin(t * 2) * 0.03;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -Math.PI / 3 + Math.sin(t * 8) * 0.04; // Rapid mouse aim
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.PI / 3 + Math.sin(t * 6) * 0.03; // Keyboard WASD
      }
      return;
    }

    if (pose === 'walking' && waypoints && waypoints.length > 0) {
      // Roaming Waypoint Navigation
      if (pauseTimer.current > 0) {
        pauseTimer.current -= delta;
        // Idle breathing while paused
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.2) * 0.3;
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.05;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 1.5) * 0.05;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        return;
      }

      const currentWaypoint = waypoints[waypointIndex.current];
      targetPos.current.set(currentWaypoint[0], currentWaypoint[1], currentWaypoint[2]);

      const dir = new THREE.Vector3().subVectors(targetPos.current, groupRef.current.position);
      dir.y = 0; // lock to floor plane
      const dist = dir.length();

      if (dist < 0.25) {
        // Reached waypoint: pause briefly then pick next
        pauseTimer.current = 1.5 + Math.random() * 2.0;
        waypointIndex.current = (waypointIndex.current + 1) % waypoints.length;
      } else {
        // Move towards target
        dir.normalize();
        const moveSpeed = 1.35 * delta;
        groupRef.current.position.addScaledVector(dir, moveSpeed);

        // Smooth rotation facing movement direction
        const targetAngle = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, 0.1);

        // Natural walking stride kinematics
        const walkCycle = t * 7;
        const legSwing = Math.sin(walkCycle) * 0.65;
        const armSwing = Math.sin(walkCycle) * 0.55;
        const hipBob = Math.abs(Math.sin(walkCycle * 2)) * 0.05;

        groupRef.current.position.y = position[1] + hipBob;

        if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
        if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;
        if (headRef.current) headRef.current.rotation.y = Math.sin(walkCycle * 0.5) * 0.08;
      }
    } else if (pose === 'standing') {
      // Subtle idle breathing
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.5) * 0.15;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.04;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 1.5) * 0.04;
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
      {/* PELVIS / HIPS ROOT */}
      <group position={[0, isSeated ? 0.52 : 0.88, isSeated ? 0.05 : 0]}>
        {/* Hip Belt */}
        <mesh material={armorMaterial} castShadow>
          <boxGeometry args={[0.3, 0.12, 0.2]} />
        </mesh>
        {/* Glowing Belt Buckle / Power cell */}
        <mesh position={[0, 0, 0.11]} material={neonGlowMaterial}>
          <boxGeometry args={[0.08, 0.05, 0.02]} />
        </mesh>

        {/* TORSO & CHEST */}
        <group position={[0, 0.24, 0]}>
          {/* Undersuit Core */}
          <mesh material={undersuitMaterial} castShadow>
            <cylinderGeometry args={[0.13, 0.11, 0.36, 12]} />
          </mesh>
          {/* Cyber Armor Chestplate */}
          <mesh position={[0, 0.04, 0.03]} material={armorMaterial} castShadow>
            <boxGeometry args={[0.34, 0.28, 0.18]} />
          </mesh>
          {/* Glowing Neon Chest Emblem */}
          <mesh position={[0, 0.06, 0.13]} material={neonGlowMaterial}>
            <boxGeometry args={[0.1, 0.14, 0.02]} />
          </mesh>
          {/* Cyber Backpack / Battery Rig */}
          <mesh position={[0, 0.04, -0.12]} material={armorMaterial} castShadow>
            <boxGeometry args={[0.22, 0.26, 0.08]} />
          </mesh>
          <mesh position={[0, 0.04, -0.17]} material={neonGlowMaterial}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          </mesh>

          {/* NECK & HEAD */}
          <group ref={headRef} position={[0, 0.26, 0]}>
            {/* Neck */}
            <mesh position={[0, 0.02, 0]} material={undersuitMaterial}>
              <cylinderGeometry args={[0.05, 0.06, 0.08, 12]} />
            </mesh>
            {/* Head / Cyber Helmet */}
            <mesh position={[0, 0.14, 0]} material={armorMaterial} castShadow>
              <sphereGeometry args={[0.13, 16, 16]} />
            </mesh>
            {/* Faceplate / Visor with Glowing HUD */}
            <mesh position={[0, 0.14, 0.1]} material={neonGlowMaterial}>
              <boxGeometry args={[0.18, 0.07, 0.08]} />
            </mesh>
            {/* Gaming Headset Ear Cups */}
            <mesh position={[-0.14, 0.14, 0]} material={armorMaterial}>
              <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
            </mesh>
            <mesh position={[0.14, 0.14, 0]} material={armorMaterial}>
              <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
            </mesh>
            {/* Headset Headband */}
            <mesh position={[0, 0.26, 0]} rotation={[0, 0, Math.PI / 2]} material={armorMaterial}>
              <torusGeometry args={[0.13, 0.02, 8, 24, Math.PI]} />
            </mesh>
            <mesh position={[0.14, 0.14, 0]} material={neonGlowMaterial}>
              <ringGeometry args={[0.02, 0.04, 16]} />
            </mesh>
            <mesh position={[-0.14, 0.14, 0]} material={neonGlowMaterial}>
              <ringGeometry args={[0.02, 0.04, 16]} />
            </mesh>
          </group>

          {/* LEFT SHOULDER & ARM */}
          <group
            ref={leftArmRef}
            position={[-0.22, 0.14, 0]}
            rotation={isSeated ? [-Math.PI / 3.2, 0.15, -0.2] : [0, 0, 0]}
          >
            {/* Shoulder Armor Pad */}
            <mesh material={armorMaterial} castShadow>
              <sphereGeometry args={[0.07, 12, 12]} />
            </mesh>
            <mesh position={[-0.04, 0, 0]} material={neonGlowMaterial}>
              <boxGeometry args={[0.01, 0.08, 0.06]} />
            </mesh>
            {/* Upper Arm */}
            <mesh position={[0, -0.12, 0]} material={undersuitMaterial} castShadow>
              <cylinderGeometry args={[0.045, 0.04, 0.18, 8]} />
            </mesh>
            {/* Forearm & Hand */}
            <group
              ref={leftForearmRef}
              position={[0, -0.21, 0]}
              rotation={isSeated ? [-0.6, 0.3, 0] : [0, 0, 0]}
            >
              <mesh position={[0, -0.1, 0]} material={armorMaterial} castShadow>
                <cylinderGeometry args={[0.04, 0.035, 0.18, 8]} />
              </mesh>
              {/* Hand / Gaming Glove */}
              <mesh position={[0, -0.21, 0.01]} material={skinToneMaterial} castShadow>
                <boxGeometry args={[0.05, 0.07, 0.03]} />
              </mesh>
            </group>
          </group>

          {/* RIGHT SHOULDER & ARM */}
          <group
            ref={rightArmRef}
            position={[0.22, 0.14, 0]}
            rotation={isSeated ? [-Math.PI / 3.2, -0.15, 0.2] : [0, 0, 0]}
          >
            {/* Shoulder Armor Pad */}
            <mesh material={armorMaterial} castShadow>
              <sphereGeometry args={[0.07, 12, 12]} />
            </mesh>
            <mesh position={[0.04, 0, 0]} material={neonGlowMaterial}>
              <boxGeometry args={[0.01, 0.08, 0.06]} />
            </mesh>
            {/* Upper Arm */}
            <mesh position={[0, -0.12, 0]} material={undersuitMaterial} castShadow>
              <cylinderGeometry args={[0.045, 0.04, 0.18, 8]} />
            </mesh>
            {/* Forearm & Hand */}
            <group
              ref={rightForearmRef}
              position={[0, -0.21, 0]}
              rotation={isSeated ? [-0.6, -0.3, 0] : [0, 0, 0]}
            >
              <mesh position={[0, -0.1, 0]} material={armorMaterial} castShadow>
                <cylinderGeometry args={[0.04, 0.035, 0.18, 8]} />
              </mesh>
              {/* Hand / Gaming Glove holding mouse/controller */}
              <mesh position={[0, -0.21, 0.01]} material={skinToneMaterial} castShadow>
                <boxGeometry args={[0.05, 0.07, 0.03]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* LEFT LEG */}
        <group
          ref={leftLegRef}
          position={[-0.1, -0.06, 0]}
          rotation={isSeated ? [-Math.PI / 2, 0.05, 0] : [0, 0, 0]}
        >
          {/* Thigh */}
          <mesh position={[0, -0.18, 0]} material={armorMaterial} castShadow>
            <cylinderGeometry args={[0.065, 0.055, 0.28, 8]} />
          </mesh>
          <mesh position={[-0.05, -0.16, 0]} material={neonGlowMaterial}>
            <boxGeometry args={[0.01, 0.18, 0.03]} />
          </mesh>

          {/* Knee & Calf */}
          <group
            position={[0, -0.32, 0]}
            rotation={isSeated ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
          >
            {/* Knee Plate */}
            <mesh position={[0, 0, 0.05]} material={armorMaterial}>
              <boxGeometry args={[0.08, 0.08, 0.03]} />
            </mesh>
            {/* Shin Guard */}
            <mesh position={[0, -0.16, 0]} material={undersuitMaterial} castShadow>
              <cylinderGeometry args={[0.055, 0.045, 0.28, 8]} />
            </mesh>
            {/* Boot / Foot */}
            <mesh position={[0, -0.31, 0.04]} material={armorMaterial} castShadow>
              <boxGeometry args={[0.09, 0.08, 0.18]} />
            </mesh>
            <mesh position={[0, -0.35, 0.04]} material={neonGlowMaterial}>
              <boxGeometry args={[0.08, 0.01, 0.16]} />
            </mesh>
          </group>
        </group>

        {/* RIGHT LEG */}
        <group
          ref={rightLegRef}
          position={[0.1, -0.06, 0]}
          rotation={isSeated ? [-Math.PI / 2, -0.05, 0] : [0, 0, 0]}
        >
          {/* Thigh */}
          <mesh position={[0, -0.18, 0]} material={armorMaterial} castShadow>
            <cylinderGeometry args={[0.065, 0.055, 0.28, 8]} />
          </mesh>
          <mesh position={[0.05, -0.16, 0]} material={neonGlowMaterial}>
            <boxGeometry args={[0.01, 0.18, 0.03]} />
          </mesh>

          {/* Knee & Calf */}
          <group
            position={[0, -0.32, 0]}
            rotation={isSeated ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
          >
            {/* Knee Plate */}
            <mesh position={[0, 0, 0.05]} material={armorMaterial}>
              <boxGeometry args={[0.08, 0.08, 0.03]} />
            </mesh>
            {/* Shin Guard */}
            <mesh position={[0, -0.16, 0]} material={undersuitMaterial} castShadow>
              <cylinderGeometry args={[0.055, 0.045, 0.28, 8]} />
            </mesh>
            {/* Boot / Foot */}
            <mesh position={[0, -0.31, 0.04]} material={armorMaterial} castShadow>
              <boxGeometry args={[0.09, 0.08, 0.18]} />
            </mesh>
            <mesh position={[0, -0.35, 0.04]} material={neonGlowMaterial}>
              <boxGeometry args={[0.08, 0.01, 0.16]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
