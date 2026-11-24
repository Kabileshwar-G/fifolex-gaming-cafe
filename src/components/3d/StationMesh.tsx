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
  available: { label: 'Available', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  occupied: { label: 'Occupied', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  reserved: { label: 'Reserved', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  cleaning: { label: 'Cleaning', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  maintenance: { label: 'Maintenance', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
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

  // Luminous character neon colors matching the reference image (vibrant against light desks)
  const characterNeonColor = station.type === 'pc' ? (station.id.endsWith('1') ? '#0284C7' : '#E11D48')
    : station.type === 'ps5' ? '#059669'
    : station.type === 'racing' ? '#EA580C'
    : station.type === 'vr' ? '#7C3AED'
    : '#0284C7';

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
            color={isSelected ? '#2563EB' : statusColor}
            transparent
            opacity={isSelected ? 0.95 : 0.65}
          />
        </mesh>
      )}

      {/* Desk Surface - Clean Matte White Laminate */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.8]} />
        <meshStandardMaterial
          color={isSelected ? '#F0F9FF' : hovered ? '#F8FAFC' : '#FFFFFF'}
          roughness={0.2}
          metalness={0.05}
        />
      </mesh>

      {/* Desk Metal Legs - Brushed Aluminum Silver */}
      <mesh position={[-0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.7, 0.375, 0]} castShadow>
        <boxGeometry args={[0.06, 0.75, 0.7]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Desk Edge Strip - Status Accent */}
      <mesh position={[0, 0.74, 0.38]}>
        <boxGeometry args={[1.54, 0.03, 0.02]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>

      {/* Gaming Chair - Modern Light Studio Ergonomic Chair */}
      <group position={[0, 0.5, 0.55]}>
        {/* Chair Seat Cushion */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.1, 0.5]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
        </mesh>
        {/* Chair Backrest */}
        <mesh position={[0, 0.45, 0.2]} castShadow>
          <boxGeometry args={[0.5, 0.8, 0.1]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
        {/* Chair Lumbar Trim Edge */}
        <mesh position={[0, 0.45, 0.26]}>
          <boxGeometry args={[0.06, 0.7, 0.02]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>
      </group>

      {/* SEATED HUMANOID CHARACTER (When Station is Occupied) */}
      {/* Precisely aligned: sitting on chair at z=0.55, facing forward towards desk & monitor */}
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
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Monitor Screen Frame */}
      <mesh position={[0, 1.15, -0.2]} castShadow>
        <boxGeometry args={[station.type === 'racing' ? 1.4 : 0.95, 0.55, 0.04]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Monitor Screen Glass / Esports Display */}
      <mesh position={[0, 1.15, -0.178]}>
        <planeGeometry args={[station.type === 'racing' ? 1.35 : 0.9, 0.5]} />
        <meshBasicMaterial
          color={
            station.status === 'occupied'
              ? (station.type === 'pc' ? '#0284C7' : '#7C3AED')
              : '#334155'
          }
        />
      </mesh>

      {/* Keyboard & Gaming Mouse */}
      <mesh position={[-0.15, 0.795, 0.15]}>
        <boxGeometry args={[0.38, 0.015, 0.14]} />
        <meshStandardMaterial color="#1E293B" roughness={0.4} />
      </mesh>
      <mesh position={[0.22, 0.795, 0.15]}>
        <boxGeometry args={[0.07, 0.02, 0.11]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* Floating 3D Station Status Badge (Crisp High-Contrast White Pill) */}
      <Html position={[0, 1.75, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(station.id);
          }}
          className={`px-3 py-1.5 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-200 select-none shadow-lg ${
            isSelected
              ? 'bg-[#2563EB] text-white border-[#2563EB] scale-110 shadow-xl shadow-[#2563EB]/30'
              : 'bg-white/95 text-slate-800 border-slate-200 hover:border-[#2563EB] hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                backgroundColor: isSelected ? '#FFFFFF' : statusColor,
                boxShadow: isSelected ? 'none' : `0 0 4px ${statusColor}`,
              }}
            />
            <span className="font-mono font-bold text-xs">{station.name}</span>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
              &bull; {statusInfo.label}
            </span>
          </div>

          {station.status === 'occupied' && session && (
            <div className={`text-[10px] font-semibold truncate max-w-[130px] mt-0.5 ${isSelected ? 'text-white' : 'text-[#2563EB]'}`}>
              {session.customerName}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
