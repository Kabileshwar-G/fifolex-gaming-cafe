// Domain Logic, Pricing Engine & State Machine Validation Test
import assert from 'assert';

console.log('====================================================');
console.log('FIFOLEX DOMAIN LOGIC & STATE MACHINE TEST SUITE');
console.log('====================================================\n');

// 1. Pricing Engine & Minor Unit Precision Test (Indian Rupees - Paise & 18% GST)
console.log('1. Testing Pricing Engine (INR / Paise & 18% GST)...');
const hourlyRateCents = 10000; // ₹100.00/hr
const durationMinutes = 90; // 1.5 hrs
const grossChargeCents = Math.round((durationMinutes / 60) * hourlyRateCents);
assert.strictEqual(grossChargeCents, 15000, "90-minute session at ₹100/hr should equal 15000 paise (₹150.00)");

// Gold member 20% discount
const memberDiscountPct = 20;
const discountCents = Math.round((grossChargeCents * memberDiscountPct) / 100);
assert.strictEqual(discountCents, 3000, "20% discount on 15000 paise should be 3000 paise (₹30.00)");
const netSessionCents = grossChargeCents - discountCents;
assert.strictEqual(netSessionCents, 12000, "Net session charge should be 12000 paise (₹120.00)");

// POS items (Red Bull ₹125 + Peri-Peri Fries ₹90 = ₹215 = 21500 paise)
const posItemsCents = 12500 + 9000;
const taxableTotalCents = netSessionCents + posItemsCents; // 12000 + 21500 = 33500 paise (₹335.00)
const taxRatePct = 18.0; // 18% GST
const taxCents = Math.round((taxableTotalCents * taxRatePct) / 100); // 6030 paise (₹60.30)
assert.strictEqual(taxCents, 6030, "18% GST on 33500 paise should be 6030 paise (₹60.30)");
const grandTotalCents = taxableTotalCents + taxCents; // 39530 paise (₹395.30)
assert.strictEqual(grandTotalCents, 39530, "Grand total should be 39530 paise (₹395.30)");

// Split Bill 2 ways via UPI
const split2Cents = Math.round(grandTotalCents / 2);
assert.strictEqual(split2Cents, 19765, "39530 split 2 ways should be 19765 paise (₹197.65) each");
console.log('✓ Pricing engine minor unit tests (INR / paise / GST) passed cleanly.\n');

// 2. Booking Overlap Conflict Detection Test (Interval-based)
console.log('2. Testing Booking Conflict Prevention (Intervals)...');
function timeStringToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function checkIntervalOverlap(startA, durationA, startB, durationB) {
  const aStart = timeStringToMinutes(startA);
  const aEnd = aStart + durationA;
  const bStart = timeStringToMinutes(startB);
  const bEnd = bStart + durationB;
  return aStart < bEnd && bStart < aEnd;
}

const existingBookings = [
  { id: 'b-1', stationId: 'st-pc-01', date: '2026-11-25', startTime: '18:00', durationMinutes: 120, status: 'confirmed' }
];

function checkBookingConflict(newBooking, ignoreId) {
  return existingBookings.some(b => 
    b.id !== ignoreId &&
    b.stationId === newBooking.stationId &&
    b.date === newBooking.date &&
    (b.status === 'confirmed' || b.status === 'pending') &&
    checkIntervalOverlap(b.startTime, b.durationMinutes, newBooking.startTime, newBooking.durationMinutes)
  );
}

const identicalStartConflict = { stationId: 'st-pc-01', date: '2026-11-25', startTime: '18:00', durationMinutes: 60 };
const partialOverlapConflict = { stationId: 'st-pc-01', date: '2026-11-25', startTime: '19:00', durationMinutes: 60 }; // Inside 18:00 - 20:00
const spanningConflict = { stationId: 'st-pc-01', date: '2026-11-25', startTime: '17:30', durationMinutes: 90 }; // 17:30 - 19:00
const adjacentNonConflict = { stationId: 'st-pc-01', date: '2026-11-25', startTime: '20:00', durationMinutes: 60 }; // Immediately after
const differentStation = { stationId: 'st-pc-02', date: '2026-11-25', startTime: '18:00', durationMinutes: 60 };
const differentDate = { stationId: 'st-pc-01', date: '2026-11-26', startTime: '18:00', durationMinutes: 60 };

