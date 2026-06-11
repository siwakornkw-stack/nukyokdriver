import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'แดชบอร์ด', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'vehicle', title: 'ยานพาหนะ', href: paths.dashboard.vehicle, icon: 'users' },
  { key: 'driver', title: 'จัดการคนขับ', href: paths.dashboard.driver, icon: 'id-card', roles: ['admin', 'staff'] },
  { key: 'driver-jobs', title: 'สั่งงานคนขับ', href: paths.dashboard.driverJobs, icon: 'truck' },
  { key: 'import', title: 'นำเข้าข้อมูล', href: paths.dashboard.importData, icon: 'upload' },
  { key: 'report', title: 'รายงานสรุป', href: paths.dashboard.report, icon: 'plugs-connected' },
  { key: 'help', title: 'วิธีใช้งาน', href: paths.dashboard.help, icon: 'book-open' },
  { key: 'settings', title: 'ตั้งค่า', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'admin', title: 'ระบบจัดการผู้ใช้งาน', href: paths.dashboard.admin, icon: 'user-gear', roles: ['admin'] },
  { key: 'data-admin', title: 'จัดการ/ลบข้อมูล', href: paths.dashboard.dataAdmin, icon: 'trash', roles: ['admin'] },
  { key: 'account', title: 'บัญชี', href: paths.dashboard.account, icon: 'user' },
  { key: 'logout', title: 'ออกจากระบบ', href: paths.dashboard.logout, icon: 'x-square' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
