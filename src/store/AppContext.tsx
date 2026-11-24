"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Station,
  StationStatus,
  Session,
  Booking,
  BookingStatus,
  Customer,
  Product,
  Order,
  OrderStatus,
  MaintenanceIssue,
  StaffUser,
  AuditEvent,
  CafeSettings,
  StaffRole
} from '@/types';
import {
  initialStations,
  initialSessions,
  initialBookings,
  initialCustomers,
  initialProducts,
  initialOrders,
  initialIssues,
  initialStaffUsers,
  initialAuditLogs,
  initialSettings
} from './initialData';

interface AppContextType {
  stations: Station[];
  sessions: Session[];
  bookings: Booking[];
  customers: Customer[];
  products: Product[];
  orders: Order[];
  issues: MaintenanceIssue[];
  staffUsers: StaffUser[];
  currentStaff: StaffUser;
  auditLogs: AuditEvent[];
  settings: CafeSettings;
  selectedStationId: string | null;
  
  // Actions
  selectStation: (id: string | null) => void;
  updateStationStatus: (stationId: string, status: StationStatus, notes?: string) => void;
  updateStationPosition: (stationId: string, position: [number, number, number], rotation: [number, number, number]) => void;
  
  startSession: (params: {
    stationId: string;
    customerName: string;
    customerPhone?: string;
    customerId?: string;
    durationMinutes: number;
    discountCents?: number;
    discountReason?: string;
    depositCents?: number;
  }) => { success: boolean; error?: string; sessionId?: string };
  
  pauseSession: (sessionId: string) => void;
  resumeSession: (sessionId: string) => void;
  extendSession: (sessionId: string, additionalMinutes: number) => void;
  transferSession: (sessionId: string, newStationId: string, reason: string) => { success: boolean; error?: string };
  endSession: (sessionId: string, paymentMethod: string, discountCents?: number, discountReason?: string) => void;
  
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  checkInBooking: (bookingId: string) => { success: boolean; error?: string };
  
  createCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalHoursPlayed'>) => Customer;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  topUpWallet: (customerId: string, amountCents: number) => void;
  
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  
  adjustStock: (productId: string, delta: number, reason: string) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  
  reportMaintenanceIssue: (issue: Omit<MaintenanceIssue, 'id' | 'reportedAt' | 'status'>) => void;
  updateMaintenanceIssue: (issueId: string, updates: Partial<MaintenanceIssue>) => void;
  
