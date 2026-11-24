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
  new: { label: 'New Ticket', bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/40' },
  preparing: { label: 'Preparing', bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  ready: { label: 'Ready for Pickup', bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/40' },
  served: { label: 'Served', bg: 'bg-gray-800/40', text: 'text-gray-400', border: 'border-gray-700/40' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-800/40', text: 'text-gray-500', border: 'border-gray-800/40' },
};

export default function KitchenPage() {
  const mounted = useMounted();
  const { orders, updateOrderStatus, settings } = useApp();

  const activeOrders = orders.filter(o => o.status === 'new' || o.status === 'preparing' || o.status === 'ready');
  const pastOrders = orders.filter(o => o.status === 'served' || o.status === 'cancelled');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <ChefHat className="w-5 h-5 text-amber-400" />
            Kitchen Display System (KDS) & Bar Counter
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Live food prep queue, ticket workflow, and station delivery dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-800/40 text-amber-300 text-xs font-mono font-bold">
            {activeOrders.length} Active Tickets
          </span>
        </div>
      </div>

      {/* ACTIVE TICKETS GRID */}
      <div>
        <h2 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Live Orders Queue
        </h2>

        {activeOrders.length === 0 ? (
          <div className="p-12 text-center bg-[#0d1017] border border-gray-800 rounded-2xl text-gray-500">
            <Utensils className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
            <p className="font-semibold text-gray-300">Kitchen Queue Clean!</p>
            <p className="text-xs text-gray-500 mt-1">No pending food or drink preparation orders.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(order => {
              const ticketStyle = STATUS_TICKET[order.status];
              const minutesAgo = mounted ? Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000) : 0;

              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all bg-[#0e121c] ${
                    order.status === 'new'
                      ? 'border-rose-700/60 shadow-lg shadow-rose-950/20'
                      : order.status === 'preparing'
                      ? 'border-amber-700/60 shadow-lg shadow-amber-950/20'
                      : 'border-emerald-700/60 shadow-lg shadow-emerald-950/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between pb-2 border-b border-gray-800">
                      <div>
                        <span className="font-mono font-extrabold text-white text-base block">{order.orderNumber}</span>
                        <span className="text-xs font-semibold text-cyan-400">{order.stationName || 'Bar Counter'}</span>
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
                    <div className="space-y-1.5 pt-2 border-t border-gray-800/80">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-200">
                            <span className="font-mono font-bold text-amber-400 mr-2">{item.quantity}x</span>
                            {item.productName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ticket Lifecycle Progression Buttons */}
                  <div className="pt-4 mt-4 border-t border-gray-800/80">
                    {order.status === 'new' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Start Preparing
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Mark Ready for Dispatch
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
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
      <div className="bg-[#0e121c] border border-[#1f2538] rounded-2xl overflow-hidden shadow-xl mt-8">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-200">Recently Served Orders</h3>
          <span className="text-xs text-gray-400 font-mono">{pastOrders.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121622] text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
              <tr>
                <th className="p-3">Order #</th>
                <th className="p-3">Location</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {pastOrders.map(po => (
                <tr key={po.id} className="hover:bg-[#131826] transition-colors">
                  <td className="p-3 font-mono font-bold text-cyan-400">{po.orderNumber}</td>
                  <td className="p-3 font-semibold text-gray-200">{po.stationName || 'Counter'}</td>
                  <td className="p-3 text-gray-300">{po.customerName}</td>
                  <td className="p-3 text-gray-400">
                    {po.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                  </td>
                  <td className="p-3 capitalize">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300">
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
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
