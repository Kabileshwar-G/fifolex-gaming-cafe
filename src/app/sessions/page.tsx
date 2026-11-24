"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/store/AppContext';
import { Station, StationStatus, Session } from '@/types';
import { formatCurrency, formatDuration, getTimeRemaining } from '@/lib/formatters';
import { hasPermission } from '@/lib/permissions';
import {
  Monitor,
  Play,
  Pause,
  PlusCircle,
  ArrowRightLeft,
  X,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  DollarSign,
  AlertTriangle,
  Receipt,
  RotateCcw
} from 'lucide-react';

export default function SessionsPage() {
  const {
    stations,
    sessions,
    customers,
    currentStaff,
    settings,
    startSession,
    pauseSession,
    resumeSession,
    extendSession,
    transferSession,
    endSession,
    updateStationStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'all_stations' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');

  // Start Session Modal State
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [startError, setStartError] = useState('');

  // Transfer Modal State
  const [transferSessionTarget, setTransferSessionTarget] = useState<Session | null>(null);
  const [newStationId, setNewStationId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Checkout Modal State
  const [checkoutSessionTarget, setCheckoutSessionTarget] = useState<Session | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState(settings.acceptedPaymentMethods[0] || 'Cash');
  const [manualDiscountCents, setManualDiscountCents] = useState(0);
  const [manualDiscountReason, setManualDiscountReason] = useState('');

  const canManageSessions = hasPermission(currentStaff.role, 'manage_sessions');
  const canRefundOrOverride = hasPermission(currentStaff.role, 'process_refunds');

  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  // Filter stations
  const filteredStations = stations.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.installedGames.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesZone = zoneFilter === 'all' || st.zone === zoneFilter;
    return matchesSearch && matchesZone;
  });

  const availableStations = stations.filter(s => s.status === 'available');

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStartError('');

    if (!selectedStationId) {
      setStartError("Please select a station.");
      return;
    }

    const member = customers.find(c => c.id === selectedCustomerId);
    const customerName = member ? member.name : guestName.trim();
    if (!customerName) {
      setStartError("Please provide a guest name or select a member.");
      return;
    }

    const targetStation = stations.find(s => s.id === selectedStationId);
    let calculatedDiscount = 0;
    let discountReason = '';
    if (member && targetStation) {
      const discountPct = settings.membershipDiscounts[member.membershipTier] || 0;
      if (discountPct > 0) {
        const gross = (durationMinutes / 60) * targetStation.hourlyRateCents;
        calculatedDiscount = Math.round((gross * discountPct) / 100);
        discountReason = `${member.membershipTier.toUpperCase()} Member (${discountPct}%)`;
      }
    }

    const res = startSession({
      stationId: selectedStationId,
      customerName,
      customerPhone: member ? member.phone : guestPhone.trim(),
      customerId: member ? member.id : undefined,
      durationMinutes,
      discountCents: calculatedDiscount,
      discountReason
    });

    if (!res.success) {
      setStartError(res.error || "Could not start session.");
    } else {
      setShowStartModal(false);
      setSelectedStationId('');
      setSelectedCustomerId('');
      setGuestName('');
      setGuestPhone('');
    }
  };

  const handleTransferSubmit = () => {
    if (!transferSessionTarget || !newStationId) return;
    const res = transferSession(transferSessionTarget.id, newStationId, transferReason.trim() || "Station switch requested");
    if (!res.success) {
      alert(res.error);
    } else {
      setTransferSessionTarget(null);
      setNewStationId('');
      setTransferReason('');
    }
  };

  const handleCheckoutSubmit = () => {
    if (!checkoutSessionTarget) return;
    endSession(checkoutSessionTarget.id, checkoutPaymentMethod, manualDiscountCents, manualDiscountReason);
    setCheckoutSessionTarget(null);
    setManualDiscountCents(0);
    setManualDiscountReason('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-cyan-400" />
            Station & Session Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time timer controls, station allocation, and player transfer management.
          </p>
        </div>

        {canManageSessions && (
          <button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-950/40 transition-all self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            Start New Session
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'active'
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Active Sessions ({activeSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('all_stations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'all_stations'
              ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          All Stations ({stations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'history'
              ? 'bg-purple-950/60 text-purple-300 border border-purple-700/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Session History ({completedSessions.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE SESSIONS */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeSessions.length === 0 ? (
            <div className="p-12 text-center bg-[#0d1017] border border-gray-800 rounded-2xl">
              <Monitor className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-300 font-semibold">No active sessions currently running</p>
              <p className="text-xs text-gray-500 mt-1">Available pods are ready for walk-in players.</p>
              {canManageSessions && (
                <button
                  onClick={() => setShowStartModal(true)}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
                >
                  Start Walk-In Player
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map(sess => {
                const timing = getTimeRemaining(sess.expectedEndTime);
                const station = stations.find(s => s.id === sess.stationId);

                return (
                  <div
                    key={sess.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      timing.isOverdue
                        ? 'bg-rose-950/20 border-rose-700/60 shadow-lg shadow-rose-950/30'
                        : timing.isEndingSoon
                        ? 'bg-amber-950/20 border-amber-700/60 shadow-lg shadow-amber-950/30'
                        : 'bg-[#0e121c] border-[#222a3d]'
                    }`}
                  >
                    <div>
                      {/* Top Pod Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-[#182033] border border-[#2d3b5e] flex items-center justify-center font-bold text-cyan-400 font-mono text-sm">
                            {sess.stationName}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block leading-tight">{sess.customerName}</span>
                            <span className="text-[11px] text-gray-400 capitalize">{station?.type} &bull; {station?.zone}</span>
                          </div>
                        </div>

                        {/* Timing pill */}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                          timing.isOverdue
                            ? 'bg-rose-950/90 text-rose-300 border border-rose-800 animate-pulse'
                            : timing.isEndingSoon
                            ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                        }`}>
                          {timing.text}
                        </span>
                      </div>

                      {/* Session Info Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-[#090b10] border border-gray-800/80 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Start Time</span>
                          <span className="font-mono text-gray-200">
                            {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Expected End</span>
                          <span className="font-mono text-gray-200">
                            {new Date(sess.expectedEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Total Duration</span>
                          <span className="font-mono text-gray-200 font-semibold">{formatDuration(sess.durationMinutes)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Accrued Charge</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {formatCurrency(sess.totalChargedCents, settings.currencySymbol)}
                          </span>
                        </div>
                      </div>

                      {/* Transferred Badge if applicable */}
                      {sess.transferHistory.length > 0 && (
                        <div className="mt-2 text-[10px] text-indigo-400 bg-indigo-950/30 px-2 py-1 rounded border border-indigo-900/40">
                          Transferred from {sess.transferHistory[0].fromStationName} ({sess.transferHistory[0].reason})
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    {canManageSessions && (
                      <div className="pt-4 mt-3 border-t border-gray-800/80 space-y-2">
                        <div className="grid grid-cols-3 gap-1.5">
                          {sess.status === 'active' ? (
                            <button
                              onClick={() => pauseSession(sess.id)}
                              className="py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <Pause className="w-3 h-3" />
                              Pause
                            </button>
                          ) : (
                            <button
                              onClick={() => resumeSession(sess.id)}
                              className="py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              Resume
                            </button>
                          )}

                          <button
                            onClick={() => extendSession(sess.id, 30)}
                            className="py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 text-xs font-mono font-bold"
                          >
                            +30m
                          </button>

                          <button
                            onClick={() => extendSession(sess.id, 60)}
                            className="py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 text-xs font-mono font-bold"
                          >
                            +60m
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => setTransferSessionTarget(sess)}
                            className="py-1.5 rounded-lg bg-[#141926] hover:bg-[#1c2336] text-gray-300 text-xs font-medium flex items-center justify-center gap-1 border border-gray-700/60"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                            Transfer
                          </button>

                          <button
                            onClick={() => setCheckoutSessionTarget(sess)}
                            className="py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold"
                          >
                            End & Bill
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL STATIONS GRID */}
      {activeTab === 'all_stations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search station or game..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121622] border border-[#232b40] rounded-xl pl-9 pr-3 py-2 text-xs text-white"
              />
            </div>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-[#121622] border border-[#232b40] rounded-xl px-3 py-2 text-xs text-gray-300"
            >
              <option value="all">All Zones</option>
              <option value="Main PC Arena">Main PC Arena</option>
              <option value="VIP Console Lounge">VIP Console Lounge</option>
              <option value="Sim Paddock">Sim Paddock</option>
              <option value="VR Holo-Bay">VR Holo-Bay</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredStations.map(st => (
              <div
                key={st.id}
                className="p-4 rounded-xl bg-[#0f131d] border border-[#1f2538] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white text-sm font-mono">{st.name}</span>
                      <span className="block text-[11px] text-gray-400 capitalize">{st.type} &bull; {st.zone}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      st.status === 'available' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                      st.status === 'occupied' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40' :
                      st.status === 'reserved' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' :
                      st.status === 'cleaning' ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40' :
                      'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                    }`}>
                      {st.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-400 font-mono">
                    {formatCurrency(st.hourlyRateCents, settings.currencySymbol)}/hr
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between">
                  {st.status === 'available' ? (
                    <button
                      onClick={() => {
                        setSelectedStationId(st.id);
                        setShowStartModal(true);
                      }}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                    >
                      Start Walk-In
                    </button>
                  ) : st.status === 'cleaning' ? (
                    <button
                      onClick={() => updateStationStatus(st.id, 'available')}
                      className="w-full py-1.5 bg-purple-900/50 hover:bg-purple-800 text-purple-200 rounded text-xs font-bold"
                    >
                      Mark Cleaned & Ready
                    </button>
                  ) : (
                    <Link
                      href="/venue"
                      className="w-full py-1.5 text-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium"
                    >
                      Inspect in 3D View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SESSION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-[#0e121c] border border-[#1f2538] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-200">Completed Sessions Audit History</h3>
            <span className="text-xs text-gray-400 font-mono">{completedSessions.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121622] text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="p-3">Station</th>
                  <th className="p-3">Player</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Staff Operator</th>
                  <th className="p-3">Ended At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {completedSessions.map(cs => (
                  <tr key={cs.id} className="hover:bg-[#131826] transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-400">{cs.stationName}</td>
                    <td className="p-3 font-semibold text-gray-200">{cs.customerName}</td>
                    <td className="p-3 font-mono">{formatDuration(cs.durationMinutes)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {formatCurrency(cs.totalChargedCents, settings.currencySymbol)}
                    </td>
                    <td className="p-3 text-gray-300">{cs.paymentMethod || 'Cash'}</td>
                    <td className="p-3 text-gray-400">{cs.staffName}</td>
                    <td className="p-3 text-gray-400 font-mono">
                      {cs.actualEndTime ? new Date(cs.actualEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: START SESSION */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e121c] border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-current" />
                Launch Gaming Session
              </h3>
              <button onClick={() => setShowStartModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {startError && (
              <p className="text-xs text-rose-400 bg-rose-950/50 p-2.5 rounded-lg border border-rose-800/40">
                {startError}
              </p>
            )}

            <form onSubmit={handleStartSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Select Station Pod</label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  required
                >
                  <option value="">-- Choose an available station --</option>
                  {availableStations.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.type.toUpperCase()}) &bull; {st.zone} &bull; {formatCurrency(st.hourlyRateCents, settings.currencySymbol)}/hr
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Registered Member (Optional)</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const c = customers.find(x => x.id === e.target.value);
                    if (c) {
                      setGuestName(c.name);
                      setGuestPhone(c.phone);
                    }
                  }}
                  className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="">-- Or enter walk-in guest below --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.membershipTier.toUpperCase()} &bull; Balance: {formatCurrency(c.walletBalanceCents, settings.currencySymbol)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Guest Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Mercer"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                    required={!selectedCustomerId}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Session Length</label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 120, 180].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                        durationMinutes === mins
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-[#181d2e] text-gray-300 border-gray-700 hover:bg-[#20273c]'
                      }`}
                    >
                      {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-800 text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
                >
                  Confirm & Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER SESSION */}
      {transferSessionTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e121c] border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                Transfer Player Station
              </h3>
              <button onClick={() => setTransferSessionTarget(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Transferring <span className="font-bold text-white">{transferSessionTarget.customerName}</span> from{' '}
              <span className="font-bold text-cyan-400">{transferSessionTarget.stationName}</span>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Select Destination Station</label>
                <select
                  value={newStationId}
                  onChange={(e) => setNewStationId(e.target.value)}
                  className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="">Select available pod...</option>
                  {availableStations.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.type.toUpperCase()}) &bull; {st.zone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Reason for Move</label>
                <input
                  type="text"
                  placeholder="e.g. Controller issue, friend group moving"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTransferSessionTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-gray-800 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferSubmit}
                disabled={!newStationId}
                className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-bold text-white shadow-lg"
              >
                Execute Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHECKOUT & RECEIPT */}
      {checkoutSessionTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e121c] border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Session Checkout & Billing
              </h3>
              <button onClick={() => setCheckoutSessionTarget(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#090c12] rounded-xl border border-gray-800 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Player:</span>
                <span className="font-bold text-white">{checkoutSessionTarget.customerName}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Station:</span>
                <span className="font-bold text-cyan-400">{checkoutSessionTarget.stationName}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Total Duration:</span>
                <span className="font-mono">{formatDuration(checkoutSessionTarget.durationMinutes)}</span>
              </div>
              {checkoutSessionTarget.discountCents > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Pre-applied Discount:</span>
                  <span className="font-mono">-{formatCurrency(checkoutSessionTarget.discountCents, settings.currencySymbol)}</span>
                </div>
              )}
              {canRefundOrOverride && (
                <div className="pt-2 border-t border-gray-800 space-y-1.5">
                  <span className="text-[10px] text-gray-400 block font-semibold">Staff Override / Courtesy Discount</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Discount in cents"
                      value={manualDiscountCents || ''}
                      onChange={(e) => setManualDiscountCents(Number(e.target.value))}
                      className="w-28 bg-[#181d2e] border border-gray-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Reason (e.g. game crash)"
                      value={manualDiscountReason}
                      onChange={(e) => setManualDiscountReason(e.target.value)}
                      className="flex-1 bg-[#181d2e] border border-gray-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800">
                <span>Total Payable:</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(Math.max(0, checkoutSessionTarget.totalChargedCents - manualDiscountCents), settings.currencySymbol)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Payment Method</label>
              <select
                value={checkoutPaymentMethod}
                onChange={(e) => setCheckoutPaymentMethod(e.target.value)}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
              >
                {settings.acceptedPaymentMethods.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCheckoutSessionTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-gray-800 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckoutSubmit}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
              >
                Collect Payment & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
