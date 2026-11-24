"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Station, StationStatus } from '@/types';
import { formatCurrency, formatDuration, getTimeRemaining } from '@/lib/formatters';
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
  available: { label: 'Available', bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/40' },
  occupied: { label: 'Occupied', bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-800/40' },
  reserved: { label: 'Reserved', bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  cleaning: { label: 'Cleaning', bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-800/40' },
  maintenance: { label: 'Maintenance', bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/40' },
};

export const StationDetailsDrawer: React.FC<StationDetailsDrawerProps> = ({ station, onClose }) => {
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
      alert(res.error);
    } else {
      setShowTransferForm(false);
      onClose();
    }
  };

  const handleEndSession = () => {
    if (!activeSession) return;
    endSession(activeSession.id, paymentMethod, discountCents);
    setShowCheckoutModal(false);
  };

  const availableTransferTargets = stations.filter(s => s.id !== station.id && s.status === 'available');

  const timing = activeSession ? getTimeRemaining(activeSession.expectedEndTime) : null;

  return (
    <div className="w-96 max-w-full bg-[#0d1017] border-l border-[#1f2538] flex flex-col h-full shadow-2xl z-40 select-none overflow-y-auto">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#1f2538] flex items-center justify-between bg-[#121622]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1b2133] border border-[#2d3652] flex items-center justify-center font-bold text-cyan-400 font-mono text-base">
            {station.name}
          </div>
          <div>
            <h2 className="font-bold text-gray-100 text-sm leading-tight">{station.name}</h2>
            <span className="text-[11px] text-gray-400 capitalize">{station.type} &bull; {station.zone}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Status Badge & Pricing Header */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#131724] border border-[#232b40]">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Station Status</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold mt-1 border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {statusStyle.label}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Hourly Rate</span>
            <span className="text-base font-bold text-white font-mono">
              {formatCurrency(station.hourlyRateCents, settings.currencySymbol)}/hr
            </span>
          </div>
        </div>

        {/* ACTIVE SESSION CARD */}
        {activeSession && (
          <div className="p-3.5 rounded-xl bg-[#121829] border border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Live Session
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                timing?.isOverdue ? 'bg-rose-950/80 text-rose-300 animate-pulse' : 'bg-cyan-950/60 text-cyan-300'
              }`}>
                {timing?.text}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block">Customer</span>
                <span className="font-semibold text-gray-200">{activeSession.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Duration</span>
                <span className="font-semibold text-gray-200 font-mono">{formatDuration(activeSession.durationMinutes)}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Start Time</span>
                <span className="text-gray-300 font-mono">
                  {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Expected End</span>
                <span className="text-gray-300 font-mono">
                  {new Date(activeSession.expectedEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {activeSession.discountCents > 0 && (
              <div className="text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/40 flex justify-between">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(activeSession.discountCents, settings.currencySymbol)} ({activeSession.discountReason})</span>
              </div>
            )}

            {/* Session Action Buttons */}
            {canManageSessions && (
              <div className="pt-2 border-t border-gray-800/80 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {activeSession.status === 'active' ? (
                    <button
                      onClick={() => pauseSession(activeSession.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      Pause Timer
                    </button>
                  ) : (
                    <button
                      onClick={() => resumeSession(activeSession.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Resume Timer
                    </button>
                  )}

                  <button
                    onClick={() => extendSession(activeSession.id, 30)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    +30m Extend
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowTransferForm(!showTransferForm)}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Transfer Station
                  </button>
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    End & Checkout
                  </button>
                </div>

                {/* Transfer Form Dropdown */}
                {showTransferForm && (
                  <div className="p-3 bg-[#0a0d14] rounded-lg border border-gray-700 space-y-2 mt-2">
                    <p className="text-[11px] font-bold text-gray-300">Move Player to Station:</p>
                    <select
                      value={transferTargetId}
                      onChange={(e) => setTransferTargetId(e.target.value)}
                      className="w-full bg-[#141824] border border-gray-700 rounded p-1.5 text-xs text-white"
                    >
                      <option value="">Select target station...</option>
                      {availableTransferTargets.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.type}) - Free</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Reason for transfer (e.g. mouse fault)"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      className="w-full bg-[#141824] border border-gray-700 rounded p-1.5 text-xs text-white"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowTransferForm(false)}
                        className="px-2 py-1 text-xs text-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleTransfer}
                        disabled={!transferTargetId}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-bold text-white rounded"
                      >
                        Confirm Move
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* START WALKIN SESSION FORM (If station is available) */}
        {station.status === 'available' && canManageSessions && (
          <form onSubmit={handleStartWalkin} className="p-3.5 rounded-xl bg-[#121622] border border-[#232b40] space-y-3">
            <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              Start Walk-In Session
            </span>

            {formError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800/40">
                {formError}
              </p>
            )}

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Select Member (Optional)</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  const cust = customers.find(c => c.id === e.target.value);
                  if (cust) {
                    setWalkinName(cust.name);
                    setWalkinPhone(cust.phone);
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

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Guest Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Mercer"
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                required={!selectedCustomerId}
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={walkinPhone}
                onChange={(e) => setWalkinPhone(e.target.value)}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Initial Session Length</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 60, 120, 180].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setWalkinDuration(mins)}
                    className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                      walkinDuration === mins
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-[#181d2e] text-gray-300 border-gray-700 hover:bg-[#20273c]'
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch Session ({formatCurrency((walkinDuration / 60) * station.hourlyRateCents, settings.currencySymbol)})
              </button>
            </div>
          </form>
        )}

        {/* QUICK STATUS OVERRIDES */}
        <div className="p-3 rounded-xl bg-[#121622] border border-[#232b40] space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Station Status Actions</span>
          <div className="grid grid-cols-2 gap-2">
            {station.status !== 'available' && station.status !== 'occupied' && (
              <button
                onClick={() => updateStationStatus(station.id, 'available')}
                className="px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Available
              </button>
            )}

            {station.status !== 'cleaning' && (
              <button
                onClick={() => updateStationStatus(station.id, 'cleaning')}
                className="px-2.5 py-1.5 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/40 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Set to Cleaning
              </button>
            )}

            {canManageMaintenance && station.status !== 'maintenance' && (
              <button
                onClick={() => {
                  const reason = prompt("Enter maintenance / fault description:");
                  if (reason) updateStationStatus(station.id, 'maintenance', reason);
                }}
                className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 col-span-2"
              >
                <Wrench className="w-3.5 h-3.5" />
                Flag for Maintenance
              </button>
            )}
          </div>
        </div>

        {/* HARDWARE SPECS */}
        <div className="p-3 rounded-xl bg-[#121622] border border-[#232b40] space-y-2 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Hardware Profile
          </span>
          <div className="space-y-1 text-gray-300 pt-1">
            {station.specs.gpu && (
              <div className="flex justify-between"><span className="text-gray-400">Graphics:</span> <span className="font-semibold">{station.specs.gpu}</span></div>
            )}
            {station.specs.cpu && (
              <div className="flex justify-between"><span className="text-gray-400">Processor:</span> <span className="font-semibold">{station.specs.cpu}</span></div>
            )}
            {station.specs.screen && (
              <div className="flex justify-between"><span className="text-gray-400">Display:</span> <span className="font-semibold">{station.specs.screen}</span></div>
            )}
            {station.specs.peripherals && (
              <div className="flex justify-between"><span className="text-gray-400">Peripherals:</span> <span className="font-semibold">{station.specs.peripherals}</span></div>
            )}
          </div>
        </div>

        {/* INSTALLED GAMES */}
        {station.installedGames.length > 0 && (
          <div className="p-3 rounded-xl bg-[#121622] border border-[#232b40] space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
              Pre-loaded Titles ({station.installedGames.length})
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {station.installedGames.map(game => (
                <span key={game} className="px-2 py-0.5 rounded bg-[#1a2133] text-gray-300 text-[11px] border border-gray-700/60">
                  {game}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CHECKOUT & RECEIPT MODAL */}
      {showCheckoutModal && activeSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e121c] border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-base text-white">Complete Session & Checkout</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Station:</span>
                <span className="font-bold text-white">{station.name}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Customer:</span>
                <span className="font-bold text-white">{activeSession.customerName}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Total Time:</span>
                <span className="font-mono font-bold text-cyan-400">{formatDuration(activeSession.durationMinutes)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Hourly Rate:</span>
                <span className="font-mono">{formatCurrency(station.hourlyRateCents, settings.currencySymbol)}/hr</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(Math.max(0, activeSession.totalChargedCents - discountCents), settings.currencySymbol)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Select Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
              >
                {settings.acceptedPaymentMethods.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
              >
                Confirm & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
