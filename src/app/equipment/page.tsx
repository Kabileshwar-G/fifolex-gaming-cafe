"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { MaintenanceIssue, IssueSeverity, IssueStatus } from '@/types';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Gamepad2,
  Cpu,
  Monitor,
  X,
  Search,
  Filter
} from 'lucide-react';

const SEVERITY_BADGE: Record<IssueSeverity, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: 'Critical', bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-700/60' },
  high: { label: 'High', bg: 'bg-orange-950/60', text: 'text-orange-400', border: 'border-orange-700/60' },
  medium: { label: 'Medium', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-700/60' },
  low: { label: 'Low Priority', bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-700/60' },
};

export default function EquipmentPage() {
  const {
    stations,
    issues,
    reportMaintenanceIssue,
    updateMaintenanceIssue,
    currentStaff
  } = useApp();

  const [activeTab, setActiveTab] = useState<'issues' | 'hardware' | 'games'>('issues');
  const [showReportModal, setShowReportModal] = useState(false);

  // New Issue Form
  const [selectedStationId, setSelectedStationId] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [description, setDescription] = useState('');

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stations.find(s => s.id === selectedStationId);
    if (!st || !description.trim()) return;

    reportMaintenanceIssue({
      stationId: st.id,
      stationName: st.name,
      severity,
      description: description.trim(),
      reportedBy: `${currentStaff.name} (${currentStaff.role})`
    });

    setShowReportModal(false);
    setSelectedStationId('');
    setDescription('');
    setSeverity('medium');
  };

  // Extract all games across stations
  const gameStatsMap: Record<string, { title: string; count: number; platforms: Set<string> }> = {};
  stations.forEach(st => {
    st.installedGames.forEach(game => {
      if (!gameStatsMap[game]) {
        gameStatsMap[game] = { title: game, count: 0, platforms: new Set() };
      }
      gameStatsMap[game].count += 1;
      gameStatsMap[game].platforms.add(st.type.toUpperCase());
    });
  });
  const allGames = Object.values(gameStatsMap).sort((a, b) => b.count - a.count);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-rose-400" />
            Equipment Inventory & Maintenance Logs
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Hardware health diagnostics, fault reports, and platform game libraries.
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Report Equipment Fault
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'issues'
              ? 'bg-rose-950/60 text-rose-300 border border-rose-700/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Maintenance Tracker ({issues.filter(i => i.status !== 'resolved').length} open)
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'hardware'
              ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Hardware Fleet ({stations.length} Pods)
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'games'
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          Pre-Loaded Game Library ({allGames.length} Titles)
        </button>
      </div>

      {/* TAB 1: MAINTENANCE TRACKER */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {issues.length === 0 ? (
            <div className="p-12 text-center bg-[#0d1017] border border-gray-800 rounded-2xl text-gray-500">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
              <p className="font-semibold text-gray-200">Zero Outstanding Hardware Faults</p>
              <p className="text-xs text-gray-500 mt-1">All stations, peripherals, and rigs are 100% operational.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issues.map(issue => {
                const badge = SEVERITY_BADGE[issue.severity];
                return (
                  <div
                    key={issue.id}
                    className="p-4 rounded-2xl bg-[#0e121c] border border-[#1f2538] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-white text-base">{issue.stationName}</span>
                          <span className="text-xs text-gray-400 block">Reported by {issue.reportedBy}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-xs text-gray-200 mt-2 p-2.5 rounded-xl bg-[#090b10] border border-gray-800">
                        {issue.description}
                      </p>

                      {issue.resolutionNotes && (
                        <p className="text-[11px] text-cyan-300 mt-2 bg-cyan-950/30 p-2 rounded border border-cyan-900/40">
                          Resolution: {issue.resolutionNotes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        Status: <strong className="capitalize text-white">{issue.status}</strong>
                      </span>

                      <div className="flex gap-2">
                        {issue.status !== 'resolved' && (
                          <button
                            onClick={() => {
                              const note = prompt("Enter resolution summary / part replaced:");
                              if (note) updateMaintenanceIssue(issue.id, { status: 'resolved', resolutionNotes: note });
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                          >
                            Mark Fixed
                          </button>
                        )}
                        {issue.status === 'open' && (
                          <button
                            onClick={() => updateMaintenanceIssue(issue.id, { status: 'investigating' })}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold"
                          >
                            Investigating
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HARDWARE FLEET */}
      {activeTab === 'hardware' && (
        <div className="bg-[#0e121c] border border-[#1f2538] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121622] text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="p-3">Station</th>
                  <th className="p-3">Zone</th>
                  <th className="p-3">Processor</th>
                  <th className="p-3">Graphics</th>
                  <th className="p-3">Display</th>
                  <th className="p-3">Peripherals</th>
                  <th className="p-3">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {stations.map(st => (
                  <tr key={st.id} className="hover:bg-[#131826] transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-400">{st.name}</td>
                    <td className="p-3 text-gray-300">{st.zone}</td>
                    <td className="p-3 text-gray-300">{st.specs.cpu || 'Integrated'}</td>
                    <td className="p-3 font-semibold text-white">{st.specs.gpu || st.specs.platform || 'Console'}</td>
                    <td className="p-3 text-gray-300">{st.specs.screen || '4K 120Hz'}</td>
                    <td className="p-3 text-gray-400">{st.specs.peripherals || 'Stock Kit'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        st.status === 'maintenance' ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                      }`}>
                        {st.status === 'maintenance' ? 'Out of Service' : 'Operational'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GAME LIBRARY */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allGames.map(game => (
            <div key={game.title} className="p-4 rounded-xl bg-[#0f131d] border border-[#1f2538] flex flex-col justify-between space-y-2">
              <div>
                <h3 className="font-bold text-white text-sm">{game.title}</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Array.from(game.platforms).map(p => (
                    <span key={p} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/50 text-cyan-300 border border-cyan-800/40">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800 flex justify-between text-xs text-gray-400">
                <span>Installed Pods:</span>
                <span className="font-mono font-bold text-emerald-400">{game.count} pods</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: REPORT ISSUE */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e121c] border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-400" />
                Log Hardware Fault
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Select Station Pod</label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  required
                >
                  <option value="">-- Choose station --</option>
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.type.toUpperCase()}) &bull; {st.zone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Fault Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                  className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="low">Low Priority (Minor cosmetic or non-critical item)</option>
                  <option value="medium">Medium (Peripheral glitch, cable replacement)</option>
                  <option value="high">High (High thermal risk, display failure - Flags Out of Service)</option>
                  <option value="critical">Critical (Power fault, hardware short - Flags Out of Service)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Fault Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue, symptoms, and affected component..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-800 text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg"
                >
                  Submit Fault Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
