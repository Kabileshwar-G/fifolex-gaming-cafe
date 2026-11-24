// Automated Route & E2E Validation Script for Fifolex
import http from 'http';

const routes = [
  { path: '/', title: 'Control Room Dashboard', keywords: ['Live Sessions', 'Floor Occupancy', 'Revenue Today', 'FIFOLEX'] },
  { path: '/venue', title: '3D Venue Floor Plan', keywords: ['Venue', 'Control Surface', '3D Venue', '2D Floor Plan'] },
  { path: '/sessions', title: 'Live Sessions Management', keywords: ['Telemetry', 'Active Sessions', 'All Stations'] },
  { path: '/bookings', title: 'Bookings Calendar', keywords: ['Reservations', 'Schedule Calendar', 'New Reservation'] },
  { path: '/pos', title: 'Point of Sale & Billing', keywords: ['Cafe Point of Sale', 'Current Order', 'Food Service'] },
  { path: '/kitchen', title: 'Kitchen Display System', keywords: ['Kitchen Display System', 'Live Orders Queue'] },
  { path: '/customers', title: 'Customer Profiles & Wallets', keywords: ['Customer Profiles', 'Memberships', 'Register Customer'] },
  { path: '/equipment', title: 'Equipment & Maintenance', keywords: ['Equipment Inventory', 'Maintenance Logs', 'Hardware Fleet'] },
  { path: '/staff', title: 'Staff & Audit Logs', keywords: ['Staff Roles', 'Audit History', 'RBAC Permission Matrix'] },
  { path: '/reports', title: 'Financial & Analytics Reports', keywords: ['Operations Analytics', 'Financial Reports', 'Gross Revenue', 'Export CSV', 'Export JSON'] },
  { path: '/settings', title: 'Cafe Configuration', keywords: ['Cafe Configuration', 'System Preferences', 'Hourly Station Rates'] },
  { path: '/portal', title: 'Customer Self-Service Portal', keywords: ['LIVE VENUE PORTAL', 'Gaming Battle Station', 'Browse Pods', 'Order to Seat'] }
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${route.path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const statusOk = res.statusCode === 200;
        const missingKeywords = route.keywords.filter(kw => !data.includes(kw));
        resolve({
          path: route.path,
          title: route.title,
          statusCode: res.statusCode,
          passed: statusOk && missingKeywords.length === 0,
          missingKeywords
        });
      });
    });
    req.on('error', (err) => {
      resolve({
        path: route.path,
        title: route.title,
        statusCode: 0,
        passed: false,
        error: err.message
      });
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('FIFOLEX ROUTE & INTERFACE VALIDATION SUITE');
  console.log('====================================================\n');

  let allPassed = true;
  for (const route of routes) {
    const res = await checkRoute(route);
    if (res.passed) {
      console.log(`✓ [200 OK] ${route.path.padEnd(12)} — ${route.title}`);
    } else {
      allPassed = false;
      console.log(`✗ [FAIL]   ${route.path.padEnd(12)} — Status: ${res.statusCode}, Missing: ${JSON.stringify(res.missingKeywords || res.error)}`);
    }
  }

  console.log('\n====================================================');
  if (allPassed) {
    console.log('ALL 12 ROUTES VERIFIED CLEANLY WITH STATUS 200 (100% PASS)');
  } else {
    console.log('SOME ROUTES ENCOUNTERED ISSUES');
  }
  console.log('====================================================');
}

runTests();
