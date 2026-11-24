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
  available: { label: 'Available', color: '#CCFF00', bg: 'rgba(204, 255, 0, 0.15)' },
  occupied: { label: 'Occupied', color: '#8A2BE2', bg: 'rgba(138, 43, 226, 0.25)' },
  reserved: { label: 'Reserved', color: '#FF8C00', bg: 'rgba(255, 140, 0, 0.2)' },
  cleaning: { label: 'Cleaning', color: '#00F0FF', bg: 'rgba(0, 240, 255, 0.2)' },
  maintenance: { label: 'Maintenance', color: '#FF0055', bg: 'rgba(255, 0, 85, 0.25)' },
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

  // Luminous character neon colors matching the reference image
  const characterNeonColor = station.type === 'pc' ? (station.id.endsWith('1') ? '#00F0FF' : '#FF007F')
    : station.type === 'ps5' ? '#CCFF00'
    : station.type === 'racing' ? '#FF5500'
    : station.type === 'vr' ? '#8A2BE2'
    : '#FFE600';

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
            color={isSelected ? '#CCFF00' : statusColor}
            transparent
            opacity={isSelected ? 0.95 : 0.65}
          />
        </mesh>
      )}

      {/* Desk Surface - Dark Gunmetal #1E1E1E */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.8]} />
        <meshStandardMaterial
          color={isSelected ? '#2A2A2A' : hovered ? '#242424' : '#1E1E1E'}
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Desk Metal Legs - Matte Carbon #111111 */}
      <mesh position={[-0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Desk Edge Strip - Acid Green / Ultraviolet Accent */}
      <mesh position={[0, 0.74, 0.38]}>
        <boxGeometry args={[1.54, 0.03, 0.02]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>

      {/* Gaming Chair - Gunmetal with Ultraviolet trim */}
      <group position={[0, 0.5, 0.55]}>
        {/* Chair Seat */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.1, 0.5]} />
          <meshStandardMaterial color="#1E1E1E" roughness={0.5} />
        </mesh>
        {/* Chair Backrest */}
        <mesh position={[0, 0.45, 0.2]} castShadow>
          <boxGeometry args={[0.5, 0.8, 0.1]} />
          <meshStandardMaterial color="#171717" roughness={0.6} />
        </mesh>
        {/* Chair Lumbar Trim Edge */}
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
            pose="seated"
            scale={0.94}
          />
        </group>
      )}

      {/* Monitor Display Stand */}
      <mesh position={[0, 0.83, -0.2]}>
        <cylinderGeometry args={[0.04, 0.08, 0.16, 16]} />
        <meshStandardMaterial color="#111111" metalness={0.95} />
      </mesh>

      {/* Monitor Screen Frame */}
      <mesh position={[0, 1.15, -0.2]} castShadow>
        <boxGeometry args={[station.type === 'racing' ? 1.4 : 0.95, 0.55, 0.04]} />
        <meshStandardMaterial color="#111111" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Glowing Screen Face */}
      <mesh position={[0, 1.15, -0.17]}>
        <planeGeometry args={[station.type === 'racing' ? 1.35 : 0.9, 0.5]} />
        <meshStandardMaterial
          color={station.status === 'occupied' ? '#180a29' : '#0a0a0a'}
          emissive={statusColor}
          emissiveIntensity={station.status === 'occupied' ? 0.8 : station.status === 'maintenance' ? 0.9 : 0.25}
          roughness={0.15}
        />
      </mesh>

      {/* Computer Tower or Console Box */}
      {station.type === 'pc' && (
        <group position={[0.55, 0.38, -0.05]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.45, 0.45]} />
            <meshStandardMaterial color="#1E1E1E" metalness={0.8} roughness={0.3} />
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
              ? 'ring-2 ring-[#CCFF00] bg-[#1E1E1E] scale-110 shadow-[0_0_15px_rgba(204,255,0,0.5)]'
              : 'bg-[#1E1E1E]/95 backdrop-blur'
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
              className="text-[9px] uppercase px-1 rounded font-sans font-bold"
              style={{ color: statusColor }}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Show player name if occupied */}
          {station.status === 'occupied' && session && (
            <div className="text-[10px] text-[#CCFF00] font-sans font-bold truncate max-w-[120px]">
              👤 {session.customerName}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
