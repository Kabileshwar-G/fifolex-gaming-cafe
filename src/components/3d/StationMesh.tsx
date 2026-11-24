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
  available: { label: 'Available', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  occupied: { label: 'Occupied', color: '#00D2FF', bg: 'rgba(0, 210, 255, 0.20)' },
  reserved: { label: 'Reserved', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.18)' },
  cleaning: { label: 'Cleaning', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.20)' },
  maintenance: { label: 'Maintenance', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.22)' },
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
  const characterNeonColor = station.type === 'pc' ? (station.id.endsWith('1') ? '#00D2FF' : '#EC4899')
    : station.type === 'ps5' ? '#10B981'
    : station.type === 'racing' ? '#F97316'
    : station.type === 'vr' ? '#8B5CF6'
    : '#00D2FF';

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
            color={isSelected ? '#00D2FF' : statusColor}
            transparent
            opacity={isSelected ? 0.95 : 0.65}
          />
        </mesh>
      )}

      {/* Desk Surface - Dark Slate Navy #121826 */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.8]} />
        <meshStandardMaterial
          color={isSelected ? '#1A2338' : hovered ? '#161F32' : '#121826'}
          roughness={0.25}
          metalness={0.65}
        />
      </mesh>

      {/* Desk Metal Legs - Deep Obsidian #0A0E17 */}
      <mesh position={[-0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#0A0E17" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#0A0E17" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Desk Edge Strip - Status Accent */}
      <mesh position={[0, 0.74, 0.38]}>
        <boxGeometry args={[1.54, 0.03, 0.02]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>

      {/* Gaming Chair - Sleek Ergonomic Mesh in #121826 with Status Trim */}
      <group position={[0, 0.5, 0.55]}>
        {/* Chair Seat Cushion */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.1, 0.5]} />
          <meshStandardMaterial color="#161F32" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Chair Backrest */}
        <mesh position={[0, 0.45, 0.2]} castShadow>
          <boxGeometry args={[0.5, 0.8, 0.1]} />
          <meshStandardMaterial color="#0E1422" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Chair Lumbar Trim Edge */}
        <mesh position={[0, 0.45, 0.26]}>
          <boxGeometry args={[0.06, 0.7, 0.02]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>
      </group>

      {/* SEATED HUMANOID CHARACTER (When Station is Occupied) */}
      {/* Precisely aligned: sitting on chair at z=0.55, rotated Math.PI so facing forward towards desk & monitor */}
      {station.status === 'occupied' && (
        <group position={[0, 0, 0.55]} rotation={[0, Math.PI, 0]}>
          <HumanoidCharacter
            name={session?.customerName || "Player"}
            neonColor={characterNeonColor}
            pose="seated"
            scale={0.95}
          />
        </group>
      )}

      {/* Monitor Display Stand */}
      <mesh position={[0, 0.83, -0.2]}>
        <cylinderGeometry args={[0.04, 0.08, 0.16, 16]} />
        <meshStandardMaterial color="#0A0E17" metalness={0.9} />
      </mesh>

      {/* Monitor Screen Frame */}
      <mesh position={[0, 1.15, -0.2]} castShadow>
        <boxGeometry args={[station.type === 'racing' ? 1.4 : 0.95, 0.55, 0.04]} />
        <meshStandardMaterial color="#0A0E17" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Monitor Screen Glass / Esports Display */}
      <mesh position={[0, 1.15, -0.178]}>
        <planeGeometry args={[station.type === 'racing' ? 1.35 : 0.9, 0.5]} />
        <meshBasicMaterial
          color={
            station.status === 'occupied'
              ? (station.type === 'pc' ? '#00D2FF' : '#6366F1')
              : '#0E1422'
          }
        />
      </mesh>

      {/* Keyboard & Gaming Mouse */}
      <mesh position={[-0.15, 0.795, 0.15]}>
        <boxGeometry args={[0.38, 0.015, 0.14]} />
        <meshStandardMaterial color="#0A0E17" roughness={0.3} />
      </mesh>
      <mesh position={[0.22, 0.795, 0.15]}>
        <boxGeometry args={[0.07, 0.02, 0.11]} />
        <meshStandardMaterial color="#161F32" roughness={0.3} />
      </mesh>

      {/* Floating 3D Station Status Badge */}
      <Html position={[0, 1.75, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(station.id);
          }}
          className={`px-3 py-1.5 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-200 select-none shadow-xl ${
            isSelected
              ? 'bg-[#00D2FF] text-[#0A0E17] border-[#00D2FF] scale-110 shadow-lg shadow-[#00D2FF]/30'
              : 'bg-[#121826]/90 text-white border-[#1F293D] hover:border-[#00D2FF]'
          }`}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                backgroundColor: isSelected ? '#0A0E17' : statusColor,
                boxShadow: isSelected ? 'none' : `0 0 6px ${statusColor}`,
              }}
            />
            <span className="font-mono font-bold text-xs">{station.name}</span>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-[#0A0E17]' : 'text-[#94A3B8]'}`}>
              &bull; {statusInfo.label}
            </span>
          </div>

          {station.status === 'occupied' && session && (
            <div className={`text-[10px] font-medium truncate max-w-[130px] mt-0.5 ${isSelected ? 'text-[#0A0E17]' : 'text-[#00D2FF]'}`}>
              {session.customerName}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
