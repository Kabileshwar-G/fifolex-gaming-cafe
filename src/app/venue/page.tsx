"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { VenueScene } from '@/components/3d/VenueScene';
import { VenueMap2D } from '@/components/3d/VenueMap2D';
import { StationDetailsDrawer } from '@/components/3d/StationDetailsDrawer';
import { Box, Layers, Sliders, RefreshCw, Sparkles } from 'lucide-react';

export default function VenuePage() {
  const { stations, selectedStationId, selectStation, settings } = useApp();
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [isEditLayoutMode, setIsEditLayoutMode] = useState(false);

  const selectedStation = stations.find(s => s.id === selectedStationId);

  return (
    <div className="flex h-full relative overflow-hidden bg-[#07080c]">
      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Top Control Bar */}
        <div className="h-14 px-4 border-b border-[#1a1f2c] bg-[#0c0e14]/90 backdrop-blur flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              Venue & Station Control Surface
            </h2>
            <span className="text-xs text-gray-400 hidden md:inline">
              &bull; Click any station to inspect, start sessions, or manage equipment.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 3D vs 2D Toggle */}
            <div className="flex p-0.5 rounded-lg bg-[#141824] border border-[#232838]">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === '3d'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                3D Venue
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === '2d'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                2D Floor Plan
              </button>
            </div>
          </div>
        </div>

        {/* View Surface */}
        <div className="flex-1 relative overflow-hidden">
          {viewMode === '3d' ? (
            <VenueScene
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={selectStation}
            />
          ) : (
            <div className="h-full overflow-y-auto">
              <VenueMap2D
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={selectStation}
                currencySymbol={settings.currencySymbol}
              />
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Station Details Drawer */}
      {selectedStation && (
        <StationDetailsDrawer
          station={selectedStation}
          onClose={() => selectStation(null)}
        />
      )}
    </div>
  );
}
