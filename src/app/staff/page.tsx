"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { useMounted } from '@/lib/useMounted';
import { formatDateTime } from '@/lib/formatters';
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
  const mounted = useMounted();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#4F46E5]" />
            Staff Roles & Operational Audit History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Role-based access matrix, shift monitoring, and tamper-evident event log.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs">
          <span className="text-slate-500 px-2 font-medium">Logged in as:</span>
          <span className="font-black text-[#2563EB] font-mono">{currentStaff.name} ({currentStaff.role})</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'roster'
              ? 'bg-[#2563EB] text-[#F8FAFC] shadow-md shadow-[#2563EB]/20'
              : 'text-slate-500 hover:text-white hover:bg-[#FFFFFF]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Staff Team ({staffUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'permissions'
              ? 'bg-[#2563EB] text-[#F8FAFC] shadow-md shadow-[#2563EB]/20'
              : 'text-slate-500 hover:text-white hover:bg-[#FFFFFF]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          RBAC Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'audit'
              ? 'bg-[#2563EB] text-[#F8FAFC] shadow-md shadow-[#2563EB]/20'
              : 'text-slate-500 hover:text-white hover:bg-[#FFFFFF]'
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
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                staff.id === currentStaff.id
                  ? 'bg-[#FFFFFF] border-[#2563EB] shadow-lg shadow-[#2563EB]/10'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#E2E8F0]'
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#2563EB] flex items-center justify-center font-black text-[#F8FAFC] text-sm">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{staff.name}</h3>
                    <span className="text-[11px] text-[#2563EB] font-mono capitalize block">{staff.role.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  <span>Email:</span> <span className="text-white ml-1">{staff.email}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs flex justify-between items-center">
                  <span className="text-slate-500">Active Shift:</span>
                  <span className="font-mono text-[#2563EB] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                    On Duty
                  </span>
                </div>
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-[#E2E8F0]">
                <button
                  onClick={() => switchStaffRole(staff.id)}
                  disabled={staff.id === currentStaff.id}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                    staff.id === currentStaff.id
                      ? 'bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/30 cursor-default'
                      : 'bg-[#F8FAFC] hover:bg-[#F8FAFC] text-white border border-[#E2E8F0]'
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
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-sm text-white">System Role & Security Capabilities</h3>
            <p className="text-xs text-slate-500 mt-0.5">Permissions are strictly enforced on client actions and backend mutations.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-500 font-mono uppercase text-[10px] border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3.5">Capability / Operation</th>
                  {roles.map(r => (
                    <th key={r} className="p-3.5 text-center capitalize">{r.replace('_', ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
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
                  <tr key={item.key} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5 font-semibold text-white">{item.label}</td>
                    {roles.map(r => {
                      const allowed = (ROLE_PERMISSIONS[r] as string[]).includes(item.key);
                      return (
                        <td key={r} className="p-3.5 text-center">
                          {allowed ? (
                            <span className="inline-block w-5 h-5 rounded-full bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/40 text-[11px] leading-5 font-bold">✓</span>
                          ) : (
                            <span className="inline-block w-5 h-5 rounded-full bg-[#F8FAFC] text-gray-600 text-[11px] leading-5 font-bold">—</span>
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
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit actions, operators, or target IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#2563EB] outline-none"
              />
            </div>
            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#2563EB] outline-none"
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

          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-slate-500 font-mono uppercase text-[10px] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Staff Operator</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Domain</th>
                    <th className="p-3.5">Target ID</th>
                    <th className="p-3.5">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] font-mono">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp, mounted)}
                      </td>
                      <td className="p-3.5 font-sans font-semibold text-white">
                        {log.staffName} <span className="text-[10px] text-[#2563EB] font-mono">({log.role})</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-[#4F46E5]/15 text-[#C084FC] border border-[#4F46E5]/40 text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 uppercase text-[10px] text-slate-500">{log.targetType}</td>
                      <td className="p-3.5 text-slate-500">{log.targetId}</td>
                      <td className="p-3.5 font-sans text-slate-800">{log.details}</td>
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
