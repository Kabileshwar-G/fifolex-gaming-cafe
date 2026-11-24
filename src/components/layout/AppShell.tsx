"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/store/AppContext';
import { useMounted } from '@/lib/useMounted';
import {
  LayoutDashboard,
  Box,
  Monitor,
  Calendar,
  UtensilsCrossed,
  ChefHat,
  Users,
  Wrench,
  ShieldAlert,
  BarChart3,
  Settings,
  Sparkles,
  RefreshCw,
  Bell,
  Menu,
  X,
  ExternalLink,
  Clock,
  Layers,
  Database,
  Info
} from 'lucide-react';
import { getTimeRemaining, formatTimeOnly } from '@/lib/formatters';

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "3D Floor Plan", href: "/venue", icon: Box },
  { label: "Live Sessions", href: "/sessions", icon: Monitor },
  { label: "Bookings", href: "/bookings", icon: Calendar },
  { label: "POS & Billing", href: "/pos", icon: UtensilsCrossed },
  { label: "Kitchen Display", href: "/kitchen", icon: ChefHat },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Equipment & Maint.", href: "/equipment", icon: Wrench },
  { label: "Staff & Logs", href: "/staff", icon: ShieldAlert },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Cafe Settings", href: "/settings", icon: Settings },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const mounted = useMounted();
  const {
    currentStaff,
    staffUsers,
    switchStaffRole,
    resetToDemoDefaults,
    sessions,
    stations,
    settings
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Live station counts
  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const availableStationsCount = stations.filter(s => s.status === 'available').length;
  const occupiedStationsCount = stations.filter(s => s.status === 'occupied').length;

  // Alerts for ending soon / overdue sessions (guarded with mounted flag for SSR safety)
  const alerts = activeSessions.map(sess => {
    const timing = getTimeRemaining(sess.expectedEndTime, mounted);
    return {
      session: sess,
      timing
    };
  }).filter(a => a.timing.isEndingSoon || a.timing.isOverdue);

  return (
    <div className="flex h-screen bg-[#07080d] text-gray-200 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#1a1f2e] bg-[#0b0d14] z-30 select-none">
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#1a1f2e]">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0b0d14] rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-white">FIFOLEX</span>
              <span className="block text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Cyber Arena</span>
            </div>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
            DEMO
          </span>
        </div>

        {/* Live occupancy status pill */}
        <div className="px-4 py-3.5 border-b border-[#1a1f2e] bg-[#0e111a]/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400 font-medium">Floor Occupancy</span>
            <span className="font-mono text-cyan-400 font-bold">{occupiedStationsCount}/{stations.length} Pods</span>
          </div>
          <div className="w-full bg-[#161a26] h-2 rounded-full overflow-hidden flex border border-gray-800/80">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-500"
              style={{ width: `${(occupiedStationsCount / (stations.length || 1)) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-gray-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {availableStationsCount} Available
            </span>
            <span className="text-gray-400 font-mono">{activeSessions.length} Active Timers</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-600/20 text-white border border-indigo-500/40 shadow-sm shadow-indigo-950/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#131724]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="h-px bg-[#1a1f2e] my-2" />
            <Link
              href="/portal"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/30 border border-emerald-700/40 hover:bg-emerald-950/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Player Portal View
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </Link>
          </div>
        </nav>

        {/* Bottom Staff Switcher & Quick Actions */}
        <div className="p-3 border-t border-[#1a1f2e] bg-[#0b0d14]">
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              aria-label="Switch staff user or role"
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#131724] hover:bg-[#1a2030] border border-[#232a3d] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
                  {currentStaff.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-200 truncate">{currentStaff.name}</p>
                  <p className="text-[10px] text-cyan-400 capitalize font-mono">{currentStaff.role.replace('_', ' ')}</p>
                </div>
              </div>
              <span className="text-gray-400 text-xs">▼</span>
            </button>

            {/* Role Switcher Menu */}
            {showRoleDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-[#121622] border border-[#2a3044] rounded-xl shadow-2xl z-50 space-y-1">
                <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">Switch Active Staff</p>
                {staffUsers.map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      switchStaffRole(st.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      st.id === currentStaff.id ? 'bg-indigo-600 text-white font-bold' : 'text-gray-300 hover:bg-[#1a1f2e]'
                    }`}
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] opacity-80 capitalize font-mono">{st.role.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Header */}
        <header className="h-16 px-4 lg:px-6 flex items-center justify-between border-b border-[#1a1f2e] bg-[#0c0e16]/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-xl bg-[#141824] text-gray-300 hover:text-white border border-gray-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <h1 className="text-sm font-bold text-white tracking-wide truncate">
                {settings.cafeName}
              </h1>
              <p className="text-[11px] text-gray-400 hidden sm:block font-mono">
                Venue Ops &bull; Timezone: {settings.timezone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Alerts Drawer Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                aria-label={`View alerts (${alerts.length})`}
                className={`relative p-2 rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  alerts.length > 0
                    ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-950/60'
                    : 'bg-[#141824] border-[#232838] text-gray-400 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Alerts dropdown drawer */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-2 w-80 p-3 bg-[#121622] border border-[#2a3044] rounded-2xl shadow-2xl z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
                    <span className="text-xs font-bold text-gray-200">Active Station Alerts</span>
                    <span className="text-[10px] font-mono text-cyan-400">{alerts.length} items</span>
                  </div>

                  {alerts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">All active sessions running smoothly</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {alerts.map(({ session, timing }) => (
                        <div
                          key={session.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            timing.isOverdue
                              ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                              : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>{session.stationName} &bull; {session.customerName}</span>
                            <span className="font-mono text-[11px]">{timing.text}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5 text-[11px] opacity-80">
                            <span>Started: {formatTimeOnly(session.startTime, mounted)}</span>
                            <Link href="/sessions" className="underline hover:text-white font-semibold">Manage &rarr;</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reset Demo button */}
            <button
              onClick={() => {
                if (confirm("Reset all synthetic station states, orders, and sessions to default demo state?")) {
                  resetToDemoDefaults();
                }
              }}
              title="Reset Demo Records"
              aria-label="Reset demo synthetic records"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-[#141824] hover:bg-[#1a2030] text-gray-300 hover:text-cyan-300 border border-[#232838] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Reset Demo</span>
            </button>
          </div>
        </header>

        {/* Demo Persistence Notice Bar */}
        {!bannerDismissed && (
          <div className="bg-gradient-to-r from-indigo-950/90 via-[#0d1326] to-cyan-950/90 px-4 py-2 border-b border-indigo-800/40 flex items-center justify-between text-xs text-indigo-200">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-white">Demo Mode Active:</strong> State persists in your local browser storage. Ready for Supabase/PostgreSQL hosted connection.
              </span>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss banner"
              className="text-gray-400 hover:text-white ml-2 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-40 bg-[#08090d]/95 backdrop-blur px-4 py-6 overflow-y-auto border-t border-gray-800">
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-[#141824]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-gray-800">
                <Link
                  href="/portal"
                  target="_blank"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-emerald-300 bg-emerald-950/40 border border-emerald-700/50"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Player Portal View
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-[#07080d]">
          {children}
        </main>
      </div>
    </div>
  );
};
