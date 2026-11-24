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
  available: { label: 'Available', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  occupied: { label: 'Occupied', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  reserved: { label: 'Reserved', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  cleaning: { label: 'Cleaning', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  maintenance: { label: 'Maintenance', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
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
    <div className="p-4 sm:p-6 space-y-6 bg-[#F8FAFC] text-slate-900">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stations, platforms, or games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2563EB] shadow-sm"
          >
            <option value="all">All Zones</option>
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2563EB] shadow-sm"
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
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  {zoneName}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
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
                          ? 'bg-blue-50/70 border-[#2563EB] shadow-md scale-102'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono font-bold text-sm text-slate-900">{station.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        <span className="block truncate">{station.specs.gpu || station.specs.platform}</span>
                        <span className="font-mono font-bold text-emerald-600 mt-1 block">
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
