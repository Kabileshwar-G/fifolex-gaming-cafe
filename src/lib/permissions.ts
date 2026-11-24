import { StaffRole } from '@/types';

export type Permission =
  | 'view_dashboard'
  | 'view_stations'
  | 'manage_sessions' // start, pause, resume, extend, transfer, end
  | 'manage_bookings' // create, edit, cancel, check in
  | 'manage_pos' // add orders, sell items
  | 'process_refunds' // apply manual discount overrides, process refunds
  | 'view_financial_reports' // view revenue, daily sales
  | 'manage_customers' // create, edit, manage wallet/tier
  | 'manage_inventory' // stock count, restock, change prices
  | 'manage_maintenance' // report, assign, resolve
  | 'manage_staff' // shifts, assign roles
  | 'manage_settings' // cafe info, rates, 3D layout editor
  | 'override_prices';

export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  owner: [
    'view_dashboard',
    'view_stations',
    'manage_sessions',
    'manage_bookings',
    'manage_pos',
    'process_refunds',
    'view_financial_reports',
    'manage_customers',
    'manage_inventory',
    'manage_maintenance',
    'manage_staff',
    'manage_settings',
    'override_prices'
  ],
  manager: [
    'view_dashboard',
    'view_stations',
    'manage_sessions',
    'manage_bookings',
    'manage_pos',
    'process_refunds',
    'view_financial_reports',
    'manage_customers',
    'manage_inventory',
    'manage_maintenance',
    'manage_staff'
  ],
  cashier: [
    'view_dashboard',
    'view_stations',
    'manage_sessions',
    'manage_bookings',
    'manage_pos',
    'manage_customers',
    'manage_maintenance'
  ],
  floor_staff: [
    'view_dashboard',
    'view_stations',
    'manage_maintenance'
  ]
};

export function hasPermission(role: StaffRole, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  return allowed ? allowed.includes(permission) : false;
}
