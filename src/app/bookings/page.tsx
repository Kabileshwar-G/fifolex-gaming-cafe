"use client";

import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Booking, BookingStatus } from '@/types';
import { formatCurrency, formatDuration } from '@/lib/formatters';
import { hasPermission } from '@/lib/permissions';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Check,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  ArrowRightLeft
} from 'lucide-react';

const STATUS_BADGE: Record<BookingStatus, { label: string; bg: string; text: string; border: string }> = {
  confirmed: { label: 'Confirmed', bg: 'bg-[#00D2FF]/15', text: 'text-[#00D2FF]', border: 'border-[#00D2FF]/40' },
  pending: { label: 'Pending', bg: 'bg-[#FF8C00]/20', text: 'text-[#FF8C00]', border: 'border-[#FF8C00]/40' },
  checked_in: { label: 'Checked In', bg: 'bg-[#6366F1]/20', text: 'text-[#818CF8]', border: 'border-[#6366F1]/40' },
  completed: { label: 'Completed', bg: 'bg-gray-800/60', text: 'text-gray-300', border: 'border-gray-700/60' },
  cancelled: { label: 'Cancelled', bg: 'bg-[#EF4444]/20', text: 'text-[#EF4444]', border: 'border-[#EF4444]/40' },
  no_show: { label: 'No Show', bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-800/60' },
};

export default function BookingsPage() {
  const {
    bookings,
    stations,
    customers,
    currentStaff,
    settings,
    createBooking,
    updateBookingStatus,
    rescheduleBooking,
    checkInBooking
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>("2026-11-25");

  // Update selectedDate on mount to today
  React.useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDuration, setRescheduleDuration] = useState(60);
  const [rescheduleError, setRescheduleError] = useState('');

  // New Booking Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [stationId, setStationId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-11-25');
  const [bookingTime, setBookingTime] = useState('18:00');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [depositAmountCents, setDepositAmountCents] = useState(1000);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const canManageBookings = hasPermission(currentStaff.role, 'manage_bookings');

  // Filter bookings for selected date and criteria
  const filteredBookings = bookings.filter(b => {
    const matchesDate = b.date === selectedDate;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customerPhone && b.customerPhone.includes(searchTerm));
    return matchesDate && matchesStatus && matchesSearch;
  });

  const handleNewBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const targetStation = stations.find(s => s.id === stationId);
    if (!targetStation) {
      setFormError("Please select a target station.");
      return;
    }

    const member = customers.find(c => c.id === customerId);
    const finalName = member ? member.name : customerName.trim();
    if (!finalName) {
      setFormError("Please provide a customer name or select a member.");
      return;
    }

    const res = createBooking({
      stationId: targetStation.id,
      stationName: targetStation.name,
      stationType: targetStation.type,
      customerId: member ? member.id : undefined,
      customerName: finalName,
      customerPhone: member ? member.phone : customerPhone.trim(),
      customerEmail: member ? member.email : customerEmail.trim(),
      date: bookingDate,
      startTime: bookingTime,
      durationMinutes,
      status: 'confirmed',
      depositCents: depositAmountCents,
      depositPaid: depositAmountCents > 0,
      notes: notes.trim()
    });

    if (!res.success) {
      setFormError(res.error || "Conflict: station is already reserved during this time slot.");
    } else {
      setShowNewModal(false);
      setStationId('');
      setCustomerId('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setNotes('');
    }
  };

  const handleCheckIn = (bookingId: string) => {
    const res = checkInBooking(bookingId);
    if (!res.success) {
      alert(res.error);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-[#0A0E17] text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1F293D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-[#00D2FF]" />
            Reservations & Schedule Calendar
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage advance bookings, group reservations, and rapid check-in conversion.
          </p>
        </div>

        {canManageBookings && (
          <button
            onClick={() => {
              setBookingDate(selectedDate);
              setShowNewModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00D2FF] hover:bg-[#00B4D8] text-[#0A0E17] font-extrabold rounded-xl text-xs shadow-lg shadow-[#00D2FF]/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Reservation
          </button>
        )}
      </div>

      {/* Date Navigation & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#121826] border border-[#1F293D] rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg bg-[#161F32] hover:bg-[#2C2C2C] text-gray-300 border border-[#1F293D]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#141414] border border-[#1F293D] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
          />

          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-lg bg-[#161F32] hover:bg-[#2C2C2C] text-gray-300 border border-[#1F293D]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 rounded-lg bg-[#161F32] text-[#00D2FF] font-bold text-xs hover:bg-[#1F293D] border border-[#1F293D]"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search player, pod, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141414] border border-[#1F293D] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#141414] border border-[#1F293D] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D2FF]"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="checked_in">Checked In</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-[#121826] border border-[#1F293D] rounded-2xl overflow-hidden shadow-xl">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-40 text-gray-500" />
            <p className="text-white font-bold">No bookings scheduled for this date</p>
            <p className="text-xs text-gray-400 mt-1">Select another day or schedule a new reservation.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1F293D]">
            {filteredBookings.map(bk => {
              const badge = STATUS_BADGE[bk.status];
              return (
                <div
                  key={bk.id}
                  className="p-4 hover:bg-[#161F32] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#161F32] border border-[#3A3A3A] flex flex-col items-center justify-center font-mono">
                      <span className="text-[10px] text-gray-400 font-semibold">POD</span>
                      <span className="font-extrabold text-[#00D2FF] text-xs">{bk.stationName}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{bk.customerName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                        {bk.depositPaid && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/40 font-mono font-bold">
                            Deposit Paid ({formatCurrency(bk.depositCents, settings.currencySymbol)})
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1 font-mono text-white">
                          <Clock className="w-3.5 h-3.5 text-[#00D2FF]" />
                          {bk.startTime} ({formatDuration(bk.durationMinutes)})
                        </span>
                        {bk.customerPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {bk.customerPhone}
                          </span>
                        )}
                        {bk.customerEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {bk.customerEmail}
                          </span>
                        )}
                      </div>

                      {bk.notes && (
                        <p className="text-[11px] text-gray-400 italic bg-[#141414] px-2 py-1 rounded border border-[#1F293D] inline-block">
                          Note: {bk.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Booking Action Controls */}
                  {canManageBookings && (
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {bk.status === 'confirmed' && (
                        <button
                          onClick={() => handleCheckIn(bk.id)}
                          className="px-3.5 py-2 bg-[#00D2FF] hover:bg-[#00B4D8] text-[#0A0E17] rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#00D2FF]/25 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Check-In Player
                        </button>
                      )}

                      {bk.status === 'pending' && (
                        <button
                          onClick={() => updateBookingStatus(bk.id, 'confirmed')}
                          className="px-3 py-1.5 bg-[#6366F1] hover:bg-[#7a20ce] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Confirm
                        </button>
                      )}

                      {(bk.status === 'pending' || bk.status === 'confirmed') && (
                        <>
                          <button
                            onClick={() => {
                              setRescheduleTarget(bk);
                              setRescheduleDate(bk.date);
                              setRescheduleTime(bk.startTime);
                              setRescheduleDuration(bk.durationMinutes);
                              setRescheduleError('');
                            }}
                            className="px-2.5 py-1.5 bg-[#6366F1]/20 hover:bg-[#6366F1]/30 text-[#818CF8] border border-[#6366F1]/50 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            Reschedule
                          </button>
                          <button
                            onClick={() => updateBookingStatus(bk.id, 'no_show')}
                            className="px-2.5 py-1.5 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/40 rounded-lg text-xs font-medium"
                          >
                            No Show
                          </button>
                          <button
                            onClick={() => updateBookingStatus(bk.id, 'cancelled')}
                            className="px-2.5 py-1.5 bg-[#161F32] hover:bg-[#2C2C2C] text-gray-400 rounded-lg text-xs font-medium border border-[#1F293D]"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW BOOKING MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121826] border border-[#1F293D] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#00D2FF]" />
                Schedule New Reservation
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-[#EF4444] bg-[#EF4444]/20 p-2.5 rounded-lg border border-[#EF4444]/40 font-semibold">
                {formError}
              </p>
            )}

            <form onSubmit={handleNewBookingSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Assign Station</label>
                <select
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                  required
                >
                  <option value="">-- Choose station pod --</option>
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.type.toUpperCase()}) &bull; {st.zone} &bull; {formatCurrency(st.hourlyRateCents, settings.currencySymbol)}/hr
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Select Member (Optional)</label>
                <select
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    const c = customers.find(x => x.id === e.target.value);
                    if (c) {
                      setCustomerName(c.name);
                      setCustomerPhone(c.phone);
                      setCustomerEmail(c.email || '');
                    }
                  }}
                  className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                >
                  <option value="">-- Or enter guest contact details below --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.membershipTier.toUpperCase()} &bull; {c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Liam Walker"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                    required={!customerId}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Time Slot</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                  >
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                    <option value={240}>4 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Deposit Amount (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Deposit in cents"
                    value={depositAmountCents || ''}
                    onChange={(e) => setDepositAmountCents(Number(e.target.value))}
                    className="w-36 bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-gray-400 self-center font-mono">
                    = {formatCurrency(depositAmountCents, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. VIP tournament setup, controller preferences"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#161F32] text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#00D2FF] hover:bg-[#00B4D8] text-xs font-extrabold text-[#0A0E17] shadow-lg shadow-[#00D2FF]/25"
                >
                  Lock Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE BOOKING MODAL */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121826] border border-[#1F293D] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#00D2FF]" />
                Reschedule Station Reservation
              </h3>
              <button onClick={() => setRescheduleTarget(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Rescheduling <span className="font-bold text-white">{rescheduleTarget.customerName}</span> on{' '}
              <span className="font-bold text-[#00D2FF]">{rescheduleTarget.stationName}</span>.
            </p>

            {rescheduleError && (
              <p className="text-xs text-[#EF4444] bg-[#EF4444]/20 p-2.5 rounded-lg border border-[#EF4444]/40 font-semibold">
                {rescheduleError}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1 font-semibold">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">New Start Time</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Duration</label>
                  <select
                    value={rescheduleDuration}
                    onChange={(e) => setRescheduleDuration(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                  >
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                    <option value={240}>4 hours</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-[#161F32] text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const res = rescheduleBooking(rescheduleTarget.id, rescheduleDate, rescheduleTime, rescheduleDuration);
                  if (!res.success) {
                    setRescheduleError(res.error || "Schedule conflict occurred.");
                  } else {
                    setRescheduleTarget(null);
                  }
                }}
                className="flex-1 py-2.5 rounded-lg bg-[#00D2FF] hover:bg-[#00B4D8] text-xs font-extrabold text-[#0A0E17] shadow-lg shadow-[#00D2FF]/25"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
