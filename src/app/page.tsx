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
  ExternalLink
} from 'lucide-react';

export default function DashboardPage() {
  const mounted = useMounted();
  const {
    stations,
    sessions,
    bookings,
    orders,
    customers,
    settings,
    pauseSession,
    resumeSession,
    extendSession,
    selectStation,
    auditLogs
  } = useApp();

  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const availableStations = stations.filter(s => s.status === 'available');
  const occupiedStations = stations.filter(s => s.status === 'occupied');
  const cleaningStations = stations.filter(s => s.status === 'cleaning');
  const maintenanceStations = stations.filter(s => s.status === 'maintenance');

  // Calculate gross sales today
  const sessionRevenueCents = sessions.reduce((acc, s) => acc + s.totalChargedCents, 0);
  const orderRevenueCents = orders.reduce((acc, o) => acc + (o.paid ? o.totalCents : 0), 0);
  const totalRevenueToday = sessionRevenueCents + orderRevenueCents;

  const occupancyPercent = Math.round((occupiedStations.length / stations.length) * 100);

  // Today's bookings
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Operational Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Control Room Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time operations, session telemetry, and venue occupancy at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/venue"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-950/50 transition-all"
          >
            <Activity className="w-4 h-4" />
            Launch 3D Floor View
          </Link>
          <Link
            href="/sessions"
            className="flex items-center gap-2 px-4 py-2 bg-[#141824] hover:bg-[#1b2233] border border-[#262f44] text-gray-200 font-semibold rounded-xl text-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            Start Session
          </Link>
        </div>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Sessions */}
        <div className="p-4 rounded-2xl bg-[#0f131d] border border-[#1f2538] hover:border-cyan-500/30 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Live Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activeSessions.length}</span>
            <span className="text-xs text-cyan-400 font-medium">/{stations.length} Pods</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {availableStations.length} pods ready for walk-ins
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />
        </div>

        {/* Card 2: Occupancy Rate */}
        <div className="p-4 rounded-2xl bg-[#0f131d] border border-[#1f2538] hover:border-indigo-500/30 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Floor Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{occupancyPercent}%</span>
            <span className="text-xs text-indigo-400 font-medium">Peak Rate</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {cleaningStations.length} cleaning &bull; {maintenanceStations.length} maintenance
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
        </div>

        {/* Card 3: Revenue Today */}
        <div className="p-4 rounded-2xl bg-[#0f131d] border border-[#1f2538] hover:border-emerald-500/30 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Revenue Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {formatCurrency(totalRevenueToday, settings.currencySymbol)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Sessions: {formatCurrency(sessionRevenueCents, settings.currencySymbol)} &bull; POS: {formatCurrency(orderRevenueCents, settings.currencySymbol)}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Card 4: Bookings Today */}
        <div className="p-4 rounded-2xl bg-[#0f131d] border border-[#1f2538] hover:border-amber-500/30 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Today's Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{todayBookings.length}</span>
            <span className="text-xs text-amber-400 font-medium">Scheduled</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {todayBookings.filter(b => b.status === 'confirmed').length} confirmed &bull; {todayBookings.filter(b => b.status === 'pending').length} pending
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>
      </div>

      {/* TWO COLUMN SECTION: Active Sessions & Quick Station Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Active Sessions Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Gaming Sessions ({activeSessions.length})
            </h2>
            <Link href="/sessions" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium">
              View All Sessions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#0e121c] border border-[#1f2538] rounded-2xl overflow-hidden shadow-xl">
            {activeSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Monitor className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No active sessions at the moment.</p>
                <Link
                  href="/sessions"
                  className="mt-3 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg"
                >
                  Start Walk-In Guest
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/80">
                {activeSessions.map(sess => {
                  const timing = getTimeRemaining(sess.expectedEndTime, mounted);
                  return (
                    <div
                      key={sess.id}
                      className="p-4 hover:bg-[#131826] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#181f33] border border-[#283452] flex items-center justify-center font-bold text-cyan-400 font-mono text-sm">
                          {sess.stationName}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-100 text-sm">{sess.customerName}</span>
                            {sess.discountCents > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
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
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 animate-pulse'
                              : timing.isEndingSoon
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                              : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
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
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => resumeSession(sess.id)}
                              title="Resume Session"
                              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => extendSession(sess.id, 30)}
                            title="+30m Extension"
                            className="px-2 py-1.5 rounded-lg bg-[#1a2133] hover:bg-[#222c44] border border-[#2d3a5a] text-cyan-300 text-xs font-mono font-bold"
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
              <Monitor className="w-4 h-4 text-indigo-400" />
              Venue Stations ({stations.length})
            </h2>
            <Link href="/venue" className="text-xs text-indigo-400 hover:underline">
              Interactive 3D &rarr;
            </Link>
          </div>

          <div className="bg-[#0e121c] border border-[#1f2538] rounded-2xl p-4 shadow-xl space-y-3">
            {/* Legend mini bar */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 pb-2 border-b border-gray-800 font-mono">
              <span className="text-emerald-400 font-bold">{availableStations.length} Available</span>
              <span className="text-cyan-400 font-bold">{occupiedStations.length} Occupied</span>
              <span className="text-purple-400 font-bold">{cleaningStations.length} Cleaning</span>
              <span className="text-rose-400 font-bold">{maintenanceStations.length} Maint.</span>
            </div>

            {/* Quick Pod Matrix Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {stations.map(st => {
                const isOccupied = st.status === 'occupied';
                const isAvailable = st.status === 'available';
                const isCleaning = st.status === 'cleaning';
                const isMaint = st.status === 'maintenance';
                const isReserved = st.status === 'reserved';

                return (
                  <Link
                    key={st.id}
                    href="/venue"
                    onClick={() => selectStation(st.id)}
                    className={`p-2 rounded-lg text-center border transition-all ${
                      isOccupied
                        ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300 hover:bg-cyan-950/70'
                        : isAvailable
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300 hover:bg-emerald-950/60'
                        : isCleaning
                        ? 'bg-purple-950/40 border-purple-800/50 text-purple-300'
                        : isMaint
                        ? 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                        : 'bg-amber-950/40 border-amber-800/50 text-amber-300'
                    }`}
                  >
                    <span className="block font-mono font-bold text-xs truncate">{st.name}</span>
                    <span className="block text-[9px] uppercase tracking-wider opacity-75">{st.type}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-800/80">
              <Link
                href="/bookings"
                className="w-full py-2 bg-[#141824] hover:bg-[#1a2133] border border-[#232b40] rounded-xl text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Manage Today's Bookings ({todayBookings.length})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Recent Audit Trail Feed */}
      <div className="bg-[#0e121c] border border-[#1f2538] rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Operations Audit Log & Station Activity
          </h3>
          <Link href="/staff" className="text-xs text-indigo-400 hover:underline">
            Full Audit History &rarr;
          </Link>
        </div>

        <div className="divide-y divide-gray-800/60 max-h-48 overflow-y-auto">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-900/40 text-[10px]">
                  {log.action}
                </span>
                <span className="text-gray-300">{log.details}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 font-mono text-[11px]">
                <span>{log.staffName} ({log.role})</span>
                <span>{formatTimeOnly(log.timestamp, mounted)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
