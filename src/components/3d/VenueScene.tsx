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

// Clear, collision-free walkways for roaming characters (vibrant colors standing out against light room)
const ROAMING_PATHS: { name: string; neonColor: string; waypoints: [number, number, number][] }[] = [
  {
    name: "Sky Cyan Avatar",
    neonColor: "#0284C7", // Sky Blue
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
    name: "Royal Purple Avatar",
    neonColor: "#7C3AED", // Royal Purple
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
    neonColor: "#059669", // Emerald Green
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
    name: "Hot Magenta Avatar",
    neonColor: "#E11D48", // Rose Red
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
      {/* Main Architectural Studio Floor - Polished Light Terrazzo #E8EEF5 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color="#E8EEF5" roughness={0.25} metalness={0.08} />
      </mesh>

      {/* Zone 1: Main PC Arena Perimeter (Clean White Pod Deck with Sky Blue border) */}
      <mesh position={[0, 0.005, -2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.008, -2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.8, 8, 4]} />
        <meshBasicMaterial color="#0284C7" transparent opacity={0.4} />
      </mesh>

      {/* Zone 2: VIP Console Lounge Perimeter (Clean White Deck with Violet border) */}
      <mesh position={[0, 0.005, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 3]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.008, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.8, 8, 4]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.4} />
      </mesh>

      {/* Zone 3: Sim Racing Paddock */}
      <mesh position={[-3.75, 0.005, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 2.5]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* Zone 4: VR Holo-Bay */}
      <mesh position={[4.4, 0.005, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 2.5]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* Grid - Refined Silver Architectural Grid */}
      <Grid
        position={[0, 0.01, 0]}
        args={[26, 20]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#CBD5E1"
        sectionSize={5}
        sectionThickness={1.4}
        sectionColor="#94A3B8"
        fadeDistance={34}
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
    <div className="relative w-full h-full min-h-[500px] bg-[#F1F5F9] select-none overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 16, 18], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => onSelectStation(null)}
      >
        <color attach="background" args={['#F1F5F9']} />
        <fog attach="fog" args={['#F1F5F9', 24, 56]} />

        {/* Studio Daylight & Ambient Lighting - Crisp, Bright Visibility */}
        <ambientLight intensity={1.1} />
        <directionalLight
          position={[12, 26, 18]}
          intensity={1.65}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        {/* Soft fill lights */}
        <pointLight position={[-8, 12, -5]} color="#E0F2FE" intensity={0.9} />
        <pointLight position={[8, 12, 5]} color="#EDE9FE" intensity={0.8} />
        <pointLight position={[0, 10, 2]} color="#FFFFFF" intensity={0.8} />

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

      {/* Floating Camera Reset and Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="px-3.5 py-2 bg-white/95 backdrop-blur border border-slate-200 rounded-xl text-xs text-slate-800 shadow-xl">
          <span className="font-bold text-[#2563EB]">Controls:</span> Left Click Orbit &bull;{' '}
          Right Click Pan &bull; Scroll Zoom &bull; Click Pod to Inspect
        </div>
        <button
          onClick={resetCamera}
          className="self-start px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#2563EB]/25"
        >
          Reset Camera
        </button>
      </div>

      {/* Legend with Status and Humanoid Characters indication */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 text-[11px] bg-white/95 backdrop-blur p-3 rounded-2xl border border-slate-200 shadow-xl">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Available
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          Occupied (Seated Gamer)
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Reserved
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          Cleaning
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-600" />
          Maintenance
        </span>
      </div>
    </div>
  );
};
