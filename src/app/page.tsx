"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/store/AppContext';
import { useMounted } from '@/lib/useMounted';
import { formatCurrency, formatDuration, getTimeRemaining, formatTimeOnly } from '@/lib/formatters';
import {
  Monitor,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  Play,
  Pause,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const mounted = useMounted();
  const {
    stations,
    sessions,
    bookings,
    orders,
    auditLogs,
    settings,
    pauseSession,
    resumeSession,
    extendSession,
    selectStation
  } = useApp();

  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const availableStations = stations.filter(s => s.status === 'available');
  const occupiedStations = stations.filter(s => s.status === 'occupied');
  const cleaningStations = stations.filter(s => s.status === 'cleaning');
  const maintenanceStations = stations.filter(s => s.status === 'maintenance');

  // Revenue computations
  const sessionRevenueCents = sessions.reduce((acc, s) => acc + s.totalChargedCents, 0);
  const orderRevenueCents = orders.reduce((acc, o) => acc + (o.paid ? o.totalCents : 0), 0);
  const totalRevenueToday = sessionRevenueCents + orderRevenueCents;

  const occupancyPercent = stations.length > 0
    ? Math.round((occupiedStations.length / stations.length) * 100)
    : 0;

  // Today's bookings
  const todayStr = '2026-11-25';
  const todayBookings = bookings.filter(b => b.date === todayStr);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-[#0A0E17] text-[#F8FAFC]">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1F293D]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30">
              Esports Arena Pro
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">Live Operations Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide mt-1 flex items-center gap-2">
            Control Room Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Real-time session timers, 3D venue occupancy, food orders, and station state machines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/venue"
            className="flex items-center gap-2 px-4 py-2 bg-[#00D2FF] hover:bg-[#00B4D8] text-[#0A0E17] font-bold rounded-xl text-xs shadow-lg shadow-[#00D2FF]/20 transition-all"
          >
            <Activity className="w-4 h-4" />
            Launch 3D Floor View
          </Link>
          <Link
            href="/sessions"
            className="flex items-center gap-2 px-4 py-2 bg-[#121826] hover:bg-[#161F32] border border-[#1F293D] text-white font-bold rounded-xl text-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-[#00D2FF] fill-current" />
            Start Session
          </Link>
        </div>
      </div>

      {/* METRIC KPI CARDS - Slate Navy Surfaces with Cyan & Indigo Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Sessions */}
        <div className="p-4 rounded-2xl bg-[#121826] border border-[#1F293D] hover:border-[#00D2FF]/50 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider font-mono">Live Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-[#00D2FF]/15 border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF]">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activeSessions.length}</span>
            <span className="text-xs text-[#00D2FF] font-bold">/{stations.length} Pods</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            {availableStations.length} pods ready for walk-ins
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00D2FF]" />
        </div>

        {/* Card 2: Occupancy Rate */}
        <div className="p-4 rounded-2xl bg-[#121826] border border-[#1F293D] hover:border-[#6366F1]/50 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider font-mono">Floor Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{occupancyPercent}%</span>
            <span className="text-xs text-[#818CF8] font-bold">Peak Rate</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            {cleaningStations.length} cleaning &bull; {maintenanceStations.length} maintenance
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6366F1]" />
        </div>

        {/* Card 3: Revenue Today */}
        <div className="p-4 rounded-2xl bg-[#121826] border border-[#1F293D] hover:border-[#10B981]/50 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider font-mono">Revenue Today</span>
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#10B981] font-mono">
              {formatCurrency(totalRevenueToday, settings.currencySymbol)}
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Sessions: {formatCurrency(sessionRevenueCents, settings.currencySymbol)} &bull; POS: {formatCurrency(orderRevenueCents, settings.currencySymbol)}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#10B981]" />
        </div>

        {/* Card 4: Bookings Today */}
        <div className="p-4 rounded-2xl bg-[#121826] border border-[#1F293D] hover:border-[#F59E0B]/50 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider font-mono">Today's Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{todayBookings.length}</span>
            <span className="text-xs text-[#F59E0B] font-bold">Scheduled</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            {todayBookings.filter(b => b.status === 'confirmed').length} confirmed &bull; {todayBookings.filter(b => b.status === 'pending').length} pending
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F59E0B]" />
        </div>
      </div>

      {/* TWO COLUMN SECTION: Active Sessions & Quick Station Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Active Sessions Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00D2FF]" />
              Live Gaming Sessions ({activeSessions.length})
            </h2>
            <Link href="/sessions" className="text-xs text-[#00D2FF] hover:underline flex items-center gap-1 font-bold">
              View All Sessions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#121826] border border-[#1F293D] rounded-2xl overflow-hidden shadow-xl">
            {activeSessions.length === 0 ? (
              <div className="p-8 text-center text-[#94A3B8]">
                <Monitor className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#94A3B8]" />
                <p className="text-sm">No active sessions at the moment.</p>
                <Link
                  href="/sessions"
                  className="mt-3 inline-block px-4 py-2 bg-[#00D2FF] hover:bg-[#00B4D8] text-[#0A0E17] text-xs font-bold rounded-xl shadow-md"
                >
                  Start Walk-In Guest
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#1F293D]">
                {activeSessions.map(sess => {
                  const timing = getTimeRemaining(sess.expectedEndTime, mounted);
                  return (
                    <div
                      key={sess.id}
                      className="p-4 hover:bg-[#161F32] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#161F32] border border-[#1F293D] flex items-center justify-center font-bold text-[#00D2FF] font-mono text-sm">
                          {sess.stationName}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{sess.customerName}</span>
                            {sess.discountCents > 0 && (
                              <span className="text-[10px] font-bold text-[#00D2FF] bg-[#00D2FF]/15 px-1.5 py-0.5 rounded border border-[#00D2FF]/30 font-mono">
                                Member Rate
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#94A3B8]">
                            Started {formatTimeOnly(sess.startTime, mounted)} &bull;{' '}
                            {formatDuration(sess.durationMinutes)} total
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        {/* Countdown Pill */}
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                            timing.isOverdue
                              ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 animate-pulse'
                              : timing.isEndingSoon
                              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                              : 'bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30'
                          }`}>
                            {timing.text}
                          </span>
                          <span className="block text-[10px] text-[#94A3B8] mt-0.5 font-mono">
                            Charge: {formatCurrency(sess.totalChargedCents, settings.currencySymbol)}
                          </span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {sess.status === 'active' ? (
                            <button
                              onClick={() => pauseSession(sess.id)}
                              title="Pause Session"
                              className="p-2 rounded-xl bg-[#161F32] hover:bg-[#1A2438] text-gray-300 border border-[#1F293D]"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => resumeSession(sess.id)}
                              title="Resume Session"
                              className="p-2 rounded-xl bg-[#00D2FF] hover:bg-[#00B4D8] text-[#0A0E17]"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                          <button
                            onClick={() => extendSession(sess.id, 30)}
                            title="+30m Extension"
                            className="px-2.5 py-2 rounded-xl bg-[#6366F1]/15 hover:bg-[#6366F1]/25 border border-[#6366F1]/30 text-[#818CF8] text-xs font-mono font-bold"
                          >
                            +30m
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Station Pods & Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#6366F1]" />
              Venue Stations ({stations.length})
            </h2>
            <Link href="/venue" className="text-xs text-[#00D2FF] font-bold hover:underline">
              Interactive 3D &rarr;
            </Link>
          </div>

          <div className="bg-[#121826] border border-[#1F293D] rounded-2xl p-4 shadow-xl space-y-3">
            {/* Legend mini bar */}
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pb-2 border-b border-[#1F293D] font-mono font-bold">
              <span className="text-[#10B981]">{availableStations.length} Available</span>
              <span className="text-[#00D2FF]">{occupiedStations.length} Occupied</span>
              <span className="text-[#8B5CF6]">{cleaningStations.length} Cleaning</span>
              <span className="text-[#EF4444]">{maintenanceStations.length} Maint.</span>
            </div>

            {/* Quick Pod Matrix Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {stations.map(st => {
                const isOccupied = st.status === 'occupied';
                const isAvailable = st.status === 'available';
                const isCleaning = st.status === 'cleaning';
                const isMaint = st.status === 'maintenance';

                return (
                  <Link
                    key={st.id}
                    href="/venue"
                    onClick={() => selectStation(st.id)}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      isOccupied
                        ? 'bg-[#00D2FF]/15 border-[#00D2FF]/40 text-[#00D2FF] hover:bg-[#00D2FF]/25'
                        : isAvailable
                        ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/25'
                        : isCleaning
                        ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/40 text-[#C084FC]'
                        : isMaint
                        ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                        : 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]'
                    }`}
                  >
                    <span className="block font-mono font-extrabold text-xs truncate">{st.name}</span>
                    <span className="block text-[9px] uppercase tracking-wider opacity-80">{st.type}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#1F293D]">
              <Link
                href="/bookings"
                className="w-full py-2 bg-[#161F32] hover:bg-[#1A2438] border border-[#1F293D] rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                Manage Today's Bookings ({todayBookings.length})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Recent Audit Trail Feed */}
      <div className="bg-[#121826] border border-[#1F293D] rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F293D]">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6366F1]" />
            Operations Audit Log & Station Activity
          </h3>
          <Link href="/staff" className="text-xs text-[#00D2FF] font-bold hover:underline">
            Full Audit History &rarr;
          </Link>
        </div>

        <div className="divide-y divide-[#1F293D] max-h-48 overflow-y-auto">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#00D2FF] font-bold px-2 py-0.5 rounded bg-[#00D2FF]/10 border border-[#00D2FF]/30 text-[10px]">
                  {log.action}
                </span>
                <span className="text-gray-200">{log.details}</span>
              </div>
              <div className="flex items-center gap-3 text-[#94A3B8] font-mono text-[11px]">
                <span className="text-white font-semibold">{log.staffName} ({log.role})</span>
                <span className="text-[#00D2FF]">{formatTimeOnly(log.timestamp, mounted)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