  switchStaffRole: (staffId: string) => void;
  updateSettings: (newSettings: Partial<CafeSettings>) => void;
  resetToDemoDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'fifolex_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [issues, setIssues] = useState<MaintenanceIssue[]>(initialIssues);
  const [staffUsers] = useState<StaffUser[]>(initialStaffUsers);
  const [currentStaff, setCurrentStaff] = useState<StaffUser>(initialStaffUsers[1]); // Default to Manager (David Miller)
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(initialAuditLogs);
  const [settings, setSettings] = useState<CafeSettings>(initialSettings);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stations) setStations(parsed.stations);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.issues) setIssues(parsed.issues);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.warn("Could not load from localStorage, using initial defaults:", e);
    }
  }, []);

  // Save to LocalStorage
  const persistState = useCallback((newState: Record<string, unknown>) => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, ...newState }));
    } catch (e) {
      console.warn("Could not persist to localStorage:", e);
    }
  }, []);

  const addAuditLog = useCallback((action: string, targetType: AuditEvent['targetType'], targetId: string, details: string) => {
    const newLog: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      staffName: currentStaff.name,
      role: currentStaff.role,
      action,
      targetType,
      targetId,
      details
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      persistState({ auditLogs: updated });
      return updated;
    });
  }, [currentStaff, persistState]);

  const selectStation = useCallback((id: string | null) => {
    setSelectedStationId(id);
  }, []);

  const updateStationStatus = useCallback((stationId: string, status: StationStatus, notes?: string) => {
    setStations(prev => {
      const updated = prev.map(st => {
        if (st.id === stationId) {
          return { ...st, status, notes: notes !== undefined ? notes : st.notes };
        }
        return st;
      });
      persistState({ stations: updated });
      return updated;
    });
    addAuditLog("STATION_STATUS_CHANGE", "station", stationId, `Status updated to ${status}${notes ? ` (${notes})` : ''}`);
  }, [addAuditLog, persistState]);

  const updateStationPosition = useCallback((stationId: string, position: [number, number, number], rotation: [number, number, number]) => {
    setStations(prev => {
      const updated = prev.map(st => st.id === stationId ? { ...st, position, rotation } : st);
      persistState({ stations: updated });
      return updated;
    });
    addAuditLog("STATION_LAYOUT_EDIT", "station", stationId, `Station coordinates repositioned in 3D floor map`);
  }, [addAuditLog, persistState]);

  const startSession = useCallback((params: {
    stationId: string;
    customerName: string;
    customerPhone?: string;
    customerId?: string;
    durationMinutes: number;
    discountCents?: number;
    discountReason?: string;
    depositCents?: number;
  }) => {
    const targetStation = stations.find(s => s.id === params.stationId);
    if (!targetStation) return { success: false, error: "Station not found" };
    if (targetStation.status !== 'available') {
      return { success: false, error: `Station is currently ${targetStation.status} and cannot be started.` };
    }

    const sessionId = `sess-${Date.now()}`;
    const startTime = new Date();
    const expectedEndTime = new Date(startTime.getTime() + params.durationMinutes * 60000);
    const durationHours = params.durationMinutes / 60;
    const grossRateCents = Math.round(durationHours * targetStation.hourlyRateCents);
    const discountCents = params.discountCents || 0;
    const totalChargedCents = Math.max(0, grossRateCents - discountCents);

    const newSession: Session = {
      id: sessionId,
      stationId: params.stationId,
      stationName: targetStation.name,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      startTime: startTime.toISOString(),
      durationMinutes: params.durationMinutes,
      expectedEndTime: expectedEndTime.toISOString(),
      status: 'active',
      totalPausedSeconds: 0,
      rateCentsPerHour: targetStation.hourlyRateCents,
      discountCents,
      discountReason: params.discountReason,
      orderItemIds: [],
      totalChargedCents,
      paymentStatus: 'unpaid',
      transferHistory: []
    };

    // Update station state
    setStations(prev => {
      const updated = prev.map(st => st.id === params.stationId ? { ...st, status: 'occupied' as StationStatus, currentSessionId: sessionId } : st);
      persistState({ stations: updated });
      return updated;
    });

    // Add session
    setSessions(prev => {
      const updated = [newSession, ...prev];
      persistState({ sessions: updated });
      return updated;
    });

    addAuditLog("SESSION_START", "session", sessionId, `Started ${params.durationMinutes}m session on ${targetStation.name} for ${params.customerName}`);
    return { success: true, sessionId };
  }, [stations, currentStaff, addAuditLog, persistState]);

  const pauseSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const updated = prev.map(sess => {
        if (sess.id === sessionId && sess.status === 'active') {
          return { ...sess, status: 'paused' as const, pausedAt: new Date().toISOString() };
        }
        return sess;
      });
      persistState({ sessions: updated });
      return updated;
    });
    addAuditLog("SESSION_PAUSE", "session", sessionId, `Session paused`);
  }, [addAuditLog, persistState]);

  const resumeSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const updated = prev.map(sess => {
        if (sess.id === sessionId && sess.status === 'paused') {
          const pausedTimeMs = sess.pausedAt ? Date.now() - new Date(sess.pausedAt).getTime() : 0;
          const additionalPausedSec = Math.round(pausedTimeMs / 1000);
          const currentExpectedEnd = new Date(sess.expectedEndTime).getTime();
          const newExpectedEnd = new Date(currentExpectedEnd + pausedTimeMs).toISOString();

          return {
            ...sess,
            status: 'active' as const,
            pausedAt: undefined,
            totalPausedSeconds: sess.totalPausedSeconds + additionalPausedSec,
            expectedEndTime: newExpectedEnd
          };
        }
        return sess;
      });
      persistState({ sessions: updated });
      return updated;
    });
    addAuditLog("SESSION_RESUME", "session", sessionId, `Session resumed`);
  }, [addAuditLog, persistState]);

  const extendSession = useCallback((sessionId: string, additionalMinutes: number) => {
    setSessions(prev => {
      const updated = prev.map(sess => {
        if (sess.id === sessionId) {
          const oldExpected = new Date(sess.expectedEndTime).getTime();
          const newExpected = new Date(oldExpected + additionalMinutes * 60000).toISOString();
          const addedHours = additionalMinutes / 60;
          const addedChargeCents = Math.round(addedHours * sess.rateCentsPerHour);

          return {
            ...sess,
            durationMinutes: sess.durationMinutes + additionalMinutes,
            expectedEndTime: newExpected,
            totalChargedCents: sess.totalChargedCents + addedChargeCents
          };
        }
        return sess;
      });
      persistState({ sessions: updated });
      return updated;
    });
    addAuditLog("SESSION_EXTEND", "session", sessionId, `Extended by +${additionalMinutes} minutes`);
  }, [addAuditLog, persistState]);

  const transferSession = useCallback((sessionId: string, newStationId: string, reason: string) => {
    const targetSession = sessions.find(s => s.id === sessionId);
    const newStation = stations.find(s => s.id === newStationId);
    if (!targetSession) return { success: false, error: "Session not found" };
    if (!newStation) return { success: false, error: "Target station not found" };
    if (newStation.status !== 'available') return { success: false, error: `Target station is ${newStation.status}` };

    const oldStationId = targetSession.stationId;
    const oldStationName = targetSession.stationName;

    // Update stations
    setStations(prev => {
      const updated = prev.map(st => {
        if (st.id === oldStationId) return { ...st, status: 'cleaning' as StationStatus, currentSessionId: undefined };
        if (st.id === newStationId) return { ...st, status: 'occupied' as StationStatus, currentSessionId: sessionId };
        return st;
      });
      persistState({ stations: updated });
      return updated;
    });

    // Update session
    setSessions(prev => {
      const updated = prev.map(sess => {
        if (sess.id === sessionId) {
          return {
            ...sess,
            stationId: newStationId,
            stationName: newStation.name,
            transferHistory: [
              ...sess.transferHistory,
              {
                fromStationId: oldStationId,
                fromStationName: oldStationName,
                toStationId: newStationId,
                toStationName: newStation.name,
                timestamp: new Date().toISOString(),
                reason,
                staffName: currentStaff.name
              }
            ]
          };
        }
        return sess;
      });
      persistState({ sessions: updated });
      return updated;
    });

    addAuditLog("SESSION_TRANSFER", "session", sessionId, `Transferred from ${oldStationName} to ${newStation.name}. Reason: ${reason}`);
    return { success: true };
  }, [sessions, stations, currentStaff, addAuditLog, persistState]);

  const endSession = useCallback((sessionId: string, paymentMethod: string, discountCents = 0, discountReason?: string) => {
    const targetSession = sessions.find(s => s.id === sessionId);
    if (!targetSession) return;

    const stationId = targetSession.stationId;

    // Close session
    setSessions(prev => {
      const updated = prev.map(sess => {
        if (sess.id === sessionId) {
          const finalCharged = Math.max(0, sess.totalChargedCents - discountCents);
          return {
            ...sess,
            status: 'completed' as const,
            actualEndTime: new Date().toISOString(),
            paymentStatus: 'paid' as const,
            paymentMethod,
            discountCents: sess.discountCents + discountCents,
            discountReason: discountReason || sess.discountReason,
            totalChargedCents: finalCharged
          };
        }
        return sess;
      });
      persistState({ sessions: updated });
      return updated;
    });

    // Set station to cleaning
    setStations(prev => {
      const updated = prev.map(st => {
        if (st.id === stationId) {
          return { ...st, status: 'cleaning' as StationStatus, currentSessionId: undefined };
        }
        return st;
      });
      persistState({ stations: updated });
      return updated;
    });

    // If customer has a wallet and paid via wallet, deduct
    if (targetSession.customerId && paymentMethod === 'Customer Wallet') {
      setCustomers(prev => {
        const updated = prev.map(c => {
          if (c.id === targetSession.customerId) {
            return {
              ...c,
              walletBalanceCents: Math.max(0, c.walletBalanceCents - targetSession.totalChargedCents),
              totalHoursPlayed: c.totalHoursPlayed + Math.round(targetSession.durationMinutes / 60),
              loyaltyPoints: c.loyaltyPoints + Math.round(targetSession.totalChargedCents / 100)
            };
          }
          return c;
        });
        persistState({ customers: updated });
        return updated;
      });
    }

    addAuditLog("SESSION_END", "session", sessionId, `Session completed on ${targetSession.stationName}. Payment: ${paymentMethod}`);
  }, [sessions, addAuditLog, persistState]);

  const createBooking = useCallback((booking: Omit<Booking, 'id' | 'createdAt'>) => {
    // Conflict check
    const existingConflict = bookings.find(
      b => b.stationId === booking.stationId &&
      b.date === booking.date &&
      b.startTime === booking.startTime &&
      (b.status === 'confirmed' || b.status === 'pending')
    );
    if (existingConflict) {
      return { success: false, error: "There is already a booking for this station at the selected time." };
    }

    const newBooking: Booking = {
      ...booking,
      id: `bk-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => {
      const updated = [newBooking, ...prev];
      persistState({ bookings: updated });
      return updated;
    });

    // If today's booking is confirmed, update station status to reserved
    const todayStr = new Date().toISOString().split('T')[0];
    if (booking.date === todayStr && booking.status === 'confirmed') {
      setStations(prev => {
        const updated = prev.map(st => st.id === booking.stationId && st.status === 'available' ? { ...st, status: 'reserved' as StationStatus } : st);
        persistState({ stations: updated });
        return updated;
      });
    }

    addAuditLog("BOOKING_CREATE", "booking", newBooking.id, `Booking created for ${booking.customerName} on ${booking.stationName} (${booking.date} ${booking.startTime})`);
    return { success: true };
  }, [bookings, addAuditLog, persistState]);

  const updateBookingStatus = useCallback((bookingId: string, status: BookingStatus) => {
    setBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, status } : b);
      persistState({ bookings: updated });
      return updated;
    });
    addAuditLog("BOOKING_STATUS_CHANGE", "booking", bookingId, `Booking status updated to ${status}`);
  }, [addAuditLog, persistState]);

  const checkInBooking = useCallback((bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: "Booking not found" };

    const station = stations.find(s => s.id === booking.stationId);
    if (!station) return { success: false, error: "Station not found" };
    if (station.status !== 'available' && station.status !== 'reserved') {
      return { success: false, error: `Station is currently ${station.status}. Please assign another station.` };
    }

    // Convert booking to active session
    const res = startSession({
      stationId: booking.stationId,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerId: booking.customerId,
      durationMinutes: booking.durationMinutes,
      depositCents: booking.depositCents
    });

    if (res.success) {
      updateBookingStatus(bookingId, 'checked_in');
      return { success: true };
    }
    return res;
  }, [bookings, stations, startSession, updateBookingStatus]);

  const createCustomer = useCallback((customerData: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalHoursPlayed'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      loyaltyPoints: 50, // Welcome bonus points
      totalHoursPlayed: 0,
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => {
      const updated = [newCustomer, ...prev];
      persistState({ customers: updated });
      return updated;
    });
    addAuditLog("CUSTOMER_CREATE", "settings", newCustomer.id, `Created customer profile for ${newCustomer.name}`);
    return newCustomer;
  }, [addAuditLog, persistState]);

  const updateCustomer = useCallback((customerId: string, updates: Partial<Customer>) => {
    setCustomers(prev => {
      const updated = prev.map(c => c.id === customerId ? { ...c, ...updates } : c);
      persistState({ customers: updated });
      return updated;
    });
    addAuditLog("CUSTOMER_UPDATE", "settings", customerId, `Customer profile updated`);
  }, [addAuditLog, persistState]);

  const topUpWallet = useCallback((customerId: string, amountCents: number) => {
    setCustomers(prev => {
      const updated = prev.map(c => c.id === customerId ? { ...c, walletBalanceCents: c.walletBalanceCents + amountCents } : c);
      persistState({ customers: updated });
      return updated;
    });
    addAuditLog("WALLET_TOPUP", "payment", customerId, `Topped up customer wallet by $${(amountCents / 100).toFixed(2)}`);
  }, [addAuditLog, persistState]);

  const createOrder = useCallback((orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };

    // Deduct stock
    setProducts(prev => {
      const updated = prev.map(p => {
        const matchingItem = orderData.items.find(i => i.productId === p.id);
        if (matchingItem) {
          const newQty = Math.max(0, p.stockQuantity - matchingItem.quantity);
          return { ...p, stockQuantity: newQty };
        }
        return p;
      });
      persistState({ products: updated });
      return updated;
    });

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      persistState({ orders: updated });
      return updated;
    });

    addAuditLog("ORDER_CREATE", "inventory", newOrder.id, `Created ${newOrder.orderNumber} ($${(newOrder.totalCents / 100).toFixed(2)}) for ${newOrder.customerName}`);
    return newOrder;
  }, [addAuditLog, persistState]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
      persistState({ orders: updated });
      return updated;
    });
    addAuditLog("ORDER_STATUS", "inventory", orderId, `Order status updated to ${status}`);
  }, [addAuditLog, persistState]);

  const adjustStock = useCallback((productId: string, delta: number, reason: string) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === productId) {
          const newQty = Math.max(0, p.stockQuantity + delta);
          return { ...p, stockQuantity: newQty };
        }
        return p;
      });
      persistState({ products: updated });
      return updated;
    });
    addAuditLog("STOCK_ADJUSTMENT", "inventory", productId, `Adjusted stock by ${delta > 0 ? `+${delta}` : delta}. Reason: ${reason}`);
  }, [addAuditLog, persistState]);

  const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === productId ? { ...p, ...updates } : p);
      persistState({ products: updated });
      return updated;
    });
    addAuditLog("PRODUCT_UPDATE", "inventory", productId, `Product details updated`);
  }, [addAuditLog, persistState]);

  const reportMaintenanceIssue = useCallback((issue: Omit<MaintenanceIssue, 'id' | 'reportedAt' | 'status'>) => {
    const newIssue: MaintenanceIssue = {
      ...issue,
      id: `iss-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      status: 'open'
    };

    setIssues(prev => {
      const updated = [newIssue, ...prev];
      persistState({ issues: updated });
      return updated;
    });

    // Mark station as maintenance if severity is high/critical
    if (issue.severity === 'high' || issue.severity === 'critical') {
      updateStationStatus(issue.stationId, 'maintenance', issue.description);
    }

    addAuditLog("MAINTENANCE_REPORT", "maintenance", newIssue.id, `Reported issue on ${issue.stationName}: ${issue.description}`);
  }, [updateStationStatus, addAuditLog, persistState]);

  const updateMaintenanceIssue = useCallback((issueId: string, updates: Partial<MaintenanceIssue>) => {
    setIssues(prev => {
      const updated = prev.map(i => i.id === issueId ? { ...i, ...updates } : i);
      persistState({ issues: updated });
      return updated;
    });
    addAuditLog("MAINTENANCE_UPDATE", "maintenance", issueId, `Issue status/notes updated`);
  }, [addAuditLog, persistState]);

  const switchStaffRole = useCallback((staffId: string) => {
    const target = staffUsers.find(s => s.id === staffId);
    if (target) {
      setCurrentStaff(target);
      addAuditLog("STAFF_ROLE_SWITCH", "settings", staffId, `Active staff switched to ${target.name} (${target.role})`);
    }
  }, [staffUsers, addAuditLog]);

  const updateSettings = useCallback((newSettings: Partial<CafeSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      persistState({ settings: updated });
      return updated;
    });
    addAuditLog("SETTINGS_UPDATE", "settings", "global", `Cafe settings updated`);
  }, [addAuditLog, persistState]);

  const resetToDemoDefaults = useCallback(() => {
    setStations(initialStations);
    setSessions(initialSessions);
    setBookings(initialBookings);
    setCustomers(initialCustomers);
    setProducts(initialProducts);
    setOrders(initialOrders);
    setIssues(initialIssues);
    setAuditLogs(initialAuditLogs);
    setSettings(initialSettings);
    localStorage.removeItem(STORAGE_KEY);
    addAuditLog("DEMO_RESET", "settings", "global", `Reset all venue records to fresh synthetic demo defaults`);
  }, [addAuditLog]);

  return (
    <AppContext.Provider
      value={{
        stations,
        sessions,
        bookings,
        customers,
        products,
        orders,
        issues,
        staffUsers,
        currentStaff,
        auditLogs,
        settings,
        selectedStationId,
        selectStation,
        updateStationStatus,
        updateStationPosition,
        startSession,
        pauseSession,
        resumeSession,
        extendSession,
        transferSession,
        endSession,
        createBooking,
        updateBookingStatus,
        checkInBooking,
        createCustomer,
        updateCustomer,
        topUpWallet,
        createOrder,
        updateOrderStatus,
        adjustStock,
        updateProduct,
        reportMaintenanceIssue,
        updateMaintenanceIssue,
        switchStaffRole,
        updateSettings,
        resetToDemoDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
