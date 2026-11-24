"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/store/AppContext';
import { useMounted } from '@/lib/useMounted';
import { Product, ProductCategory, OrderLineItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  DollarSign,
  Split,
  Printer,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  X,
  AlertTriangle
} from 'lucide-react';

export default function PosPage() {
  const mounted = useMounted();
  const {
    products,
    sessions,
    customers,
    settings,
    createOrder,
    adjustStock,
    currentStaff
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Cart State
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [linkedSessionId, setLinkedSessionId] = useState<string>('');
  const [walkinGuestName, setWalkinGuestName] = useState<string>('Walk-in Customer');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState(settings.acceptedPaymentMethods[0] || 'Cash');
  const [splitCount, setSplitCount] = useState<number>(1);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Completed Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any>(null);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Items' },
    { key: 'beverage', label: 'Drinks & Energy' },
    { key: 'hot_food', label: 'Hot Food & Meals' },
    { key: 'snack', label: 'Snacks & Sweets' },
    { key: 'merch', label: 'Gear & Accessories' },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) return;
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev;
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stockQuantity) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.product.id !== productId));
  };

  // Calculations
  const subtotalCents = cartItems.reduce((acc, i) => acc + i.product.priceCents * i.quantity, 0);
  const discountAmountCents = Math.round((subtotalCents * discountPercent) / 100);
  const discountedSubtotal = subtotalCents - discountAmountCents;
  const taxAmountCents = Math.round((discountedSubtotal * settings.taxRatePercent) / 100);
  const grandTotalCents = discountedSubtotal + taxAmountCents;
  const splitAmountCents = Math.round(grandTotalCents / Math.max(1, splitCount));

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    let destinationStation = '';
    let customerName = walkinGuestName.trim() || 'Counter Guest';

    if (linkedSessionId) {
      const sess = sessions.find(s => s.id === linkedSessionId);
      if (sess) {
        destinationStation = sess.stationName;
        customerName = sess.customerName;
      }
    }

    const orderItems: OrderLineItem[] = cartItems.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.quantity,
      unitPriceCents: i.product.priceCents
    }));

    // Deduct stock in real-time
    cartItems.forEach(i => {
      adjustStock(i.product.id, -i.quantity, `Sold in POS order for ${customerName}`);
    });

    const newOrder = createOrder({
      sessionId: linkedSessionId || undefined,
      stationName: destinationStation || undefined,
      customerId: selectedCustomerId || undefined,
      customerName,
      items: orderItems,
      status: 'new',
      totalCents: grandTotalCents,
      paid: true,
      paymentMethod,
      staffName: currentStaff.name,
      notes: splitCount > 1 ? `Split ${splitCount} ways (${formatCurrency(splitAmountCents, settings.currencySymbol)} each)` : undefined
    });

    setLastCompletedOrder({
      ...newOrder,
      subtotalCents,
      discountAmountCents,
      taxAmountCents,
      grandTotalCents,
      splitCount,
      splitAmountCents
    });

    setCartItems([]);
    setDiscountPercent(0);
    setSplitCount(1);
    setShowReceiptModal(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-[#0A0E17] text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1F293D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
            <UtensilsCrossed className="w-5 h-5 text-[#00D2FF]" />
            Cafe Point of Sale & Food Service
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Beverage inventory, snack checkout, kitchen dispatch, and split-bill payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/kitchen"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#6366F1]/20 hover:bg-[#6366F1]/30 border border-[#6366F1]/40 rounded-xl text-xs font-bold text-[#818CF8] transition-colors"
          >
            Kitchen Display System (KDS) &rarr;
          </Link>
        </div>
      </div>

      {/* Main Grid: Products (7 Cols) & Cart / Billing (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food, energy drinks, snacks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121826] border border-[#1F293D] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === cat.key
                      ? 'bg-[#00D2FF] text-[#0A0E17] shadow-md shadow-[#00D2FF]/20'
                      : 'bg-[#121826] text-gray-400 hover:text-white border border-[#1F293D]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stockQuantity <= 0;
              const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all select-none ${
                    isOutOfStock
                      ? 'bg-[#181818] border-[#1F293D] opacity-50 cursor-not-allowed'
                      : 'bg-[#121826] border-[#1F293D] hover:border-[#00D2FF] hover:bg-[#161F32] cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="font-extrabold text-white text-xs leading-snug line-clamp-2">
                        {product.name}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-mono font-extrabold text-[#00D2FF] text-sm">
                        {formatCurrency(product.priceCents, settings.currencySymbol)}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isOutOfStock
                          ? 'bg-[#EF4444]/20 text-[#EF4444]'
                          : isLowStock
                          ? 'bg-[#FF8C00]/20 text-[#FF8C00]'
                          : 'bg-[#1F293D] text-gray-300'
                      }`}>
                        {isOutOfStock ? 'Sold Out' : `${product.stockQuantity} in stock`}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    className="mt-3 w-full py-1.5 bg-[#161F32] hover:bg-[#00D2FF] hover:text-[#0A0E17] disabled:opacity-30 text-[#00D2FF] text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors border border-[#1F293D]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Order Cart & Billing (5 Cols) */}
        <div className="lg:col-span-5 bg-[#121826] border border-[#1F293D] rounded-2xl p-4 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#00D2FF]" />
                Current Order ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
              </h2>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  className="text-xs text-[#EF4444] hover:underline font-bold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Destination Selection (Session or Walk-in) */}
            <div className="space-y-2 p-3 rounded-xl bg-[#141414] border border-[#1F293D] text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Deliver to Gaming Station (Optional)</label>
                <select
                  value={linkedSessionId}
                  onChange={(e) => setLinkedSessionId(e.target.value)}
                  className="w-full bg-[#121826] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                >
                  <option value="">-- Over-the-counter walk-in --</option>
                  {sessions.filter(s => s.status === 'active').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.stationName} &bull; {s.customerName}
                    </option>
                  ))}
                </select>
              </div>

              {!linkedSessionId && (
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Customer / Member</label>
                  <input
                    type="text"
                    placeholder="Guest Name or Table"
                    value={walkinGuestName}
                    onChange={(e) => setWalkinGuestName(e.target.value)}
                    className="w-full bg-[#121826] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* Cart Items List */}
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-30 text-gray-400" />
                <p className="text-xs">Cart is empty. Click items on the left to add.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl bg-[#141414] border border-[#1F293D] flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="font-bold text-white block truncate">{item.product.name}</span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {formatCurrency(item.product.priceCents, settings.currencySymbol)} each
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg bg-[#222222] border border-[#1F293D]">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="p-1 hover:text-white text-gray-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-white text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="p-1 hover:text-white text-gray-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="w-14 text-right font-mono font-bold text-[#00D2FF]">
                        {formatCurrency(item.product.priceCents * item.quantity, settings.currencySymbol)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-500 hover:text-[#EF4444] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Summary & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#1F293D]">
              {/* Discount & Split Bill options */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Discount %</label>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-1.5 text-xs text-white"
                  >
                    <option value={0}>No Discount (0%)</option>
                    <option value={5}>VIP Member (5%)</option>
                    <option value={10}>Happy Hour (10%)</option>
                    <option value={15}>Staff / Friend (15%)</option>
                    <option value={20}>Special Promo (20%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1 flex items-center gap-1 font-bold">
                    <Split className="w-3 h-3 text-[#00D2FF]" />
                    Split Bill
                  </label>
                  <select
                    value={splitCount}
                    onChange={(e) => setSplitCount(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-1.5 text-xs text-white"
                  >
                    <option value={1}>Single Payer (1x)</option>
                    <option value={2}>Split 2 Ways</option>
                    <option value={3}>Split 3 Ways</option>
                    <option value={4}>Split 4 Ways</option>
                  </select>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3 rounded-xl bg-[#141414] border border-[#1F293D] text-xs space-y-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">{formatCurrency(subtotalCents, settings.currencySymbol)}</span>
                </div>
                {discountAmountCents > 0 && (
                  <div className="flex justify-between text-[#00D2FF]">
                    <span>Discount ({discountPercent}%):</span>
                    <span className="font-mono">-{formatCurrency(discountAmountCents, settings.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Tax ({settings.taxRatePercent}%):</span>
                  <span className="font-mono text-white">{formatCurrency(taxAmountCents, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-[#1F293D]">
                  <span>Total Due:</span>
                  <span className="font-mono text-[#00D2FF] font-extrabold">{formatCurrency(grandTotalCents, settings.currencySymbol)}</span>
                </div>
                {splitCount > 1 && (
                  <div className="flex justify-between text-xs text-[#818CF8] font-bold pt-1 border-t border-[#1F293D]">
                    <span>Each Player ({splitCount}x):</span>
                    <span className="font-mono">{formatCurrency(splitAmountCents, settings.currencySymbol)}</span>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1F293D] rounded-lg p-2 text-xs text-white"
                >
                  {settings.acceptedPaymentMethods.map(pm => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-[#00D2FF] hover:bg-[#00B4D8] text-[#0A0E17] font-extrabold text-xs rounded-xl shadow-lg shadow-[#00D2FF]/25 flex items-center justify-center gap-2 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Charge {formatCurrency(grandTotalCents, settings.currencySymbol)} & Print Receipt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* COMPLETED RECEIPT MODAL */}
      {showReceiptModal && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-gray-900 rounded-2xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="text-center pb-3 border-b border-gray-200">
              <h3 className="font-bold text-lg tracking-wider uppercase">{settings.cafeName}</h3>
              <p className="text-[10px] text-gray-500">{settings.address}</p>
              <p className="text-[10px] text-gray-500">Tel: {settings.phone}</p>
              <p className="text-xs font-bold mt-2 text-gray-800">TAX INVOICE / RECEIPT</p>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt #:</span>
                <span className="font-bold">{lastCompletedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date/Time:</span>
                <span>{mounted ? new Date().toLocaleString() : 'Receipt Date'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cashier:</span>
                <span>{lastCompletedOrder.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-bold">{lastCompletedOrder.customerName}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-gray-300 py-2 space-y-1 text-xs">
              {lastCompletedOrder.items.map((i: OrderLineItem) => (
                <div key={i.productId} className="flex justify-between">
                  <span>{i.quantity}x {i.productName}</span>
                  <span>{formatCurrency(i.quantity * i.unitPriceCents, settings.currencySymbol)}</span>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(lastCompletedOrder.subtotalCents, settings.currencySymbol)}</span>
              </div>
              {lastCompletedOrder.discountAmountCents > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(lastCompletedOrder.discountAmountCents, settings.currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax ({settings.taxRatePercent}%):</span>
                <span>{formatCurrency(lastCompletedOrder.taxAmountCents, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-800 pt-1">
                <span>TOTAL:</span>
                <span>{formatCurrency(lastCompletedOrder.grandTotalCents, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1">
                <span>Paid via:</span>
                <span className="font-bold">{lastCompletedOrder.paymentMethod}</span>
              </div>
              {lastCompletedOrder.splitCount > 1 && (
                <div className="flex justify-between text-cyan-600 font-bold">
                  <span>Split ({lastCompletedOrder.splitCount}x):</span>
                  <span>{formatCurrency(lastCompletedOrder.splitAmountCents, settings.currencySymbol)} each</span>
                </div>
              )}
            </div>

            <div className="text-center pt-2 text-[10px] text-gray-400 border-t border-gray-100">
              Thank you for gaming with us! &bull; GG WP
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
