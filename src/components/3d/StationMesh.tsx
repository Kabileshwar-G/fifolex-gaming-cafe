"use client";

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Station, StationStatus } from '@/types';

interface StationMeshProps {
  station: Station;
  isSelected: boolean;
  onSelect: (stationId: string) => void;
}

const STATUS_COLORS: Record<StationStatus, string> = {
  available: '#10b981', // Emerald
  occupied: '#06b6d4', // Cyan
  reserved: '#f59e0b', // Amber
  cleaning: '#a855f7', // Purple
  maintenance: '#f43f5e', // Rose
};

export const StationMesh: React.FC<StationMeshProps> = ({ station, isSelected, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const statusColor = STATUS_COLORS[station.status] || '#10b981';

  return (
    <group
      ref={groupRef}
      position={station.position}
      rotation={station.rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(station.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Selection Glow Indicator ring on floor */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.15, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#818cf8' : statusColor}
            transparent
            opacity={isSelected ? 0.9 : 0.5}
          />
        </mesh>
      )}

      {/* Desk Top */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.8]} />
        <meshStandardMaterial
          color={isSelected ? '#2e354b' : hovered ? '#252b3d' : '#1a1f2c'}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>

      {/* Desk Metal Legs */}
      <mesh position={[-0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#0f131a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#0f131a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Gaming Chair */}
      <group position={[0, 0.5, 0.6]}>
        {/* Chair Seat */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.1, 0.5]} />
          <meshStandardMaterial color="#161b26" roughness={0.6} />
        </mesh>
        {/* Chair Backrest */}
        <mesh position={[0, 0.45, 0.2]} castShadow>
          <boxGeometry args={[0.5, 0.8, 0.1]} />
          <meshStandardMaterial color="#11141d" roughness={0.7} />
        </mesh>
        {/* Chair RGB Accent Strip */}
        <mesh position={[0, 0.45, 0.26]}>
          <boxGeometry args={[0.06, 0.7, 0.02]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>
      </group>

      {/* Monitor Display Stand */}
      <mesh position={[0, 0.83, -0.2]}>
        <cylinderGeometry args={[0.04, 0.08, 0.16, 16]} />
        <meshStandardMaterial color="#0a0c10" metalness={0.9} />
      </mesh>

      {/* Monitor Screen Frame */}
      <mesh position={[0, 1.15, -0.2]} castShadow>
        <boxGeometry args={[station.type === 'racing' ? 1.4 : 0.95, 0.55, 0.04]} />
        <meshStandardMaterial color="#0b0e14" metalness={0.8} />
      </mesh>

      {/* Glowing Screen Face */}
      <mesh position={[0, 1.15, -0.17]}>
        <planeGeometry args={[station.type === 'racing' ? 1.35 : 0.9, 0.5]} />
        <meshStandardMaterial
          color={station.status === 'occupied' ? '#082f49' : '#05070a'}
          emissive={statusColor}
          emissiveIntensity={station.status === 'occupied' ? 0.6 : station.status === 'maintenance' ? 0.8 : 0.25}
          roughness={0.2}
        />
      </mesh>

      {/* Station Status Light Bar under Desk Edge */}
      <mesh position={[0, 0.74, 0.38]}>
        <boxGeometry args={[1.5, 0.03, 0.02]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>

      {/* Computer Tower or Console Box */}
      {station.type === 'pc' && (
        <group position={[0.55, 0.38, -0.05]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.45, 0.45]} />
            <meshStandardMaterial color="#0d1117" metalness={0.7} />
          </mesh>
          {/* Glass Side Panel & Internal RGB */}
          <mesh position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.02, 0.4, 0.4]} />
            <meshBasicMaterial color={statusColor} transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {/* HTML 3D Station Floating Badge */}
      <Html
        position={[0, 1.6, -0.1]}
        center
        distanceFactor={15}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-transform ${
            isSelected
              ? 'ring-2 ring-indigo-400 bg-[#0e121d] scale-110'
              : 'bg-[#0a0d14]/90 backdrop-blur'
          } border border-gray-700/80`}
          style={{ borderColor: statusColor }}
        >
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-white">{station.name}</span>
        </div>
      </Html>
    </group>
  );
};
