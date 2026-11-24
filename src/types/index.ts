export type StationType = 'pc' | 'ps5' | 'xbox' | 'vr' | 'racing';

export type StationStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';

export type StationZone = 'Main PC Arena' | 'VIP Console Lounge' | 'VR Holo-Bay' | 'Sim Paddock';

export interface StationSpecs {
  cpu?: string;
  gpu?: string;
  ram?: string;
  screen?: string;
  peripherals?: string;
  platform?: string;
}

export interface Station {
  id: string;
  name: string;
  type: StationType;
  zone: StationZone;
  status: StationStatus;
  hourlyRateCents: number;
  specs: StationSpecs;
  installedGames: string[];
  position: [number, number, number]; // 3D coordinates [x, y, z]
  rotation: [number, number, number];
  currentSessionId?: string;
  assignedStaff?: string;
  notes?: string;
}

export type SessionStatus = 'active' | 'paused' | 'completed' | 'transferred';

export interface SessionTransferRecord {
  fromStationId: string;
  fromStationName: string;
  toStationId: string;
  toStationName: string;
  timestamp: string;
  reason: string;
  staffName: string;
}

export interface Session {
  id: string;
  stationId: string;
  stationName: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  staffId: string;
  staffName: string;
  startTime: string; // ISO
  durationMinutes: number;
  expectedEndTime: string; // ISO
  actualEndTime?: string; // ISO
  status: SessionStatus;
  pausedAt?: string;
  totalPausedSeconds: number;
  rateCentsPerHour: number;
  discountCents: number;
  discountReason?: string;
  orderItemIds: string[];
  totalChargedCents: number;
  paymentStatus: 'unpaid' | 'paid' | 'partial' | 'refunded';
  paymentMethod?: string;
  transferHistory: SessionTransferRecord[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  stationId: string;
  stationName: string;
  stationType: StationType;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  status: BookingStatus;
  depositCents: number;
  depositPaid: boolean;
  notes?: string;
  createdAt: string;
}

export type MembershipTier = 'standard' | 'silver' | 'gold' | 'vip';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  membershipTier: MembershipTier;
  walletBalanceCents: number;
  loyaltyPoints: number;
  totalHoursPlayed: number;
  preferredPlatform?: StationType;
  preferredStationId?: string;
  notes?: string;
  createdAt: string;
}

export type ProductCategory = 'beverage' | 'snack' | 'hot_food' | 'merch';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  priceCents: number;
  costCents: number;
  stockQuantity: number;
  lowStockThreshold: number;
  available: boolean;
  imageUrl?: string;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface OrderLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  sessionId?: string;
  stationName?: string;
  customerName: string;
  items: OrderLineItem[];
  status: OrderStatus;
  totalCents: number;
  paid: boolean;
  createdAt: string;
}

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'investigating' | 'scheduled' | 'resolved';

export interface MaintenanceIssue {
  id: string;
  stationId: string;
  stationName: string;
  severity: IssueSeverity;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: IssueStatus;
  resolutionNotes?: string;
}

export type StaffRole = 'owner' | 'manager' | 'cashier' | 'floor_staff';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  avatar?: string;
  activeShiftId?: string;
}

export interface StaffShift {
  id: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  startTime: string;
  endTime?: string;
  cashFloatStartCents: number;
  cashFloatEndCents?: number;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  staffName: string;
  role: StaffRole;
  action: string;
  targetType: 'station' | 'session' | 'booking' | 'payment' | 'inventory' | 'settings' | 'maintenance';
  targetId: string;
  details: string;
}

export interface CafeSettings {
  cafeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: {
    open: string; // e.g. "10:00"
    close: string; // e.g. "02:00"
  };
  timezone: string;
  currencySymbol: string;
  currencyCode: string;
  taxRatePercent: number;
  gracePeriodMinutes: number;
  bufferBetweenSessionsMinutes: number;
  minSessionMinutes: number;
  ratesPerHourCents: Record<StationType, number>;
  membershipDiscounts: Record<MembershipTier, number>; // Percentage e.g. 15 for 15%
  acceptedPaymentMethods: string[];
}
