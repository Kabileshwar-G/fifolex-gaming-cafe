"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { VenueScene } from '@/components/3d/VenueScene';
import { VenueMap2D } from '@/components/3d/VenueMap2D';
import { StationDetailsDrawer } from '@/components/3d/StationDetailsDrawer';
import { Box, Layers, Sliders, RefreshCw, Sparkles } from 'lucide-react';

export default function VenuePage() {
  const { stations, sessions, selectedStationId, selectStation, settings } = useApp();
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const selectedStation = stations.find(s => s.id === selectedStationId);

  return (
    <div className="flex h-full relative overflow-hidden bg-[#111111]">
      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Top Control Bar */}
        <div className="h-14 px-4 border-b border-[#262626] bg-[#161616]/95 backdrop-blur flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Box className="w-4 h-4 text-[#CCFF00]" />
              3D Venue & Station Control Surface
            </h2>
            <span className="text-xs text-gray-400 hidden md:inline font-mono">
              &bull; Click any pod to inspect, launch sessions, or manage hardware.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 3D vs 2D Toggle */}
            <div className="flex p-0.5 rounded-xl bg-[#202020] border border-[#2E2E2E]">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === '3d'
                    ? 'bg-[#CCFF00] text-[#111111] shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                3D Venue
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === '2d'
                    ? 'bg-[#CCFF00] text-[#111111] shadow-sm'
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
        <div className="flex-1 relative overflow-hidden bg-[#111111]">
          {viewMode === '3d' ? (
            <VenueScene
              stations={stations}
              sessions={sessions}
              selectedStationId={selectedStationId}
              onSelectStation={selectStation}
            />
          ) : (
            <div className="h-full overflow-y-auto bg-[#111111]">
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
