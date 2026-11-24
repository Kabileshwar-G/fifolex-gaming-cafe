"use client";

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Station, Session } from '@/types';
import { StationMesh } from './StationMesh';
import { HumanoidCharacter } from './HumanoidCharacter';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface VenueSceneProps {
  stations: Station[];
  sessions?: Session[];
  selectedStationId: string | null;
  onSelectStation: (id: string | null) => void;
}

// Clear, collision-free walkways for roaming characters (matching the reference art palette)
const ROAMING_PATHS: { name: string; neonColor: string; waypoints: [number, number, number][] }[] = [
  {
    name: "Cyan Sapphire Avatar",
    neonColor: "#00D2FF", // Electric Cyan
    waypoints: [
      [-7.5, 0, -2.75],
      [-3.5, 0, -2.75],
      [1.0, 0, -2.75],
      [5.5, 0, -2.75],
      [7.5, 0, -2.75],
      [7.5, 0, 0.2],
      [3.0, 0, 0.2],
      [-1.5, 0, 0.2],
      [-7.5, 0, 0.2]
    ]
  },
  {
    name: "Indigo Energy Avatar",
    neonColor: "#6366F1", // Royal Indigo
    waypoints: [
      [-6.5, 0, 3.5],
      [-2.0, 0, 3.5],
      [2.5, 0, 3.5],
      [7.0, 0, 3.5],
      [7.0, 0, 6.6],
      [1.0, 0, 6.6],
      [-6.5, 0, 6.6]
    ]
  },
  {
    name: "Emerald Mint Avatar",
    neonColor: "#10B981", // Emerald Mint
    waypoints: [
      [0, 0, -4.5],
      [0, 0, -2.75],
      [0, 0, 0.2],
      [0, 0, 3.5],
      [0, 0, 6.5],
      [-3.0, 0, 6.5],
      [-3.0, 0, 3.5],
      [0, 0, 3.5]
    ]
  },
  {
    name: "Magenta Avatar",
    neonColor: "#EC4899", // Magenta
    waypoints: [
      [6.5, 0, 6.2],
      [6.5, 0, 0.5],
      [6.5, 0, -3.5],
      [3.0, 0, -3.5],
      [3.0, 0, 0.5],
      [3.0, 0, 6.2]
    ]
  }
];

const ZoneFloorMarkers: React.FC = () => {
  return (
    <group position={[0, -0.01, 0]}>
      {/* Main Floor Base - Deep Midnight Obsidian #0A0E17 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color="#0A0E17" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Zone 1: Main PC Arena Perimeter (Cyan border accent) */}
      <mesh position={[0, 0.005, -2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 5]} />
        <meshBasicMaterial color="#121826" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.008, -2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.8, 8, 4]} />
        <meshBasicMaterial color="#00D2FF" transparent opacity={0.3} />
      </mesh>

      {/* Zone 2: VIP Console Lounge Perimeter (Indigo accent) */}
      <mesh position={[0, 0.005, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 3]} />
        <meshBasicMaterial color="#121826" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.008, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.8, 8, 4]} />
        <meshBasicMaterial color="#6366F1" transparent opacity={0.35} />
      </mesh>

      {/* Zone 3: Sim Racing Paddock */}
      <mesh position={[-3.75, 0.005, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 2.5]} />
        <meshBasicMaterial color="#121826" transparent opacity={0.8} />
      </mesh>

      {/* Zone 4: VR Holo-Bay */}
      <mesh position={[4.4, 0.005, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 2.5]} />
        <meshBasicMaterial color="#121826" transparent opacity={0.8} />
      </mesh>

      {/* Grid - Refined Slate Mesh */}
      <Grid
        position={[0, 0.01, 0]}
        args={[26, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1A2438"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#24334F"
        fadeDistance={32}
      />
    </group>
  );
};

export const VenueScene: React.FC<VenueSceneProps> = ({
  stations,
  sessions = [],
  selectedStationId,
  onSelectStation
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(0, 16, 18);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#0A0E17] select-none overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 16, 18], fov: 45 }}
        onPointerMissed={() => onSelectStation(null)}
      >
        <color attach="background" args={['#0A0E17']} />
        <fog attach="fog" args={['#0A0E17', 22, 52]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[10, 22, 15]}
          intensity={1.25}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        {/* Professional Esports Arena Accent Lights */}
        <pointLight position={[-8, 9, -5]} color="#00D2FF" intensity={1.2} />
        <pointLight position={[8, 9, 5]} color="#6366F1" intensity={1.1} />
        <pointLight position={[0, 8, 2]} color="#10B981" intensity={0.7} />

        {/* Scene Objects */}
        <Suspense fallback={null}>
          <ZoneFloorMarkers />

          {/* Gaming Stations with Seated Characters when Occupied */}
          {stations.map((st) => {
            const activeSession = sessions.find(s => s.stationId === st.id && (s.status === 'active' || s.status === 'paused'));
            return (
              <StationMesh
                key={st.id}
                station={st}
                session={activeSession}
                isSelected={st.id === selectedStationId}
                onSelect={onSelectStation}
              />
            );
          })}

          {/* Roaming Humanoid Characters Wandering Along Hallways */}
          {ROAMING_PATHS.map((char) => (
            <HumanoidCharacter
              key={char.name}
              name={char.name}
              neonColor={char.neonColor}
              pose="walking"
              position={char.waypoints[0]}
              waypoints={char.waypoints}
              scale={0.92}
            />
          ))}
        </Suspense>

        {/* Camera Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={6}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.1} // Prevent dipping beneath floor
        />
      </Canvas>

      {/* Floating Camera Reset and Instructions */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="px-3.5 py-2 bg-[#121826]/90 backdrop-blur border border-[#1F293D] rounded-xl text-xs text-[#F8FAFC] shadow-2xl">
          <span className="font-bold text-[#00D2FF]">Controls:</span> Left Click Orbit &bull;{' '}
          Right Click Pan &bull; Scroll Zoom &bull; Click Pod to Inspect
        </div>
        <button
          onClick={resetCamera}
          className="self-start px-3.5 py-1.5 bg-[#00D2FF] hover:bg-[#00B4D8] text-[#0A0E17] rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#00D2FF]/20"
        >
          Reset Camera
        </button>
      </div>

      {/* Legend with Status and Humanoid Characters indication */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 text-[11px] bg-[#121826]/95 backdrop-blur p-3 rounded-2xl border border-[#1F293D] shadow-2xl">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          Available
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/40 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-[#00D2FF]" />
          Occupied (Seated Gamer)
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          Reserved
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#8B5CF6]/15 text-[#C084FC] border border-[#8B5CF6]/40 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          Cleaning
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          Maintenance
        </span>
      </div>
    </div>
  );
};
