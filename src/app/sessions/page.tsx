"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/store/AppContext';
import { useMounted } from '@/lib/useMounted';
import { Station, StationStatus, Session } from '@/types';
import { formatCurrency, formatDuration, getTimeRemaining, formatTimeOnly } from '@/lib/formatters';
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
  const mounted = useMounted();
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
    let memberDiscountCents = 0;
    let discountReason = '';

    if (member && targetStation) {
      const discountPct = settings.membershipDiscounts[member.membershipTier] || 0;
      if (discountPct > 0) {
        const gross = (durationMinutes / 60) * targetStation.hourlyRateCents;
        memberDiscountCents = Math.round((gross * discountPct) / 100);
        discountReason = `${member.membershipTier.toUpperCase()} Member (${discountPct}%)`;
      }
    }

    const res = startSession({
      stationId: selectedStationId,
      customerName,
      customerPhone: member ? member.phone : guestPhone.trim(),
      customerId: member ? member.id : undefined,
      durationMinutes,
      discountCents: memberDiscountCents,
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
    const res = transferSession(transferSessionTarget.id, newStationId, transferReason.trim() || "Customer requested station move");
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-[#F8FAFC] text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-wide flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-[#2563EB]" />
            Station & Session Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time timer controls, station allocation, and player transfer management.
          </p>
        </div>

        {canManageSessions && (
          <button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#F8FAFC] font-extrabold rounded-xl text-xs shadow-lg shadow-[#2563EB]/25 transition-all self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            Start New Session
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-[#2563EB] text-[#F8FAFC] shadow-sm'
              : 'text-slate-500 hover:text-white hover:bg-[#F8FAFC]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Active Sessions ({activeSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('all_stations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all_stations'
              ? 'bg-[#2563EB] text-[#F8FAFC] shadow-sm'
              : 'text-slate-500 hover:text-white hover:bg-[#F8FAFC]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          All Stations ({stations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-[#2563EB] text-[#F8FAFC] shadow-sm'
              : 'text-slate-500 hover:text-white hover:bg-[#F8FAFC]'
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
            <div className="p-12 text-center bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl">
              <Monitor className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-white font-bold">No active sessions currently running</p>
              <p className="text-xs text-slate-500 mt-1">Available pods are ready for walk-in players.</p>
              {canManageSessions && (
                <button
                  onClick={() => setShowStartModal(true)}
                  className="mt-4 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#F8FAFC] text-xs font-extrabold rounded-lg shadow-md"
                >
                  Start Walk-In Player
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map(sess => {
                const timing = getTimeRemaining(sess.expectedEndTime, mounted);
                const station = stations.find(s => s.id === sess.stationId);

                return (
                  <div
                    key={sess.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      timing.isOverdue
                        ? 'bg-[#FFFFFF] border-[#EF4444]/70 shadow-lg shadow-[#EF4444]/20'
                        : timing.isEndingSoon
                        ? 'bg-[#FFFFFF] border-[#FF8C00]/70 shadow-lg shadow-[#FF8C00]/20'
                        : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#2563EB]/50'
                    }`}
                  >
                    <div>
                      {/* Top Pod Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#3A3A3A] flex items-center justify-center font-bold text-[#2563EB] font-mono text-sm">
                            {sess.stationName}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block leading-tight">{sess.customerName}</span>
                            <span className="text-[11px] text-slate-500 capitalize">{station?.type} &bull; {station?.zone}</span>
                          </div>
                        </div>

                        {/* Timing pill */}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                          timing.isOverdue
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50 animate-pulse'
                            : timing.isEndingSoon
                            ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                            : 'bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/40'
                        }`}>
                          {timing.text}
                        </span>
                      </div>

                      {/* Session Info Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-[#141414] border border-[#E2E8F0] text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Start Time</span>
                          <span className="font-mono text-white">
                            {formatTimeOnly(sess.startTime, mounted)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Expected End</span>
                          <span className="font-mono text-white">
                            {formatTimeOnly(sess.expectedEndTime, mounted)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Total Duration</span>
                          <span className="font-mono text-white font-bold">{formatDuration(sess.durationMinutes)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Accrued Charge</span>
                          <span className="font-mono text-[#2563EB] font-extrabold">
                            {formatCurrency(sess.totalChargedCents, settings.currencySymbol)}
                          </span>
                        </div>
                      </div>

                      {/* Transferred Badge if applicable */}
                      {sess.transferHistory.length > 0 && (
                        <div className="mt-2 text-[10px] text-[#6366F1] bg-[#4F46E5]/15 px-2 py-1 rounded border border-[#4F46E5]/30 font-mono">
                          Transferred from {sess.transferHistory[0].fromStationName} ({sess.transferHistory[0].reason})
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    {canManageSessions && (
                      <div className="pt-4 mt-3 border-t border-[#E2E8F0] space-y-2">
                        <div className="grid grid-cols-3 gap-1.5">
                          {sess.status === 'active' ? (
                            <button
                              onClick={() => pauseSession(sess.id)}
                              className="py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#2C2C2C] text-slate-700 border border-[#E2E8F0] text-xs font-bold flex items-center justify-center gap-1"
                            >
                              <Pause className="w-3 h-3" />
                              Pause
                            </button>
                          ) : (
                            <button
                              onClick={() => resumeSession(sess.id)}
                              className="py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-[#F8FAFC] text-xs font-extrabold flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Resume
                            </button>
                          )}

                          <button
                            onClick={() => extendSession(sess.id, 30)}
                            className="py-1.5 rounded-lg bg-[#4F46E5]/20 hover:bg-[#4F46E5]/30 text-[#6366F1] border border-[#4F46E5]/40 text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <PlusCircle className="w-3 h-3" />
                            +30m
                          </button>

                          <button
                            onClick={() => {
                              setTransferSessionTarget(sess);
                              setNewStationId('');
                              setTransferReason('');
                            }}
                            className="py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#2C2C2C] text-slate-700 border border-[#E2E8F0] text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            Move
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setCheckoutSessionTarget(sess);
                            setCheckoutPaymentMethod(settings.acceptedPaymentMethods[0] || 'Cash');
                          }}
                          className="w-full py-2 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/50 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          End Session & Checkout
                        </button>
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
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2563EB]"
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
                className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm font-mono">{st.name}</span>
                      <span className="block text-[11px] text-slate-500 capitalize">{st.type} &bull; {st.zone}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      st.status === 'available' ? 'bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/40' :
                      st.status === 'occupied' ? 'bg-[#4F46E5]/20 text-[#6366F1] border border-[#4F46E5]/40' :
                      st.status === 'reserved' ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40' :
                      st.status === 'cleaning' ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40' :
                      'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                    }`}>
                      {st.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 font-mono">
                    {formatCurrency(st.hourlyRateCents, settings.currencySymbol)}/hr
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  {st.status === 'available' ? (
                    <button
                      onClick={() => {
                        setSelectedStationId(st.id);
                        setShowStartModal(true);
                      }}
                      className="w-full py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#F8FAFC] rounded text-xs font-extrabold shadow"
                    >
                      Start Walk-In
                    </button>
                  ) : st.status === 'cleaning' ? (
                    <button
                      onClick={() => updateStationStatus(st.id, 'available')}
                      className="w-full py-1.5 bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 text-[#00F0FF] border border-[#00F0FF]/40 rounded text-xs font-bold"
                    >
                      Mark Cleaned & Ready
                    </button>
                  ) : (
                    <Link
                      href="/venue"
                      className="w-full py-1.5 text-center bg-[#F8FAFC] hover:bg-[#2C2C2C] text-slate-700 rounded text-xs font-bold border border-[#E2E8F0]"
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
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Completed Sessions Audit History</h3>
            <span className="text-xs text-[#2563EB] font-mono font-bold">{completedSessions.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181818] text-slate-500 font-mono uppercase text-[10px] border-b border-[#E2E8F0]">
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
              <tbody className="divide-y divide-[#E2E8F0]/60">
                {completedSessions.map(cs => (
                  <tr key={cs.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#2563EB]">{cs.stationName}</td>
                    <td className="p-3 font-semibold text-white">{cs.customerName}</td>
                    <td className="p-3 font-mono">{formatDuration(cs.durationMinutes)}</td>
                    <td className="p-3 font-mono font-bold text-[#2563EB]">
                      {formatCurrency(cs.totalChargedCents, settings.currencySymbol)}
                    </td>
                    <td className="p-3 text-slate-700">{cs.paymentMethod || 'Cash'}</td>
                    <td className="p-3 text-slate-500">{cs.staffName}</td>
                    <td className="p-3 text-slate-500 font-mono">
                      {cs.actualEndTime ? formatTimeOnly(cs.actualEndTime, mounted) : '--'}
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-[#2563EB] fill-current" />
                Launch Gaming Session
              </h3>
              <button onClick={() => setShowStartModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {startError && (
              <p className="text-xs text-[#EF4444] bg-[#EF4444]/15 p-2.5 rounded-lg border border-[#EF4444]/40">
                {startError}
              </p>
            )}

            <form onSubmit={handleStartSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">Select Station Pod</label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full bg-[#141414] border border-[#E2E8F0] rounded-lg p-2 text-xs text-white"
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
                <label className="text-xs text-slate-700 block mb-1 font-semibold">Registered Member (Optional)</label>
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
                  className="w-full bg-[#141414] border border-[#E2E8F0] rounded-lg p-2 text-xs text-white"
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
                  <label className="text-xs text-slate-700 block mb-1 font-semibold">Guest Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Mercer"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-[#141414] border border-[#E2E8F0] rounded-lg p-2 text-xs text-white"
                    required={!selectedCustomerId}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-semibold">Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-[#141414] border border-[#E2E8F0] rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">Session Length</label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 120, 180].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                        durationMinutes === mins
                          ? 'bg-[#2563EB] text-[#F8FAFC] border-[#2563EB] shadow'
                          : 'bg-[#181818] text-slate-700 border-[#E2E8F0] hover:bg-[#F8FAFC]'
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
                  className="flex-1 py-2.5 rounded-lg bg-[#F8FAFC] text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-extrabold text-[#F8FAFC] shadow-lg shadow-[#2563EB]/25"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#2563EB]" />
                Transfer Player Station
              </h3>
              <button onClick={() => setTransferSessionTarget(null)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700">
              Transferring <span className="font-bold text-slate-900">{transferSessionTarget.customerName}</span> from{' '}
              <span className="font-bold text-[#2563EB]">{transferSessionTarget.stationName}</span>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 block mb-1">Select Destination Station</label>
                <select
                  value={newStationId}
                  onChange={(e) => setNewStationId(e.target.value)}
                  className="w-full bg-[#141414] border border-[#E2E8F0] rounded-lg p-2 text-xs text-white"
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
                <label className="text-xs text-slate-700 block mb-1">Reason for Move</label>
                <input
                  type="text"
                  placeholder="e.g. Controller issue, friend group moving"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full bg-[#141414] border border-[#E2E8F0] rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTransferSessionTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-[#F8FAFC] text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferSubmit}
                disabled={!newStationId}
                className="flex-1 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-xs font-extrabold text-[#F8FAFC] shadow-lg shadow-[#2563EB]/25"
              >
                Execute Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHECKOUT & RECEIPT */}
      {checkoutSessionTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2563EB]" />
                Session Checkout & Billing
              </h3>
              <button onClick={() => setCheckoutSessionTarget(null)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#141414] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Player:</span>
                <span className="font-bold text-slate-900">{checkoutSessionTarget.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Station:</span>
                <span className="font-bold text-[#2563EB]">{checkoutSessionTarget.stationName}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Total Duration:</span>
                <span className="font-mono">{formatDuration(checkoutSessionTarget.durationMinutes)}</span>
              </div>
              {checkoutSessionTarget.discountCents > 0 && (
                <div className="flex justify-between text-[#2563EB]">
                  <span>Pre-applied Discount:</span>
                  <span className="font-mono">-{formatCurrency(checkoutSessionTarget.discountCents, settings.currencySymbol)}</span>
                </div>
              )}
              {canRefundOrOverride && (
                <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
                  <span className="text-[10px] text-slate-500 block font-semibold">Staff Override / Courtesy Discount</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Discount in cents"
                      value={manualDiscountCents || ''}
                      onChange={(e) => setManualDiscountCents(Number(e.target.value))}
                      className="w-28 bg-[#1A1A1A] border border-[#E2E8F0] rounded px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Reason (e.g. game crash)"
                      value={manualDiscountReason}
                      onChange={(e) => setManualDiscountReason(e.target.value)}
                      className="flex-1 bg-[#1A1A1A] border border-[#E2E8F0] rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-[#E2E8F0]">
                <span>Total Payable:</span>
                <span className="font-mono text-[#2563EB] font-extrabold">
                  {formatCurrency(Math.max(0, checkoutSessionTarget.totalChargedCents - manualDiscountCents), settings.currencySymbol)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 block mb-1 font-semibold">Payment Method</label>
              <select
                value={checkoutPaymentMethod}
                onChange={(e) => setCheckoutPaymentMethod(e.target.value)}
                className="w-full bg-[#141414] border border-[#E2E8F0] rounded-lg p-2 text-xs text-white"
              >
                {settings.acceptedPaymentMethods.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCheckoutSessionTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-[#F8FAFC] text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckoutSubmit}
                className="flex-1 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-extrabold text-[#F8FAFC] shadow-lg shadow-[#2563EB]/25"
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
