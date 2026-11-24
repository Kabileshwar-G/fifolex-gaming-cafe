"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/store/AppContext';
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
  Layers
} from 'lucide-react';
import { getTimeRemaining } from '@/lib/formatters';

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

  // Calculate live stats
  const activeSessions = sessions.filter(s => s.status === 'active');
  const availableStationsCount = stations.filter(s => s.status === 'available').length;
  const occupiedStationsCount = stations.filter(s => s.status === 'occupied').length;

  // Alerts for ending soon / overdue sessions
  const alerts = activeSessions.map(sess => {
    const timing = getTimeRemaining(sess.expectedEndTime);
    return {
      session: sess,
      timing
    };
  }).filter(a => a.timing.isEndingSoon || a.timing.isOverdue);

  return (
    <div className="flex h-screen bg-[#08090d] text-gray-200 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#1a1f2c] bg-[#0c0e14] z-30 select-none">
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#1a1f2c]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-white">FIFOLEX</span>
              <span className="block text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Cyber Ops</span>
            </div>
          </Link>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            DEMO
          </span>
        </div>

        {/* Live occupancy status pill */}
        <div className="px-4 py-3 border-b border-[#1a1f2c]/60 bg-[#0e111a]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400 font-medium">Floor Occupancy</span>
            <span className="font-mono text-cyan-400 font-semibold">{occupiedStationsCount}/{stations.length}</span>
          </div>
          <div className="w-full bg-gray-800/60 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-cyan-500 h-full transition-all duration-500"
              style={{ width: `${(occupiedStationsCount / stations.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1.5 text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {availableStationsCount} Free
            </span>
            <span className="text-gray-400">{activeSessions.length} Active Timers</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#141824]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="h-px bg-[#1a1f2c] my-2" />
            <Link
              href="/portal"
              target="_blank"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/20 border border-emerald-800/30 hover:bg-emerald-950/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Customer Portal
              </span>
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </Link>
          </div>
        </nav>

        {/* Bottom Staff Switcher & Quick Actions */}
        <div className="p-3 border-t border-[#1a1f2c] bg-[#0c0e14]">
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#141824] hover:bg-[#1b2131] border border-[#232838] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-xs">
                  {currentStaff.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">{currentStaff.name}</p>
                  <p className="text-[10px] text-cyan-400 capitalize">{currentStaff.role.replace('_', ' ')}</p>
                </div>
              </div>
              <span className="text-gray-400 text-xs">▼</span>
            </button>

            {/* Role Switcher Menu */}
            {showRoleDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-[#121622] border border-[#2a3044] rounded-lg shadow-2xl z-50 space-y-1">
                <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-400 font-bold">Switch Demo Role</p>
                {staffUsers.map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      switchStaffRole(st.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between ${
                      st.id === currentStaff.id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-[#1a1f2e]'
                    }`}
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] opacity-75 capitalize">{st.role.replace('_', ' ')}</span>
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
        <header className="h-16 px-4 lg:px-6 flex items-center justify-between border-b border-[#1a1f2c] bg-[#0c0e14]/90 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-[#141824] text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <h1 className="text-sm font-semibold text-white tracking-wide truncate">
                {settings.cafeName}
              </h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Operations Control &bull; Live Timezone: {settings.timezone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Overdue / Ending Alerts Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className={`relative p-2 rounded-lg border transition-colors ${
                  alerts.length > 0
                    ? 'bg-amber-950/30 border-amber-600/40 text-amber-400 hover:bg-amber-950/50'
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
                <div className="absolute right-0 mt-2 w-80 p-3 bg-[#121622] border border-[#2a3044] rounded-xl shadow-2xl z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
                    <span className="text-xs font-bold text-gray-200">Session Alerts</span>
                    <span className="text-[10px] text-gray-400">{alerts.length} items</span>
                  </div>

                  {alerts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-3 text-center">No overdue or ending-soon stations</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {alerts.map(({ session, timing }) => (
                        <div
                          key={session.id}
                          className={`p-2.5 rounded-lg border text-xs ${
                            timing.isOverdue
                              ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                              : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span>{session.stationName} &bull; {session.customerName}</span>
                            <span className="font-mono text-[11px]">{timing.text}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[11px] opacity-80">
                            <span>Started: {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <Link href="/sessions" className="underline hover:text-white">Manage</Link>
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
                if (confirm("Reset all synthetic station states, orders, and sessions to demo defaults?")) {
                  resetToDemoDefaults();
                }
              }}
              title="Reset Demo Data"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#141824] hover:bg-[#1a2030] text-gray-400 hover:text-cyan-300 border border-[#232838] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </header>

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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
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
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-emerald-400 bg-emerald-950/30 border border-emerald-800/40"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Customer Portal
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-[#08090d]">
          {children}
        </main>
      </div>
    </div>
  );
};
