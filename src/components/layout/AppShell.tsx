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
    <div className="flex h-screen bg-[#0A0E17] text-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar for Desktop - Sleek Midnight Obsidian */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#1F293D] bg-[#0E1422] z-30 select-none">
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#1F293D]">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF] rounded-lg p-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] via-[#00D2FF] to-[#10B981] p-[1.5px] shadow-lg shadow-[#00D2FF]/20">
              <div className="w-full h-full bg-[#0A0E17] rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-[#00D2FF] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">FIFOLEX</span>
              <span className="block text-[10px] text-[#00D2FF] font-mono tracking-widest uppercase font-bold">Esports Arena</span>
            </div>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30 font-bold">
            PRO
          </span>
        </div>

        {/* Live occupancy status pill */}
        <div className="px-4 py-3.5 border-b border-[#1F293D] bg-[#121826]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#94A3B8] font-medium">Floor Occupancy</span>
            <span className="font-mono text-[#00D2FF] font-bold">{occupiedStationsCount}/{stations.length} Pods</span>
          </div>
          <div className="w-full bg-[#0A0E17] h-2 rounded-full overflow-hidden flex border border-[#1F293D]">
            <div
              className="bg-gradient-to-r from-[#6366F1] to-[#00D2FF] h-full transition-all duration-500"
              style={{ width: `${(occupiedStationsCount / (stations.length || 1)) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="flex items-center gap-1.5 text-[#10B981] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse"></span>
              {availableStationsCount} Available
            </span>
            <span className="text-[#94A3B8] font-mono">{activeSessions.length} Active Timers</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF] ${
                  isActive
                    ? 'bg-[#00D2FF] text-[#0A0E17] font-bold shadow-md shadow-[#00D2FF]/20'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F32]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0A0E17]' : 'text-[#94A3B8]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="h-px bg-[#1F293D] my-2" />
            <Link
              href="/portal"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#66E5FF] bg-[#00D2FF]/10 border border-[#00D2FF]/30 hover:bg-[#00D2FF]/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00D2FF]" />
                Player Portal View
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#00D2FF]" />
            </Link>
          </div>
        </nav>

        {/* Bottom Staff Switcher */}
        <div className="p-3 border-t border-[#1F293D] bg-[#0E1422]">
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              aria-label="Switch staff user or role"
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#121826] hover:bg-[#161F32] border border-[#1F293D] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#00D2FF] flex items-center justify-center font-bold text-[#0A0E17] text-xs">
                  {currentStaff.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentStaff.name}</p>
                  <p className="text-[10px] text-[#00D2FF] capitalize font-mono font-bold">{currentStaff.role.replace('_', ' ')}</p>
                </div>
              </div>
              <span className="text-[#94A3B8] text-xs">▼</span>
            </button>

            {/* Role Switcher Menu */}
            {showRoleDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-[#121826] border border-[#1F293D] rounded-xl shadow-2xl z-50 space-y-1">
                <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold font-mono">Switch Active Staff</p>
                {staffUsers.map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      switchStaffRole(st.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      st.id === currentStaff.id ? 'bg-[#00D2FF] text-[#0A0E17] font-bold' : 'text-gray-300 hover:bg-[#161F32]'
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
        <header className="h-16 px-4 lg:px-6 flex items-center justify-between border-b border-[#1F293D] bg-[#0E1422]/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-xl bg-[#121826] text-gray-300 hover:text-white border border-[#1F293D]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <h1 className="text-sm font-bold text-white tracking-wide truncate">
                {settings.cafeName}
              </h1>
              <span className="text-[11px] text-[#94A3B8] font-medium hidden sm:inline">
                {settings.tagline}
              </span>
            </div>
          </div>

          {/* Quick Telemetry & Status Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Session Ending Alerts Button */}
            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              aria-label="View urgent session alerts"
              className="relative p-2 rounded-xl bg-[#121826] hover:bg-[#161F32] border border-[#1F293D] text-[#94A3B8] hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#EF4444] text-white text-[10px] font-bold rounded-full animate-bounce">
                  {alerts.length}
                </span>
              )}
            </button>

            {/* Quick Demo Reset Button */}
            <button
              onClick={() => {
                if (confirm("Reset demo data to synthetic defaults? All unsaved test changes will be reset.")) {
                  resetToDemoDefaults();
                }
              }}
              title="Reset synthetic demo data to initial state"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121826] hover:bg-[#161F32] border border-[#1F293D] rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#00D2FF]" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Active Operator Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121826] border border-[#1F293D] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="text-[#94A3B8]">Staff:</span>
              <span className="font-bold text-white font-mono">{currentStaff.name}</span>
            </div>
          </div>
        </header>

        {/* Demo Persistence Notice Bar */}
        {!bannerDismissed && (
          <div className="bg-[#121826] border-b border-[#1F293D] px-4 py-2 flex items-center justify-between text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#00D2FF]" />
              <span>
                <strong className="text-white">Local Demo Mode:</strong> Data persists in your browser storage. Real café production systems and live payments are safely isolated.
              </span>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-[#94A3B8] hover:text-white px-2 py-0.5 rounded text-[11px]"
              aria-label="Dismiss demo notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0E17]">
          {children}
        </main>
      </div>

      {/* Notifications Drawer (Overdue / Ending Sessions) */}
      {showNotificationDrawer && (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#121826] border-l border-[#1F293D] shadow-2xl z-50 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#00D2FF]" />
                <h3 className="font-bold text-sm text-white">Live Session Alerts</h3>
              </div>
              <button onClick={() => setShowNotificationDrawer(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 overflow-y-auto max-h-[75vh]">
              {alerts.length === 0 ? (
                <p className="text-xs text-[#94A3B8] py-8 text-center">Zero urgent session warnings. All gaming timers in healthy range.</p>
              ) : (
                alerts.map(a => (
                  <div key={a.session.id} className="p-3 rounded-xl bg-[#161F32] border border-[#1F293D] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white">{a.session.stationName}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${a.timing.isOverdue ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'}`}>
                        {a.timing.isOverdue ? 'Overdue' : 'Ending Soon'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-medium">{a.session.customerName}</p>
                    <p className="text-[11px] text-[#94A3B8] font-mono">{a.timing.text} remaining &bull; ends at {formatTimeOnly(a.session.expectedEndTime, mounted)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <button
            onClick={() => setShowNotificationDrawer(false)}
            className="w-full py-2 bg-[#161F32] hover:bg-[#1A2438] text-white text-xs font-semibold rounded-xl border border-[#1F293D]"
          >
            Close Alerts
          </button>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 lg:hidden flex">
          <div className="w-64 bg-[#0E1422] border-r border-[#1F293D] flex flex-col h-full">
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#1F293D]">
              <span className="font-extrabold text-lg text-white">FIFOLEX</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                    pathname === item.href ? 'bg-[#00D2FF] text-[#0A0E17]' : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                href="/portal"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#00D2FF] bg-[#00D2FF]/10 mt-4 border border-[#00D2FF]/30"
              >
                <Sparkles className="w-4 h-4 text-[#00D2FF]" />
                <span>Player Portal View</span>
              </Link>
            </nav>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </div>
  );
};
