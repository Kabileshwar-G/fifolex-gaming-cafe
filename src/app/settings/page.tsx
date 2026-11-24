"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { CafeSettings, StationType } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { hasPermission } from '@/lib/permissions';
import {
  Settings as SettingsIcon,
  Save,
  DollarSign,
  Clock,
  ShieldCheck,
  Building,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin
} from 'lucide-react';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    resetToDemoDefaults,
    currentStaff,
    stations
  } = useApp();

  const [form, setForm] = useState<CafeSettings>(settings);
  const [saveMessage, setSaveMessage] = useState('');

  const canManageSettings = hasPermission(currentStaff.role, 'manage_settings');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaveMessage("Settings successfully saved and operational across the app.");
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handleRateChange = (type: StationType, cents: number) => {
    setForm(prev => ({
      ...prev,
      ratesPerHourCents: {
        ...prev.ratesPerHourCents,
        [type]: cents
      }
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            Cafe Configuration & System Preferences
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Configure venue pricing, operating schedule, currency, and station hourly rates.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm("Reset all settings to clean synthetic factory defaults?")) {
              resetToDemoDefaults();
            }
          }}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Defaults
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          {saveMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Venue Profile */}
        <div className="p-5 rounded-2xl bg-[#0e121c] border border-[#1f2538] space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-gray-800">
            <Building className="w-4 h-4 text-cyan-400" />
            Cafe Venue Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Venue / Business Name</label>
              <input
                type="text"
                value={form.cafeName}
                onChange={(e) => setForm({ ...form, cafeName: e.target.value })}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white"
                disabled={!canManageSettings}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white"
                disabled={!canManageSettings}
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Physical Street Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white"
                disabled={!canManageSettings}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white"
                  disabled={!canManageSettings}
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Operations Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white"
                  disabled={!canManageSettings}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Hourly Pricing per Platform */}
        <div className="p-5 rounded-2xl bg-[#0e121c] border border-[#1f2538] space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-gray-800">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Hourly Station Rates (Cents / Minor Units)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { type: 'pc' as StationType, label: 'PC Arena Pod' },
              { type: 'ps5' as StationType, label: 'PS5 VIP Lounge' },
              { type: 'xbox' as StationType, label: 'Xbox Console' },
              { type: 'vr' as StationType, label: 'VR Holo-Bay' },
              { type: 'racing' as StationType, label: 'Sim Racing Rig' },
            ].map(item => (
              <div key={item.type} className="p-3 bg-[#121622] border border-gray-800 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-gray-300 block">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={form.ratesPerHourCents[item.type]}
                    onChange={(e) => handleRateChange(item.type, Number(e.target.value))}
                    className="w-full bg-[#181d2e] border border-gray-700 rounded p-1.5 text-xs text-white font-mono font-bold"
                    disabled={!canManageSettings}
                  />
                  <span className="text-xs text-emerald-400 font-mono font-bold whitespace-nowrap">
                    = {formatCurrency(form.ratesPerHourCents[item.type], form.currencySymbol)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Timezone, Currency & Session Buffer Rules */}
        <div className="p-5 rounded-2xl bg-[#0e121c] border border-[#1f2538] space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-gray-800">
            <Clock className="w-4 h-4 text-amber-400" />
            Session Scheduling & Buffer Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Currency Symbol & Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.currencySymbol}
                  onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                  className="w-16 bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white text-center font-mono"
                  disabled={!canManageSettings}
                />
                <input
                  type="text"
                  value={form.currencyCode}
                  onChange={(e) => setForm({ ...form, currencyCode: e.target.value })}
                  className="flex-1 bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white font-mono"
                  disabled={!canManageSettings}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.taxRatePercent}
                onChange={(e) => setForm({ ...form, taxRatePercent: Number(e.target.value) })}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white font-mono"
                disabled={!canManageSettings}
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Grace Period (Minutes)</label>
              <input
                type="number"
                value={form.gracePeriodMinutes}
                onChange={(e) => setForm({ ...form, gracePeriodMinutes: Number(e.target.value) })}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white font-mono"
                disabled={!canManageSettings}
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Clean Buffer Between (Mins)</label>
              <input
                type="number"
                value={form.bufferBetweenSessionsMinutes}
                onChange={(e) => setForm({ ...form, bufferBetweenSessionsMinutes: Number(e.target.value) })}
                className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white font-mono"
                disabled={!canManageSettings}
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        {canManageSettings && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-950/40 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Settings Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
