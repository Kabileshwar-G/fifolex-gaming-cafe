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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-[#F8FAFC] text-slate-900">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
              Modern Studio
            </span>
            <span className="text-xs text-slate-500 font-mono">Live Operations Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-wide mt-1 flex items-center gap-2">
            Control Room Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time session timers, 3D venue occupancy, food orders, and station state machines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/venue"
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            <Activity className="w-4 h-4" />
            Launch 3D Floor View
          </Link>
          <Link
            href="/sessions"
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-[#2563EB] fill-current" />
            Start Session
          </Link>
        </div>
      </div>

      {/* METRIC KPI CARDS - Clean White Cards with High-Contrast Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Sessions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Live Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{activeSessions.length}</span>
            <span className="text-xs text-blue-600 font-bold">/{stations.length} Pods</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {availableStations.length} pods ready for walk-ins
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2563EB]" />
        </div>

        {/* Card 2: Occupancy Rate */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Floor Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{occupancyPercent}%</span>
            <span className="text-xs text-purple-600 font-bold">Peak Rate</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {cleaningStations.length} cleaning &bull; {maintenanceStations.length} maintenance
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600" />
        </div>

        {/* Card 3: Revenue Today */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Revenue Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              {formatCurrency(totalRevenueToday, settings.currencySymbol)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sessions: {formatCurrency(sessionRevenueCents, settings.currencySymbol)} &bull; POS: {formatCurrency(orderRevenueCents, settings.currencySymbol)}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Card 4: Bookings Today */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Today's Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{todayBookings.length}</span>
            <span className="text-xs text-amber-600 font-bold">Scheduled</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
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
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2563EB]" />
              Live Gaming Sessions ({activeSessions.length})
            </h2>
            <Link href="/sessions" className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 font-bold">
              View All Sessions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {activeSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Monitor className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm">No active sessions at the moment.</p>
                <Link
                  href="/sessions"
                  className="mt-3 inline-block px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Start Walk-In Guest
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {activeSessions.map(sess => {
                  const timing = getTimeRemaining(sess.expectedEndTime, mounted);
                  return (
                    <div
                      key={sess.id}
                      className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[#2563EB] font-mono text-sm">
                          {sess.stationName}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{sess.customerName}</span>
                            {sess.discountCents > 0 && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-mono">
                                Member Rate
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
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
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : timing.isEndingSoon
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {timing.text}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5 font-mono">
                            Charge: {formatCurrency(sess.totalChargedCents, settings.currencySymbol)}
                          </span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {sess.status === 'active' ? (
                            <button
                              onClick={() => pauseSession(sess.id)}
                              title="Pause Session"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => resumeSession(sess.id)}
                              title="Resume Session"
                              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                          <button
                            onClick={() => extendSession(sess.id, 30)}
                            title="+30m Extension"
                            className="px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-mono font-bold"
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
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#2563EB]" />
              Venue Stations ({stations.length})
            </h2>
            <Link href="/venue" className="text-xs text-[#2563EB] font-bold hover:underline">
              Interactive 3D &rarr;
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            {/* Legend mini bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-200 font-mono font-bold">
              <span className="text-emerald-600">{availableStations.length} Available</span>
              <span className="text-blue-600">{occupiedStations.length} Occupied</span>
              <span className="text-purple-600">{cleaningStations.length} Cleaning</span>
              <span className="text-rose-600">{maintenanceStations.length} Maint.</span>
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
                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                        : isAvailable
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : isCleaning
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : isMaint
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}
                  >
                    <span className="block font-mono font-extrabold text-xs truncate">{st.name}</span>
                    <span className="block text-[9px] uppercase tracking-wider opacity-80">{st.type}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <Link
                href="/bookings"
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Manage Today's Bookings ({todayBookings.length})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Recent Audit Trail Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            Operations Audit Log & Station Activity
          </h3>
          <Link href="/staff" className="text-xs text-[#2563EB] font-bold hover:underline">
            Full Audit History &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-200 max-h-48 overflow-y-auto">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-blue-700 font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[10px]">
                  {log.action}
                </span>
                <span className="text-slate-800">{log.details}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                <span className="text-slate-900 font-semibold">{log.staffName} ({log.role})</span>
                <span className="text-blue-600">{formatTimeOnly(log.timestamp, mounted)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
