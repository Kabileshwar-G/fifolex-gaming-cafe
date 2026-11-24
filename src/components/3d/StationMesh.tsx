"use client";

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Station, StationStatus, Session } from '@/types';
import { HumanoidCharacter } from './HumanoidCharacter';

interface StationMeshProps {
  station: Station;
  session?: Session;
  isSelected: boolean;
  onSelect: (stationId: string) => void;
}

const STATUS_CONFIG: Record<StationStatus, { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: '#10b981', bg: 'rgba(6, 78, 59, 0.9)' },
  occupied: { label: 'Occupied', color: '#06b6d4', bg: 'rgba(8, 47, 73, 0.9)' },
  reserved: { label: 'Reserved', color: '#f59e0b', bg: 'rgba(120, 53, 15, 0.9)' },
  cleaning: { label: 'Cleaning', color: '#a855f7', bg: 'rgba(88, 28, 135, 0.9)' },
  maintenance: { label: 'Maintenance', color: '#f43f5e', bg: 'rgba(136, 19, 55, 0.9)' },
};

export const StationMesh: React.FC<StationMeshProps> = ({
  station,
  session,
  isSelected,
  onSelect
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const statusInfo = STATUS_CONFIG[station.status] || STATUS_CONFIG.available;
  const statusColor = statusInfo.color;

  // Determine seated character neon accent
  const characterNeonColor = station.type === 'pc' ? '#00f0ff'
    : station.type === 'ps5' ? '#3b82f6'
    : station.type === 'racing' ? '#ff007f'
    : station.type === 'vr' ? '#10b981'
    : '#f59e0b';

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
      {/* Floor selection glow ring */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.05, 1.25, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#818cf8' : statusColor}
            transparent
            opacity={isSelected ? 0.95 : 0.6}
          />
        </mesh>
      )}

      {/* Desk Surface */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.8]} />
        <meshStandardMaterial
          color={isSelected ? '#2e354b' : hovered ? '#252b3d' : '#141824'}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Desk Metal Legs */}
      <mesh position={[-0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#0b0e14" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#0b0e14" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Gaming Chair */}
      <group position={[0, 0.5, 0.55]}>
        {/* Chair Seat */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.1, 0.5]} />
          <meshStandardMaterial color="#161b26" roughness={0.6} />
        </mesh>
        {/* Chair Backrest */}
        <mesh position={[0, 0.45, 0.2]} castShadow>
          <boxGeometry args={[0.5, 0.8, 0.1]} />
          <meshStandardMaterial color="#0f131a" roughness={0.7} />
        </mesh>
        {/* Chair RGB Accent Edge */}
        <mesh position={[0, 0.45, 0.26]}>
          <boxGeometry args={[0.06, 0.7, 0.02]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>
      </group>

      {/* SEATED HUMANOID CHARACTER (When Station is Occupied) */}
      {station.status === 'occupied' && (
        <group position={[0, 0, 0.55]} rotation={[0, 0, 0]}>
          <HumanoidCharacter
            name={session?.customerName || "Player"}
            neonColor={characterNeonColor}
            secondaryColor="#151b2a"
            pose="seated"
            scale={0.92}
          />
        </group>
      )}

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
          emissiveIntensity={station.status === 'occupied' ? 0.75 : station.status === 'maintenance' ? 0.85 : 0.25}
          roughness={0.2}
        />
      </mesh>

      {/* Desk Edge RGB Strip */}
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
          <mesh position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.02, 0.4, 0.4]} />
            <meshBasicMaterial color={statusColor} transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {/* Clear, Readable HTML 3D Station Label / Status Badge */}
      <Html
        position={[0, 1.68, -0.1]}
        center
        distanceFactor={14}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wide flex flex-col items-center gap-0.5 shadow-2xl transition-all ${
            isSelected
              ? 'ring-2 ring-indigo-400 bg-[#0e121d] scale-110 shadow-indigo-950/60'
              : 'bg-[#0a0d14]/95 backdrop-blur'
          } border`}
          style={{ borderColor: statusColor }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-white font-extrabold">{station.name}</span>
            <span
              className="text-[9px] uppercase px-1 rounded font-sans"
              style={{ color: statusColor }}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Show player name if occupied */}
          {station.status === 'occupied' && session && (
            <div className="text-[10px] text-cyan-300 font-sans font-medium truncate max-w-[120px]">
              👤 {session.customerName}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
