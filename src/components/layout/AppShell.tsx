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

  // Alerts for ending soon / overdue sessions
  const alerts = activeSessions.map(sess => {
    const timing = getTimeRemaining(sess.expectedEndTime, mounted);
    return {
      session: sess,
      timing
    };
  }).filter(a => a.timing.isEndingSoon || a.timing.isOverdue);

  return (
    <div className="flex h-screen bg-[#111111] text-white overflow-hidden font-sans">
      {/* Sidebar for Desktop - Matte Carbon & Dark Gunmetal */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#262626] bg-[#161616] z-30 select-none">
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#262626]">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] rounded-lg p-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8A2BE2] via-[#CCFF00] to-[#00F0FF] p-[1.5px] shadow-lg shadow-[#CCFF00]/15">
              <div className="w-full h-full bg-[#111111] rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-[#CCFF00] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">FIFOLEX</span>
              <span className="block text-[10px] text-[#CCFF00] font-mono tracking-widest uppercase font-bold">Cyber Lounge</span>
            </div>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#8A2BE2]/20 text-[#c084fc] border border-[#8A2BE2]/40 font-bold">
            GLITCH
          </span>
        </div>

        {/* Live occupancy status pill */}
        <div className="px-4 py-3.5 border-b border-[#262626] bg-[#1A1A1A]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400 font-medium">Floor Occupancy</span>
            <span className="font-mono text-[#CCFF00] font-bold">{occupiedStationsCount}/{stations.length} Pods</span>
          </div>
          <div className="w-full bg-[#111111] h-2 rounded-full overflow-hidden flex border border-[#2E2E2E]">
            <div
              className="bg-gradient-to-r from-[#8A2BE2] to-[#CCFF00] h-full transition-all duration-500"
              style={{ width: `${(occupiedStationsCount / (stations.length || 1)) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="flex items-center gap-1.5 text-[#CCFF00] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] inline-block animate-pulse"></span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
                  isActive
                    ? 'bg-[#CCFF00] text-[#111111] font-extrabold shadow-md shadow-[#CCFF00]/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#202020]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#111111]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="h-px bg-[#262626] my-2" />
            <Link
              href="/portal"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#c084fc] bg-[#8A2BE2]/15 border border-[#8A2BE2]/40 hover:bg-[#8A2BE2]/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8A2BE2]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8A2BE2]" />
                Player Portal View
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8A2BE2]" />
            </Link>
          </div>
        </nav>

        {/* Bottom Staff Switcher & Quick Actions */}
        <div className="p-3 border-t border-[#262626] bg-[#161616]">
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              aria-label="Switch staff user or role"
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#202020] hover:bg-[#262626] border border-[#2E2E2E] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8A2BE2] to-[#CCFF00] flex items-center justify-center font-bold text-[#111111] text-xs">
                  {currentStaff.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentStaff.name}</p>
                  <p className="text-[10px] text-[#CCFF00] capitalize font-mono font-bold">{currentStaff.role.replace('_', ' ')}</p>
                </div>
              </div>
              <span className="text-gray-400 text-xs">▼</span>
            </button>

            {/* Role Switcher Menu */}
            {showRoleDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-[#1E1E1E] border border-[#333333] rounded-xl shadow-2xl z-50 space-y-1">
                <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">Switch Active Staff</p>
                {staffUsers.map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      switchStaffRole(st.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      st.id === currentStaff.id ? 'bg-[#CCFF00] text-[#111111] font-bold' : 'text-gray-300 hover:bg-[#2A2A2A]'
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
        <header className="h-16 px-4 lg:px-6 flex items-center justify-between border-b border-[#262626] bg-[#161616]/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-xl bg-[#202020] text-gray-300 hover:text-white border border-[#2E2E2E]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <h1 className="text-sm font-bold text-white tracking-wide truncate">
                {settings.cafeName}
              </h1>
              <p className="text-[11px] text-gray-400 hidden sm:block font-mono">
                Glitch Mode &bull; Timezone: {settings.timezone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Alerts Drawer Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                aria-label={`View alerts (${alerts.length})`}
                className={`relative p-2 rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
                  alerts.length > 0
                    ? 'bg-[#FF8C00]/20 border-[#FF8C00]/50 text-[#FF8C00] hover:bg-[#FF8C00]/30'
                    : 'bg-[#202020] border-[#2E2E2E] text-gray-400 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF0055] text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Alerts dropdown drawer */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-2 w-80 p-3 bg-[#1E1E1E] border border-[#333333] rounded-2xl shadow-2xl z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2E2E2E]">
                    <span className="text-xs font-bold text-white">Active Station Alerts</span>
                    <span className="text-[10px] font-mono text-[#CCFF00] font-bold">{alerts.length} items</span>
                  </div>

                  {alerts.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">All active sessions running smoothly</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {alerts.map(({ session, timing }) => (
                        <div
                          key={session.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            timing.isOverdue
                              ? 'bg-[#FF0055]/20 border-[#FF0055]/50 text-[#FF0055]'
                              : 'bg-[#FF8C00]/20 border-[#FF8C00]/50 text-[#FF8C00]'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>{session.stationName} &bull; {session.customerName}</span>
                            <span className="font-mono text-[11px]">{timing.text}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5 text-[11px] opacity-90">
                            <span>Started: {formatTimeOnly(session.startTime, mounted)}</span>
                            <Link href="/sessions" className="underline hover:text-white font-bold">Manage &rarr;</Link>
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-[#202020] hover:bg-[#282828] text-gray-300 hover:text-[#CCFF00] border border-[#2E2E2E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold">Reset Demo</span>
            </button>
          </div>
        </header>

        {/* Demo Persistence Notice Bar */}
        {!bannerDismissed && (
          <div className="bg-[#1E1E1E] px-4 py-2 border-b border-[#2E2E2E] flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
              <span>
                <strong className="text-[#CCFF00]">Glitch Mode Active:</strong> #111111 Matte Carbon &bull; #1E1E1E Gunmetal &bull; #CCFF00 Acid Green &bull; #8A2BE2 Ultraviolet.
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
          <div className="lg:hidden fixed inset-0 top-16 z-40 bg-[#111111]/95 backdrop-blur px-4 py-6 overflow-y-auto border-t border-[#262626]">
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
                      isActive ? 'bg-[#CCFF00] text-[#111111] font-extrabold' : 'text-gray-300 hover:bg-[#1E1E1E]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-[#262626]">
                <Link
                  href="/portal"
                  target="_blank"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-[#c084fc] bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 font-bold"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8A2BE2]" />
                    Player Portal View
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-[#111111]">
          {children}
        </main>
      </div>
    </div>
  );
};
