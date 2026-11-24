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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2A2A2A]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-[#CCFF00]" />
            Cafe Configuration & System Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Configure venue pricing, operating schedule, currency, and station hourly rates.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm("Reset all settings to clean synthetic factory defaults?")) {
              resetToDemoDefaults();
            }
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#1E1E1E] hover:bg-[#252525] border border-[#2A2A2A] text-gray-300 rounded-xl text-xs font-bold self-start sm:self-auto transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Defaults
        </button>
      </div>

      {saveMessage && (
        <div className="p-3.5 bg-[#CCFF00]/15 border border-[#CCFF00]/40 rounded-xl text-xs font-bold text-[#CCFF00] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#CCFF00]" />
          {saveMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Venue Profile */}
        <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-[#2A2A2A]">
            <Building className="w-4 h-4 text-[#CCFF00]" />
            Cafe Venue Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white block mb-1 font-semibold">Venue / Business Name</label>
              <input
                type="text"
                value={form.cafeName}
                onChange={(e) => setForm({ ...form, cafeName: e.target.value })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white focus:border-[#CCFF00] outline-none"
                disabled={!canManageSettings}
                required
              />
            </div>
            <div>
              <label className="text-xs text-white block mb-1 font-semibold">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white focus:border-[#CCFF00] outline-none"
                disabled={!canManageSettings}
              />
            </div>
            <div>
              <label className="text-xs text-white block mb-1 font-semibold">Physical Street Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white focus:border-[#CCFF00] outline-none"
                disabled={!canManageSettings}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-white block mb-1 font-semibold">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white focus:border-[#CCFF00] outline-none"
                  disabled={!canManageSettings}
                />
              </div>
              <div>
                <label className="text-xs text-white block mb-1 font-semibold">Operations Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white focus:border-[#CCFF00] outline-none"
                  disabled={!canManageSettings}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Hourly Pricing per Platform */}
        <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-[#2A2A2A]">
            <DollarSign className="w-4 h-4 text-[#CCFF00]" />
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
              <div key={item.type} className="p-3 bg-[#161616] border border-[#2A2A2A] rounded-xl space-y-1">
                <span className="text-xs font-semibold text-gray-300 block">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={form.ratesPerHourCents[item.type]}
                    onChange={(e) => handleRateChange(item.type, Number(e.target.value))}
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded p-1.5 text-xs text-white font-mono font-bold focus:border-[#CCFF00] outline-none"
                    disabled={!canManageSettings}
                  />
                  <span className="text-xs text-[#CCFF00] font-mono font-bold whitespace-nowrap">
                    = {formatCurrency(form.ratesPerHourCents[item.type], form.currencySymbol)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Timezone, Currency & Session Buffer Rules */}
        <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-[#2A2A2A]">
            <Clock className="w-4 h-4 text-[#8A2BE2]" />
            Session Scheduling & Buffer Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-white block mb-1 font-semibold">Currency Symbol & Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.currencySymbol}
                  onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                  className="w-16 bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white text-center font-mono focus:border-[#CCFF00] outline-none"
                  disabled={!canManageSettings}
                />
                <input
                  type="text"
                  value={form.currencyCode}
                  onChange={(e) => setForm({ ...form, currencyCode: e.target.value })}
                  className="flex-1 bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white font-mono focus:border-[#CCFF00] outline-none"
                  disabled={!canManageSettings}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white block mb-1 font-semibold">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.taxRatePercent}
                onChange={(e) => setForm({ ...form, taxRatePercent: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white font-mono focus:border-[#CCFF00] outline-none"
                disabled={!canManageSettings}
              />
            </div>

            <div>
              <label className="text-xs text-white block mb-1 font-semibold">Grace Period (Minutes)</label>
              <input
                type="number"
                value={form.gracePeriodMinutes}
                onChange={(e) => setForm({ ...form, gracePeriodMinutes: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white font-mono focus:border-[#CCFF00] outline-none"
                disabled={!canManageSettings}
              />
            </div>

            <div>
              <label className="text-xs text-white block mb-1 font-semibold">Clean Buffer Between (Mins)</label>
              <input
                type="number"
                value={form.bufferBetweenSessionsMinutes}
                onChange={(e) => setForm({ ...form, bufferBetweenSessionsMinutes: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white font-mono focus:border-[#CCFF00] outline-none"
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
              className="flex items-center gap-2 px-6 py-3 bg-[#CCFF00] hover:bg-[#b8e600] text-[#111111] font-black rounded-xl text-xs shadow-lg shadow-[#CCFF00]/20 transition-all"
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
