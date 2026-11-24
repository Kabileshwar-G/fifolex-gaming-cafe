"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Customer, MembershipTier } from '@/types';
import { formatCurrency, formatDuration } from '@/lib/formatters';
import { hasPermission } from '@/lib/permissions';
import {
  Users,
  Search,
  Plus,
  Wallet,
  Award,
  Clock,
  Phone,
  Mail,
  Edit2,
  X,
  CreditCard,
  Sparkles,
  Gamepad2,
  CheckCircle2
} from 'lucide-react';

const TIER_BADGE: Record<MembershipTier, { label: string; bg: string; text: string; border: string }> = {
  vip: { label: 'VIP Titan', bg: 'bg-[#4F46E5]/20', text: 'text-[#6366F1]', border: 'border-[#4F46E5]/50' },
  gold: { label: 'Gold Pro', bg: 'bg-[#2563EB]/15', text: 'text-[#2563EB]', border: 'border-[#2563EB]/40' },
  silver: { label: 'Silver Elite', bg: 'bg-[#F8FAFC]', text: 'text-slate-800', border: 'border-[#3A3A3A]' },
  standard: { label: 'Standard', bg: 'bg-[#181818]', text: 'text-slate-500', border: 'border-[#E2E8F0]' },
};

export default function CustomersPage() {
  const {
    customers,
    settings,
    createCustomer,
    updateCustomer,
    topUpWallet,
    currentStaff
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topUpCustomerTarget, setTopUpCustomerTarget] = useState<Customer | null>(null);
  const [topUpAmountCents, setTopUpAmountCents] = useState(2500);

  // New Customer Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<MembershipTier>('standard');
  const [initialWalletCents, setInitialWalletCents] = useState(0);
  const [notes, setNotes] = useState('');

  const canManageCustomers = hasPermission(currentStaff.role, 'manage_customers');

  const filteredCustomers = customers.filter(c => {
    const matchesTier = tierFilter === 'all' || c.membershipTier === tierFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTier && matchesSearch;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    createCustomer({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim(),
      membershipTier: tier,
      walletBalanceCents: initialWalletCents,
      notes: notes.trim() || undefined
    });

    setShowCreateModal(false);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setInitialWalletCents(0);
  };

  const handleTopUpSubmit = () => {
    if (!topUpCustomerTarget || topUpAmountCents <= 0) return;
    topUpWallet(topUpCustomerTarget.id, topUpAmountCents);
    setTopUpCustomerTarget(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-[#F8FAFC] text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-wide flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#2563EB]" />
            Customer Profiles & Memberships
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Prepaid gaming hour wallets, loyalty reward points, and VIP tiers.
          </p>
        </div>

        {canManageCustomers && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#F8FAFC] font-extrabold rounded-xl text-xs shadow-lg shadow-[#2563EB]/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Register Customer
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2563EB]"
        >
          <option value="all">All Tiers</option>
          <option value="vip">VIP Titan (30% off)</option>
          <option value="gold">Gold Pro (20% off)</option>
          <option value="silver">Silver Elite (10% off)</option>
          <option value="standard">Standard Member</option>
        </select>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(cust => {
          const tierInfo = TIER_BADGE[cust.membershipTier];
          const discountPct = settings.membershipDiscounts[cust.membershipTier] || 0;

          return (
            <div
              key={cust.id}
              className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#2563EB]/50 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight">{cust.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Phone className="w-3 h-3 text-[#2563EB]" />
                      <span>{cust.phone}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${tierInfo.bg} ${tierInfo.text} ${tierInfo.border}`}>
                    {tierInfo.label}
                  </span>
                </div>

                {/* Wallet Balance & Loyalty Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#141414] border border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Wallet</span>
                    <span className="font-mono font-extrabold text-[#2563EB] text-sm">
                      {formatCurrency(cust.walletBalanceCents, settings.currencySymbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Rewards</span>
                    <span className="font-mono font-bold text-[#FF8C00] text-sm">
                      {cust.loyaltyPoints} pts
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Time Played</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {cust.totalHoursPlayed}h
                    </span>
                  </div>
                </div>

                {discountPct > 0 && (
                  <p className="text-[11px] text-[#6366F1] bg-[#4F46E5]/15 px-2 py-1 rounded border border-[#4F46E5]/30 font-mono font-bold">
                    &bull; {discountPct}% automatic discount on all station sessions
                  </p>
                )}

                {cust.notes && (
                  <p className="text-xs text-slate-500 italic bg-[#141414] p-2 rounded-lg border border-[#E2E8F0]">
                    &ldquo;{cust.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                <button
                  onClick={() => setTopUpCustomerTarget(cust)}
                  className="flex-1 py-1.5 bg-[#2563EB]/15 hover:bg-[#2563EB]/25 text-[#2563EB] border border-[#2563EB]/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Top-Up Wallet
                </button>

                <select
                  value={cust.membershipTier}
                  onChange={(e) => updateCustomer(cust.id, { membershipTier: e.target.value as MembershipTier })}
                  className="bg-[#141414] border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="standard">Standard</option>
                  <option value="silver">Silver Tier</option>
                  <option value="gold">Gold Tier</option>
                  <option value="vip">VIP Tier</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: REGISTER CUSTOMER */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2563EB]" />
                Register New Customer Profile
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-semibold">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="aarav@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">Membership Plan</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as MembershipTier)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="standard">Standard Member (0% discount)</option>
                  <option value="silver">Silver Tier (10% discount on rates)</option>
                  <option value="gold">Gold Tier (20% discount on rates)</option>
                  <option value="vip">VIP Titan (30% discount on rates)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">Initial Wallet Deposit (Paise)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000 for ₹500.00"
                  value={initialWalletCents || ''}
                  onChange={(e) => setInitialWalletCents(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">Notes / Preferences</label>
                <input
                  type="text"
                  placeholder="e.g. Prefers PC-03, plays CS2 & Valorant"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-extrabold text-[#F8FAFC] shadow-lg shadow-[#2563EB]/25"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TOP UP WALLET */}
      {topUpCustomerTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#2563EB]" />
                Add Credits to Wallet
              </h3>
              <button onClick={() => setTopUpCustomerTarget(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700">
              Customer: <span className="font-bold text-slate-900">{topUpCustomerTarget.name}</span> &bull; Current Balance:{' '}
              <span className="font-bold text-[#2563EB] font-mono">
                {formatCurrency(topUpCustomerTarget.walletBalanceCents, settings.currencySymbol)}
              </span>
            </p>

            <div>
              <label className="text-xs text-slate-600 block mb-1 font-semibold">Select Credit Package</label>
              <div className="grid grid-cols-3 gap-2">
                {[20000, 50000, 100000].map(cents => (
                  <button
                    key={cents}
                    type="button"
                    onClick={() => setTopUpAmountCents(cents)}
                    className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
                      topUpAmountCents === cents
                        ? 'bg-[#2563EB] text-[#F8FAFC] border-[#2563EB] font-extrabold shadow-sm'
                        : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {formatCurrency(cents, settings.currencySymbol)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1 font-semibold">Or Custom Amount (Paise)</label>
              <input
                type="number"
                value={topUpAmountCents || ''}
                onChange={(e) => setTopUpAmountCents(Number(e.target.value))}
                placeholder="e.g. 25000 for ₹250.00"
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTopUpCustomerTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUpSubmit}
                className="flex-1 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-extrabold text-[#F8FAFC] shadow-lg shadow-[#2563EB]/25"
              >
                Add Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
