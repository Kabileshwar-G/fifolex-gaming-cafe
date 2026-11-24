"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/store/AppContext';
import { formatCurrency, formatDuration } from '@/lib/formatters';
import {
  Sparkles,
  Monitor,
  Calendar,
  Wallet,
  UtensilsCrossed,
  MessageSquare,
  CheckCircle2,
  Play,
  ArrowRight,
  ShieldCheck,
  Star,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomerPortalPage() {
  const {
    stations,
    customers,
    products,
    createBooking,
    createOrder,
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'browse' | 'book' | 'wallet' | 'snacks' | 'feedback'>('browse');

  // Booking Flow State
  const [selectedStationId, setSelectedStationId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('19:00');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Snack Order Flow
  const [seatDestination, setSeatDestination] = useState('PC-01');
  const [orderedItems, setOrderedItems] = useState<{ productId: string; name: string; quantity: number; priceCents: number }[]>([]);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  // Feedback Flow
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const availableStations = stations.filter(s => s.status === 'available');
  const selectedStation = stations.find(s => s.id === selectedStationId);

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedStationId) {
      setBookingError("Please select a gaming pod.");
      return;
    }

    const st = stations.find(s => s.id === selectedStationId);
    if (!st) return;

    const res = createBooking({
      stationId: st.id,
      stationName: st.name,
      stationType: st.type,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      date: bookingDate,
      startTime: bookingTime,
      durationMinutes,
      status: 'confirmed',
      depositCents: Math.round((durationMinutes / 60) * st.hourlyRateCents * 0.5),
      depositPaid: true,
      notes: "Booked via Customer Self-Service Portal"
    });

    if (!res.success) {
      setBookingError(res.error || "Conflict: station is not available at this slot.");
    } else {
      setBookingSuccess(true);
      try {
        confetti({ particleCount: 80, spread: 60 });
      } catch {}
    }
  };

  const handleOrderSnack = (product: any) => {
    setOrderedItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, priceCents: product.priceCents }];
    });
  };

  const handleSendOrder = () => {
    if (orderedItems.length === 0) return;
    createOrder({
      stationName: seatDestination,
      customerName: customerName.trim() || 'Portal Guest',
      items: orderedItems.map(i => ({
        productId: i.productId,
        productName: i.name,
        quantity: i.quantity,
        unitPriceCents: i.priceCents
      })),
      status: 'new',
      totalCents: orderedItems.reduce((acc, i) => acc + i.quantity * i.priceCents, 0),
      paid: true
    });
    setOrderSubmitted(true);
    setOrderedItems([]);
  };

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col font-sans">
      {/* Customer Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-gray-800 bg-[#0c0e14]/90 backdrop-blur flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-wide">FIFOLEX</span>
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest block uppercase">Player Sanctuary</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1e2538] text-gray-300 border border-gray-700 transition-colors"
          >
            Staff Dashboard &rarr;
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="p-6 sm:p-10 border-b border-gray-800/80 bg-gradient-to-b from-[#0f1422] to-[#07090e] text-center max-w-4xl mx-auto w-full space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 inline-block">
          LIVE VENUE PORTAL
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Reserve Your Gaming Battle Station
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          Ultra-high refresh OLED PCs, PS5 VIP lounges, full-motion sim racing rigs, and room-scale VR pods.
        </p>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {[
            { key: 'browse', label: 'Browse Pods', icon: Monitor },
            { key: 'book', label: 'Book a Session', icon: Calendar },
            { key: 'snacks', label: 'Order to Seat', icon: UtensilsCrossed },
            { key: 'feedback', label: 'Leave Review', icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                    : 'bg-[#121622] text-gray-300 hover:text-white border border-[#232b40]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8">
        {/* TAB 1: BROWSE STATIONS */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Live Station Pod Availability</h2>
              <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {availableStations.length} Pods Free Right Now
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stations.map(st => {
                const isAvailable = st.status === 'available';
                return (
                  <div
                    key={st.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isAvailable
                        ? 'bg-[#0f1422] border-cyan-800/40 hover:border-cyan-500 shadow-md'
                        : 'bg-[#0b0d13] border-gray-800 opacity-60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-white text-base font-mono">{st.name}</span>
                          <span className="block text-[11px] text-gray-400 capitalize">{st.zone}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isAvailable
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {isAvailable ? 'Available' : 'Occupied'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-300 space-y-1 pt-1">
                        <div><strong className="text-gray-400">Hardware:</strong> {st.specs.gpu || st.specs.platform}</div>
                        <div><strong className="text-gray-400">Display:</strong> {st.specs.screen}</div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-800 flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-sm">
                        {formatCurrency(st.hourlyRateCents, settings.currencySymbol)}/hr
                      </span>
                      {isAvailable && (
                        <button
                          onClick={() => {
                            setSelectedStationId(st.id);
                            setActiveTab('book');
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                        >
                          Book Slot &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: BOOK A SESSION */}
        {activeTab === 'book' && (
          <div className="max-w-xl mx-auto bg-[#0e121c] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="pb-3 border-b border-gray-800 text-center">
              <h2 className="text-xl font-bold text-white">Online Slot Reservation</h2>
              <p className="text-xs text-gray-400 mt-1">Book your desired station and secure your tournament rig.</p>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Reservation Confirmed!</h3>
                <p className="text-xs text-gray-300">
                  Your gaming pod is reserved for {bookingDate} at {bookingTime}. Show this screen or provide your phone number at reception.
                </p>
                <button
                  onClick={() => {
                    setBookingSuccess(false);
                    setActiveTab('browse');
                  }}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Back to Stations
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookSession} className="space-y-4">
                {bookingError && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">
                    {bookingError}
                  </p>
                )}

                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Select Gaming Pod</label>
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1 font-semibold">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kai Jensen"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1 font-semibold">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white"
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
                      className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1 font-semibold">Start Time</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1 font-semibold">Duration</label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                    >
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                      <option value={240}>4 hours</option>
                    </select>
                  </div>
                </div>

                {selectedStation && (
                  <div className="p-3 rounded-xl bg-[#080a0f] border border-gray-800 text-xs space-y-1">
                    <div className="flex justify-between text-gray-400">
                      <span>Rate:</span>
                      <span>{formatCurrency(selectedStation.hourlyRateCents, settings.currencySymbol)}/hr</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Total Session Cost:</span>
                      <span className="font-mono text-white font-bold">
                        {formatCurrency((durationMinutes / 60) * selectedStation.hourlyRateCents, settings.currencySymbol)}
                      </span>
                    </div>
                    <div className="flex justify-between text-cyan-400 font-bold pt-1 border-t border-gray-800">
                      <span>Required Deposit (50%):</span>
                      <span className="font-mono">
                        {formatCurrency(Math.round(((durationMinutes / 60) * selectedStation.hourlyRateCents) * 0.5), settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Pay Deposit & Confirm Slot
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: ORDER SNACKS TO SEAT */}
        {activeTab === 'snacks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
              <div>
                <h2 className="text-base font-bold text-white">Order Refreshments to Your Station</h2>
                <p className="text-xs text-gray-400">Never leave your game. Staff will deliver items straight to your pod.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Deliver To:</span>
                <select
                  value={seatDestination}
                  onChange={(e) => setSeatDestination(e.target.value)}
                  className="bg-[#121622] border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono font-bold"
                >
                  {stations.map(st => (
                    <option key={st.id} value={st.name}>{st.name} ({st.type})</option>
                  ))}
                </select>
              </div>
            </div>

            {orderSubmitted && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span>Order dispatched to the kitchen! Your refreshments will arrive shortly at {seatDestination}.</span>
                <button onClick={() => setOrderSubmitted(false)} className="underline text-white font-bold">Order More</button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-[#0e121c] border border-gray-800 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block leading-tight">{p.name}</span>
                    <span className="text-[10px] text-gray-400 capitalize">{p.category}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-800/80">
                    <span className="font-mono text-emerald-400 font-bold text-xs">
                      {formatCurrency(p.priceCents, settings.currencySymbol)}
                    </span>
                    <button
                      onClick={() => handleOrderSnack(p)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {orderedItems.length > 0 && (
              <div className="fixed bottom-6 right-6 p-4 bg-[#121622] border border-indigo-500/60 rounded-2xl shadow-2xl z-40 max-w-sm w-full space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Selected Snacks ({orderedItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                  <span className="text-emerald-400 font-mono">
                    {formatCurrency(orderedItems.reduce((acc, i) => acc + i.quantity * i.priceCents, 0), settings.currencySymbol)}
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto text-xs space-y-1 text-gray-300">
                  {orderedItems.map(i => (
                    <div key={i.productId} className="flex justify-between">
                      <span>{i.quantity}x {i.name}</span>
                      <span>{formatCurrency(i.quantity * i.priceCents, settings.currencySymbol)}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSendOrder}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Send Order to Station {seatDestination}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LEAVE FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="max-w-md mx-auto bg-[#0e121c] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white text-center">Post-Visit Player Feedback</h2>
            <p className="text-xs text-gray-400 text-center">How was your session? We tune our rigs based on your feedback.</p>

            {feedbackSubmitted ? (
              <div className="p-6 text-center space-y-2 bg-indigo-950/30 border border-indigo-800/40 rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-indigo-400 mx-auto" />
                <h3 className="font-bold text-white text-sm">Thank You for Your Feedback!</h3>
                <p className="text-xs text-gray-300">+50 bonus loyalty points added to your member account.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedback} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold text-center">Your Rating</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-transform ${star <= rating ? 'text-amber-400 scale-110' : 'text-gray-600'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-semibold">Feedback / Hardware Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about the displays, game latency, atmosphere, or snack service..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-[#181d2e] border border-gray-700 rounded-lg p-2.5 text-xs text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
