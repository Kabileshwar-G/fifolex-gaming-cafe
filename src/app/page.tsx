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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-[#111111] text-white">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2E2E2E]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40">
              Edgy & Rebel Dark
            </span>
            <span className="text-xs text-gray-400 font-mono">Live Operations Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide mt-1 flex items-center gap-2">
            Control Room Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Real-time session timers, 3D venue occupancy, food orders, and station state machines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/venue"
            className="flex items-center gap-2 px-4 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-[#111111] font-extrabold rounded-xl text-xs shadow-lg shadow-[#CCFF00]/25 transition-all"
          >
            <Activity className="w-4 h-4" />
            Launch 3D Floor View
          </Link>
          <Link
            href="/sessions"
            className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] hover:bg-[#282828] border border-[#333333] text-white font-bold rounded-xl text-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-[#CCFF00] fill-current" />
            Start Session
          </Link>
        </div>
      </div>

      {/* METRIC KPI CARDS - Gunmetal Surfaces with Neon Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Sessions */}
        <div className="p-4 rounded-2xl bg-[#1E1E1E] border border-[#2E2E2E] hover:border-[#CCFF00]/50 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Live Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activeSessions.length}</span>
            <span className="text-xs text-[#CCFF00] font-bold">/{stations.length} Pods</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {availableStations.length} pods ready for walk-ins
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#CCFF00]" />
        </div>

        {/* Card 2: Occupancy Rate */}
        <div className="p-4 rounded-2xl bg-[#1E1E1E] border border-[#2E2E2E] hover:border-[#8A2BE2]/50 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Floor Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 flex items-center justify-center text-[#c084fc]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{occupancyPercent}%</span>
            <span className="text-xs text-[#c084fc] font-bold">Peak Rate</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {cleaningStations.length} cleaning &bull; {maintenanceStations.length} maintenance
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8A2BE2]" />
        </div>

        {/* Card 3: Revenue Today */}
        <div className="p-4 rounded-2xl bg-[#1E1E1E] border border-[#2E2E2E] hover:border-[#CCFF00]/50 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Revenue Today</span>
            <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#CCFF00] font-mono">
              {formatCurrency(totalRevenueToday, settings.currencySymbol)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Sessions: {formatCurrency(sessionRevenueCents, settings.currencySymbol)} &bull; POS: {formatCurrency(orderRevenueCents, settings.currencySymbol)}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#CCFF00]" />
        </div>

        {/* Card 4: Bookings Today */}
        <div className="p-4 rounded-2xl bg-[#1E1E1E] border border-[#2E2E2E] hover:border-[#FF8C00]/50 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Today's Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF8C00]/20 border border-[#FF8C00]/40 flex items-center justify-center text-[#FF8C00]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{todayBookings.length}</span>
            <span className="text-xs text-[#FF8C00] font-bold">Scheduled</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {todayBookings.filter(b => b.status === 'confirmed').length} confirmed &bull; {todayBookings.filter(b => b.status === 'pending').length} pending
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF8C00]" />
        </div>
      </div>

      {/* TWO COLUMN SECTION: Active Sessions & Quick Station Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Active Sessions Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#CCFF00]" />
              Live Gaming Sessions ({activeSessions.length})
            </h2>
            <Link href="/sessions" className="text-xs text-[#CCFF00] hover:underline flex items-center gap-1 font-bold">
              View All Sessions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-2xl overflow-hidden shadow-xl">
            {activeSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Monitor className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
                <p className="text-sm">No active sessions at the moment.</p>
                <Link
                  href="/sessions"
                  className="mt-3 inline-block px-4 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-[#111111] text-xs font-extrabold rounded-lg shadow-md"
                >
                  Start Walk-In Guest
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#2E2E2E]">
                {activeSessions.map(sess => {
                  const timing = getTimeRemaining(sess.expectedEndTime, mounted);
                  return (
                    <div
                      key={sess.id}
                      className="p-4 hover:bg-[#252525] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#282828] border border-[#3A3A3A] flex items-center justify-center font-bold text-[#CCFF00] font-mono text-sm">
                          {sess.stationName}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{sess.customerName}</span>
                            {sess.discountCents > 0 && (
                              <span className="text-[10px] font-bold text-[#CCFF00] bg-[#CCFF00]/15 px-1.5 py-0.5 rounded border border-[#CCFF00]/30 font-mono">
                                Member Rate
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            Started {formatTimeOnly(sess.startTime, mounted)} &bull;{' '}
                            {formatDuration(sess.durationMinutes)} total
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        {/* Countdown Pill */}
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                            timing.isOverdue
                              ? 'bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 animate-pulse'
                              : timing.isEndingSoon
                              ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                              : 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40'
                          }`}>
                            {timing.text}
                          </span>
                          <span className="block text-[10px] text-gray-400 mt-0.5 font-mono">
                            Charge: {formatCurrency(sess.totalChargedCents, settings.currencySymbol)}
                          </span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {sess.status === 'active' ? (
                            <button
                              onClick={() => pauseSession(sess.id)}
                              title="Pause Session"
                              className="p-1.5 rounded-lg bg-[#252525] hover:bg-[#2C2C2C] text-gray-300 border border-[#333333]"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => resumeSession(sess.id)}
                              title="Resume Session"
                              className="p-1.5 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-[#111111]"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                          <button
                            onClick={() => extendSession(sess.id, 30)}
                            title="+30m Extension"
                            className="px-2 py-1.5 rounded-lg bg-[#8A2BE2]/20 hover:bg-[#8A2BE2]/35 border border-[#8A2BE2]/40 text-[#c084fc] text-xs font-mono font-bold"
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
              <Monitor className="w-4 h-4 text-[#8A2BE2]" />
              Venue Stations ({stations.length})
            </h2>
            <Link href="/venue" className="text-xs text-[#CCFF00] font-bold hover:underline">
              Interactive 3D &rarr;
            </Link>
          </div>

          <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-2xl p-4 shadow-xl space-y-3">
            {/* Legend mini bar */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 pb-2 border-b border-[#2E2E2E] font-mono font-bold">
              <span className="text-[#CCFF00]">{availableStations.length} Available</span>
              <span className="text-[#8A2BE2]">{occupiedStations.length} Occupied</span>
              <span className="text-[#00F0FF]">{cleaningStations.length} Cleaning</span>
              <span className="text-[#FF0055]">{maintenanceStations.length} Maint.</span>
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
                    className={`p-2 rounded-lg text-center border transition-all ${
                      isOccupied
                        ? 'bg-[#8A2BE2]/20 border-[#8A2BE2]/50 text-[#c084fc] hover:bg-[#8A2BE2]/30'
                        : isAvailable
                        ? 'bg-[#CCFF00]/15 border-[#CCFF00]/40 text-[#CCFF00] hover:bg-[#CCFF00]/25'
                        : isCleaning
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF]'
                        : isMaint
                        ? 'bg-[#FF0055]/20 border-[#FF0055]/50 text-[#FF0055]'
                        : 'bg-[#FF8C00]/20 border-[#FF8C00]/50 text-[#FF8C00]'
                    }`}
                  >
                    <span className="block font-mono font-extrabold text-xs truncate">{st.name}</span>
                    <span className="block text-[9px] uppercase tracking-wider opacity-80">{st.type}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#2E2E2E]">
              <Link
                href="/bookings"
                className="w-full py-2 bg-[#252525] hover:bg-[#2C2C2C] border border-[#333333] rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#FF8C00]" />
                Manage Today's Bookings ({todayBookings.length})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Recent Audit Trail Feed */}
      <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#2E2E2E]">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8A2BE2]" />
            Operations Audit Log & Station Activity
          </h3>
          <Link href="/staff" className="text-xs text-[#CCFF00] font-bold hover:underline">
            Full Audit History &rarr;
          </Link>
        </div>

        <div className="divide-y divide-[#2E2E2E] max-h-48 overflow-y-auto">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#CCFF00] font-bold px-2 py-0.5 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[10px]">
                  {log.action}
                </span>
                <span className="text-gray-200">{log.details}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 font-mono text-[11px]">
                <span className="text-white font-semibold">{log.staffName} ({log.role})</span>
                <span className="text-[#CCFF00]">{formatTimeOnly(log.timestamp, mounted)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