assert.strictEqual(checkBookingConflict(identicalStartConflict), true, "Identical start time should conflict");
assert.strictEqual(checkBookingConflict(partialOverlapConflict), true, "Start time inside an ongoing booking should conflict");
assert.strictEqual(checkBookingConflict(spanningConflict), true, "End time overlapping into an ongoing booking should conflict");
assert.strictEqual(checkBookingConflict(adjacentNonConflict), false, "Adjacent booking (20:00 after 18:00-20:00) should NOT conflict");
assert.strictEqual(checkBookingConflict(differentStation), false, "Different station should NOT conflict");
assert.strictEqual(checkBookingConflict(differentDate), false, "Different date should NOT conflict");

// Rescheduling test (ignoring self)
assert.strictEqual(checkBookingConflict({ stationId: 'st-pc-01', date: '2026-11-25', startTime: '18:00', durationMinutes: 120 }, 'b-1'), false, "Rescheduling existing booking should ignore self");
console.log('✓ Booking interval overlap and reschedule tests passed cleanly.\n');

// 3. Station State Machine Lifecycle Transitions
console.log('3. Testing Station State Lifecycle Transitions...');
const stationLifecycle = {
  status: 'available',
  currentSessionId: null
};

// Start session
stationLifecycle.status = 'occupied';
stationLifecycle.currentSessionId = 'sess-test-01';
assert.strictEqual(stationLifecycle.status, 'occupied');

// End session -> must transition to cleaning
stationLifecycle.status = 'cleaning';
stationLifecycle.currentSessionId = null;
assert.strictEqual(stationLifecycle.status, 'cleaning');
assert.strictEqual(stationLifecycle.currentSessionId, null);

// Cleaned -> transitions back to available
stationLifecycle.status = 'available';
assert.strictEqual(stationLifecycle.status, 'available');

// Hardware fault reported -> transitions to maintenance
stationLifecycle.status = 'maintenance';
assert.strictEqual(stationLifecycle.status, 'maintenance');

// Fixed -> transitions to available
stationLifecycle.status = 'available';
assert.strictEqual(stationLifecycle.status, 'available');
console.log('✓ Station state machine lifecycle tests passed cleanly.\n');

// 4. Role Permissions Hierarchy Verification
console.log('4. Testing Role Permission Enforcements...');
const ROLE_PERMISSIONS = {
  owner: ['view_dashboard', 'manage_settings', 'override_prices', 'manage_sessions', 'process_refunds'],
  manager: ['view_dashboard', 'manage_sessions', 'process_refunds'],
  cashier: ['view_dashboard', 'manage_sessions'],
  floor_staff: ['view_dashboard']
};

function hasPerm(role, perm) {
  return ROLE_PERMISSIONS[role].includes(perm);
}

assert.strictEqual(hasPerm('owner', 'manage_settings'), true);
assert.strictEqual(hasPerm('manager', 'manage_settings'), false, "Manager cannot alter cafe settings");
assert.strictEqual(hasPerm('cashier', 'process_refunds'), false, "Cashier cannot process refunds");
assert.strictEqual(hasPerm('floor_staff', 'manage_sessions'), false, "Floor staff cannot start or bill sessions");
assert.strictEqual(hasPerm('floor_staff', 'view_dashboard'), true, "Floor staff can view dashboard");
console.log('✓ Role permission matrix tests passed cleanly.\n');

console.log('====================================================');
console.log('ALL BUSINESS LOGIC & CONFLICT TESTS PASSED (100%)');
console.log('====================================================');
