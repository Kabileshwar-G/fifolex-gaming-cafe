"use client";

import React from 'react';
import { useApp } from '@/store/AppContext';
import { useMounted } from '@/lib/useMounted';
import { OrderStatus } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Utensils
} from 'lucide-react';

const STATUS_TICKET: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  new: { label: 'New Ticket', bg: 'bg-[#EF4444]/20', text: 'text-[#EF4444]', border: 'border-[#EF4444]/50' },
  preparing: { label: 'Preparing', bg: 'bg-[#FF8C00]/20', text: 'text-[#FF8C00]', border: 'border-[#FF8C00]/50' },
  ready: { label: 'Ready for Pickup', bg: 'bg-[#00D2FF]/15', text: 'text-[#00D2FF]', border: 'border-[#00D2FF]/40' },
  served: { label: 'Served', bg: 'bg-[#161F32]', text: 'text-gray-400', border: 'border-[#1F293D]' },
  cancelled: { label: 'Cancelled', bg: 'bg-[#161F32]', text: 'text-gray-500', border: 'border-[#1F293D]' },
};

export default function KitchenPage() {
  const mounted = useMounted();
  const { orders, updateOrderStatus, settings } = useApp();

  const activeOrders = orders.filter(o => o.status === 'new' || o.status === 'preparing' || o.status === 'ready');
  const pastOrders = orders.filter(o => o.status === 'served' || o.status === 'cancelled');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-[#0A0E17] text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1F293D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
            <ChefHat className="w-5 h-5 text-[#00D2FF]" />
            Kitchen Display System (KDS) & Bar Counter
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Live food prep queue, ticket workflow, and station delivery dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#00D2FF]/15 border border-[#00D2FF]/40 text-[#00D2FF] text-xs font-mono font-extrabold">
            {activeOrders.length} Active Tickets
          </span>
        </div>
      </div>

      {/* ACTIVE TICKETS GRID */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00D2FF]" />
          Live Orders Queue
        </h2>

        {activeOrders.length === 0 ? (
          <div className="p-12 text-center bg-[#121826] border border-[#1F293D] rounded-2xl text-gray-400">
            <Utensils className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-500" />
            <p className="font-bold text-white">Kitchen Queue Clean!</p>
            <p className="text-xs text-gray-400 mt-1">No pending food or drink preparation orders.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(order => {
              const ticketStyle = STATUS_TICKET[order.status];
              const minutesAgo = mounted ? Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000) : 0;

              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all bg-[#121826] ${
                    order.status === 'new'
                      ? 'border-[#EF4444]/70 shadow-lg shadow-[#EF4444]/20'
                      : order.status === 'preparing'
                      ? 'border-[#FF8C00]/70 shadow-lg shadow-[#FF8C00]/20'
                      : 'border-[#00D2FF]/70 shadow-lg shadow-[#00D2FF]/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between pb-2 border-b border-[#1F293D]">
                      <div>
                        <span className="font-mono font-extrabold text-white text-base block">{order.orderNumber}</span>
                        <span className="text-xs font-bold text-[#00D2FF]">{order.stationName || 'Bar Counter'}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${ticketStyle.bg} ${ticketStyle.text} ${ticketStyle.border}`}>
                          {ticketStyle.label}
                        </span>
                        <span className="block text-[10px] text-gray-400 mt-1 font-mono">
                          +{minutesAgo}m ago
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-300">
                      <span className="text-[11px] text-gray-400 block mb-0.5">Player / Table:</span>
                      <span className="font-bold text-white">{order.customerName}</span>
                    </div>

                    {/* Order Items List */}
                    <div className="space-y-1.5 pt-2 border-t border-[#1F293D]">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-white">
                            <span className="font-mono font-extrabold text-[#00D2FF] mr-2">{item.quantity}x</span>
                            {item.productName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ticket Lifecycle Progression Buttons */}
                  <div className="pt-4 mt-4 border-t border-[#1F293D]">
                    {order.status === 'new' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="w-full py-2 bg-[#FF8C00] hover:bg-[#e07b00] text-black font-extrabold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Start Preparing
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full py-2 bg-[#00D2FF] hover:bg-[#00B4D8] text-[#0A0E17] font-extrabold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Mark Ready for Dispatch
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="w-full py-2 bg-[#6366F1] hover:bg-[#7a20ce] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Delivered to Player (Serve)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPLETED ORDERS LOG */}
      <div className="bg-[#121826] border border-[#1F293D] rounded-2xl overflow-hidden shadow-xl mt-8">
        <div className="p-4 border-b border-[#1F293D] flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Recently Served Orders</h3>
          <span className="text-xs text-[#00D2FF] font-mono font-bold">{pastOrders.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-gray-400 font-mono uppercase text-[10px] border-b border-[#1F293D]">
              <tr>
                <th className="p-3">Order #</th>
                <th className="p-3">Location</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F293D]">
              {pastOrders.map(po => (
                <tr key={po.id} className="hover:bg-[#161F32] transition-colors">
                  <td className="p-3 font-mono font-bold text-[#00D2FF]">{po.orderNumber}</td>
                  <td className="p-3 font-semibold text-white">{po.stationName || 'Counter'}</td>
                  <td className="p-3 text-gray-300">{po.customerName}</td>
                  <td className="p-3 text-gray-400">
                    {po.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                  </td>
                  <td className="p-3 capitalize">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#161F32] text-gray-300 border border-[#1F293D]">
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#00D2FF]">
                    {formatCurrency(po.totalCents, settings.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
