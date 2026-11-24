"use client";

import React, { useState } from 'react';
import { Station, StationStatus, StationZone } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import {
  Monitor,
  Gamepad2,
  Cpu,
  Sparkles,
  Wrench,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react';

interface VenueMap2DProps {
  stations: Station[];
  selectedStationId: string | null;
  onSelectStation: (id: string | null) => void;
  currencySymbol: string;
}

const STATUS_PILL: Record<StationStatus, { label: string; bg: string; text: string }> = {
  available: { label: 'Available', bg: 'bg-[#CCFF00]/15 border-[#CCFF00]/40', text: 'text-[#CCFF00]' },
  occupied: { label: 'Occupied', bg: 'bg-[#8A2BE2]/20 border-[#8A2BE2]/40', text: 'text-[#c084fc]' },
  reserved: { label: 'Reserved', bg: 'bg-[#FF8C00]/20 border-[#FF8C00]/40', text: 'text-[#FF8C00]' },
  cleaning: { label: 'Cleaning', bg: 'bg-[#00F0FF]/15 border-[#00F0FF]/40', text: 'text-[#00F0FF]' },
  maintenance: { label: 'Maintenance', bg: 'bg-[#FF0055]/20 border-[#FF0055]/40', text: 'text-[#FF0055]' },
};

export const VenueMap2D: React.FC<VenueMap2DProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  currencySymbol
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredStations = stations.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.installedGames.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesZone = zoneFilter === 'all' || st.zone === zoneFilter;
    const matchesStatus = statusFilter === 'all' || st.status === statusFilter;
    return matchesSearch && matchesZone && matchesStatus;
  });

  const zones: StationZone[] = [
    'Main PC Arena',
    'VIP Console Lounge',
    'Sim Paddock',
    'VR Holo-Bay'
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#111111] text-white">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stations, platforms, or games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
          >
            <option value="all">All Zones</option>
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Grid of Stations Organized by Zone */}
      <div className="space-y-6">
        {zones.map(zoneName => {
          const zoneStations = filteredStations.filter(s => s.zone === zoneName);
          if (zoneStations.length === 0) return null;

          return (
            <div key={zoneName} className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-2">
                <h3 className="font-extrabold text-sm text-white tracking-wide">{zoneName}</h3>
                <span className="text-xs text-[#CCFF00] font-mono font-bold">
                  {zoneStations.filter(s => s.status === 'available').length}/{zoneStations.length} Free
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {zoneStations.map(st => {
                  const isSelected = st.id === selectedStationId;
                  const pill = STATUS_PILL[st.status];

                  return (
                    <div
                      key={st.id}
                      onClick={() => onSelectStation(st.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#252525] border-[#CCFF00] shadow-lg shadow-[#CCFF00]/20'
                          : 'bg-[#1E1E1E] border-[#2E2E2E] hover:border-gray-500 hover:bg-[#252525]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-extrabold text-white text-sm font-mono">{st.name}</span>
                          <span className="block text-[11px] text-gray-400 capitalize">{st.type}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${pill.bg} ${pill.text}`}>
                          {pill.label}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-gray-400 my-2">
                        {st.specs.gpu && (
                          <div className="truncate"><span className="text-gray-400">GPU:</span> {st.specs.gpu}</div>
                        )}
                        {st.specs.screen && (
                          <div className="truncate"><span className="text-gray-400">Screen:</span> {st.specs.screen}</div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#2E2E2E] text-xs">
                        <span className="font-extrabold text-white font-mono">
                          {formatCurrency(st.hourlyRateCents, currencySymbol)}/hr
                        </span>
                        <span className="text-[11px] text-[#CCFF00] font-bold hover:underline">
                          Inspect &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
