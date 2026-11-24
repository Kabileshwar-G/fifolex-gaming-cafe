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
  available: { label: 'Available', bg: 'bg-[#10B981]/15 border-[#10B981]/40', text: 'text-[#10B981]' },
  occupied: { label: 'Occupied', bg: 'bg-[#00D2FF]/15 border-[#00D2FF]/40', text: 'text-[#00D2FF]' },
  reserved: { label: 'Reserved', bg: 'bg-[#F59E0B]/15 border-[#F59E0B]/40', text: 'text-[#F59E0B]' },
  cleaning: { label: 'Cleaning', bg: 'bg-[#8B5CF6]/15 border-[#8B5CF6]/40', text: 'text-[#C084FC]' },
  maintenance: { label: 'Maintenance', bg: 'bg-[#EF4444]/15 border-[#EF4444]/40', text: 'text-[#EF4444]' },
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
    <div className="p-4 sm:p-6 space-y-6 bg-[#0A0E17] text-white">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stations, platforms, or games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121826] border border-[#1F293D] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-[#121826] border border-[#1F293D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D2FF]"
          >
            <option value="all">All Zones</option>
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121826] border border-[#1F293D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D2FF]"
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
              <div className="flex items-center justify-between pb-2 border-b border-[#1F293D]">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D2FF]" />
                  {zoneName}
                </h3>
                <span className="text-xs text-[#94A3B8] font-mono">
                  {zoneStations.filter(s => s.status === 'available').length}/{zoneStations.length} Pods Free
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {zoneStations.map(station => {
                  const isSelected = station.id === selectedStationId;
                  const statusInfo = STATUS_PILL[station.status];

                  return (
                    <div
                      key={station.id}
                      onClick={() => onSelectStation(station.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-[#161F32] border-[#00D2FF] shadow-lg shadow-[#00D2FF]/20 scale-102'
                          : 'bg-[#121826] border-[#1F293D] hover:border-[#2D3E5D]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono font-bold text-sm text-white">{station.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#94A3B8]">
                        <span className="block truncate">{station.specs.gpu || station.specs.platform}</span>
                        <span className="font-mono font-bold text-[#10B981] mt-1 block">
                          {formatCurrency(station.hourlyRateCents, currencySymbol)}/hr
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
