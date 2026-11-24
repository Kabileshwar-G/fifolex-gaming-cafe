"use client";

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Station } from '@/types';
import { StationMesh } from './StationMesh';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface VenueSceneProps {
  stations: Station[];
  selectedStationId: string | null;
  onSelectStation: (id: string | null) => void;
}

const ZoneFloorMarkers: React.FC = () => {
  return (
    <group position={[0, -0.01, 0]}>
      {/* Main Floor Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color="#090b10" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Zone 1: Main PC Arena Perimeter */}
      <mesh position={[0, 0.005, -2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 5]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.6} />
      </mesh>

      {/* Zone 2: VIP Console Lounge Perimeter */}
      <mesh position={[0, 0.005, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 3]} />
        <meshBasicMaterial color="#172554" transparent opacity={0.4} />
      </mesh>

      {/* Zone 3: Sim Racing Paddock */}
      <mesh position={[-3.75, 0.005, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 2.5]} />
        <meshBasicMaterial color="#311042" transparent opacity={0.4} />
      </mesh>

      {/* Zone 4: VR Holo-Bay */}
      <mesh position={[4.4, 0.005, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 2.5]} />
        <meshBasicMaterial color="#064e3b" transparent opacity={0.4} />
      </mesh>

      {/* Neon Floor Grid */}
      <Grid
        position={[0, 0.01, 0]}
        args={[26, 20]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#334155"
        fadeDistance={30}
      />
    </group>
  );
};

export const VenueScene: React.FC<VenueSceneProps> = ({
  stations,
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
    <div className="relative w-full h-full min-h-[500px] bg-[#07080c] select-none overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 16, 18], fov: 45 }}
        onPointerMissed={() => onSelectStation(null)}
      >
        <color attach="background" args={['#07080c']} />
        <fog attach="fog" args={['#07080c', 20, 45]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 15]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <pointLight position={[-8, 8, -5]} color="#6366f1" intensity={0.8} />
        <pointLight position={[8, 8, 5]} color="#06b6d4" intensity={0.8} />

        {/* Scene Objects */}
        <Suspense fallback={null}>
          <ZoneFloorMarkers />

          {stations.map((st) => (
            <StationMesh
              key={st.id}
              station={st}
              isSelected={st.id === selectedStationId}
              onSelect={onSelectStation}
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
        <div className="px-3 py-1.5 bg-[#0e121c]/80 backdrop-blur border border-gray-800 rounded-lg text-xs text-gray-400">
          <span className="font-semibold text-gray-200">Orbit:</span> Left Click + Drag &bull;{' '}
          <span className="font-semibold text-gray-200">Pan:</span> Right Click &bull;{' '}
          <span className="font-semibold text-gray-200">Zoom:</span> Scroll
        </div>
        <button
          onClick={resetCamera}
          className="self-start px-3 py-1 bg-[#141824]/90 hover:bg-[#1f2638] border border-gray-700/80 rounded-md text-xs font-medium text-cyan-300 transition-colors shadow-lg"
        >
          Reset Camera View
        </button>
      </div>

      {/* Zone Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 text-[11px] bg-[#0c0e14]/85 backdrop-blur p-2.5 rounded-xl border border-gray-800">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Available
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          Occupied
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Reserved
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          Cleaning
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          Maintenance
        </span>
      </div>
    </div>
  );
};
