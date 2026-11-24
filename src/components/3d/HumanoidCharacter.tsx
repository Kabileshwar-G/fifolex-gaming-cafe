"use client";

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface HumanoidCharacterProps {
  id?: string;
  name?: string;
  neonColor: string; // Electric Cyan, Royal Indigo, Emerald Mint, Sunset Amber, Magenta
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

  // Smooth Roaming & Locomotion State
  const waypointIndex = useRef(0);
  const pauseTimer = useRef(0);
  const walkPhase = useRef(0);
  const walkWeight = useRef(0); // Blends smoothly between 0 (idle) and 1 (walk)
  const currentSpeed = useRef(0);

  // Glowing translucent materials matching the ethereal neon reference art
  const { coreMaterial, rimGlowMaterial } = useMemo(() => {
    // Inner luminous translucent body
    const core = new THREE.MeshStandardMaterial({
      color: neonColor,
      emissive: neonColor,
      emissiveIntensity: 1.35,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88,
      depthWrite: true,
    });

    // Outer ethereal rim glow
    const rim = new THREE.MeshBasicMaterial({
      color: neonColor,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
      depthWrite: false,
    });

    return { coreMaterial: core, rimGlowMaterial: rim };
  }, [neonColor]);

  // Smooth Animation Loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    // Clamp delta to prevent animation spikes on tab-switch
    const dt = Math.min(delta, 0.05);

    if (pose === 'seated') {
      // Natural, organic seated gaming posture:
      // Gentle breathing, subtle keyboard/mouse micro-adjustments
      const breathing = Math.sin(t * 1.8) * 0.008;
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.2 + breathing;
        torsoRef.current.rotation.x = 0.06 + Math.sin(t * 1.4) * 0.015;
      }
      if (headRef.current) {
        // Natural gaze shifting slightly around the screen
        headRef.current.rotation.y = Math.sin(t * 0.9) * 0.04;
        headRef.current.rotation.x = -0.04 + Math.sin(t * 1.6) * 0.02;
      }
      if (rightForearmRef.current) {
        // Smooth mouse aiming wrist adjustment
        rightForearmRef.current.rotation.z = Math.sin(t * 2.5) * 0.025;
        rightForearmRef.current.rotation.y = -0.22 + Math.sin(t * 1.8) * 0.02;
      }
      if (leftForearmRef.current) {
        // Subtle rhythmic keystroke typing
        leftForearmRef.current.rotation.x = -0.42 + Math.sin(t * 3.2) * 0.015;
      }
      return;
    }

    if (pose === 'walking' && waypoints && waypoints.length > 0) {
      const isPaused = pauseTimer.current > 0;
      if (isPaused) {
        pauseTimer.current -= dt;
      }

      // Smoothly blend walk weight (0 = idle, 1 = walking)
      const targetWeight = isPaused ? 0 : 1;
      walkWeight.current = THREE.MathUtils.damp(walkWeight.current, targetWeight, 6, dt);

      const currentWaypoint = waypoints[waypointIndex.current];
      const targetPos = new THREE.Vector3(currentWaypoint[0], currentWaypoint[1], currentWaypoint[2]);

      const dir = new THREE.Vector3().subVectors(targetPos, groupRef.current.position);
      dir.y = 0;
      const dist = dir.length();

      if (dist < 0.35 && !isPaused) {
        // Arrived at waypoint - pause naturally before moving to next
        pauseTimer.current = 1.4 + Math.random() * 2.0;
        waypointIndex.current = (waypointIndex.current + 1) % waypoints.length;
      } else if (!isPaused) {
        dir.normalize();

        // Smooth speed acceleration / deceleration
        const desiredSpeed = dist < 0.8 ? (dist / 0.8) * 1.25 : 1.25;
        currentSpeed.current = THREE.MathUtils.damp(currentSpeed.current, desiredSpeed, 5, dt);

        groupRef.current.position.addScaledVector(dir, currentSpeed.current * dt);

        // Smooth Shortest-Arc Angular Slerp (no 360 flip glitches)
        const targetAngle = Math.atan2(dir.x, dir.z);
        let angleDiff = targetAngle - groupRef.current.rotation.y;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        groupRef.current.rotation.y += angleDiff * Math.min(1, dt * 5.0);
      }

      // Advance walk cycle proportional to speed
      walkPhase.current += dt * 6.0 * (currentSpeed.current / 1.25 + 0.1);

      // Smooth kinematic limb swings
      const legSwing = Math.sin(walkPhase.current) * 0.52 * walkWeight.current;
      const armSwing = Math.sin(walkPhase.current) * 0.44 * walkWeight.current;
      const hipBob = Math.abs(Math.sin(walkPhase.current * 2)) * 0.035 * walkWeight.current;

      groupRef.current.position.y = position[1] + hipBob;

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = legSwing;
        if (leftCalfRef.current) {
          leftCalfRef.current.rotation.x = Math.max(0, -legSwing * 0.75);
        }
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -legSwing;
        if (rightCalfRef.current) {
          rightCalfRef.current.rotation.x = Math.max(0, legSwing * 0.75);
        }
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;

      // Subtle head sway
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(walkPhase.current * 0.5) * 0.06 * walkWeight.current;
      }
    } else if (pose === 'standing') {
      // Natural idle standing breathing
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.2) * 0.1;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.03;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 1.5) * 0.03;
      if (torsoRef.current) torsoRef.current.position.y = 0.22 + Math.sin(t * 1.5) * 0.005;
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
      {/* Dynamic Point Light casting the avatar's neon aura */}
      <pointLight
        color={neonColor}
        intensity={1.0}
        distance={2.4}
        decay={2}
        position={[0, isSeated ? 0.7 : 1.1, isSeated ? 0.1 : 0]}
      />

      {/* PELVIS / HIPS ROOT */}
      {/* When seated: precisely rests on chair seat cushion at y = 0.55 */}
      <group position={[0, isSeated ? 0.55 : 0.88, isSeated ? -0.05 : 0]}>
        {/* Pelvis Core */}
        <mesh material={coreMaterial} castShadow>
          <sphereGeometry args={[0.13, 20, 16]} />
        </mesh>
        <mesh material={rimGlowMaterial} scale={1.06}>
          <sphereGeometry args={[0.13, 20, 16]} />
        </mesh>

        {/* TORSO & CHEST */}
        <group
          ref={torsoRef}
          position={[0, 0.2, isSeated ? -0.02 : 0]}
          rotation={isSeated ? [0.06, 0, 0] : [0, 0, 0]}
        >
          {/* Lower abdomen & waist */}
          <mesh position={[0, -0.06, 0]} material={coreMaterial} castShadow>
            <cylinderGeometry args={[0.11, 0.12, 0.16, 20]} />
          </mesh>
          <mesh position={[0, -0.06, 0]} material={rimGlowMaterial} scale={1.05}>
            <cylinderGeometry args={[0.11, 0.12, 0.16, 20]} />
          </mesh>

          {/* Upper Chest & Ribcage */}
          <mesh position={[0, 0.1, 0]} material={coreMaterial} castShadow>
            <cylinderGeometry args={[0.15, 0.11, 0.2, 20]} />
          </mesh>
          <mesh position={[0, 0.1, 0]} material={rimGlowMaterial} scale={1.06}>
            <cylinderGeometry args={[0.15, 0.11, 0.2, 20]} />
          </mesh>

          {/* Contoured Chest Curve */}
          <mesh position={[0, 0.11, 0.05]} material={coreMaterial}>
            <sphereGeometry args={[0.13, 20, 16]} />
          </mesh>

          {/* NECK & HEAD */}
          <group ref={headRef} position={[0, 0.24, 0]} rotation={isSeated ? [-0.04, 0, 0] : [0, 0, 0]}>
            {/* Neck */}
            <mesh position={[0, 0.03, 0]} material={coreMaterial}>
              <cylinderGeometry args={[0.045, 0.055, 0.08, 16]} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.16, 0.01]} material={coreMaterial} castShadow>
              <sphereGeometry args={[0.115, 24, 20]} />
            </mesh>
            <mesh position={[0, 0.16, 0.01]} material={rimGlowMaterial} scale={1.07}>
              <sphereGeometry args={[0.115, 24, 20]} />
            </mesh>

            {/* Jaw Contours */}
            <mesh position={[0, 0.12, 0.07]} rotation={[0.4, 0, 0]} material={coreMaterial}>
              <sphereGeometry args={[0.065, 16, 12]} />
            </mesh>

            {/* Cyber Visor Accents */}
            <mesh position={[0, 0.16, 0.08]} material={coreMaterial}>
              <boxGeometry args={[0.14, 0.03, 0.05]} />
            </mesh>
            <mesh position={[-0.12, 0.16, 0]} material={coreMaterial}>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
            </mesh>
            <mesh position={[0.12, 0.16, 0]} material={coreMaterial}>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
            </mesh>
          </group>

          {/* LEFT ARM & HAND (Keyboard / WASD Position) */}
          <group
            ref={leftArmRef}
            position={[-0.19, 0.16, 0]}
            rotation={isSeated ? [-0.55, 0.18, -0.15] : [0, 0, -0.1]}
          >
            {/* Shoulder */}
            <mesh material={coreMaterial} castShadow>
              <sphereGeometry args={[0.065, 16, 14]} />
            </mesh>
            <mesh material={rimGlowMaterial} scale={1.07}>
              <sphereGeometry args={[0.065, 16, 14]} />
            </mesh>

            {/* Upper Arm Bicep */}
            <mesh position={[0, -0.1, 0]} material={coreMaterial} castShadow>
              <cylinderGeometry args={[0.042, 0.036, 0.18, 16]} />
            </mesh>
            <mesh position={[0, -0.1, 0]} material={rimGlowMaterial} scale={1.06}>
              <cylinderGeometry args={[0.042, 0.036, 0.18, 16]} />
            </mesh>

            {/* Elbow & Forearm - Rests smoothly on desk surface */}
            <group
              ref={leftForearmRef}
              position={[0, -0.19, 0]}
              rotation={isSeated ? [-0.42, 0.22, 0] : [0, 0, 0]}
            >
              <mesh material={coreMaterial}>
                <sphereGeometry args={[0.038, 14, 12]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={coreMaterial} castShadow>
                <cylinderGeometry args={[0.036, 0.03, 0.16, 16]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={rimGlowMaterial} scale={1.06}>
                <cylinderGeometry args={[0.036, 0.03, 0.16, 16]} />
              </mesh>

              {/* Hand & Fingers on Keyboard */}
              <group position={[0, -0.18, 0]} rotation={isSeated ? [0.22, 0, -0.1] : [0, 0, 0]}>
                <mesh material={coreMaterial}>
                  <boxGeometry args={[0.045, 0.06, 0.02]} />
                </mesh>
                <mesh position={[-0.015, -0.035, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.04, 8]} />
                </mesh>
                <mesh position={[0, -0.038, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.045, 8]} />
                </mesh>
                <mesh position={[0.015, -0.035, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.04, 8]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* RIGHT ARM & HAND (Gaming Mouse Position) */}
          <group
            ref={rightArmRef}
            position={[0.19, 0.16, 0]}
            rotation={isSeated ? [-0.55, -0.18, 0.15] : [0, 0, 0.1]}
          >
            {/* Shoulder */}
            <mesh material={coreMaterial} castShadow>
              <sphereGeometry args={[0.065, 16, 14]} />
            </mesh>
            <mesh material={rimGlowMaterial} scale={1.07}>
              <sphereGeometry args={[0.065, 16, 14]} />
            </mesh>

            {/* Upper Arm Bicep */}
            <mesh position={[0, -0.1, 0]} material={coreMaterial} castShadow>
              <cylinderGeometry args={[0.042, 0.036, 0.18, 16]} />
            </mesh>
            <mesh position={[0, -0.1, 0]} material={rimGlowMaterial} scale={1.06}>
              <cylinderGeometry args={[0.042, 0.036, 0.18, 16]} />
            </mesh>

            {/* Elbow & Forearm - Rests smoothly on mouse pad */}
            <group
              ref={rightForearmRef}
              position={[0, -0.19, 0]}
              rotation={isSeated ? [-0.42, -0.22, 0] : [0, 0, 0]}
            >
              <mesh material={coreMaterial}>
                <sphereGeometry args={[0.038, 14, 12]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={coreMaterial} castShadow>
                <cylinderGeometry args={[0.036, 0.03, 0.16, 16]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={rimGlowMaterial} scale={1.06}>
                <cylinderGeometry args={[0.036, 0.03, 0.16, 16]} />
              </mesh>

              {/* Hand & Fingers on Mouse */}
              <group position={[0, -0.18, 0]} rotation={isSeated ? [0.22, 0, 0.1] : [0, 0, 0]}>
                <mesh material={coreMaterial}>
                  <boxGeometry args={[0.045, 0.06, 0.02]} />
                </mesh>
                <mesh position={[-0.015, -0.035, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.04, 8]} />
                </mesh>
                <mesh position={[0, -0.038, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.045, 8]} />
                </mesh>
                <mesh position={[0.015, -0.035, 0]} material={coreMaterial}>
                  <cylinderGeometry args={[0.007, 0.006, 0.04, 8]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* LEFT LEG - Ergonomically seated on chair, feet flat on floor */}
        <group
          ref={leftLegRef}
          position={[-0.1, -0.06, 0]}
          rotation={isSeated ? [-Math.PI / 2, 0.06, 0] : [0, 0, 0]}
        >
          {/* Hip Joint */}
          <mesh material={coreMaterial}>
            <sphereGeometry args={[0.065, 16, 14]} />
          </mesh>

          {/* Thigh (extends forward horizontally onto chair) */}
          <mesh position={[0, -0.16, 0]} material={coreMaterial} castShadow>
            <cylinderGeometry args={[0.06, 0.048, 0.32, 16]} />
          </mesh>
          <mesh position={[0, -0.16, 0]} material={rimGlowMaterial} scale={1.06}>
            <cylinderGeometry args={[0.06, 0.048, 0.32, 16]} />
          </mesh>

          {/* Knee & Calf (drops down vertically to floor) */}
          <group
            ref={leftCalfRef}
            position={[0, -0.32, 0]}
            rotation={isSeated ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
          >
            <mesh material={coreMaterial}>
              <sphereGeometry args={[0.048, 14, 12]} />
            </mesh>
            <mesh position={[0, -0.22, 0]} material={coreMaterial} castShadow>
              <cylinderGeometry args={[0.046, 0.036, 0.44, 16]} />
            </mesh>
            <mesh position={[0, -0.22, 0]} material={rimGlowMaterial} scale={1.06}>
              <cylinderGeometry args={[0.046, 0.036, 0.44, 16]} />
            </mesh>

            {/* Ankle & Foot (Rests flat on the floor at y = 0.0) */}
            <group position={[0, -0.45, 0.06]}>
              <mesh material={coreMaterial} castShadow>
                <boxGeometry args={[0.065, 0.04, 0.16]} />
              </mesh>
              <mesh material={rimGlowMaterial} scale={1.08}>
                <boxGeometry args={[0.065, 0.04, 0.16]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* RIGHT LEG - Ergonomically seated on chair, feet flat on floor */}
        <group
          ref={rightLegRef}
          position={[0.1, -0.06, 0]}
          rotation={isSeated ? [-Math.PI / 2, -0.06, 0] : [0, 0, 0]}
        >
          {/* Hip Joint */}
          <mesh material={coreMaterial}>
            <sphereGeometry args={[0.065, 16, 14]} />
          </mesh>

          {/* Thigh (extends forward horizontally onto chair) */}
          <mesh position={[0, -0.16, 0]} material={coreMaterial} castShadow>
            <cylinderGeometry args={[0.06, 0.048, 0.32, 16]} />
          </mesh>
          <mesh position={[0, -0.16, 0]} material={rimGlowMaterial} scale={1.06}>
            <cylinderGeometry args={[0.06, 0.048, 0.32, 16]} />
          </mesh>

          {/* Knee & Calf (drops down vertically to floor) */}
          <group
            ref={rightCalfRef}
            position={[0, -0.32, 0]}
            rotation={isSeated ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
          >
            <mesh material={coreMaterial}>
              <sphereGeometry args={[0.048, 14, 12]} />
            </mesh>
            <mesh position={[0, -0.22, 0]} material={coreMaterial} castShadow>
              <cylinderGeometry args={[0.046, 0.036, 0.44, 16]} />
            </mesh>
            <mesh position={[0, -0.22, 0]} material={rimGlowMaterial} scale={1.06}>
              <cylinderGeometry args={[0.046, 0.036, 0.44, 16]} />
            </mesh>

            {/* Ankle & Foot (Rests flat on the floor at y = 0.0) */}
            <group position={[0, -0.45, 0.06]}>
              <mesh material={coreMaterial} castShadow>
                <boxGeometry args={[0.065, 0.04, 0.16]} />
              </mesh>
              <mesh material={rimGlowMaterial} scale={1.08}>
                <boxGeometry args={[0.065, 0.04, 0.16]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
