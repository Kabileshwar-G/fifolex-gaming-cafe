"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { useMounted } from '@/lib/useMounted';
import { Station, StationStatus } from '@/types';
import { formatCurrency, formatDuration, getTimeRemaining, formatTimeOnly } from '@/lib/formatters';
import { hasPermission } from '@/lib/permissions';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  PlusCircle,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Sparkles,
  Gamepad2,
  Cpu,
  Clock,
  User,
  Phone
} from 'lucide-react';

interface StationDetailsDrawerProps {
  station: Station;
  onClose: () => void;
}

const STATUS_CONFIG: Record<StationStatus, { label: string; bg: string; text: string; border: string }> = {
  available: { label: 'Available', bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', border: 'border-[#10B981]/40' },
  occupied: { label: 'Occupied', bg: 'bg-[#00D2FF]/15', text: 'text-[#00D2FF]', border: 'border-[#00D2FF]/40' },
  reserved: { label: 'Reserved', bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/40' },
  cleaning: { label: 'Cleaning', bg: 'bg-[#8B5CF6]/15', text: 'text-[#C084FC]', border: 'border-[#8B5CF6]/40' },
  maintenance: { label: 'Maintenance', bg: 'bg-[#EF4444]/15', text: 'text-[#EF4444]', border: 'border-[#EF4444]/40' },
};

export const StationDetailsDrawer: React.FC<StationDetailsDrawerProps> = ({ station, onClose }) => {
  const mounted = useMounted();
  const {
    sessions,
    stations,
    currentStaff,
    startSession,
    pauseSession,
    resumeSession,
    extendSession,
    transferSession,
    endSession,
    updateStationStatus,
    customers,
    settings
  } = useApp();

  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [walkinDuration, setWalkinDuration] = useState(60);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(settings.acceptedPaymentMethods[0] || 'Cash');
  const [discountCents, setDiscountCents] = useState(0);
  const [formError, setFormError] = useState('');

  // Find active session on this station
  const activeSession = sessions.find(s => s.stationId === station.id && (s.status === 'active' || s.status === 'paused'));

  const statusStyle = STATUS_CONFIG[station.status];
  const canManageSessions = hasPermission(currentStaff.role, 'manage_sessions');
  const canManageMaintenance = hasPermission(currentStaff.role, 'manage_maintenance');

  const handleStartWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const customerObj = customers.find(c => c.id === selectedCustomerId);
    const customerName = customerObj ? customerObj.name : walkinName.trim();
    if (!customerName) {
      setFormError("Please enter customer name or select a member.");
      return;
    }

    // Apply member discount if applicable
    let calculatedDiscount = 0;
    let discountReason = '';
    if (customerObj) {
      const discountPct = settings.membershipDiscounts[customerObj.membershipTier] || 0;
      if (discountPct > 0) {
        const gross = (walkinDuration / 60) * station.hourlyRateCents;
        calculatedDiscount = Math.round((gross * discountPct) / 100);
        discountReason = `${customerObj.membershipTier.toUpperCase()} Member (${discountPct}%)`;
      }
    }

    const res = startSession({
      stationId: station.id,
      customerName,
      customerPhone: customerObj ? customerObj.phone : walkinPhone.trim(),
      customerId: customerObj ? customerObj.id : undefined,
      durationMinutes: walkinDuration,
      discountCents: calculatedDiscount,
      discountReason
    });

    if (!res.success) {
      setFormError(res.error || "Failed to start session.");
    } else {
      setWalkinName('');
      setWalkinPhone('');
      setSelectedCustomerId('');
    }
  };

  const handleTransfer = () => {
    if (!activeSession || !transferTargetId) return;
    const res = transferSession(activeSession.id, transferTargetId, transferReason.trim() || "Customer requested station move");
    if (!res.success) {
      alert(res.error || "Cannot transfer session.");
    } else {
      setShowTransferForm(false);
      setTransferTargetId('');
      setTransferReason('');
    }
  };

  const handleExtend = (minutes: number) => {
    if (!activeSession) return;
    extendSession(activeSession.id, minutes);
  };

  const handleCheckoutSubmit = () => {
    if (!activeSession) return;
    endSession(activeSession.id, paymentMethod, discountCents);
    setShowCheckoutModal(false);
  };

  // Timing calculation for active session
  const remaining = activeSession ? getTimeRemaining(activeSession.expectedEndTime, mounted) : null;
  const otherAvailableStations = stations.filter(s => s.status === 'available' && s.id !== station.id);

  return (
    <div className="h-full flex flex-col bg-[#121826] border-l border-[#1F293D] shadow-2xl text-white overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-[#1F293D] flex items-center justify-between sticky top-0 bg-[#121826]/95 backdrop-blur z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-mono font-bold text-white">{station.name}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {statusStyle.label}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] capitalize mt-0.5">{station.zone} &bull; {station.type.toUpperCase()}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close pod details drawer"
          className="p-1.5 rounded-xl bg-[#161F32] hover:bg-[#1A2438] text-[#94A3B8] hover:text-white border border-[#1F293D] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-5 flex-1">
        {/* ACTIVE SESSION CONTROL PANEL */}
        {activeSession ? (
          <div className="p-4 rounded-2xl bg-[#161F32] border border-[#1F293D] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
              <span className="text-xs font-bold text-[#00D2FF] uppercase tracking-wider font-mono">Live Session Active</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase ${
                activeSession.status === 'paused' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#10B981]/20 text-[#10B981]'
              }`}>
                {activeSession.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#94A3B8] block text-[11px]">Player Name:</span>
                <span className="font-bold text-white text-sm truncate block">{activeSession.customerName}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[11px]">Expected Finish:</span>
                <span className="font-mono text-white font-bold">{formatTimeOnly(activeSession.expectedEndTime, mounted)}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[11px]">Time Remaining:</span>
                <span className={`font-mono font-bold text-sm ${
                  remaining?.isOverdue ? 'text-[#EF4444] animate-pulse' : remaining?.isEndingSoon ? 'text-[#F59E0B]' : 'text-[#00D2FF]'
                }`}>
                  {remaining?.text || 'Calculating...'}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[11px]">Accrued Charge:</span>
                <span className="font-mono text-[#10B981] font-bold text-sm">
                  {formatCurrency(activeSession.totalChargedCents, settings.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Session Action Buttons */}
            {canManageSessions && (
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  {activeSession.status === 'active' ? (
                    <button
                      onClick={() => pauseSession(activeSession.id)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#121826] hover:bg-[#1A2438] text-xs font-bold text-[#F59E0B] border border-[#1F293D] transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      Pause Timer
                    </button>
                  ) : (
                    <button
                      onClick={() => resumeSession(activeSession.id)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#121826] hover:bg-[#1A2438] text-xs font-bold text-[#10B981] border border-[#1F293D] transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Resume Timer
                    </button>
                  )}

                  <button
                    onClick={() => setShowTransferForm(!showTransferForm)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#121826] hover:bg-[#1A2438] text-xs font-bold text-white border border-[#1F293D] transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Move Pod
                  </button>
                </div>

                {/* Quick Extend Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-[#94A3B8] font-medium whitespace-nowrap">Extend:</span>
                  <button
                    onClick={() => handleExtend(30)}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#121826] hover:bg-[#1A2438] border border-[#1F293D] text-[11px] font-bold text-white transition-colors"
                  >
                    +30m
                  </button>
                  <button
                    onClick={() => handleExtend(60)}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#121826] hover:bg-[#1A2438] border border-[#1F293D] text-[11px] font-bold text-white transition-colors"
                  >
                    +60m
                  </button>
                  <button
                    onClick={() => handleExtend(120)}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#121826] hover:bg-[#1A2438] border border-[#1F293D] text-[11px] font-bold text-white transition-colors"
                  >
                    +2h
                  </button>
                </div>

                {/* Transfer Station Drawer Form */}
                {showTransferForm && (
                  <div className="p-3 bg-[#121826] rounded-xl border border-[#1F293D] space-y-2 mt-2">
                    <span className="text-[11px] font-bold text-white block">Move Session to Free Pod:</span>
                    <select
                      value={transferTargetId}
                      onChange={(e) => setTransferTargetId(e.target.value)}
                      className="w-full bg-[#161F32] border border-[#1F293D] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00D2FF]"
                    >
                      <option value="">-- Choose destination station --</option>
                      {otherAvailableStations.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.type}) &bull; {st.zone}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Reason for transfer (e.g. peripheral preference)"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      className="w-full bg-[#161F32] border border-[#1F293D] rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleTransfer}
                        disabled={!transferTargetId}
                        className="flex-1 py-1.5 bg-[#00D2FF] hover:bg-[#00B4D8] disabled:opacity-50 text-[#0A0E17] rounded-lg text-xs font-bold transition-all"
                      >
                        Confirm Transfer
                      </button>
                      <button
                        onClick={() => setShowTransferForm(false)}
                        className="py-1.5 px-3 bg-[#161F32] text-xs font-semibold rounded-lg text-[#94A3B8]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* End & Checkout Button */}
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs shadow-lg shadow-[#EF4444]/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Check Out & Bill Session
                </button>
              </div>
            )}
          </div>
        ) : (
          /* NO ACTIVE SESSION: START WALK-IN LAUNCHER */
          station.status === 'available' ? (
            <div className="p-4 rounded-2xl bg-[#161F32] border border-[#1F293D] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1F293D]">
                <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider font-mono">Launch Session</span>
                <span className="text-xs font-mono font-bold text-white">{formatCurrency(station.hourlyRateCents, settings.currencySymbol)}/hr</span>
              </div>

              {formError && (
                <p className="text-xs text-[#EF4444] bg-[#EF4444]/15 p-2.5 rounded-xl border border-[#EF4444]/40 font-bold">{formError}</p>
              )}

              <form onSubmit={handleStartWalkin} className="space-y-3">
                {/* Registered Member Selector */}
                <div>
                  <label className="text-[11px] text-[#94A3B8] block mb-1 font-semibold">Select Registered Member (Optional)</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-[#121826] border border-[#1F293D] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00D2FF]"
                  >
                    <option value="">-- Guest / Walk-In --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.membershipTier.toUpperCase()} &bull; Balance: {formatCurrency(c.walletBalanceCents, settings.currencySymbol)})</option>
                    ))}
                  </select>
                </div>

                {!selectedCustomerId && (
                  <>
                    <div>
                      <label className="text-[11px] text-[#94A3B8] block mb-1 font-semibold">Guest Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. David Vance"
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        className="w-full bg-[#121826] border border-[#1F293D] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]"
                        required={!selectedCustomerId}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#94A3B8] block mb-1 font-semibold">Phone (Optional for SMS notifications)</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                        className="w-full bg-[#121826] border border-[#1F293D] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[11px] text-[#94A3B8] block mb-1 font-semibold">Initial Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 60, 120, 180].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setWalkinDuration(mins)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                          walkinDuration === mins
                            ? 'bg-[#00D2FF] text-[#0A0E17] border-[#00D2FF] shadow-md shadow-[#00D2FF]/20'
                            : 'bg-[#121826] text-gray-300 border-[#1F293D] hover:bg-[#1A2438]'
                        }`}
                      >
                        {formatDuration(mins)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0E17] border border-[#1F293D] text-xs space-y-1">
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Standard Rate:</span>
                    <span>{formatCurrency((walkinDuration / 60) * station.hourlyRateCents, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-[#1F293D]">
                    <span>Total Deposit:</span>
                    <span className="font-mono text-[#10B981]">
                      {formatCurrency((walkinDuration / 60) * station.hourlyRateCents, settings.currencySymbol)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canManageSessions}
                  className="w-full py-3 bg-[#00D2FF] hover:bg-[#00B4D8] disabled:opacity-50 text-[#0A0E17] font-bold text-xs rounded-xl shadow-lg shadow-[#00D2FF]/20 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Launch Gaming Session
                </button>
              </form>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#161F32] border border-[#1F293D] text-center space-y-3">
              <span className="text-xs text-[#94A3B8]">Station is currently: <strong className="capitalize text-white">{station.status}</strong></span>
              <div className="flex justify-center gap-2">
                {station.status === 'cleaning' && (
                  <button
                    onClick={() => updateStationStatus(station.id, 'available')}
                    className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Mark Clean & Available
                  </button>
                )}
                {station.status === 'maintenance' && (
                  <button
                    onClick={() => updateStationStatus(station.id, 'available')}
                    className="px-4 py-2 bg-[#00D2FF] hover:bg-[#00B4D8] text-[#0A0E17] text-xs font-bold rounded-xl shadow-md"
                  >
                    Restore to Service
                  </button>
                )}
              </div>
            </div>
          )
        )}

        {/* STATION HARDWARE SPECIFICATIONS */}
        <div className="p-4 rounded-2xl bg-[#161F32] border border-[#1F293D] space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-[#1F293D]">
            <Cpu className="w-3.5 h-3.5 text-[#00D2FF]" />
            Hardware & Platform Specs
          </h3>
          <div className="space-y-1.5 text-xs">
            {station.specs.cpu && (
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">CPU:</span>
                <span className="text-white font-mono">{station.specs.cpu}</span>
              </div>
            )}
            {station.specs.gpu && (
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">GPU:</span>
                <span className="text-white font-mono font-bold text-[#00D2FF]">{station.specs.gpu}</span>
              </div>
            )}
            {station.specs.ram && (
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">RAM:</span>
                <span className="text-white font-mono">{station.specs.ram}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Display:</span>
              <span className="text-white">{station.specs.screen}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Kit:</span>
              <span className="text-white">{station.specs.peripherals}</span>
            </div>
          </div>
        </div>

        {/* PRE-LOADED GAMES */}
        <div className="p-4 rounded-2xl bg-[#161F32] border border-[#1F293D] space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-[#1F293D]">
            <Gamepad2 className="w-3.5 h-3.5 text-[#6366F1]" />
            Installed Games ({station.installedGames.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {station.installedGames.map(game => (
              <span key={game} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#121826] text-gray-300 border border-[#1F293D]">
                {game}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && activeSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121826] border border-[#1F293D] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F293D]">
              <h3 className="font-bold text-sm text-white">Checkout & Settle Session</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Player:</span>
                <span className="font-bold text-white">{activeSession.customerName}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Station:</span>
                <span className="font-mono text-white">{station.name}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Total Session Charge:</span>
                <span className="font-mono text-base font-bold text-[#10B981]">
                  {formatCurrency(Math.max(0, activeSession.totalChargedCents - discountCents), settings.currencySymbol)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#94A3B8] block mb-1 font-semibold">Payment Tender</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#161F32] border border-[#1F293D] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00D2FF]"
              >
                {settings.acceptedPaymentMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-2 rounded-xl bg-[#161F32] text-xs font-semibold text-gray-300 border border-[#1F293D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCheckoutSubmit}
                className="flex-1 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-white shadow-lg shadow-[#10B981]/20"
              >
                Receive Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
