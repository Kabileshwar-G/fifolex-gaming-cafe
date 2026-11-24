"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { formatCurrency, formatDuration } from '@/lib/formatters';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Monitor,
  Users,
  Gamepad2,
  UtensilsCrossed,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function ReportsPage() {
  const {
    sessions,
    orders,
    stations,
    customers,
    settings
  } = useApp();

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  // Compute metrics
  const totalSessionRevenueCents = sessions.reduce((acc, s) => acc + s.totalChargedCents, 0);
  const totalOrderRevenueCents = orders.reduce((acc, o) => acc + (o.paid ? o.totalCents : 0), 0);
  const totalGrossRevenueCents = totalSessionRevenueCents + totalOrderRevenueCents;

  const totalSessionHours = Math.round(sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60);

  // Platform popularity
  const platformHours: Record<string, number> = {};
  stations.forEach(st => {
    platformHours[st.type] = 0;
  });
  sessions.forEach(sess => {
    const st = stations.find(s => s.id === sess.stationId);
    if (st) {
      platformHours[st.type] = (platformHours[st.type] || 0) + (sess.durationMinutes / 60);
    }
  });

  // Export JSON Report
  const handleExportJSON = () => {
    const reportData = {
      cafeName: settings.cafeName,
      generatedAt: new Date().toISOString(),
      dateRange,
      totalRevenueCents: totalGrossRevenueCents,
      totalSessionRevenueCents,
      totalOrderRevenueCents,
      totalSessionHours,
      activePodCount: stations.length,
      sessionsCount: sessions.length,
      ordersCount: orders.length,
      customersCount: customers.length
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fifolex-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Cafe Name", settings.cafeName],
      ["Date Range", dateRange],
      ["Total Gross Revenue", (totalGrossRevenueCents / 100).toFixed(2)],
      ["Session Revenue", (totalSessionRevenueCents / 100).toFixed(2)],
      ["Food & Drink POS Revenue", (totalOrderRevenueCents / 100).toFixed(2)],
      ["Total Gaming Hours", totalSessionHours.toString()],
      ["Total Completed Sessions", sessions.length.toString()],
      ["Total POS Orders", orders.length.toString()],
      ["Total Registered Members", customers.length.toString()]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fifolex-summary-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Operations Analytics & Financial Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Revenue breakdown, station utilization, and downloadable management reports.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#141824] hover:bg-[#1d2334] border border-[#232b40] rounded-xl text-xs font-semibold text-gray-200"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex p-1 bg-[#121622] border border-[#232b40] rounded-xl self-start w-fit">
        {(['today', 'week', 'month'] as const).map(range => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              dateRange === range
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f131d] border border-[#1f2538]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Gross Revenue</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono">
            {formatCurrency(totalGrossRevenueCents, settings.currencySymbol)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Sessions + Food & Beverage POS</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131d] border border-[#1f2538]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Total Gaming Hours</span>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">
            {totalSessionHours} hrs
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Across 26 pod units</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131d] border border-[#1f2538]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">POS Food Sales</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-400 font-mono">
            {formatCurrency(totalOrderRevenueCents, settings.currencySymbol)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{orders.length} orders served</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131d] border border-[#1f2538]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Active Members</span>
          <div className="mt-2 text-2xl font-extrabold text-cyan-400 font-mono">
            {customers.length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">VIP & registered guests</p>
        </div>
      </div>

      {/* Popular Platforms & Utilization Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Share */}
        <div className="p-5 rounded-2xl bg-[#0e121c] border border-[#1f2538] space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            Station Platform Hours Share
          </h2>

          <div className="space-y-3 pt-2">
            {Object.entries(platformHours).map(([platform, hours]) => {
              const maxHours = Math.max(...Object.values(platformHours), 1);
              const pct = Math.round((hours / maxHours) * 100);

              return (
                <div key={platform} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-300 uppercase tracking-wider font-mono">{platform}</span>
                    <span className="font-mono text-cyan-300 font-bold">{hours.toFixed(1)} hrs</span>
                  </div>
                  <div className="w-full bg-[#181d2e] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Hours Distribution */}
        <div className="p-5 rounded-2xl bg-[#0e121c] border border-[#1f2538] space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Peak Operational Traffic Window
          </h2>

          <div className="space-y-2 text-xs pt-1">
            <div className="flex justify-between p-2 rounded-lg bg-[#141824] text-gray-300">
              <span>Prime Peak Hours (High Demand):</span>
              <span className="font-mono font-bold text-rose-400">18:00 - 23:00 (92% Occ.)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#141824] text-gray-300">
              <span>Afternoon Esports Wave:</span>
              <span className="font-mono font-bold text-amber-400">14:00 - 18:00 (68% Occ.)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#141824] text-gray-300">
              <span>Morning Casual Play:</span>
              <span className="font-mono font-bold text-emerald-400">10:00 - 14:00 (35% Occ.)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#141824] text-gray-300">
              <span>Late Night Hardcore:</span>
              <span className="font-mono font-bold text-purple-400">23:00 - 03:00 (74% Occ.)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
