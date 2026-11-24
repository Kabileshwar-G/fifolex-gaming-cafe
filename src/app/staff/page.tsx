"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import { StaffRole, AuditEvent } from '@/types';
import {
  ShieldAlert,
  Users,
  Clock,
  Key,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';

export default function StaffPage() {
  const {
    staffUsers,
    currentStaff,
    switchStaffRole,
    auditLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState<'roster' | 'permissions' | 'audit'>('roster');
  const [auditFilter, setAuditFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesType = auditFilter === 'all' || log.targetType === auditFilter;
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const roles: StaffRole[] = ['owner', 'manager', 'cashier', 'floor_staff'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Staff Roles & Operational Audit History
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Role-based access matrix, shift monitoring, and tamper-evident event log.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-[#121622] border border-[#232b40] rounded-xl text-xs">
          <span className="text-gray-400 px-2 font-medium">Logged in as:</span>
          <span className="font-bold text-cyan-300 font-mono">{currentStaff.name} ({currentStaff.role})</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'roster'
              ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Staff Team ({staffUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'permissions'
              ? 'bg-purple-950/60 text-purple-300 border border-purple-700/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          RBAC Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'audit'
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Audit Trail Log ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: STAFF ROSTER */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {staffUsers.map(staff => (
            <div
              key={staff.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                staff.id === currentStaff.id
                  ? 'bg-[#151c2d] border-indigo-500 shadow-lg shadow-indigo-950/40'
                  : 'bg-[#0e121c] border-[#1f2538]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-700 to-cyan-600 flex items-center justify-center font-bold text-white text-sm">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">{staff.name}</h3>
                    <span className="text-[11px] text-cyan-400 capitalize block">{staff.role.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  <span>Email:</span> <span className="text-gray-200">{staff.email}</span>
                </div>

                <div className="p-2 rounded-lg bg-[#090b10] border border-gray-800 text-xs flex justify-between items-center">
                  <span className="text-gray-400">Active Shift:</span>
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    On Duty
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-800">
                <button
                  onClick={() => switchStaffRole(staff.id)}
                  disabled={staff.id === currentStaff.id}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    staff.id === currentStaff.id
                      ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 cursor-default'
                      : 'bg-[#181d2e] hover:bg-[#20273c] text-gray-200 border border-gray-700'
                  }`}
                >
                  {staff.id === currentStaff.id ? 'Currently Active' : 'Switch to this User'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RBAC PERMISSION MATRIX */}
      {activeTab === 'permissions' && (
        <div className="bg-[#0e121c] border border-[#1f2538] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold text-sm text-gray-200">System Role & Security Capabilities</h3>
            <p className="text-xs text-gray-400 mt-0.5">Permissions are strictly enforced on client actions and backend mutations.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121622] text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="p-3">Capability / Operation</th>
                  {roles.map(r => (
                    <th key={r} className="p-3 text-center capitalize">{r.replace('_', ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {[
                  { key: 'view_dashboard', label: 'View Dashboard & Telemetry' },
                  { key: 'view_stations', label: 'Inspect 3D Venue & Stations' },
                  { key: 'manage_sessions', label: 'Start, Pause, Extend, Transfer Sessions' },
                  { key: 'manage_bookings', label: 'Create, Check-in & Cancel Bookings' },
                  { key: 'manage_pos', label: 'POS Checkout & Food Billing' },
                  { key: 'process_refunds', label: 'Courtesy Discounts & Refunds' },
                  { key: 'view_financial_reports', label: 'Financial Analytics & Revenue' },
                  { key: 'manage_customers', label: 'Manage Member Wallets & Profiles' },
                  { key: 'manage_inventory', label: 'Stock Counts & Adjustments' },
                  { key: 'manage_maintenance', label: 'Report & Resolve Hardware Faults' },
                  { key: 'manage_staff', label: 'Staff Management & Handover' },
                  { key: 'manage_settings', label: 'Cafe Rates & 3D Layout Editor' },
                ].map(item => (
                  <tr key={item.key} className="hover:bg-[#131826] transition-colors">
                    <td className="p-3 font-semibold text-gray-200">{item.label}</td>
                    {roles.map(r => {
                      const allowed = (ROLE_PERMISSIONS[r] as string[]).includes(item.key);
                      return (
                        <td key={r} className="p-3 text-center">
                          {allowed ? (
                            <span className="inline-block w-5 h-5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[11px] leading-5 font-bold">✓</span>
                          ) : (
                            <span className="inline-block w-5 h-5 rounded-full bg-gray-800/40 text-gray-600 text-[11px] leading-5 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit actions, operators, or target IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121622] border border-[#232b40] rounded-xl pl-9 pr-3 py-2 text-xs text-white"
              />
            </div>
            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="bg-[#121622] border border-[#232b40] rounded-xl px-3 py-2 text-xs text-gray-300"
            >
              <option value="all">All Event Domains</option>
              <option value="session">Gaming Sessions</option>
              <option value="station">Station Status</option>
              <option value="booking">Reservations</option>
              <option value="inventory">POS & Orders</option>
              <option value="payment">Financial & Wallet</option>
              <option value="maintenance">Hardware Maintenance</option>
              <option value="settings">Configuration & Settings</option>
            </select>
          </div>

          <div className="bg-[#0e121c] border border-[#1f2538] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121622] text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Staff Operator</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Target ID</th>
                    <th className="p-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#131826] transition-colors">
                      <td className="p-3 text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td className="p-3 font-sans font-semibold text-gray-200">
                        {log.staffName} <span className="text-[10px] text-cyan-400 font-mono">({log.role})</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 uppercase text-[10px] text-gray-400">{log.targetType}</td>
                      <td className="p-3 text-gray-400">{log.targetId}</td>
                      <td className="p-3 font-sans text-gray-300">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
